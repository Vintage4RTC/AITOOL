import fs from 'fs'
import path from 'path'
import nodemailer from 'nodemailer'
import { chromium } from 'playwright'
import { expect } from '@playwright/test'
import { testingProfiles } from './testingProfiles.js'
import xlsx from 'xlsx'
import { OpenAI } from 'openai'

// Initialize OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Constants for AI-driven testing
const AGENT_BATCH_SIZE = 3
const OPENAI_MAX_RETRIES = 3
const OPENAI_MIN_GAP_MS = 20000

// Global state for rate limiting
global.isRateLimited = false
global.rateLimitUntil = null

const artifactsRoot = path.resolve(process.cwd(), 'artifacts')

// Playwright test configuration
const MAX_TEST_STEPS = 60

function nowISO(){ return new Date().toISOString() }

function slackNotify(blocks){
  const url = process.env.SLACK_WEBHOOK_URL
  if(!url) {
    console.log('Slack webhook not configured, skipping notification')
    return
  }
  console.log('Slack notification sent:', JSON.stringify(blocks, null, 2))
  return fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ blocks })
  }).catch(err => console.warn('Slack notify failed:', err?.message || err))
}

// Fail-safe email
async function emailNotify({subject, html, attachments=[]}){
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM, MAIL_TO } = process.env
  if(!(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && MAIL_FROM && MAIL_TO)){
    console.log('Email not configured; skipping.')
    return
  }
  const secure = String(SMTP_PORT) === '465'
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  })
  try{
    await transporter.sendMail({ from: MAIL_FROM, to: MAIL_TO, subject, html, attachments })
  }catch(err){
    console.warn('Email notify failed:', err?.code || err?.message || err)
  }
}

function artifactLink(rel){
  const base = process.env.PUBLIC_BASE_URL || 'http://localhost:8787'
  return base.replace(/\/$/,'') + '/artifacts/' + rel.replace(/^\//,'')
}
function relFromArtifacts(absPath) {
  return path.relative(path.resolve(process.cwd(), 'artifacts'), absPath).replace(/\\/g, '/')
}
function publicUrlFromAbs(absPath) {
  return artifactLink(relFromArtifacts(absPath))
}
// ---------- AI Functions ----------
async function callOpenAI(prompt, maxLength = 500) {
  if (global.isRateLimited && global.rateLimitUntil > Date.now()) {
    const waitTime = global.rateLimitUntil - Date.now()
    console.log(`[callOpenAI] Rate limited, waiting ${waitTime}ms`)
    await new Promise(resolve => setTimeout(resolve, waitTime))
  }

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxLength,
      temperature: 0.1
    })

    global.isRateLimited = false
    return response.choices[0].message.content
  } catch (error) {
    if (error.status === 429) {
      global.isRateLimited = true
      global.rateLimitUntil = Date.now() + 60000 // Wait 1 minute
      console.log('[callOpenAI] 429 rate-limited, will retry later')
      throw new Error('Rate limited')
    }
    throw error
  }
}

async function planWithAI(testType, url, profile) {
  const prompt = `Generate a test plan for ${testType} testing of ${url}. 
  
Profile context: ${JSON.stringify(profile, null, 2)}

Return ONLY a valid JSON object with this exact structure:
{
  "plan": "brief description of the test plan",
  "checks": [
    {"id": "1", "title": "check title", "rationale": "why this check"}
  ],
  "heuristics": ["heuristic1", "heuristic2"]
}

Keep the response concise and focused.`

  try {
    const response = await callOpenAI(prompt, 200)
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('No valid JSON found in response')
  } catch (error) {
    console.log('[planWithAI] AI failed, using fallback plan:', error.message)
    return {
      plan: `${testType} testing using fallback plan`,
      checks: [
        { id: "1", title: "Basic navigation", rationale: "Ensure page loads and navigation works" },
        { id: "2", title: "Core functionality", rationale: "Test main application features" },
        { id: "3", title: "User workflows", rationale: "Verify critical user paths" }
      ],
      heuristics: ["Reliability", "Coverage", "User Experience"]
    }
  }
}

async function agentDecideBatch(page, testType, profile, testCases, actions) {
  // Get comprehensive page context
  const pageContext = await getEnhancedPageContext(page)
  const recentActions = actions.slice(-10) // More context
  const failurePattern = analyzeFailurePattern(recentActions)
  
  const prompt = `You are an expert QA automation agent performing ${testType} testing on ${page.url()}.

CURRENT PAGE CONTEXT:
- Title: ${pageContext.title}
- URL: ${pageContext.url}
- Page Type: ${pageContext.pageType}
- Form Elements: ${pageContext.formElements.length} found
- Interactive Elements: ${pageContext.interactiveElements.length} found
- Navigation Elements: ${pageContext.navigationElements.length} found
- Error Messages: ${pageContext.errorMessages.length > 0 ? pageContext.errorMessages.join(', ') : 'None'}

AVAILABLE ELEMENTS (with reliable selectors):
${pageContext.allElements.map(el => `- ${el.type}: "${el.text}" (${el.selector})`).join('\n')}

PROFILE CONTEXT:
${JSON.stringify(profile, null, 2)}

RECENT ACTIONS (last 10):
${JSON.stringify(recentActions, null, 2)}

FAILURE ANALYSIS:
${failurePattern}

TESTING STRATEGY:
1. Focus on ${testType === 'smoke' ? 'critical user journeys and basic functionality' : 'exploring all available features and edge cases'}
2. ${failurePattern.includes('selector') ? 'Use more robust selectors and add wait conditions' : 'Continue with current approach'}
3. ${pageContext.formElements.length > 0 ? 'Prioritize form interactions' : 'Focus on navigation and content validation'}
4. Always validate page state after actions

Generate 2-4 SMART test actions. Return ONLY valid JSON array:
[
  {"action": "action_type", "target": "reliable_selector", "value": "input_value", "text": "description", "waitFor": "selector_or_condition"}
]

VALID ACTIONS: navigate, click, fill, select, press, hover, assertText, wait, screenshot, scroll
IMPORTANT: Use robust selectors, add wait conditions, and provide clear descriptions.`

  try {
    const response = await callOpenAI(prompt, 200) // Increased token limit
    console.log('[agentDecideBatch] Raw AI response:', response.substring(0, 500) + '...')
    
    // Try multiple JSON extraction strategies
    let actions = null
    
    // Strategy 1: Look for complete JSON array
    const jsonMatch = response.match(/\[[\s\S]*?\]/)
    if (jsonMatch) {
      try {
        actions = JSON.parse(jsonMatch[0])
        console.log('[agentDecideBatch] Successfully parsed JSON with strategy 1')
      } catch (e) {
        console.log('[agentDecideBatch] Strategy 1 failed:', e.message)
      }
    }
    
    // Strategy 2: Look for JSON between ```json and ```
    if (!actions) {
      const codeBlockMatch = response.match(/```json\s*([\s\S]*?)\s*```/)
      if (codeBlockMatch) {
        try {
          actions = JSON.parse(codeBlockMatch[1])
          console.log('[agentDecideBatch] Successfully parsed JSON with strategy 2')
        } catch (e) {
          console.log('[agentDecideBatch] Strategy 2 failed:', e.message)
        }
      }
    }
    
    // Strategy 3: Try to fix common JSON issues
    if (!actions) {
      try {
        // Remove any text before the first [ and after the last ]
        const cleanedResponse = response.replace(/^[^[]*/, '').replace(/[^]]*$/, '')
        actions = JSON.parse(cleanedResponse)
        console.log('[agentDecideBatch] Successfully parsed JSON with strategy 3')
      } catch (e) {
        console.log('[agentDecideBatch] Strategy 3 failed:', e.message)
      }
    }
    
    if (actions && Array.isArray(actions) && actions.length > 0) {
      // Validate and enhance actions
      return enhanceActionsWithValidation(actions, pageContext)
    }
    
    throw new Error('No valid JSON array found in response')
  } catch (error) {
    console.log('[agentDecideBatch] AI failed, using enhanced fallback actions:', error.message)
    return generateEnhancedFallbackActions(page, profile, pageContext)
  }
}

