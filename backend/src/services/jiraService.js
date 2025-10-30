import JiraApi from 'jira-client'
import { OpenAI } from 'openai'
import fetch from 'node-fetch'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })



export class JiraService {
  constructor() {
    this.jira = null
    this.businessUnitUrls = {
      'lavinia': 'https://laviniagro1stg.wpengine.com/',
      'passage prep': 'https://passageprepstg.wpenginepowered.com/',
      'passageprep': 'https://passageprepstg.wpenginepowered.com/',
      'passage-prep': 'https://passageprepstg.wpenginepowered.com/',
      'teaching channel': 'https://passageprepstg.wpenginepowered.com/',
      'teachingchannel': 'https://passageprepstg.wpenginepowered.com/',
      'teaching-channel': 'https://passageprepstg.wpenginepowered.com/',
      'smartapp': process.env.SMARTAPP_URL || 'https://smartapp.example.com/'
    }
    this.initializeJira()
  }

  initializeJira() {
    try {
      console.log('JIRA Configuration check:')
      console.log('- JIRA_HOST:', process.env.JIRA_HOST ? 'Set' : 'Missing')
      console.log('- JIRA_USERNAME:', process.env.JIRA_USERNAME ? 'Set' : 'Missing')
      console.log('- JIRA_API_TOKEN:', process.env.JIRA_API_TOKEN ? 'Set' : 'Missing')

      if (!process.env.JIRA_HOST || !process.env.JIRA_USERNAME || !process.env.JIRA_API_TOKEN) {
        throw new Error('JIRA configuration missing. Please set JIRA_HOST, JIRA_USERNAME, and JIRA_API_TOKEN in your .env file')
      }

      this.jira = new JiraApi({
        protocol: 'https',
        host: process.env.JIRA_HOST,
        username: process.env.JIRA_USERNAME,
        password: process.env.JIRA_API_TOKEN,
        apiVersion: '3',
        strictSSL: true
      })
      console.log('JIRA client initialized successfully')
    } catch (error) {
      console.error('Failed to initialize JIRA client:', error)
      this.jira = null
    }
  }