async function generateEnhancedFallbackActions(page, profile, pageContext) {
  const actions = []
  
  // Smart login detection and handling
  if (pageContext.formElements.length >= 2) {
    const usernameField = pageContext.formElements.find(el => 
      el.type === 'input' && (el.text.includes('username') || el.text.includes('email') || el.text.includes('login'))
    )
    const passwordField = pageContext.formElements.find(el => 
      el.type === 'input' && el.text.includes('password')
    )
    const submitButton = pageContext.interactiveElements.find(el => 
      el.type === 'button' && (el.text.toLowerCase().includes('login') || el.text.toLowerCase().includes('sign in') || el.text.toLowerCase().includes('submit'))
    )
    
    if (usernameField && passwordField && submitButton) {
      const username = profile?.login?.username || process.env[profile?.login?.usernameEnv] || 'testuser'
      const password = profile?.login?.password || process.env[profile?.login?.passwordEnv] || 'testpass'
      
      actions.push(
        { 
          action: 'fill', 
          target: usernameField.selector, 
          value: username, 
          text: `Fill username field: ${usernameField.text}`,
          waitFor: 'input'
        },
        { 
          action: 'fill', 
          target: passwordField.selector, 
          value: password, 
          text: `Fill password field: ${passwordField.text}`,
          waitFor: 'input'
        },
        { 
          action: 'click', 
          target: submitButton.selector, 
          text: `Click submit button: ${submitButton.text}`,
          waitFor: 'networkidle'
        }
      )
    }
  }
  
  // Smart navigation based on page type
  if (pageContext.pageType === 'navigation' && pageContext.navigationElements.length > 0) {
    const primaryNav = pageContext.navigationElements.find(el => 
      el.text.toLowerCase().includes('home') || 
      el.text.toLowerCase().includes('dashboard') ||
      el.text.toLowerCase().includes('main')
    ) || pageContext.navigationElements[0]
    
    actions.push({
      action: 'click',
      target: primaryNav.selector,
      text: `Navigate to: ${primaryNav.text}`,
      waitFor: 'networkidle'
    })
  }
  
  // Smart form interaction
  if (pageContext.pageType === 'form' && pageContext.formElements.length > 0) {
    const textInputs = pageContext.formElements.filter(el => 
      el.type === 'input' && !el.text.includes('password')
    )
    
    if (textInputs.length > 0) {
      const firstInput = textInputs[0]
      const testValue = firstInput.text.includes('email') ? 'test@example.com' : 
                       firstInput.text.includes('name') ? 'Test User' : 'test value'
      
      actions.push({
        action: 'fill',
        target: firstInput.selector,
        value: testValue,
        text: `Fill ${firstInput.text} field`,
        waitFor: 'input'
      })
    }
  }
  
  // Smart content validation
  if (pageContext.allElements.length > 0) {
    const importantElements = pageContext.allElements.filter(el => 
      el.text.length > 10 && el.text.length < 100 &&
      !el.text.toLowerCase().includes('copyright') &&
      !el.text.toLowerCase().includes('privacy')
    )
    
    if (importantElements.length > 0) {
      const keyElement = importantElements[0]
      actions.push({
        action: 'assertText',
        target: keyElement.selector,
        value: keyElement.text,
        text: `Verify content: ${keyElement.text.substring(0, 30)}...`,
        waitFor: 'visible'
      })
    }
  }
  
  // Error handling and recovery
  if (pageContext.errorMessages.length > 0) {
    actions.push({
      action: 'screenshot',
      text: 'Capture error state for analysis',
      waitFor: 'load'
    })
  }
  
  // Fallback: take screenshot if no meaningful actions found
  if (actions.length === 0) {
    actions.push({
      action: 'screenshot',
      text: 'Take screenshot of current page state',
      waitFor: 'load'
    })
  }
  
  return actions.slice(0, 4) // Limit to 4 actions for better focus
}

// Legacy fallback function for backward compatibility
async function generateFallbackActions(page, profile) {
  const pageContext = await getEnhancedPageContext(page)
  return generateEnhancedFallbackActions(page, profile, pageContext)
}

// ---------- Test case ingestion (Excel) ----------
function toLowerKeys(obj){
  const out = {}
  for(const k of Object.keys(obj||{})) out[String(k).toLowerCase()] = obj[k]
  return out
}
function normalizeDecisionFromRow(row){
  const r = toLowerKeys(row)
  const action = String(r.action || '').toLowerCase()
  const notes = r.notes || ''
  const value = r.value ?? null
  const selector = r.selector || r.css || null
  const id = r.targetid || r.id || null
  const name = r.name || null
  const placeholder = r.placeholder || null
  const text = r.text || r.label || null
  const press = r.press || null
  const navigate = r.navigate || null
  const decision = { action, notes }
  if (value != null) decision.value = value
  if (press) { decision.action = 'press'; decision.value = press }
  if (navigate) { decision.action = 'navigate'; decision.value = navigate }
  if (selector) decision.selector = selector
  if (id || name || placeholder || text) decision.target = { id, name, placeholder, text }
  return decision
}
// Very simple BDD line -> decisions
function parseBddLine(line){
  const t = String(line || '').trim()
  if(!t) return []
  
  console.log(`BDD parsing line: "${t}"`)
  
  // Handle login scenarios with credentials
  const loginMatch = t.match(/click\s+on\s+(.+?)\s+then\s+a\s+valid\s+user\(([^)]+)\)\s+and\s+password\(([^)]+)\)\s+is\s+logged\s+in/i)
  if(loginMatch) {
    console.log(`BDD parsing: detected login flow - click "${loginMatch[1]}" then login with user "${loginMatch[2]}"`)
    // Skip PLATFORM LOGIN click if it's Lavinia (will be done automatically)
    const actions = []
    if (!loginMatch[1].toLowerCase().includes('platform login')) {
      actions.push({ action: 'click', text: loginMatch[1].trim(), notes: `Click on ${loginMatch[1].trim()}` })
    }
    actions.push(
      { action: 'fill', target: { placeholder: 'username', name: 'username' }, value: loginMatch[2], notes: `Fill username with ${loginMatch[2]}` },
      { action: 'fill', target: { placeholder: 'password', name: 'password' }, value: loginMatch[3], notes: `Fill password` },
      { action: 'click', text: 'Login', notes: 'Click Login button', selector: 'button[type="submit"]' }
    )
    return actions
  }
  
  // Handle simple login with credentials
  const simpleLogin = t.match(/a\s+valid\s+user\(([^)]+)\)\s+and\s+password\(([^)]+)\)\s+is\s+logged\s+in/i)
  if(simpleLogin) {
    console.log(`BDD parsing: detected login with user "${simpleLogin[1]}"`)
    return [
      { action: 'fill', target: { placeholder: 'username', name: 'username' }, value: simpleLogin[1], notes: `Fill username with ${simpleLogin[1]}` },
      { action: 'fill', target: { placeholder: 'password', name: 'password' }, value: simpleLogin[2], notes: `Fill password` },
      { action: 'click', text: 'Login', notes: 'Click Login button', selector: 'button[type="submit"]' }
    ]
  }
  
  // ignore purely descriptive givens (but not login ones)
  if(/^given\b/i.test(t) && !/user\(|password\(|login/i.test(t)) {
    console.log(`BDD parsing: ignored Given line as note`)
    return [{ action: 'note', notes: t }]
  }
  
  // navigate to URL or page
  const navUrl = t.match(/navigate(?:s|d)?\s*(?:to|towards)\s+(https?:[^\s]+|\/[\w\-\/]+)\b/i)
  if(navUrl) {
    console.log(`BDD parsing: detected navigate action to "${navUrl[1]}"`)
    return [{ action: 'navigate', value: navUrl[1], notes: t }]
  }
  
  // navigate to dashboard or specific page
  const navPage = t.match(/navigate(?:s|d)?\s*(?:to|towards)\s+(the\s+)?(.+)/i)
  if(navPage && /dashboard|page|section|area/i.test(navPage[2])) {
    const target = navPage[2].trim()
    console.log(`BDD parsing: detected navigate action to "${target}"`)
    return [{ action: 'click', text: target, notes: t }]
  }
  
  // hover over text
  const hov = t.match(/hover(?:s|ed)?\s*(?:over|on)\s+(.+)/i)
  if(hov) {
    console.log(`BDD parsing: detected hover action over "${hov[1].trim()}"`)
    return [{ action: 'hover', text: hov[1].trim(), notes: t }]
  }
  
  // click/select/open/go to <text>
  const clickText = t.match(/\b(click|select|choose|open|go to)\b\s+(.+)/i)
  if(clickText) {
    console.log(`BDD parsing: detected click action on "${clickText[2].trim()}"`)
    return [{ action: 'click', text: clickText[2].trim(), notes: t }]
  }
  
  // fill <field> with <value>
  const fill = t.match(/fill\s+(.+?)\s+with\s+(.+)/i)
  if(fill) {
    console.log(`BDD parsing: detected fill action for "${fill[1].trim()}" with "${fill[2].trim()}"`)
    return [{ action: 'fill', target: { placeholder: fill[1].trim(), name: fill[1].trim() }, value: fill[2].trim(), notes: t }]
  }
  
  // press key
  const press = t.match(/\bpress\b\s+(Enter|Tab|Escape|Space|ArrowUp|ArrowDown|ArrowLeft|ArrowRight)/i)
  if(press) {
    console.log(`BDD parsing: detected press action for key "${press[1]}"`)
    return [{ action: 'press', value: press[1], notes: t }]
  }
  
  // expectation: Then/Expect/Should see <text>
  const exp = t.match(/\b(then|expect|should\s+see)\b\s+(.+)/i)
  if(exp) {
    console.log(`BDD parsing: detected assertText action for "${exp[2].trim()}"`)
    return [{ action: 'assertText', value: exp[2].trim(), notes: t }]
  }
  
  // default: try to click matching text, but clean up "When" statements
  let cleanText = t
  if(/^when\s+/i.test(cleanText)) {
    cleanText = cleanText.replace(/^when\s+/i, '').trim()
  }
  if(/^and\s+/i.test(cleanText)) {
    cleanText = cleanText.replace(/^and\s+/i, '').trim()
  }
  console.log(`BDD parsing: defaulting to click action on "${cleanText}"`)
  return [{ action: 'click', text: cleanText }]
}
function expandBddToDecisions(bddCell){
  const lines = String(bddCell || '').split(/\r?\n+/)
  const out = []
  for(const line of lines){
    out.push(...parseBddLine(line))
  }
  return out
}
function parseTestCasesFromXlsx(filePath, testType){
  try{
    const wb = xlsx.readFile(filePath)
    const want = String(testType || '').toLowerCase()
    let sheetName = wb.SheetNames.find(n => String(n).toLowerCase() === want)
    if (!sheetName) sheetName = wb.SheetNames.find(n => String(n).toLowerCase() === 'all')
    if (!sheetName) sheetName = wb.SheetNames[0]
    console.log(`Excel parsing: found sheets [${wb.SheetNames.join(', ')}], selected "${sheetName}" for test type "${testType}"`)
    
    const ws = wb.Sheets[sheetName]
    const rows = xlsx.utils.sheet_to_json(ws, { defval: '' })
    console.log(`Excel parsing: found ${rows.length} rows in sheet "${sheetName}"`)
    
    const filtered = (String(sheetName).toLowerCase() === want)
      ? rows
      : rows.filter(row => {
          const r = toLowerKeys(row)
          const suite = String(r.suite || r.type || r.category || 'all').toLowerCase()
          return suite === 'all' || suite === '' || suite === want
        })
    console.log(`Excel parsing: filtered to ${filtered.length} rows`)
    
    // If a BDD column exists, expand it into decisions; else use action/selector/value columns
    const hasBdd = filtered.length && Object.keys(toLowerKeys(filtered[0])).some(k => /bdd|test\s*script/i.test(k))
    console.log(`Excel parsing: BDD detection - hasBdd=${hasBdd}, columns=${filtered.length ? Object.keys(filtered[0]).join(', ') : 'none'}`)
    
    if (hasBdd) {
      const key = Object.keys(toLowerKeys(filtered[0])).find(k => /bdd|test\s*script/i.test(k))
      console.log(`Excel parsing: BDD column key="${key}"`)
      console.log(`Excel parsing: First row data:`, JSON.stringify(filtered[0], null, 2))
      
      const all = []
      for(const row of filtered){
        // Try multiple ways to get the BDD text
        let bddText = null
        
        // Method 1: Direct key access
        if (row[key]) {
          bddText = row[key]
        }
        // Method 2: Case-insensitive key search
        else {
          const foundKey = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase())
          if (foundKey) {
            bddText = row[foundKey]
          }
        }
        // Method 3: Look for any column containing BDD-like content
        if (!bddText) {
          for (const colKey of Object.keys(row)) {
            const value = row[colKey]
            if (value && typeof value === 'string' && value.length > 20 && 
                (value.includes('Given') || value.includes('When') || value.includes('Then') || 
                 value.includes('navigate') || value.includes('click') || value.includes('hover'))) {
              bddText = value
              console.log(`Excel parsing: Found BDD content in column "${colKey}"`)
              break
            }
          }
        }
        
        console.log(`Excel parsing: BDD text from row: "${bddText}"`)
        
        if (bddText && bddText !== 'undefined' && bddText.trim()) {
          const decisions = expandBddToDecisions(bddText)
          console.log(`Excel parsing: expanded to ${decisions.length} decisions:`, decisions)
          all.push(...decisions)
        } else {
          console.log(`Excel parsing: Skipping empty/undefined BDD text`)
        }
      }
      console.log(`Excel parsing: total decisions: ${all.length}`)
      return all
    }
    return filtered.map(normalizeDecisionFromRow).filter(d => d.action)
  }catch(err){
    console.warn('Failed to parse Excel test cases:', err?.message || err)
    return []
  }
}

// ---------- UI/Report helpers ----------
function buildAssetsIndexHTML({ projectName, runId, files }) {
  const items = files.map(f =>
    `<li><a href="${f.url}" target="_blank" rel="noopener">${f.filename}</a> <small>(${f.type})</small></li>`
  ).join('\n')

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>Assets · ${projectName} · ${runId}</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:24px;background:#f7f7fb;color:#111}
  h1{margin:0 0 8px}
  .card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:16px}
  ul{line-height:1.7}
</style>
</head>
<body>
  <h1>Assets</h1>
  <div class="card">
    <p><strong>Project:</strong> ${projectName} &nbsp; <strong>Run:</strong> ${runId}</p>
    <ul>${items}</ul>
  </div>
</body>
</html>`
}

export function buildReportHTML({ projectName, testType, startedAt, plan, checks = [], heuristics = [], artifacts = [], actions = [] }) {
  const imgs = artifacts.filter(a => a.type === 'screenshot')
  const vids = artifacts.filter(a => a.type === 'video')

  const total = actions.length
  const passed = actions.filter(a => a.status === 'ok').length
  const failed = actions.filter(a => a.status === 'error').length
  const successRate = total > 0 ? Math.round((passed / total) * 100) : 0

  const checksHtml = (checks || []).map(c =>
    `<li><strong>${c.title || c.id}</strong>${c.rationale ? ` — <em>${c.rationale}</em>` : ''}</li>`
  ).join('\n')

  const heurHtml = (heuristics || []).map(h => `<li>${h}</li>`).join('\n')

  const actionRows = actions.map((a,i) => {
    const statusClass = a.status === 'ok' ? 'status-ok' : a.status === 'error' ? 'status-error' : 'status-pending'
    const statusIcon = a.status === 'ok' ? '✅' : a.status === 'error' ? '❌' : '⏳'
    return `
    <tr class="action-row ${statusClass}">
      <td class="step-number">${i+1}</td>
      <td class="action-type"><code>${a.action}</code></td>
      <td class="action-target">${a.target?.label || a.target?.selector || a.target?.uid || ''}</td>
      <td class="action-value">${a.value ?? ''}</td>
      <td class="action-status">${statusIcon} ${a.status}</td>
      <td class="action-notes">${a.notes || ''}</td>
    </tr>`
  }).join('')

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>${projectName} · ${testType} Report</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
  }
  
  .container {
    max-width: 1200px; margin: 0 auto; padding: 20px;
  }
  
  .header {
    background: white; border-radius: 20px; padding: 30px; margin-bottom: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    text-align: center;
  }
  
  .header h1 {
    margin: 0 0 10px 0; font-size: 2.5em; font-weight: 700;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .header .meta {
    color: #6b7280; font-size: 1.1em;
  }
  
  .summary-cards {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px; margin-bottom: 20px;
  }
  
  .summary-card {
    background: white; border-radius: 16px; padding: 25px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    text-align: center; transition: transform 0.2s;
  }
  
  .summary-card:hover { transform: translateY(-2px); }
  
  .summary-card .number {
    font-size: 2.5em; font-weight: 700; margin-bottom: 5px;
  }
  
  .summary-card .label {
    color: #6b7280; font-size: 0.9em; text-transform: uppercase; letter-spacing: 0.5px;
  }
  
  .total .number { color: #3b82f6; }
  .passed .number { color: #10b981; }
  .failed .number { color: #ef4444; }
  .success .number { color: #f59e0b; }
  
  .section {
    background: white; border-radius: 16px; margin-bottom: 20px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;
  }
  
  .section-header {
    background: linear-gradient(135deg, #f8fafc, #e2e8f0);
    padding: 20px 25px; cursor: pointer; user-select: none;
    display: flex; align-items: center; justify-content: space-between;
    transition: background 0.2s;
  }
  
  .section-header:hover { background: linear-gradient(135deg, #e2e8f0, #cbd5e1); }
  
  .section-header h2 {
    margin: 0; font-size: 1.3em; font-weight: 600; color: #1e293b;
  }
  
  .section-content {
    padding: 25px; display: none;
  }
  
  .section-content.active { display: block; }
  
  .toggle-icon {
    font-size: 1.2em; transition: transform 0.2s;
  }
  
  .section-header.active .toggle-icon { transform: rotate(180deg); }
  
  .plan-content {
    background: #f8fafc; border-radius: 12px; padding: 20px;
    border-left: 4px solid #3b82f6; font-size: 1.1em; line-height: 1.6;
  }
  
  .checks-list {
    background: #f8fafc; border-radius: 12px; padding: 20px;
    border-left: 4px solid #10b981;
  }
  
  .checks-list ol, .checks-list ul {
    margin: 0; padding-left: 20px;
  }
  
  .checks-list li {
    margin-bottom: 10px; line-height: 1.5;
  }
  
  .actions-table {
    width: 100%; border-collapse: collapse; margin-top: 15px; table-layout: auto;
  }
  
  .actions-table th {
    background: #f1f5f9; padding: 12px; text-align: left; font-weight: 600;
    color: #475569; border-bottom: 2px solid #e2e8f0;
  }
  
  .actions-table td {
    padding: 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top;
  }
  
  .action-row { transition: background 0.2s; }
  .action-row:hover { background: #f8fafc; }
  
  .action-row.status-ok { border-left: 4px solid #10b981; }
  .action-row.status-error { border-left: 4px solid #ef4444; }
  .action-row.status-pending { border-left: 4px solid #f59e0b; }
  
  .step-number { font-weight: 600; color: #475569; width: 50px; }
  .action-type { font-family: 'Monaco', 'Menlo', monospace; }
  .action-status { font-weight: 600; }
  .action-target, .action-value, .action-notes {
    color: #475569;
    font-size: 0.95em;
    white-space: normal;
    word-break: break-word;
    overflow-wrap: anywhere;
  }
  
  .media-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px; margin-top: 15px;
  }
  
  .media-item {
    background: #f8fafc; border-radius: 12px; padding: 15px;
    border: 1px solid #e2e8f0;
  }
  
  .media-item img, .media-item video {
    width: 100%; border-radius: 8px; margin-bottom: 10px;
  }
  
  .media-item .caption {
    color: #6b7280; font-size: 0.9em; text-align: center;
  }
  
  .no-media {
    text-align: center; color: #6b7280; font-style: italic;
    padding: 40px 20px;
  }
  
  @media (max-width: 768px) {
    .container { padding: 10px; }
    .summary-cards { grid-template-columns: repeat(2, 1fr); }
    .actions-table { font-size: 0.9em; }
    .actions-table th, .actions-table td { padding: 8px; }
  }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${projectName} · ${testType} Report</h1>
      <div class="meta">Started: ${startedAt}</div>
    </div>

    <div class="summary-cards">
      <div class="summary-card total">
        <div class="number">${total}</div>
        <div class="label">Total Steps</div>
      </div>
      <div class="summary-card passed">
        <div class="number">${passed}</div>
        <div class="label">Passed</div>
      </div>
      <div class="summary-card failed">
        <div class="number">${failed}</div>
        <div class="label">Failed</div>
      </div>
      <div class="summary-card success">
        <div class="number">${successRate}%</div>
        <div class="label">Success Rate</div>
      </div>
    </div>

    <div class="section">
      <div class="section-header" onclick="toggleSection('plan')">
        <h2>📋 Test Plan</h2>
        <span class="toggle-icon">▼</span>
      </div>
      <div class="section-content" id="plan-content">
        <div class="plan-content">${plan ? String(plan).replace(/\n/g,'<br/>') : 'No plan available.'}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-header" onclick="toggleSection('checks')">
        <h2>✅ Test Checks</h2>
        <span class="toggle-icon">▼</span>
      </div>
      <div class="section-content" id="checks-content">
        <div class="checks-list">
          <h3>Test Steps:</h3>
          <ol>${checksHtml || '<li>No specific checks defined.</li>'}</ol>
          <h3>Testing Heuristics:</h3>
          <ul>${heurHtml || '<li>No heuristics defined.</li>'}</ul>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header" onclick="toggleSection('actions')">
        <h2>🎯 Test Actions</h2>
        <span class="toggle-icon">▼</span>
      </div>
      <div class="section-content" id="actions-content">
        <table class="actions-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Action</th>
              <th>Target</th>
              <th>Value</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>${actionRows || '<tr><td colspan="6" style="text-align:center;color:#6b7280;padding:20px;">No actions recorded.</td></tr>'}</tbody>
        </table>
      </div>
    </div>

    <div class="section">
      <div class="section-header" onclick="toggleSection('video')">
        <h2>🎥 Screen Recording</h2>
        <span class="toggle-icon">▼</span>
      </div>
      <div class="section-content" id="video-content">
        ${vids.length > 0 ? 
          `<div class="media-grid">
            ${vids.map(a => `
              <div class="media-item">
                <video controls style="width:100%;border-radius:8px;">
                  <source src="${a.url}" type="video/webm">
                  Your browser does not support the video tag.
                </video>
                <div class="caption">${a.filename}</div>
              </div>
            `).join('')}
          </div>` : 
          '<div class="no-media">No video recording available.</div>'
        }
      </div>
    </div>

    <div class="section">
      <div class="section-header" onclick="toggleSection('screenshots')">
        <h2>📸 Screenshots</h2>
        <span class="toggle-icon">▼</span>
      </div>
      <div class="section-content" id="screenshots-content">
        ${imgs.length > 0 ? 
          `<div class="media-grid">
            ${imgs.map(a => `
              <div class="media-item">
                <img src="${a.url}" alt="${a.filename}" style="width:100%;border-radius:8px;">
                <div class="caption">${a.filename}</div>
              </div>
            `).join('')}
          </div>` : 
          '<div class="no-media">No screenshots available.</div>'
        }
      </div>
    </div>
  </div>

  <script>
    function toggleSection(sectionId) {
      const header = event.currentTarget;
      const content = document.getElementById(sectionId + '-content');
      
      header.classList.toggle('active');
      content.classList.toggle('active');
    }
    
    // Auto-expand first section (Test Plan)
    document.addEventListener('DOMContentLoaded', function() {
      const firstSection = document.querySelector('.section-header');
      if (firstSection) {
        firstSection.click();
      }
    });
  </script>
</body>
</html>`
}