  // Fetch tickets assigned to a specific user
  async getAssignedTickets(username) {
    if (!process.env.JIRA_HOST || !process.env.JIRA_USERNAME || !process.env.JIRA_API_TOKEN) {
      throw new Error('JIRA configuration missing. Please set JIRA_HOST, JIRA_USERNAME, and JIRA_API_TOKEN in your .env file')
    }

    try {
      console.log(`Fetching tickets for user: ${username}`)
      console.log(`JIRA Host: ${process.env.JIRA_HOST}`)
      
      // Query for current sprint tickets only
      const jql = `assignee = "${username}" AND sprint in openSprints() AND status != "Done" AND status != "Closed" ORDER BY priority DESC, updated DESC`
      console.log(`JQL Query: ${jql}`)
      
      // Use direct HTTP call to REST API v3
      const jiraHost = process.env.JIRA_HOST.startsWith('http') ? process.env.JIRA_HOST : `https://${process.env.JIRA_HOST}`
      const response = await fetch(`${jiraHost}/rest/api/3/search/jql`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.JIRA_USERNAME}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jql: jql,
          maxResults: 50,
          fields: ['summary', 'description', 'priority', 'status', 'issuetype', 'key', 'updated', 'project', 'customfield_10014', 'labels']
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`JIRA API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      console.log(`Found ${data.issues?.length || 0} tickets`)

      return (data.issues || []).map(issue => {
        const labels = issue.fields.labels || []
        const businessUnit = this.determineBusinessUnit(issue.fields.customfield_10014?.value, issue.fields.project?.name, labels)
        const mappedUrl = this.getUrlForBusinessUnit(businessUnit)
        
        return {
          key: issue.key,
          summary: issue.fields.summary,
          description: issue.fields.description || 'No description provided',
          priority: issue.fields.priority?.name || 'Medium',
          status: issue.fields.status?.name || 'Unknown',
          type: issue.fields.issuetype?.name || 'Task',
          updated: issue.fields.updated,
          url: `https://${process.env.JIRA_HOST}/browse/${issue.key}`,
          businessUnit: businessUnit,
          mappedUrl: mappedUrl,
          labels: labels
        }
      })
    } catch (error) {
      console.error('Error fetching JIRA tickets:', error)
      console.error('Error details:', {
        message: error.message,
        statusCode: error.statusCode,
        statusText: error.statusText,
        response: error.response
      })
      
      if (error.statusCode === 401) {
        throw new Error('JIRA authentication failed. Check your username and API token.')
      } else if (error.statusCode === 403) {
        throw new Error('JIRA access denied. Check your permissions.')
      } else if (error.statusCode === 404) {
        throw new Error('JIRA host not found. Check your JIRA_HOST configuration.')
      } else {
        throw new Error(`Failed to fetch JIRA tickets: ${error.message || 'Unknown error'}`)
      }
    }
  }

  // Generate test cases from JIRA ticket using AI
  async generateTestCasesFromTicket(ticketSummary, ticketDescription) {
    try {
      const prompt = `Generate 5-6 test cases for this JIRA ticket in BDD format.

Summary: ${ticketSummary}
Description: ${ticketDescription}

Return JSON array:
[
  {
    "testCaseId": "TC-001",
    "title": "Test title",
    "priority": "High|Medium|Low",
    "bddSteps": [
      "Given user is on page",
      "When they perform action", 
      "Then result should occur"
    ]
  }
]`

      // Check if OpenAI API key is valid
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
        throw new Error('OpenAI API key not configured. Please set a valid OPENAI_API_KEY in your environment.')
      }

      const response = await Promise.race([
        client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a QA expert. Generate only valid JSON test cases. Keep responses concise.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 2000
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API request timeout after 30 seconds')), 30000)
        )
      ])

      const content = response.choices[0].message.content
      console.log('Raw AI response length:', content.length)
      console.log('Raw AI response preview:', content.substring(0, 500) + '...')
      
      // Check if response was truncated
      if (content.includes('```json') && !content.includes('```')) {
        console.log('⚠️ Response appears to be truncated (missing closing ```)')
      }
      
      // Try to find JSON array in the response
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      
      if (jsonMatch) {
        try {
          // Clean up the JSON string before parsing
          let jsonString = jsonMatch[0]
          
          // Check if JSON appears to be truncated (doesn't end with ])
          if (!jsonString.trim().endsWith(']')) {
            console.log('⚠️ JSON appears to be truncated, attempting to fix...')
            
            // Try to find the last complete object and close the array
            const lastCompleteObject = jsonString.lastIndexOf('},')
            if (lastCompleteObject > 0) {
              jsonString = jsonString.substring(0, lastCompleteObject + 1) + ']'
              console.log('Fixed truncated JSON by removing incomplete objects')
            } else {
              // If no complete objects found, try to close the current object
              const lastCompleteProperty = jsonString.lastIndexOf('",')
              if (lastCompleteProperty > 0) {
                jsonString = jsonString.substring(0, lastCompleteProperty + 1) + '}]'
                console.log('Fixed truncated JSON by closing current object')
              }
            }
          }
          
          // Remove any trailing commas before closing brackets/braces
          jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1')
          
          // Remove any comments or extra text
          jsonString = jsonString.replace(/\/\*[\s\S]*?\*\//g, '')
          jsonString = jsonString.replace(/\/\/.*$/gm, '')
          
          console.log('Cleaned JSON string length:', jsonString.length)
          return JSON.parse(jsonString)
        } catch (parseError) {
          console.error('JSON parsing error:', parseError)
          console.error('Problematic JSON preview:', jsonMatch[0].substring(0, 1000) + '...')
          
          // Try to fix common JSON issues
          let fixedJson = jsonMatch[0]
          
          // Fix trailing commas
          fixedJson = fixedJson.replace(/,(\s*[}\]])/g, '$1')
          
          // Fix unescaped quotes in strings
          fixedJson = fixedJson.replace(/"([^"]*)"([^"]*)"([^"]*)"/g, '"$1\\"$2\\"$3"')
          
          try {
            return JSON.parse(fixedJson)
          } catch (secondError) {
            console.error('Second parsing attempt failed:', secondError)
            throw new Error(`Invalid JSON format: ${parseError.message}`)
          }
        }
      } else {
        throw new Error('AI response was not in expected JSON format')
      }
    } catch (error) {
      console.error('Error generating test cases:', error.message)
      
      // Check if it's an API key issue
      if (error.message.includes('OpenAI API key not configured')) {
        console.error('❌ OpenAI API key is not configured properly.')
        console.error('Please set a valid OPENAI_API_KEY in your environment variables.')
        console.error('You can get an API key from: https://platform.openai.com/api-keys')
      } else if (error.message.includes('timeout')) {
        console.error('❌ OpenAI API request timed out. This could be due to:')
        console.error('1. Invalid API key')
        console.error('2. Network connectivity issues')
        console.error('3. OpenAI service being slow')
      } else {
        console.error('❌ Unexpected error occurred:', error.message)
      }
      
      // Fallback: return a default test case if JSON parsing fails
      console.log('Falling back to default test case due to error')
      return [{
        title: "Basic functionality test",
        bddSteps: "Given the user is on the application\nWhen they perform basic actions\nThen the application should respond correctly",
        priority: "Medium",
        category: "Functional"
      }]
    }
  }

  // Generate additional edge cases from custom prompt
  async generateEdgeCases(ticketSummary, ticketDescription, customPrompt) {
    try {
      const prompt = `Generate 3-4 edge cases based on this JIRA ticket and custom prompt.

Summary: ${ticketSummary}
Description: ${ticketDescription}
Custom Prompt: ${customPrompt}

Return JSON array:
[
  {
    "testCaseId": "EC-001",
    "title": "Edge case title",
    "priority": "High|Medium|Low",
    "bddSteps": [
      "Given edge condition exists",
      "When user performs action",
      "Then system should handle gracefully"
    ]
  }
]`

      const response = await Promise.race([
        client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a QA expert specializing in edge cases. Generate only valid JSON edge cases. Keep responses concise.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 1500
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API request timeout after 10 seconds')), 10000)
        )
      ])

      const content = response.choices[0].message.content
      console.log('Raw edge cases response length:', content.length)
      console.log('Raw edge cases response preview:', content.substring(0, 500) + '...')
      
      // Check if response was truncated
      if (content.includes('```json') && !content.includes('```')) {
        console.log('⚠️ Edge cases response appears to be truncated (missing closing ```)')
      }
      
      // Try to find JSON array in the response
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      
      if (jsonMatch) {
        try {
          // Clean up the JSON string before parsing
          let jsonString = jsonMatch[0]
          
          // Check if JSON appears to be truncated (doesn't end with ])
          if (!jsonString.trim().endsWith(']')) {
            console.log('⚠️ Edge cases JSON appears to be truncated, attempting to fix...')
            
            // Try to find the last complete object and close the array
            const lastCompleteObject = jsonString.lastIndexOf('},')
            if (lastCompleteObject > 0) {
              jsonString = jsonString.substring(0, lastCompleteObject + 1) + ']'
              console.log('Fixed truncated edge cases JSON by removing incomplete objects')
            } else {
              // If no complete objects found, try to close the current object
              const lastCompleteProperty = jsonString.lastIndexOf('",')
              if (lastCompleteProperty > 0) {
                jsonString = jsonString.substring(0, lastCompleteProperty + 1) + '}]'
                console.log('Fixed truncated edge cases JSON by closing current object')
              }
            }
          }
          
          // Remove any trailing commas before closing brackets/braces
          jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1')
          
          // Remove any comments or extra text
          jsonString = jsonString.replace(/\/\*[\s\S]*?\*\//g, '')
          jsonString = jsonString.replace(/\/\/.*$/gm, '')
          
          console.log('Cleaned edge cases JSON string length:', jsonString.length)
          return JSON.parse(jsonString)
        } catch (parseError) {
          console.error('Edge cases JSON parsing error:', parseError)
          console.error('Problematic edge cases JSON preview:', jsonMatch[0].substring(0, 1000) + '...')
          
          // Try to fix common JSON issues
          let fixedJson = jsonMatch[0]
          
          // Fix trailing commas
          fixedJson = fixedJson.replace(/,(\s*[}\]])/g, '$1')
          
          // Fix unescaped quotes in strings
          fixedJson = fixedJson.replace(/"([^"]*)"([^"]*)"([^"]*)"/g, '"$1\\"$2\\"$3"')
          
          try {
            return JSON.parse(fixedJson)
          } catch (secondError) {
            console.error('Second edge cases parsing attempt failed:', secondError)
            throw new Error(`Invalid edge cases JSON format: ${parseError.message}`)
          }
        }
      } else {
        throw new Error('Edge cases AI response was not in expected JSON format')
      }
    } catch (error) {
      console.error('Error generating edge cases:', error)
      
      // Fallback: return a default edge case if JSON parsing fails
      console.log('Falling back to default edge case due to parsing error')
      return [{
        testCaseId: "EC-001",
        title: "Edge case - System handles invalid input gracefully",
        priority: "High",
        bddSteps: [
          "Given the user provides invalid input",
          "When the system processes the input",
          "Then it should display appropriate error messages",
          "And the system should remain stable"
        ]
      }]
    }
  }

  // Generate Playwright script from test cases
  async generatePlaywrightScript(testCases, businessUnit = null) {
    try {
      const baseUrl = (testCases && testCases.baseUrl) || null
      const pureCases = Array.isArray(testCases) ? testCases : (Array.isArray(testCases?.testCases) ? testCases.testCases : [])
      
      // Use business unit to determine URL if not provided
      let targetUrl = baseUrl
      if (!targetUrl && businessUnit) {
        targetUrl = this.getUrlForBusinessUnit(businessUnit)
      }
      
      // FORCE proper URL - never use example.com or null for demo
      if (!targetUrl || targetUrl.includes('example.com') || targetUrl === null || targetUrl === 'null') {
        // Default to Lavinia if no business unit specified
        const defaultBusinessUnit = businessUnit || 'lavinia'
        targetUrl = this.getUrlForBusinessUnit(defaultBusinessUnit)
        console.log(`🚨 FORCED URL: Using ${defaultBusinessUnit} URL: ${targetUrl}`)
      }
      
      // Additional safety check - if targetUrl is still null, force Lavinia
      if (!targetUrl || targetUrl === 'null') {
        targetUrl = this.businessUnitUrls['lavinia']
        console.log(`🚨 EMERGENCY FALLBACK: Using Lavinia URL: ${targetUrl}`)
      }
      
      console.log(`🎯 Script Generation - Business Unit: ${businessUnit}, Target URL: ${targetUrl}`)

      // Generate dynamic selectors by analyzing the actual page
      let dynamicSelectors = ''
      if (targetUrl) {
        try {
          dynamicSelectors = await this.generateDynamicSelectors(targetUrl)
        } catch (error) {
          console.log('Could not generate dynamic selectors:', error.message)
        }
      }

      // Get basic auth credentials for the business unit
      let basicAuthInfo = ''
      if (businessUnit) {
        const normalizedUnit = businessUnit.toLowerCase().trim()
        if (normalizedUnit === 'lavinia') {
          const username = process.env.LAVINIA_USERNAME || 'laviniagro1stg'
          const password = process.env.LAVINIA_PASSWORD || '7ada27f4'
          basicAuthInfo = `
BASIC AUTHENTICATION REQUIRED:
- Username: ${username}
- Password: ${password}
- Use: const context = await browser.newContext({ httpCredentials: { username: '${username}', password: '${password}' } })
- Then: const page = await context.newPage()
- Set credentials on context, not page`
        } else if (normalizedUnit === 'passage prep' || normalizedUnit === 'passageprep') {
          const username = process.env.PASSAGE_PREP_USERNAME || 'passageprepstg'
          const password = process.env.PASSAGE_PREP_PASSWORD || '777456c1'
          basicAuthInfo = `
BASIC AUTHENTICATION REQUIRED:
- Username: ${username}
- Password: ${password}
- Use: const context = await browser.newContext({ httpCredentials: { username: '${username}', password: '${password}' } })
- Then: const page = await context.newPage()
- Set credentials on context, not page`
        } else if (normalizedUnit === 'smartapp') {
          basicAuthInfo = `
NO BASIC AUTHENTICATION REQUIRED:
- SmartApp does not require basic authentication
- Use: const page = await browser.newPage()
- Then: await page.goto(BASE_URL)`
        }
      }

      // Get application login credentials for the business unit
      let appLoginInfo = ''
      if (businessUnit) {
        const normalizedUnit = businessUnit.toLowerCase().trim()
        if (normalizedUnit === 'lavinia') {
          const appUsername = process.env.LAVINIA_APP_USERNAME || 'your_lavinia_app_username'
          const appPassword = process.env.LAVINIA_APP_PASSWORD || 'your_lavinia_app_password'
          appLoginInfo = `
APPLICATION LOGIN CREDENTIALS:
- Username: ${appUsername}
- Password: ${appPassword}
- Use for login forms: await page.fill('input[name="username"], input[name="email"]', '${appUsername}')
- Use for password: await page.fill('input[name="password"]', '${appPassword}')`
        } else if (normalizedUnit === 'passage prep' || normalizedUnit === 'passageprep') {
          const appUsername = process.env.PASSAGE_PREP_APP_USERNAME || 'your_passage_prep_app_username'
          const appPassword = process.env.PASSAGE_PREP_APP_PASSWORD || 'your_passage_prep_app_password'
          appLoginInfo = `
APPLICATION LOGIN CREDENTIALS:
- Username: ${appUsername}
- Password: ${appPassword}
- Use for login forms: await page.fill('input[name="username"], input[name="email"]', '${appUsername}')
- Use for password: await page.fill('input[name="password"]', '${appPassword}')`
        } else if (normalizedUnit === 'smartapp') {
          const appUsername = process.env.SMARTAPP_APP_USERNAME || 'your_smartapp_username'
          const appPassword = process.env.SMARTAPP_APP_PASSWORD || 'your_smartapp_password'
          appLoginInfo = `
APPLICATION LOGIN CREDENTIALS:
- Username: ${appUsername}
- Password: ${appPassword}
- Use for login forms: await page.fill('input[name="username"], input[name="email"]', '${appUsername}')
- Use for password: await page.fill('input[name="password"]', '${appPassword}')`
        }
      }
      
      const prompt = `You are a Playwright expert. Generate a READY-TO-RUN Playwright test script that tests the ACTUAL FUNCTIONALITY described in the test cases.

🚨 CRITICAL: ALWAYS use the specified URL below - NEVER use example.com or placeholder URLs!
Base URL: ${targetUrl}
Business Unit: ${businessUnit || 'lavinia'}

Test Cases to Implement: ${JSON.stringify(pureCases, null, 2)}

${basicAuthInfo ? `${basicAuthInfo}

` : ''}${appLoginInfo ? `${appLoginInfo}

` : ''}${dynamicSelectors ? `DYNAMIC SELECTORS FROM ACTUAL PAGE:
${dynamicSelectors}

Use these REAL selectors from the actual page instead of generic ones.` : ''}

CRITICAL REQUIREMENTS - Generate tests that match the ACTUAL FUNCTIONALITY:

1. **NAVIGATION LOGIC**: After login, navigate to the appropriate page based on test case content:
   - If test cases mention "student" or "students", navigate to Students page via School menu:
     * Click on "School" menu item
     * Wait for dropdown to appear
     * Click on "Students" submenu item
   - If test cases mention "teacher" or "teachers", navigate to Teachers page
   - If test cases mention "assessment" or "assessments", navigate to Assessments page

2. **FUNCTIONAL TESTING**: Create tests that actually test the features described in the test cases
   - If test case mentions "Create Student", create a test that fills a student form and submits it
   - If test case mentions "Search functionality", create a test that uses a search input
   - If test case mentions "Sorting", create a test that clicks column headers
   - If test case mentions "Pagination", create a test that clicks next/previous buttons
   - If test case mentions "Import/Export", create a test that handles file uploads

2. **REALISTIC USER WORKFLOWS**: 
   - Test the complete user journey described in the test cases
   - Use proper form filling with realistic data
   - Test actual interactions like clicking buttons, filling inputs, selecting options
   - Add assertions that verify the expected behavior from the test cases

3. **CONTEXT-AWARE SELECTORS**:
   - Use selectors that make sense for the functionality being tested
   - For forms: input[name="firstName"], input[name="lastName"], select[name="grade"]
   - For tables: table, tr, td, th
   - For buttons: button[type="submit"], .btn-primary, [data-testid="create-button"]
   - For search: input[type="search"], input[placeholder*="search"]
   - For pagination: .pagination, .next-page, .prev-page

4. **MEANINGFUL ASSERTIONS**:
   - Assert that forms submit successfully
   - Assert that data appears in tables after creation
   - Assert that search results are filtered correctly
   - Assert that sorting changes the order
   - Assert that pagination shows different pages
   - Assert that error messages appear for invalid inputs

5. **VISUAL CAPTURE**:
   - Always include screenshots at key points: await page.screenshot({ path: 'screenshots/test-step.png', fullPage: true })
   - Capture screenshots after form submissions, search results, and important state changes
   - Use descriptive screenshot names that match the test step
   - Videos and traces will be automatically captured by Playwright configuration

CRITICAL REQUIREMENTS - Generate ONLY working, executable code:

1. **REAL SELECTORS ONLY**: Use actual CSS selectors, not placeholders like 'selector-for-button'
   - Use: button[type="submit"], input[name="email"], #login-button, .submit-btn
   - NEVER use: 'selector-for-logout-button', 'form-selector', etc.

2. **PROPER FORM HANDLING**: 
   - For form filling, iterate through data object properties
   - Use: await page.fill('input[name="field1"]', data.field1)
   - NEVER use: await page.fill(selector, data) where data is an object

3. **BROWSER-AGNOSTIC TESTS**:
   - Remove browser-specific assertions like expect(browserName).toBe('firefox')
   - Use generic tests that work on all browsers

4. **ROBUST SELECTORS**:
   - Use multiple fallback selectors: 'button[type="submit"], .btn-primary, #submit'
   - Add proper waits: await page.waitForSelector(selector)
   - Use data-testid when available: [data-testid="login-button"]

5. **REALISTIC TEST FLOW**:
   - Start with navigation to base URL
   - Use proper login flow if needed
   - Add meaningful assertions
   - Handle common UI patterns

6. **ERROR HANDLING**:
   - Add try-catch blocks for critical operations
   - Use proper timeouts and waits
   - Handle dynamic content loading

EXAMPLE STRUCTURE FOR FUNCTIONAL TESTING:
\`\`\javascript
import { test, expect } from '@playwright/test';

const BASE_URL = '${targetUrl}';

test.describe('Students Page Functionality Tests', () => {
  test.beforeEach(async ({ browser }) => {
    ${businessUnit === 'smartapp' ? `// SmartApp - No basic authentication required
    const page = await browser.newPage();
    ` : basicAuthInfo ? `// Set basic authentication credentials on context
    const context = await browser.newContext({ 
      httpCredentials: { 
        username: '${businessUnit === 'lavinia' ? (process.env.LAVINIA_USERNAME || 'laviniagro1stg') : (process.env.PASSAGE_PREP_USERNAME || 'passageprepstg')}', 
        password: '${businessUnit === 'lavinia' ? (process.env.LAVINIA_PASSWORD || '7ada27f4') : (process.env.PASSAGE_PREP_PASSWORD || '777456c1')}' 
      } 
    });
    const page = await context.newPage();
    ` : `// No authentication required
    const page = await browser.newPage();
    `}
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    ${appLoginInfo ? `// Perform application login if needed
    console.log('🔐 Checking for login form...');
    const loginForm = page.locator('input[name="username"], input[name="email"], input[name="password"]');
    const loginFormCount = await loginForm.count();
    console.log(\`📊 Found \${loginFormCount} login form elements\`);
    
    if (loginFormCount > 0) {
      console.log('🔑 Attempting to login...');
      try {
        // Wait for login form to be visible
        await page.waitForSelector('input[name="username"], input[name="email"], input[name="password"]', { timeout: 5000 });
        
        // Fill username/email
        const usernameField = page.locator('input[name="username"], input[name="email"]').first();
        await usernameField.waitFor({ state: 'visible', timeout: 5000 });
        await usernameField.fill('${businessUnit === 'lavinia' ? (process.env.LAVINIA_APP_USERNAME || '') : businessUnit === 'passage prep' ? (process.env.PASSAGE_PREP_APP_USERNAME || '') : (process.env.SMARTAPP_APP_USERNAME || '')}');
        console.log('✅ Username filled');
        
        // Fill password
        const passwordField = page.locator('input[name="password"]').first();
        await passwordField.waitFor({ state: 'visible', timeout: 5000 });
        await passwordField.fill('${businessUnit === 'lavinia' ? (process.env.LAVINIA_APP_PASSWORD || '') : businessUnit === 'passage prep' ? (process.env.PASSAGE_PREP_APP_PASSWORD || '') : (process.env.SMARTAPP_APP_PASSWORD || '')}');
        console.log('✅ Password filled');
        
        // Click login button
        const loginButton = page.locator('button[type="submit"], .btn-login, button:has-text("Login"), button:has-text("Sign In")').first();
        await loginButton.waitFor({ state: 'visible', timeout: 5000 });
        await loginButton.click();
        console.log('✅ Login button clicked');
        
        // Wait for login to complete - look for success indicators
        try {
          // Wait for either success URL or success element
          await Promise.race([
            page.waitForURL('**/dashboard**', { timeout: 10000 }),
            page.waitForURL('**/home**', { timeout: 10000 }),
            page.waitForSelector('text=Dashboard, .dashboard, [data-testid="dashboard"]', { timeout: 10000 }),
            page.waitForSelector('text=Welcome, .welcome, .user-menu', { timeout: 10000 })
          ]);
          console.log('✅ Login successful - detected success indicators');
        } catch (loginError) {
          console.log('⚠️ Login success detection failed, but continuing...');
          console.log('Current URL:', page.url());
        }
        
        // Wait for page to stabilize
        await page.waitForLoadState('networkidle');
        console.log('✅ Page loaded after login');
        
      } catch (loginError) {
        console.error('❌ Login failed:', loginError.message);
        console.log('Current URL:', page.url());
        // Take screenshot for debugging
        await page.screenshot({ path: 'login-error.png', fullPage: true });
        throw new Error(\`Login failed: \${loginError.message}\`);
      }
    } else {
      console.log('ℹ️ No login form found, proceeding without login');
    }` : ''}
    
    // Navigate to appropriate page based on test case content
    // If test cases mention "student" or "students", navigate to Students page via School menu
    if (testCasesContent.some(testCase => 
      testCase.title?.toLowerCase().includes('student') || 
      testCase.bddSteps?.some(step => step?.toLowerCase().includes('student')) ||
      testCase.description?.toLowerCase().includes('student')
    )) {
      console.log('🎯 Detected student-related test cases, navigating to Students page...');
      try {
        // Wait for navigation elements to be available
        await page.waitForLoadState('networkidle');
        
        // Look for School menu with multiple selectors
        const schoolMenu = page.locator('a:has-text("School"), [href*="school"], .nav-item:has-text("School"), .menu-item:has-text("School")').first();
        await schoolMenu.waitFor({ state: 'visible', timeout: 10000 });
        await schoolMenu.click();
        console.log('✅ Clicked School menu');
        
        // Wait for dropdown to appear
        await page.waitForTimeout(2000);
        
        // Look for Students submenu with multiple selectors
        const studentsMenu = page.locator('a:has-text("Students"), [href*="student"], .submenu-item:has-text("Students"), .dropdown-item:has-text("Students")').first();
        await studentsMenu.waitFor({ state: 'visible', timeout: 10000 });
        await studentsMenu.click();
        console.log('✅ Clicked Students submenu');
        
        // Wait for page to load
        await page.waitForLoadState('networkidle');
        console.log('✅ Successfully navigated to Students page');
        console.log('Current URL:', page.url());
        
      } catch (navError) {
        console.error('❌ Navigation failed:', navError.message);
        console.log('Current URL:', page.url());
        // Take screenshot for debugging
        await page.screenshot({ path: 'navigation-error.png', fullPage: true });
        console.log('⚠️ Continuing with tests despite navigation failure...');
      }
    }
  });

  test('Create new student with valid data', async ({ page }) => {
    console.log('🧪 Starting test: Create new student with valid data');
    
    try {
      // Navigate to create student form
      console.log('🔍 Looking for create student button...');
      const createButton = page.locator('button:has-text("Create Student"), [data-testid="create-student"], button:has-text("Add Student")').first();
      await createButton.waitFor({ state: 'visible', timeout: 10000 });
      await createButton.click();
      console.log('✅ Clicked create student button');
      await page.waitForLoadState('networkidle');
      
      // Fill student form with realistic data
      console.log('📝 Filling student form...');
      await page.fill('input[name="firstName"]', 'John');
      await page.fill('input[name="lastName"]', 'Doe');
      await page.selectOption('select[name="grade"]', '10');
      await page.selectOption('select[name="school"]', 'Test School');
      await page.fill('input[name="entryYear"]', '2024');
      console.log('✅ Form filled');
      
      // Submit the form
      console.log('🚀 Submitting form...');
      await page.click('button[type="submit"], .btn-primary');
      await page.waitForLoadState('networkidle');
      console.log('✅ Form submitted');
      
      // Assert student was created successfully
      console.log('🔍 Verifying success...');
      await expect(page.locator('text=Student created successfully, .success-message')).toBeVisible();
      await expect(page.locator('table tr:has-text("John Doe")')).toBeVisible();
      console.log('✅ Test passed');
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      await page.screenshot({ path: 'test-failed-create-student.png', fullPage: true });
      throw error;
    }
  });

  test('Search functionality filters students correctly', async ({ page }) => {
    // Use search functionality
    await page.fill('input[type="search"], input[placeholder*="search"]', 'John');
    await page.press('input[type="search"]', 'Enter');
    await page.waitForLoadState('networkidle');
    
    // Assert search results
    const rows = page.locator('table tr');
    const count = await rows.count();
    for (let i = 1; i < count; i++) {
      await expect(rows.nth(i)).toContainText('John');
    }
  });

  test('Sorting functionality works on columns', async ({ page }) => {
    // Click on Name column header to sort
    await page.click('th:has-text("Name"), .sortable-header');
    await page.waitForLoadState('networkidle');
    
    // Assert sorting worked (check if rows are in alphabetical order)
    const nameCells = page.locator('table td:nth-child(1)');
    const firstCell = await nameCells.first().textContent();
    const lastCell = await nameCells.last().textContent();
    expect(firstCell <= lastCell).toBeTruthy();
  });
});
\`\`\`

CRITICAL: If basic auth is required, ALWAYS use the browser context approach above. Never use page.setHTTPCredentials() as it doesn't exist.

CRITICAL SELECTOR RULES FOR FUNCTIONAL TESTING:
- Use selectors that match the functionality being tested
- For student forms: input[name="firstName"], input[name="lastName"], select[name="grade"], select[name="school"]
- For tables: table, tr, td, th, tbody
- For buttons: button[type="submit"], .btn-primary, button:has-text("Create"), button:has-text("Edit")
- For search: input[type="search"], input[placeholder*="search"], input[name="search"]
- For pagination: .pagination, .next-page, .prev-page, button:has-text("Next"), button:has-text("Previous")
- For sorting: th.sortable, .sortable-header, th:has-text("Name")
- For file uploads: input[type="file"], .file-upload
- Use fallback selectors: 'button[type="submit"], .btn-primary, [data-testid="submit"]'
- Always add proper waits: await page.waitForLoadState('networkidle') after interactions
- Add meaningful assertions that verify the actual functionality
- Test the complete user workflow, not just page loads

CRITICAL TEST GENERATION RULES:
- Generate tests that actually test the functionality described in the test cases
- Use realistic selectors that match the functionality being tested
- Create tests that perform actual user actions (form filling, clicking, searching, sorting)
- Add meaningful assertions that verify the expected behavior
- Test complete user workflows, not just basic page loads
- Use beforeEach hooks for setup when needed
- Create comprehensive tests that cover the full functionality
- Use proper assertions that verify the actual behavior
- Test real user interactions and workflows
- Generate tests that will pass on any website

MANDATORY: You MUST generate functional tests based on the test cases provided. 

For the test case "Create new student with valid data", generate:
test('Create new student with valid data', async ({ browser }) => {
  ${businessUnit === 'smartapp' ? `// SmartApp - No basic authentication required
  const page = await browser.newPage();` : `// Set basic authentication credentials
  const context = await browser.newContext({ 
    httpCredentials: { 
      username: '${businessUnit === 'lavinia' ? (process.env.LAVINIA_USERNAME || 'laviniagro1stg') : (process.env.PASSAGE_PREP_USERNAME || 'passageprepstg')}', 
      password: '${businessUnit === 'lavinia' ? (process.env.LAVINIA_PASSWORD || '7ada27f4') : (process.env.PASSAGE_PREP_PASSWORD || '777456c1')}' 
    } 
  });
  const page = await context.newPage();`}
  
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  
  ${appLoginInfo ? `// Perform application login if needed
  if (await page.locator('input[name="username"], input[name="email"], input[name="password"]').count() > 0) {
    await page.fill('input[name="username"], input[name="email"]', '${businessUnit === 'lavinia' ? (process.env.LAVINIA_APP_USERNAME || 'your_lavinia_app_username') : businessUnit === 'passage prep' ? (process.env.PASSAGE_PREP_APP_USERNAME || 'your_passage_prep_app_username') : (process.env.SMARTAPP_APP_USERNAME || 'your_smartapp_username')}');
    await page.fill('input[name="password"]', '${businessUnit === 'lavinia' ? (process.env.LAVINIA_APP_PASSWORD || 'your_lavinia_app_password') : businessUnit === 'passage prep' ? (process.env.PASSAGE_PREP_APP_PASSWORD || 'your_passage_prep_app_password') : (process.env.SMARTAPP_APP_PASSWORD || 'your_smartapp_password')}');
    await page.click('button[type="submit"], .btn-login, button:has-text("Login")');
    await page.waitForLoadState('networkidle');
  }
  
  ` : ''}// Click create student button
  await page.click('button:has-text("Create Student"), [data-testid="create-student"]');
  await page.waitForLoadState('networkidle');
  
  // Fill student form
  await page.fill('input[name="firstName"]', 'John');
  await page.fill('input[name="lastName"]', 'Doe');
  await page.selectOption('select[name="grade"]', '10');
  await page.selectOption('select[name="school"]', 'Test School');
  
  // Submit form
  await page.click('button[type="submit"], .btn-primary');
  await page.waitForLoadState('networkidle');
  
  // Verify student was created
  await expect(page.locator('text=Student created successfully, .success-message')).toBeVisible();
  await expect(page.locator('table tr:has-text("John Doe")')).toBeVisible();
  
  // Capture screenshot for verification
  await page.screenshot({ path: 'screenshots/student-created.png', fullPage: true });
});

For the test case "Search functionality filters students", generate:
test('Search functionality filters students', async ({ browser }) => {
  ${businessUnit === 'smartapp' ? `// SmartApp - No basic authentication required
  const page = await browser.newPage();` : `// Set basic authentication credentials
  const context = await browser.newContext({ 
    httpCredentials: { 
      username: '${businessUnit === 'lavinia' ? (process.env.LAVINIA_USERNAME || 'laviniagro1stg') : (process.env.PASSAGE_PREP_USERNAME || 'passageprepstg')}', 
      password: '${businessUnit === 'lavinia' ? (process.env.LAVINIA_PASSWORD || '7ada27f4') : (process.env.PASSAGE_PREP_PASSWORD || '777456c1')}' 
    } 
  });
  const page = await context.newPage();`}
  
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  
  ${appLoginInfo ? `// Perform application login if needed
  if (await page.locator('input[name="username"], input[name="email"], input[name="password"]').count() > 0) {
    await page.fill('input[name="username"], input[name="email"]', '${businessUnit === 'lavinia' ? (process.env.LAVINIA_APP_USERNAME || 'your_lavinia_app_username') : businessUnit === 'passage prep' ? (process.env.PASSAGE_PREP_APP_USERNAME || 'your_passage_prep_app_username') : (process.env.SMARTAPP_APP_USERNAME || 'your_smartapp_username')}');
    await page.fill('input[name="password"]', '${businessUnit === 'lavinia' ? (process.env.LAVINIA_APP_PASSWORD || 'your_lavinia_app_password') : businessUnit === 'passage prep' ? (process.env.PASSAGE_PREP_APP_PASSWORD || 'your_passage_prep_app_password') : (process.env.SMARTAPP_APP_PASSWORD || 'your_smartapp_password')}');
    await page.click('button[type="submit"], .btn-login, button:has-text("Login")');
    await page.waitForLoadState('networkidle');
  }
  
  ` : ''}// Use search functionality
  await page.fill('input[type="search"], input[placeholder*="search"]', 'John');
  await page.press('input[type="search"]', 'Enter');
  await page.waitForLoadState('networkidle');
  
  // Verify search results
  const rows = page.locator('table tr');
  const count = await rows.count();
  for (let i = 1; i < count; i++) {
    await expect(rows.nth(i)).toContainText('John');
  }
  
  // Capture screenshot of search results
  await page.screenshot({ path: 'screenshots/search-results.png', fullPage: true });
});

Generate ONLY the Playwright script code following this pattern - no explanations, no markdown formatting.

🚨 FINAL INSTRUCTION: ALWAYS use BASE_URL = '${targetUrl}' - NEVER use example.com, null, or placeholder URLs!

CRITICAL: The BASE_URL must be a valid URL starting with https:// - if you see 'null' or 'undefined', use '${targetUrl}' instead!`

      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a Playwright expert specializing in functional testing. Generate tests that actually test the functionality described in the test cases.