// Recursively gather files (Playwright may nest videos)
function walkFiles(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walkFiles(p))
    else out.push(p)
  }
  return out
}

// ---------- OpenAI rate-limit helpers ----------
function sleep(ms){ return new Promise(r => setTimeout(r, ms)) }
let lastOAICall = 0

// ---------- Agent utilities ----------
const DANGEROUS_RE = /(delete|remove|destroy|drop|logout|sign\s*out|deactivate|close\s*account|unsubscribe|checkout|purchase|pay|buy)/i

function genValueFor(desc, runId){
  const seed = runId.slice(0,8)
  const type = (desc.type || '').toLowerCase()
  const name = (desc.name || '').toLowerCase()
  const placeholder = (desc.placeholder || '').toLowerCase()
  const tag = (desc.tag || '').toLowerCase()
  const hint = `${type} ${name} ${placeholder}`

  if (/email/.test(hint)) return `qa.${seed}@example.com`
  if (/phone|tel/.test(hint)) return '5550101234'
  if (/pass/.test(hint)) return 'QAtest1234!'
  if (/url|link/.test(hint)) return 'https://example.com/test'
  if (/zip|pincode|postal/.test(hint)) return '12345'
  if (/city/.test(hint)) return 'Testville'
  if (/name|first|last|full/.test(hint)) return 'QA Tester'
  if (/search|query/.test(hint)) return 'test query'
  if (/address/.test(hint)) return '123 Test St'
  if (/company|org/.test(hint)) return 'QA Org'
  if (type === 'number') return '42'
  if (tag === 'textarea') return 'Automated exploratory input.'
  return 'Test value'
}