CRITICAL RULES:
- DO NOT generate basic page load tests like "Basic Page Load Test", "Header Visibility Test"
- DO generate tests that perform actual user actions (form filling, clicking, searching, sorting)
- Use realistic selectors that match the functionality being tested
- For student forms: input[name="firstName"], input[name="lastName"], select[name="grade"]
- For tables: table, tr, td, th
- For buttons: button[type="submit"], .btn-primary, button:has-text("Create")
- Handle forms properly by iterating through data properties
- ALWAYS include screenshots at key points: await page.screenshot({ path: 'screenshots/step-name.png', fullPage: true })
- Remove browser-specific assertions
- Add proper waits and error handling
- Use basic assertions like expect(page.locator('body')).toBeVisible()
- ALWAYS set basic auth credentials on the browser context BEFORE creating pages
- Use browser.newContext({ httpCredentials: { username, password } }) for basic authentication
- Generate code that can run immediately without modifications
- NO markdown formatting, NO explanations, ONLY JavaScript code
- Focus on functional tests that test the actual features described in the test cases`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 3000
      })

      let script = response.choices[0].message.content
      
      // Clean up markdown formatting
      script = script.replace(/```javascript\n?/g, '')
      script = script.replace(/```\n?/g, '')
      script = script.replace(/```js\n?/g, '')
      script = script.trim()
      
      return script
    } catch (error) {
      console.error('Error generating Playwright script:', error)
      throw new Error(`Failed to generate Playwright script: ${error.message}`)
    }
  }

  // Generate dynamic selectors by analyzing the actual page
  async generateDynamicSelectors(url) {
    try {
      // Import Playwright dynamically to avoid require issues in ES modules
      const playwright = await import('playwright')
      const { chromium } = playwright
      const browser = await chromium.launch({ headless: true })
      
      // Set basic auth credentials on the context if needed
      let contextOptions = {}
      if (url.includes('laviniagro1stg.wpengine.com')) {
        contextOptions.httpCredentials = { username: 'laviniagro1stg', password: '7ada27f4' }
      } else if (url.includes('passageprepstg.wpenginepowered.com')) {
        contextOptions.httpCredentials = { username: 'passageprepstg', password: '777456c1' }
      }
      
      const context = await browser.newContext(contextOptions)
      const page = await context.newPage()
      
      await page.goto(url, { waitUntil: 'networkidle' })
      
      // Extract common selectors from the page
      const selectors = await page.evaluate(() => {
        const elements = {
          buttons: [],
          inputs: [],
          forms: [],
          links: []
        }
        
        // Get all buttons
        document.querySelectorAll('button, input[type="button"], input[type="submit"]').forEach(btn => {
          const text = btn.textContent?.trim() || btn.value || ''
          const id = btn.id
          const className = btn.className
          const type = btn.type
          const name = btn.name
          
          if (text || id || className) {
            elements.buttons.push({
              text: text,
              selector: id ? `#${id}` : 
                      name ? `[name="${name}"]` :
                      type ? `button[type="${type}"]` :
                      className ? `.${className.split(' ')[0]}` :
                      `button:has-text("${text}")`,
              fullSelector: btn.outerHTML.substring(0, 100)
            })
          }
        })
        
        // Get all input fields
        document.querySelectorAll('input, textarea, select').forEach(input => {
          const type = input.type
          const name = input.name
          const id = input.id
          const placeholder = input.placeholder
          const className = input.className
          
          if (name || id || placeholder) {
            elements.inputs.push({
              type: type,
              name: name,
              placeholder: placeholder,
              selector: id ? `#${id}` : 
                       name ? `[name="${name}"]` :
                       placeholder ? `[placeholder="${placeholder}"]` :
                       className ? `.${className.split(' ')[0]}` :
                       `input[type="${type}"]`,
              fullSelector: input.outerHTML.substring(0, 100)
            })
          }
        })
        
        // Get forms
        document.querySelectorAll('form').forEach(form => {
          const id = form.id
          const className = form.className
          const action = form.action
          
          elements.forms.push({
            selector: id ? `#${id}` : className ? `.${className.split(' ')[0]}` : 'form',
            action: action,
            fullSelector: form.outerHTML.substring(0, 100)
          })
        })
        
        return elements
      })
      
      await context.close()
      await browser.close()
      
      // Format selectors for the prompt
      let selectorText = 'REAL SELECTORS FOUND ON PAGE:\n\n'
      
      if (selectors.buttons.length > 0) {
        selectorText += 'BUTTONS:\n'
        selectors.buttons.slice(0, 10).forEach(btn => {
          selectorText += `- ${btn.selector} (text: "${btn.text}")\n`
        })
        selectorText += '\n'
      }
      
      if (selectors.inputs.length > 0) {
        selectorText += 'INPUT FIELDS:\n'
        selectors.inputs.slice(0, 10).forEach(input => {
          selectorText += `- ${input.selector} (type: ${input.type}, name: ${input.name}, placeholder: "${input.placeholder}")\n`
        })
        selectorText += '\n'
      }
      
      if (selectors.forms.length > 0) {
        selectorText += 'FORMS:\n'
        selectors.forms.slice(0, 5).forEach(form => {
          selectorText += `- ${form.selector} (action: ${form.action})\n`
        })
        selectorText += '\n'
      }
      
      return selectorText
      
    } catch (error) {
      console.error('Error generating dynamic selectors:', error)
      return ''
    }
  }

  // Get URL for business unit
  // Determine business unit from custom field, project name, or labels
  determineBusinessUnit(customField, projectName, labels) {
    // Check labels first for SmartApp
    if (labels && labels.includes('qa_SmartApp')) {
      return 'smartapp'
    }
    
    // Check custom field
    if (customField) {
      const normalized = customField.toLowerCase().trim()
      if (normalized.includes('lavinia')) return 'lavinia'
      if (normalized.includes('passage') || normalized.includes('teaching')) return 'passage prep'
      if (normalized.includes('smartapp')) return 'smartapp'
    }
    
    // Check project name
    if (projectName) {
      const normalized = projectName.toLowerCase().trim()
      if (normalized.includes('lavinia')) return 'lavinia'
      if (normalized.includes('passage') || normalized.includes('teaching')) return 'passage prep'
      if (normalized.includes('smartapp')) return 'smartapp'
    }
    
    // Default fallback
    return customField || projectName || 'lavinia'
  }

  getUrlForBusinessUnit(businessUnit) {
    if (!businessUnit) return null
    
    const normalizedUnit = businessUnit.toLowerCase().trim()
    
    // Handle SmartApp URL dynamically from environment
    if (normalizedUnit === 'smartapp') {
      return 'https://smartappstage.teachingchannel.com/'
    }
    
    return this.businessUnitUrls[normalizedUnit] || null
  }

  // Get ticket details by key
  async getTicketDetails(ticketKey) {
    try {
      const issue = await this.jira.findIssue(ticketKey, {
        fields: ['summary', 'description', 'priority', 'status', 'issuetype', 'assignee', 'reporter', 'created', 'updated', 'project', 'customfield_10014', 'labels']
      })
      
      const labels = issue.fields.labels || []
      const businessUnit = this.determineBusinessUnit(issue.fields.customfield_10014?.value, issue.fields.project?.name, labels)
      const mappedUrl = this.getUrlForBusinessUnit(businessUnit)
      
      return {
        key: issue.key,
        summary: issue.fields.summary,
        description: issue.fields.description || 'No description provided',
        priority: issue.fields.priority?.name || 'Medium',
        status: issue.fields.status?.name || 'Unknown',
        type: issue.fields.issuetype?.name || 'Task',
        assignee: issue.fields.assignee?.displayName || 'Unassigned',
        reporter: issue.fields.reporter?.displayName || 'Unknown',
        created: issue.fields.created,
        updated: issue.fields.updated,
        url: `${process.env.JIRA_HOST}/browse/${issue.key}`,
        projectKey: issue.fields.project?.key || null,
        projectName: issue.fields.project?.name || null,
        businessUnit: businessUnit,
        mappedUrl: mappedUrl,
        labels: labels
      }
    } catch (error) {
      console.error('Error fetching ticket details:', error)
      throw new Error(`Failed to fetch ticket details: ${error.message}`)
    }
  }

  // Publish test cases to a Jira ticket as comments using direct REST API
  async publishTestCasesToTicket(ticketKey, testCases) {
    if (!this.jira) {
      throw new Error('JIRA client not initialized. Check your JIRA configuration.')
    }

    try {
      console.log(`Publishing ${testCases.length} test cases to ticket ${ticketKey}`)
      
      // Use direct REST API call instead of jira-client library
      const jiraHost = process.env.JIRA_HOST
      const username = process.env.JIRA_USERNAME
      const apiToken = process.env.JIRA_API_TOKEN
      
      const auth = Buffer.from(`${username}:${apiToken}`).toString('base64')
      
      // Try the most basic comment possible
      const basicCommentBody = `Test cases generated: ${testCases.length} test cases. Generated on ${new Date().toLocaleString()}.`
      
      console.log('Trying direct REST API call...')
      console.log('Comment body:', basicCommentBody)
      
      const response = await fetch(`https://${jiraHost}/rest/api/2/issue/${ticketKey}/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          body: basicCommentBody
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Jira API Error:', response.status, errorText)
        throw new Error(`Jira API Error ${response.status}: ${errorText}`)
      }
      
      const result = await response.json()
      console.log(`Successfully published basic comment to ticket ${ticketKey}`)
      console.log('Comment ID:', result.id)
      
      // If basic comment works, try to add a more detailed comment
      try {
        let detailedCommentBody = `Test Cases Generated by QA Testing Agent\n\n`
        
        testCases.forEach((testCase, index) => {
          const title = (testCase.title || `Test Case ${index + 1}`).replace(/[{}*_#]/g, '').trim()
          const testCaseId = testCase.testCaseId || `TC-${String(index + 1).padStart(3, '0')}`
          const priority = testCase.priority || 'Medium'
          
          detailedCommentBody += `Test Case ${index + 1}: ${title}\n`
          detailedCommentBody += `ID: ${testCaseId}\n`
          detailedCommentBody += `Priority: ${priority}\n\n`
          
          if (testCase.bddSteps && Array.isArray(testCase.bddSteps) && testCase.bddSteps.length > 0) {
            detailedCommentBody += `BDD Steps:\n`
            testCase.bddSteps.forEach((step, stepIndex) => {
              if (step && step.trim()) {
                const cleanStep = step.replace(/[{}*_#]/g, '').trim()
                detailedCommentBody += `${stepIndex + 1}. ${cleanStep}\n`
              }
            })
          }
          
          detailedCommentBody += `\n---\n\n`
        })
        
        detailedCommentBody += `Generated on: ${new Date().toLocaleString()}\n`
        detailedCommentBody += `Total Test Cases: ${testCases.length}\n\n`
        detailedCommentBody += `These test cases were automatically generated by the QA Testing Agent.`
        
        // Ensure comment body is not too long
        if (detailedCommentBody.length > 32767) {
          detailedCommentBody = detailedCommentBody.substring(0, 32700) + '\n\n... (truncated due to length)'
        }

        console.log('Trying detailed comment...')
        const detailedResponse = await fetch(`https://${jiraHost}/rest/api/2/issue/${ticketKey}/comment`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            body: detailedCommentBody
          })
        })
        
        if (!detailedResponse.ok) {
          const errorText = await detailedResponse.text()
          console.log('Detailed comment failed:', detailedResponse.status, errorText)
          throw new Error(`Detailed comment failed: ${errorText}`)
        }
        
        const detailedResult = await detailedResponse.json()
        console.log(`Successfully published detailed comment to ticket ${ticketKey}`)
        
        return {
          ticketKey,
          commentId: detailedResult.id,
          testCasesCount: testCases.length,
          publishedAt: new Date().toISOString(),
          basicCommentId: result.id
        }
        
      } catch (detailedError) {
        console.log('Detailed comment failed, but basic comment succeeded:', detailedError.message)
        return {
          ticketKey,
          commentId: result.id,
          testCasesCount: testCases.length,
          publishedAt: new Date().toISOString(),
          note: 'Only basic comment was added due to formatting issues'
        }
      }
      
    } catch (error) {
      console.error('Error publishing test cases to Jira:', error)
      
      if (error.message.includes('401')) {
        throw new Error('JIRA authentication failed. Check your username and API token.')
      } else if (error.message.includes('403')) {
        throw new Error('JIRA access denied. Check your permissions for this ticket.')
      } else if (error.message.includes('404')) {
        throw new Error(`JIRA ticket ${ticketKey} not found.`)
      } else {
        throw new Error(`Failed to publish test cases to Jira: ${error.message || 'Unknown error'}`)
      }
    }
  }
}