function cssEscape(s) {
  return String(s).replace(/["\\]/g, '\\$&')
}

async function summarizeInteractables(page){
  return await page.evaluate(() => {
    function visible(el){
      const style = window.getComputedStyle(el)
      const rect = el.getBoundingClientRect()
      return style && style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0
    }
    const nodes = Array.from(document.querySelectorAll('input, textarea, select, button, a, [role="button"]'))
    const items = []
    let idx = 0
    for(const el of nodes){
      if(!visible(el)) continue
      const tag = (el.tagName || '').toLowerCase()
      const role = el.getAttribute('role') || ''
      const type = (el.getAttribute('type') || '').toLowerCase()
      const name = el.getAttribute('name') || ''
      const id = el.id || ''
      const placeholder = el.getAttribute('placeholder') || ''
      const href = (el instanceof HTMLAnchorElement && el.href) ? el.href : ''
      const label = (el.labels && el.labels[0] && el.labels[0].innerText) || el.getAttribute('aria-label') || el.innerText || ''
      const required = !!el.getAttribute('required') || el.getAttribute('aria-required') === 'true'
      const disabled = !!el.getAttribute('disabled') || el.getAttribute('aria-disabled') === 'true'
      const text = (el.innerText || '').trim().slice(0,120)

      // compute a simple selector
      let selector = ''
      if(id) selector = `#${id}`
      else if(name) selector = `[name="${name.replace(/["\\]/g,'\\$&')}"]`
      else if(placeholder) selector = `[placeholder="${placeholder.replace(/["\\]/g,'\\$&')}"]`
      else if(tag === 'button' && text) selector = `button:has-text("${text.replace(/["\\]/g,'\\$&')}")`
      else if(tag === 'a' && text) selector = `a:has-text("${text.replace(/["\\]/g,'\\$&')}")`

      items.push({
        uid: 'e'+(idx++),
        tag, role, type, name, id, placeholder, href, label, text, required, disabled,
        selector
      })
    }
    return { url: location.href, title: document.title, interactables: items }
  })
}

function locatorFor(page, desc){
  if (desc.selector && !/has-text/.test(desc.selector)) return page.locator(desc.selector)
  if (desc.id) return page.locator(`#${cssEscape(desc.id)}`)
  if (desc.name) return page.locator(`[name="${cssEscape(desc.name)}"]`)
  if (desc.placeholder) return page.locator(`[placeholder="${cssEscape(desc.placeholder)}"]`)
  // fallback to role/name heuristics with better handling of multiple elements
  if ((desc.tag === 'button' || desc.role === 'button') && desc.text) {
    const locator = page.getByRole('button', { name: desc.text, exact: false })
    return locator.first() // Use first button if multiple found
  }
  if (desc.tag === 'a' && desc.text) {
    const locator = page.getByRole('link', { name: desc.text, exact: false })
    return locator.first() // Use first link if multiple found
  }
  if (desc.text) {
    const locator = page.getByText(desc.text, { exact: false })
    return locator.first() // Use first text match if multiple found
  }
  // ultimate fallback: first visible input
  return page.locator('input, textarea, select').first()
}

// Single-step agent (kept for reference)
async function agentDecide({ testType, current, history }){
  const prompt = `You are an expert QA agent performing ${testType} testing.
Given the current page summary and recent actions, choose ONE next action.

Return STRICT JSON:
{"action":"fill|click|select|press|navigate|end","target_uid": "...", "value": "...", "notes":"..."}`

  const res = await callOpenAI(() => client.responses.create({
    model: 'gpt-4o-mini',
    temperature: 0.2,
    input: [
      { role: 'system', content: 'You output ONLY JSON. No prose.' },
      { role: 'user', content: prompt },
      { role: 'user', content: JSON.stringify({ current, history }).slice(0, 15000) }
    ]
  }), 'agentDecide')
  const text = res.output_text || ''
  const m = text.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('Agent did not return JSON')
  return JSON.parse(m[0])
}

// ---------- Action Execution ----------
async function executeDecision(page, decision, artifacts, outDir) {
  const { action, target, value, text, waitFor } = decision
  
  console.log(`🎯 Executing action: ${action} on ${target} (${text || 'no description'})`)
  
  try {
    // Pre-action validation and preparation
    if (target && action !== 'navigate' && action !== 'press' && action !== 'wait') {
      await waitForElementToBeReady(page, target, action)
    }
    
    switch (action) {
      case 'navigate':
        if (value) {
          const waitUntil = waitFor || 'networkidle'
          await page.goto(value, { waitUntil, timeout: 30000 })
          console.log(`🌐 Navigated to: ${value}`)
        }
        break
        
      case 'click':
        if (target) {
          const element = page.locator(target)
          await element.waitFor({ state: 'visible', timeout: 10000 })
          await element.scrollIntoViewIfNeeded()
          await element.click({ timeout: 10000, force: true })
          
          // Wait for page response after click
          if (waitFor === 'networkidle') {
            await page.waitForLoadState('networkidle', { timeout: 10000 })
          } else if (waitFor && waitFor !== 'click') {
            await page.waitForSelector(waitFor, { timeout: 10000 })
          }
          
          console.log(`👆 Clicked element: ${target}`)
        }
        break
        
      case 'fill':
        if (target && value) {
          const element = page.locator(target)
          await element.waitFor({ state: 'visible', timeout: 10000 })
          await element.scrollIntoViewIfNeeded()
          await element.clear()
          await element.fill(value)
          
          // Wait for input to be processed
          if (waitFor === 'input') {
            await page.waitForTimeout(500)
          }
          
          console.log(`✏️ Filled field: ${target} with "${value}"`)
        }
        break
        
      case 'select':
        if (target && value) {
          const element = page.locator(target)
          await element.waitFor({ state: 'visible', timeout: 10000 })
          await element.selectOption(value)
          console.log(`📋 Selected option: ${value} in ${target}`)
        }
        break
        
      case 'press':
        if (value) {
          await page.keyboard.press(value)
          console.log(`⌨️ Pressed key: ${value}`)
        }
        break
        
      case 'hover':
        if (target) {
          const element = page.locator(target)
          await element.waitFor({ state: 'visible', timeout: 10000 })
          await element.hover()
          console.log(`🖱️ Hovered over: ${target}`)
        }
        break
        
      case 'assertText':
        if (target && value) {
          const element = page.locator(target)
          await element.waitFor({ state: 'visible', timeout: 10000 })
          const actualText = await element.textContent()
          
          if (!actualText || !actualText.includes(value)) {
            throw new Error(`Text assertion failed. Expected "${value}" but found "${actualText}"`)
          }
          
          console.log(`✅ Text assertion passed: "${value}" found in ${target}`)
        }
        break
        
      case 'wait':
        const waitTime = parseInt(value) || parseInt(target) || 2000
        await page.waitForTimeout(waitTime)
        console.log(`⏱️ Waited for ${waitTime}ms`)
        break
        
      case 'screenshot':
        const screenshotPath = path.join(outDir, `screenshot_${Date.now()}.png`)
        await page.screenshot({ path: screenshotPath, fullPage: true })
        artifacts.push({ type: 'screenshot', path: screenshotPath })
        console.log(`📸 Screenshot saved: ${screenshotPath}`)
        break
        
      case 'scroll':
        if (target === 'down' || !target) {
          await page.evaluate(() => window.scrollBy(0, 500))
        } else if (target === 'up') {
          await page.evaluate(() => window.scrollBy(0, -500))
        } else if (target === 'top') {
          await page.evaluate(() => window.scrollTo(0, 0))
        } else if (target === 'bottom') {
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        }
        console.log(`📜 Scrolled: ${target || 'down'}`)
        break
        
      default:
        console.log(`⚠️ Unknown action: ${action}`)
        throw new Error(`Unsupported action: ${action}`)
    }
    
    console.log(`✅ Action ${action} completed successfully`)
    
  } catch (error) {
    console.log(`❌ Action ${action} failed: ${error.message}`)
    
    // Enhanced error reporting
    if (error.message.includes('timeout')) {
      console.log(`⏰ Timeout error - element may not be visible or page may be slow`)
    } else if (error.message.includes('not found') || error.message.includes('selector')) {
      console.log(`🔍 Element not found - selector may be incorrect: ${target}`)
    } else if (error.message.includes('not visible')) {
      console.log(`👁️ Element not visible - may be hidden or off-screen: ${target}`)
    }
    
    throw error
  }
}

// Enhanced element waiting with multiple strategies
async function waitForElementToBeReady(page, selector, action) {
  try {
    // Wait for element to exist
    await page.waitForSelector(selector, { timeout: 10000 })
    
    // Wait for element to be visible
    await page.waitForSelector(selector, { state: 'visible', timeout: 5000 })
    
    // For clickable elements, ensure they're enabled
    if (action === 'click') {
      const element = page.locator(selector)
      await element.waitFor({ state: 'attached', timeout: 5000 })
      
      // Check if element is enabled
      const isDisabled = await element.getAttribute('disabled')
      if (isDisabled !== null) {
        throw new Error(`Element is disabled: ${selector}`)
      }
    }
    
    // For form elements, ensure they're ready for interaction
    if (action === 'fill' || action === 'select') {
      const element = page.locator(selector)
      await element.waitFor({ state: 'visible', timeout: 5000 })
      
      // Ensure element is not readonly
      const isReadonly = await element.getAttribute('readonly')
      if (isReadonly !== null) {
        throw new Error(`Element is readonly: ${selector}`)
      }
    }
    
  } catch (error) {
    console.log(`⚠️ Element readiness check failed for ${selector}: ${error.message}`)
    throw error
  }
}

// ---------- Enhanced Login Functions ----------

// Intelligent login detection and execution
async function attemptIntelligentLogin(page, username, password, pageContext, artifacts, outDir) {
  console.log('🧠 Attempting intelligent login detection...')
  
  try {
    // Find login form elements using multiple strategies
    const loginElements = findLoginElements(pageContext)
    
    if (!loginElements.username || !loginElements.password || !loginElements.submit) {
      console.log('❌ Login form not detected on current page')
      return false
    }
    
    console.log('✅ Login form detected:')
    console.log(`- Username field: ${loginElements.username.selector}`)
    console.log(`- Password field: ${loginElements.password.selector}`)
    console.log(`- Submit button: ${loginElements.submit.selector}`)
    
    // Take screenshot before login
    const beforeLoginPath = path.join(outDir, 'before_login.png')
    await page.screenshot({ path: beforeLoginPath, fullPage: true })
    artifacts.push({ type: 'screenshot', path: beforeLoginPath })
    
    // Execute login sequence
    console.log('🔐 Executing login sequence...')
    
    // Fill username
    await page.locator(loginElements.username.selector).waitFor({ state: 'visible', timeout: 10000 })
    await page.locator(loginElements.username.selector).clear()
    await page.locator(loginElements.username.selector).fill(username)
    console.log(`✏️ Filled username: ${username}`)
    
    // Fill password
    await page.locator(loginElements.password.selector).waitFor({ state: 'visible', timeout: 10000 })
    await page.locator(loginElements.password.selector).clear()
    await page.locator(loginElements.password.selector).fill(password)
    console.log(`🔒 Filled password: ***`)
    
    // Click submit
    await page.locator(loginElements.submit.selector).waitFor({ state: 'visible', timeout: 10000 })
    await page.locator(loginElements.submit.selector).click()
    console.log(`👆 Clicked submit button`)
    
    // Wait for login to complete
    await page.waitForLoadState('networkidle', { timeout: 15000 })
    
    // Verify login success by checking for common success indicators
    const loginSuccess = await verifyLoginSuccess(page)
    
    if (loginSuccess) {
      console.log('✅ Login successful!')
      return true
    } else {
      console.log('❌ Login may have failed - no success indicators found')
      return false
    }
    
  } catch (error) {
    console.log(`❌ Intelligent login failed: ${error.message}`)
    return false
  }
}

// Find login form elements using intelligent detection
function findLoginElements(pageContext) {
  const loginElements = { username: null, password: null, submit: null }
  
  // Find username field (multiple strategies)
  const usernameCandidates = pageContext.formElements.filter(el => {
    const text = el.text.toLowerCase()
    return text.includes('username') || text.includes('email') || text.includes('login') || 
           text.includes('user') || el.type === 'email'
  })
  
  if (usernameCandidates.length > 0) {
    loginElements.username = usernameCandidates[0]
  }
  
  // Find password field
  const passwordCandidates = pageContext.formElements.filter(el => {
    const text = el.text.toLowerCase()
    return text.includes('password') || el.type === 'password'
  })
  
  if (passwordCandidates.length > 0) {
    loginElements.password = passwordCandidates[0]
  }
  
  // Find submit button
  const submitCandidates = pageContext.interactiveElements.filter(el => {
    const text = el.text.toLowerCase()
    return text.includes('login') || text.includes('sign in') || text.includes('submit') ||
           text.includes('log in') || text.includes('enter')
  })
  
  if (submitCandidates.length > 0) {
    loginElements.submit = submitCandidates[0]
  }
  
  return loginElements
}

// Verify login success by checking for common indicators
async function verifyLoginSuccess(page) {
  try {
    // Check for common success indicators
    const successIndicators = [
      'dashboard', 'welcome', 'profile', 'account', 'logout', 'sign out',
      'user menu', 'settings', 'my account', 'home', 'main'
    ]
    
    const pageContent = await page.textContent('body')
    const pageTitle = await page.title()
    const currentUrl = page.url()
    
    // Check if URL changed (common after login)
    if (currentUrl.includes('dashboard') || currentUrl.includes('account') || 
        currentUrl.includes('profile') || currentUrl.includes('home')) {
      return true
    }
    
    // Check page title for success indicators
    const titleLower = pageTitle.toLowerCase()
    if (successIndicators.some(indicator => titleLower.includes(indicator))) {
      return true
    }
    
    // Check page content for success indicators
    const contentLower = pageContent.toLowerCase()
    if (successIndicators.some(indicator => contentLower.includes(indicator))) {
      return true
    }
    
    // Check for absence of login form (another success indicator)
    const loginFormExists = await page.locator('form').count() > 0
    if (!loginFormExists) {
      return true
    }
    
    return false
    
  } catch (error) {
    console.log(`⚠️ Error verifying login success: ${error.message}`)
    return false
  }
}

// Analyze page changes after each action
async function analyzePageChanges(page, actions) {
  try {
    const currentUrl = page.url()
    const pageTitle = await page.title()
    const lastAction = actions[actions.length - 1]
    
    // Log significant page changes
    if (lastAction && lastAction.action === 'click') {
      console.log(`🔄 Page state after click: ${pageTitle} (${currentUrl})`)
      
      // Check for navigation
      if (currentUrl !== lastAction.previousUrl) {
        console.log(`🌐 Navigation detected: ${lastAction.previousUrl} → ${currentUrl}`)
      }
      
      // Check for new content
      const newContent = await page.evaluate(() => {
        const forms = document.querySelectorAll('form')
        const buttons = document.querySelectorAll('button, input[type="submit"]')
        const links = document.querySelectorAll('a')
        return {
          forms: forms.length,
          buttons: buttons.length,
          links: links.length
        }
      })
      
      console.log(`📊 Page elements: ${newContent.forms} forms, ${newContent.buttons} buttons, ${newContent.links} links`)
    }
    
  } catch (error) {
    console.log(`⚠️ Error analyzing page changes: ${error.message}`)
  }
}

// Legacy login function for backward compatibility
async function attemptLogin(page, profile, artifacts, outDir) {
  console.log('🔐 Attempting automatic login...')
  
  try {
    // Wait for login form to be visible with longer timeout
    console.log('⏳ Waiting for login form to load...')
    await page.waitForLoadState('networkidle', { timeout: 30000 })
    await page.waitForTimeout(2000) // Additional wait for form elements
    
    // Look for login form elements with better selectors
    const usernameSelectors = [
      'input[name="email"]',
      'input[name="username"]', 
      'input[placeholder*="email"]',
      'input[placeholder*="username"]',
      'input[type="email"]',
      '#user_email',
      '#user_login'
    ]
    
    const passwordSelectors = [
      'input[name="password"]',
      'input[type="password"]',
      'input[placeholder*="password"]',
      '#user_pass'
    ]
    
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Login")',
      'button:has-text("Sign In")',
      'button:has-text("Sign in")'
    ]
    
    // Find the first visible element for each type
    let usernameField = null
    let passwordField = null
    let submitButton = null
    
    // Wait for at least one form element to appear
    console.log('🔍 Looking for login form elements...')
    await page.waitForTimeout(3000) // Wait for dynamic content
    
    for (const selector of usernameSelectors) {
      try {
        const element = page.locator(selector).first()
        if (await element.isVisible()) {
          usernameField = element
          console.log(`✅ Found username field: ${selector}`)
          break
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    for (const selector of passwordSelectors) {
      try {
        const element = page.locator(selector).first()
        if (await element.isVisible()) {
          passwordField = element
          console.log(`✅ Found password field: ${selector}`)
          break
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    for (const selector of submitSelectors) {
      try {
        const element = page.locator(selector).first()
        if (await element.isVisible()) {
          submitButton = element
          console.log(`✅ Found submit button: ${selector}`)
          break
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (usernameField && passwordField && submitButton) {
      // Get credentials from profile
      const username = profile?.login?.username || process.env[profile?.login?.usernameEnv]
      const password = profile?.login?.password || process.env[profile?.login?.passwordEnv]
      
      if (username && password) {
        console.log(`🔐 Filling credentials for user: ${username}`)
        
        // Take screenshot before login
        const beforeLoginPath = path.join(outDir, 'before_login.png')
        await page.screenshot({ path: beforeLoginPath, fullPage: true })
        artifacts.push({ type: 'screenshot', path: beforeLoginPath })
        
        // Fill username
        await usernameField.fill(username)
        console.log('✅ Username filled')
        
        // Fill password
        await passwordField.fill(password)
        console.log('✅ Password filled')
        
        // Wait a moment
        await page.waitForTimeout(1000)
        
        // Click login button
        await submitButton.click()
        console.log('✅ Login button clicked')
        
        // Wait for navigation or success
        await page.waitForLoadState('networkidle', { timeout: 15000 })
        await page.waitForTimeout(2000)
        
        // Take screenshot after login
        const afterLoginPath = path.join(outDir, 'after_login.png')
        await page.screenshot({ path: afterLoginPath, fullPage: true })
        artifacts.push({ type: 'screenshot', path: afterLoginPath })
        
        console.log('✅ Login attempt completed')
        return true
        
      } else {
        console.log('❌ No credentials available for login')
        return false
      }
    } else {
      console.log('❌ Login form elements not found')
      console.log('- Username field:', !!usernameField)
      console.log('- Password field:', !!passwordField)
      console.log('- Submit button:', !!submitButton)
      return false
    }
    
  } catch (error) {
    console.log(`❌ Login attempt failed: ${error.message}`)
    return false
  }
}

// ---------- Enhanced Page Analysis Functions ----------

// Enhanced page context gathering
async function getEnhancedPageContext(page) {
  try {
    const context = await page.evaluate(() => {
      const getElementInfo = (el) => {
        const text = el.textContent?.trim() || el.value || el.placeholder || el.title || ''
        const selectors = []
        
        // Generate multiple selector strategies
        if (el.id) selectors.push(`#${el.id}`)
        if (el.name) selectors.push(`[name="${el.name}"]`)
        if (el.className && el.className.trim()) {
          const classes = el.className.trim().split(/\s+/)
          selectors.push(`.${classes[0]}`)
        }
        if (el.getAttribute('data-testid')) selectors.push(`[data-testid="${el.getAttribute('data-testid')}"]`)
        if (el.getAttribute('data-test')) selectors.push(`[data-test="${el.getAttribute('data-test')}"]`)
        if (el.getAttribute('data-cy')) selectors.push(`[data-cy="${el.getAttribute('data-cy')}"]`)
        if (text && text.length < 50) selectors.push(`text="${text}"`)
        
        return {
          type: el.tagName.toLowerCase(),
          text: text,
          selector: selectors[0] || `${el.tagName.toLowerCase()}:nth-child(${Array.from(el.parentNode.children).indexOf(el) + 1})`,
          allSelectors: selectors,
          visible: el.offsetParent !== null,
          interactive: ['input', 'button', 'select', 'textarea', 'a'].includes(el.tagName.toLowerCase()) || 
                      el.getAttribute('onclick') || el.getAttribute('role') === 'button'
        }
      }
      
      const allElements = Array.from(document.querySelectorAll('*'))
        .filter(el => el.offsetParent !== null && (el.textContent?.trim() || el.value || el.placeholder))
        .map(getElementInfo)
        .filter(el => el.text.length > 0 && el.text.length < 100)
      
      // Categorize elements
      const formElements = allElements.filter(el => ['input', 'select', 'textarea'].includes(el.type))
      const interactiveElements = allElements.filter(el => el.interactive)
      const navigationElements = allElements.filter(el => el.type === 'a' || el.text.toLowerCase().includes('nav'))
      
      // Detect page type
      let pageType = 'unknown'
      if (formElements.length > 2) pageType = 'form'
      else if (document.querySelector('form')) pageType = 'form'
      else if (navigationElements.length > 3) pageType = 'navigation'
      else if (document.querySelector('[role="main"]')) pageType = 'content'
      
      // Check for error messages
      const errorMessages = Array.from(document.querySelectorAll('.error, .alert-danger, [role="alert"], .message.error'))
        .map(el => el.textContent?.trim())
        .filter(text => text && text.length > 0)
      
      return {
        title: document.title,
        url: window.location.href,
        pageType,
        allElements,
        formElements,
        interactiveElements,
        navigationElements,
        errorMessages
      }
    })
    
    return context
  } catch (error) {
    console.log('Error getting enhanced page context:', error.message)
    return {
      title: 'Unknown',
      url: 'Unknown',
      pageType: 'unknown',
      allElements: [],
      formElements: [],
      interactiveElements: [],
      navigationElements: [],
      errorMessages: []
    }
  }
}

// Analyze failure patterns to improve decision making
function analyzeFailurePattern(actions) {
  if (actions.length === 0) return 'No previous actions to analyze'
  
  const recentFailures = actions.filter(a => a.status === 'error').slice(-5)
  const failureReasons = recentFailures.map(a => a.notes?.toLowerCase() || '')
  
  if (failureReasons.length === 0) return 'No recent failures detected'
  
  const patterns = []
  if (failureReasons.some(r => r.includes('selector') || r.includes('element'))) {
    patterns.push('Element selector issues detected')
  }
  if (failureReasons.some(r => r.includes('timeout') || r.includes('wait'))) {
    patterns.push('Timing issues detected')
  }
  if (failureReasons.some(r => r.includes('click') || r.includes('interact'))) {
    patterns.push('Interaction failures detected')
  }
  if (failureReasons.some(r => r.includes('fill') || r.includes('input'))) {
    patterns.push('Form input issues detected')
  }
  
  return patterns.length > 0 ? patterns.join(', ') : 'General execution failures'
}

// Enhance actions with validation and better selectors
function enhanceActionsWithValidation(actions, pageContext) {
  return actions.map(action => {
    // Add wait conditions for better reliability
    if (!action.waitFor) {
      if (action.action === 'click') {
        action.waitFor = 'networkidle'
      } else if (action.action === 'fill') {
        action.waitFor = 'input'
      } else if (action.action === 'navigate') {
        action.waitFor = 'load'
      }
    }
    
    // Validate selector exists on page
    const elementExists = pageContext.allElements.some(el => 
      el.selector === action.target || el.allSelectors?.includes(action.target)
    )
    
    if (!elementExists && action.target) {
      // Try to find a better selector
      const betterSelector = findBetterSelector(action.target, pageContext)
      if (betterSelector) {
        action.target = betterSelector
        action.notes = `Selector improved from original`
      }
    }
    
    return action
  })
}

// Find better selectors when original fails
function findBetterSelector(originalSelector, pageContext) {
  // Try to find element by text content
  const textMatch = pageContext.allElements.find(el => 
    el.text.toLowerCase().includes(originalSelector.toLowerCase()) ||
    originalSelector.toLowerCase().includes(el.text.toLowerCase())
  )
  
  if (textMatch) {
    return textMatch.selector
  }
  
  // Try to find by partial selector match
  const partialMatch = pageContext.allElements.find(el => 
    el.allSelectors?.some(sel => sel.includes(originalSelector) || originalSelector.includes(sel))
  )
  
  return partialMatch?.selector
}

async function getVisibleElements(page) {
  try {
    return await page.evaluate(() => {
      const elements = []
      const selectors = [
        'input', 'button', 'a', 'select', 'textarea', '[role="button"]', '[role="link"]'
      ]
      
      selectors.forEach(selector => {
        const nodes = document.querySelectorAll(selector)
        nodes.forEach((el, index) => {
          if (el.offsetParent !== null && el.style.display !== 'none' && el.style.visibility !== 'hidden') {
            const tag = el.tagName.toLowerCase()
            const type = el.type || ''
            const name = el.name || ''
            const id = el.id || ''
            const placeholder = el.placeholder || ''
            const text = el.textContent?.trim().slice(0, 50) || ''
            const href = el.href || ''
            
            elements.push({
              tag,
              type,
              name,
              id,
              placeholder,
              text,
              href,
              selector: id ? `#${id}` : `${tag}${name ? `[name="${name}"]` : ''}${placeholder ? `[placeholder="${placeholder}"]` : ''}`
            })
          }
        })
      })
      
      return elements.slice(0, 20) // Limit to first 20 elements
    })
  } catch (error) {
    console.log('Error getting visible elements:', error.message)
    return []
  }
}

// ---------- Main runner ----------
export function createRunner(config){
  const runDir = path.join(artifactsRoot, config.runId)
  fs.mkdirSync(runDir, { recursive: true })
  const profile = testingProfiles[config.projectId] || testingProfiles._default

  

  async function runAgent({ url, screenshotPath, testType, outDir, runId, maxSteps = 60, profile, basicAuthUser = null, basicAuthPass = null, testCases = null, loginUsername = null, loginPassword = null }){
    // Debug basic auth credentials
    console.log('Basic Auth Debug:')
    console.log('- Provided basicAuthUser:', basicAuthUser)
    console.log('- Provided basicAuthPass:', config.basicAuthPass ? '***' : null)
    console.log('- Profile basicAuth:', profile?.basicAuth)
    
    // Determine final basic auth credentials (prioritize profile over UI input)
    const finalBasicAuthUser = profile?.basicAuth?.username || basicAuthUser
    const finalBasicAuthPass = profile?.basicAuth?.password || basicAuthPass
    console.log('- Final credentials:', (finalBasicAuthUser && finalBasicAuthPass) ? { username: finalBasicAuthUser, password: '***' } : 'None')
    
    const browser = await chromium.launch()
    const context = await browser.newContext({
      recordVideo: { dir: outDir, size: { width: 1280, height: 720 } },
      httpCredentials: (finalBasicAuthUser && finalBasicAuthPass) ? { username: finalBasicAuthUser, password: finalBasicAuthPass } : undefined
    })
    const page = await context.newPage()
    const artifacts = []
    const actions = []
    const startOrigin = url ? new URL(url).origin : null

    // capture console errors
    const consoleErrors = []
    page.on('pageerror', e => consoleErrors.push(String(e)))
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })

    try{
      if(url){
        console.log(`🌐 Navigating to: ${url}`)
        console.log(`🔐 Using basic auth: ${finalBasicAuthUser ? 'Yes' : 'No'}`)
        
        try {
          await page.goto(url, { waitUntil: 'load', timeout: 60000 })
          console.log('✅ Page navigation successful')
        } catch (error) {
          console.log(`❌ Page navigation failed: ${error.message}`)
          
          // Try with a longer timeout and different wait strategy
          try {
            console.log('🔄 Retrying with networkidle strategy...')
            await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 })
            console.log('✅ Page navigation successful with networkidle')
          } catch (retryError) {
            console.log(`❌ Retry also failed: ${retryError.message}`)
            throw retryError
          }
        }
      } else if(screenshotPath){
        const img = fs.readFileSync(screenshotPath).toString('base64')
        await page.setContent(
          `<html><body style="margin:0;background:#0b0b0b;display:grid;place-items:center;min-height:100vh">
             <img src="data:image/*;base64,${img}" style="max-width:100%;height:auto;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.35)"/>
           </body></html>`
        )
      }

      // Optional login phase
      async function maybeLogin(){
        if (!profile?.login) return { didLogin: false, note: 'no login profile' }
        const { path: loginPath, usernameSelector, passwordSelector, submitSelector, usernameEnv, passwordEnv } = profile.login
        const username = process.env[usernameEnv]
        const password = process.env[passwordEnv]
        if (!(username && password)) return { didLogin: false, note: 'credentials missing' }
        try {
          if (url && loginPath) {
            const u = new URL(url)
            const loginUrl = new URL(loginPath, u.origin).toString()
            await page.goto(loginUrl, { waitUntil: 'load', timeout: 60000 })
          }
          if (usernameSelector) { await page.locator(usernameSelector).fill(username) }
          if (passwordSelector) { await page.locator(passwordSelector).fill(password) }
          if (submitSelector)   { await page.locator(submitSelector).click({ timeout: 10000 }) }
          await page.waitForLoadState('load', { timeout: 15000 }).catch(()=>{})
          return { didLogin: true, note: 'login attempted' }
        } catch (e) {
          return { didLogin: false, note: 'login failed: ' + e.message }
        }
      }

      // login first (if configured)
      const loginRes = await maybeLogin()

      // helper to snapshot
      async function snapshot(label){
        const file = path.join(outDir, `${String(actions.length+1).padStart(2,'0')}_${label}.png`)
        await page.screenshot({ path: file, fullPage: true })
        artifacts.push({ type: 'screenshot', path: file })
      }

      // initial shot
      await snapshot('initial')

      // Auto-click PLATFORM LOGIN for Lavinia if not already logged in
      if (config.projectId === 'lavinia' && !loginRes.didLogin) {
        try {
          console.log('Auto-clicking PLATFORM LOGIN for Lavinia...')
          const platformLoginLocator = page.getByRole('link', { name: /platform login/i, exact: false })
          await platformLoginLocator.first().click({ timeout: 10000 })
          await page.waitForLoadState('load', { timeout: 15000 }).catch(() => {})
          await snapshot('platform_login_click')
          console.log('Successfully clicked PLATFORM LOGIN')
          
          // Now attempt login with credentials
          await attemptLogin(page, profile, artifacts, outDir)
          
        } catch (e) {
          console.log('PLATFORM LOGIN click failed:', e.message)
        }
      }

      // Enhanced AI-driven testing loop with intelligent login detection
      console.log('🤖 Starting enhanced AI-driven testing for:', testType)
      console.log('🔐 Login credentials available:', loginUsername ? 'Yes' : 'No')
      
      // Initialize loop prevention counters
      global.aiFailureCount = 0
      global.totalActionsGenerated = 0
      global.loginAttempted = false
      
      while (true) {
        // Check loop prevention conditions
        if (global.aiFailureCount > 5) {
          console.log('🛑 Too many consecutive AI failures, ending test')
          break
        }
        
        if (global.totalActionsGenerated > 30 && global.aiFailureCount > 3) {
          console.log('🛑 Too many actions generated with failures, ending test')
          break
        }
        
        try {
          // Get comprehensive page context for intelligent decision making
          const pageContext = await getEnhancedPageContext(page)
          
          // Check if we need to attempt login (only once per session)
          if (!global.loginAttempted && loginUsername && loginPassword && pageContext.formElements.length >= 2) {
            const loginResult = await attemptIntelligentLogin(page, loginUsername, loginPassword, pageContext, artifacts, outDir)
            if (loginResult) {
              global.loginAttempted = true
              actions.push({
                action: 'login',
                status: 'success',
                notes: 'Successfully logged in with provided credentials',
                target: 'login_form',
                value: loginUsername
              })
              global.totalActionsGenerated++
              
              // Wait for page to load after login
              await page.waitForLoadState('networkidle', { timeout: 10000 })
              
              // Take screenshot after login
              const afterLoginPath = path.join(outDir, 'after_login.png')
              await page.screenshot({ path: afterLoginPath, fullPage: true })
              artifacts.push({ type: 'screenshot', path: afterLoginPath })
              
              // Continue with exploration after login
              continue
            }
          }
          
          // Get next batch of actions from AI with enhanced context
          const decisions = await agentDecideBatch(page, testType, profile, testCases, actions)
          console.log(`🤖 AI generated ${decisions.length} actions`)
          
          if (!decisions || decisions.length === 0) {
            console.log('🤖 AI returned no actions, ending test')
            break
          }
          
          // Execute each action in the batch
          for (const decision of decisions) {
            try {
              await executeDecision(page, decision, artifacts, outDir)
              actions.push({
                action: decision.action,
                status: 'success',
                notes: decision.text || `Executed ${decision.action}`,
                target: decision.target,
                value: decision.value
              })
              global.totalActionsGenerated++
              
              // After each action, analyze page changes for better next decisions
              await analyzePageChanges(page, actions)
              
            } catch (error) {
              console.log(`❌ Action execution failed:`, error.message)
              actions.push({
                action: decision.action,
                status: 'error',
                notes: `Failed: ${error.message}`,
                target: decision.target,
                value: decision.value
              })
              global.aiFailureCount++
            }
          }
          
          // Reset failure counter on success
          global.aiFailureCount = 0
          
          // Take screenshot after batch
          await snapshot(`after_batch_${actions.length}`)
          
        } catch (error) {
          console.log(`❌ AI decision failed:`, error.message)
          global.aiFailureCount++
          
          // Generate fallback actions
          const fallbackActions = await generateFallbackActions(page, profile)
          console.log(`🔄 Using ${fallbackActions.length} fallback actions`)
          
          for (const fallbackAction of fallbackActions) {
            try {
              await executeDecision(page, fallbackAction, artifacts, outDir)
              actions.push({
                action: fallbackAction.action,
                status: 'success',
                notes: `Fallback: ${fallbackAction.text}`,
                target: fallbackAction.target,
                value: fallbackAction.value
              })
              global.totalActionsGenerated++
            } catch (error) {
              console.log(`❌ Fallback action failed:`, error.message)
              actions.push({
                action: fallbackAction.action,
                status: 'error',
                notes: `Fallback failed: ${error.message}`,
                target: fallbackAction.target,
                value: fallbackAction.value
              })
            }
          }
        }
        
        // Check if we should continue
        if (actions.length >= 50) {
          console.log('🛑 Maximum actions reached, ending test')
          break
        }
      }
      
      console.log(`✅ AI-driven testing completed with ${actions.length} actions`)



      // Close to flush video
      await page.close()
      await context.close()
      await browser.close()

      // Gather videos and step shots
      const all = walkFiles(outDir)
      const videos = all.filter(f => f.endsWith('.webm'))
      for(const v of videos) artifacts.push({ type: 'video', path: v })

      // Return artifacts + actions + console errors (as note)
      return { artifacts, actions, consoleErrors }
    }catch(err){
      try { await page.close() } catch {}
      try { await context.close() } catch {}
      try { await browser.close() } catch {}
      throw err
    }
  }

  return {
    async start(){
      const { runId, projectName, testType, targetKind, url, screenshotPath, testCasesPath } = config
      const outDir = path.join(runDir, 'assets')
      fs.mkdirSync(outDir, { recursive: true })

      const startedAt = nowISO()

      // Optional: parse Excel test cases if provided (before planning)
      let explicitCases = null
      if (testCasesPath) {
        explicitCases = parseTestCasesFromXlsx(testCasesPath, testType)
      }

      // Agent run
      const profile = testingProfiles[config.projectId] || testingProfiles._default
      
      // Generate AI test plan
      const planObj = await planWithAI(testType, url, profile)
      
      // Debug profile and basic auth
      console.log('Profile Debug:')
      console.log('- Project ID:', config.projectId)
      console.log('- Profile found:', !!profile)
      console.log('- Profile basicAuth:', profile?.basicAuth)
      console.log('- Config basicAuthUser:', config.basicAuthUser)
      console.log('- Config basicAuthPass:', config.basicAuthPass ? '***' : null)
      
      const finalBasicAuthUser = config.basicAuthUser || profile?.basicAuth?.username || null
      const finalBasicAuthPass = config.basicAuthPass || profile?.basicAuth?.password || null
      
      console.log('- Final basicAuthUser:', finalBasicAuthUser)
      console.log('- Final basicAuthPass:', finalBasicAuthPass ? '***' : null)
      
      const { artifacts, actions, consoleErrors } = await runAgent({
        url: targetKind === 'url' ? url : null,
        screenshotPath: targetKind === 'screenshot' ? screenshotPath : null,
        testType,
        outDir,
        runId,
        profile,
        basicAuthUser: finalBasicAuthUser,
        basicAuthPass: finalBasicAuthPass,
        loginUsername: config.loginUsername,
        loginPassword: config.loginPassword,
        testCases: explicitCases
      })

      // Map to public URLs
      const publicArtifacts = artifacts.map(a => ({
        ...a,
        filename: path.basename(a.path),
        url: publicUrlFromAbs(a.path),
      }))

      // Assets index
      const assetsIndexHtml = buildAssetsIndexHTML({ projectName, runId, files: publicArtifacts })
      fs.writeFileSync(path.join(outDir, 'index.html'), assetsIndexHtml, 'utf8')

      // Action log JSON
      fs.writeFileSync(path.join(runDir, 'actions.json'), JSON.stringify({ actions, consoleErrors }, null, 2), 'utf8')

      // Report with embedded media + action table
      const html = buildReportHTML({
        projectName,
        testType,
        startedAt,
        plan: planObj.plan,
        checks: planObj.checks,
        heuristics: planObj.heuristics,
        artifacts: publicArtifacts,
        actions
      })
      const reportPath = path.join(runDir, 'report.html')
      fs.writeFileSync(reportPath, html, 'utf8')

      // Links
      const reportUrl = artifactLink(relFromArtifacts(reportPath))
      const assetUrl = artifactLink(relFromArtifacts(path.join(outDir, 'index.html')))

      // Slack
      const blocks = [
        { type: "header", text: { type: "plain_text", text: `✅ Test finished: ${projectName} (${testType})` } },
        { type: "section", text: { type: "mrkdwn", text:
`*Run ID:* ${runId}
*Started:* ${startedAt}
*Report:* ${reportUrl}
*Assets:* ${assetUrl}
${consoleErrors?.length ? `*Console errors:* ${consoleErrors.length}` : ''}` } }
      ]
      await slackNotify(blocks)

      // Email (attach a few screenshots from disk)
      await emailNotify({
        subject: `QA Agent · ${projectName} (${testType}) finished`,
        html: `<p>Run ID: ${runId}</p>
<p>Started: ${startedAt}</p>
<p><a href="${reportUrl}">Open HTML Report</a></p>
<p><a href="${assetUrl}">Browse assets</a></p>`,
        attachments: publicArtifacts
          .filter(a=>a.type==='screenshot')
          .slice(0,3)
          .map(a=>({ filename: a.filename, path: a.path })) // use disk paths for reliability
      })

      console.log('Run complete:', runId, reportUrl)
    }
  }

  return { start }
}

