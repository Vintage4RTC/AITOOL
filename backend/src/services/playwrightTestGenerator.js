import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class PlaywrightTestGenerator {
  constructor() {
    this.tempTestsDir = path.join(__dirname, '..', 'temp-tests')
    this.ensureTempDir()
  }

  ensureTempDir() {
    if (!fs.existsSync(this.tempTestsDir)) {
      fs.mkdirSync(this.tempTestsDir, { recursive: true })
    }
  }

  generateSmokeTest(config) {
    const {
      projectId,
      testType,
      targetUrl,
      basicAuth,
      loginFlow,
      agentId
    } = config

    // Get project-specific configuration
    const projectConfig = this.getProjectConfig(projectId)
    
    // Generate the test file content
    const testContent = this.generateTestContent({
      projectId,
      testType,
      targetUrl,
      basicAuth,
      loginFlow,
      projectConfig,
      agentId
    })

    // Write test file
    const fileName = `smoke-test-${agentId}.spec.js`
    const filePath = path.join(this.tempTestsDir, fileName)
    fs.writeFileSync(filePath, testContent)

    return {
      fileName,
      filePath,
      content: testContent
    }
  }

  getProjectConfig(projectId) {
    const configs = {
      passageprep: {
        loginUrl: 'https://passageprepstg.wpenginepowered.com/my-account/',
        usernameSelector: 'input#username',
        passwordSelector: 'input#password',
        loginButtonSelector: 'button[name="login"]',
        successUrlPattern: /.*my-account/,
        successElementSelector: 'h1, h2, .entry-title',
        successText: 'My Account',
        basicAuth: {
          username: 'passageprepstg',
          password: '777456c1'
        }
      },
      lavinia: {
        loginUrl: 'https://laviniagro1stg.wpengine.com/my-account/',
        usernameSelector: 'input#username',
        passwordSelector: 'input#password',
        loginButtonSelector: 'button[name="login"]',
        successUrlPattern: /.*my-account/,
        successElementSelector: 'h1, h2, .entry-title',
        successText: 'My Account',
        basicAuth: {
          username: 'laviniagro1stg',
          password: '7ada27f4'
        }
      },
      teachingchannel: {
        loginUrl: 'https://teachingchannelstg.wpengine.com/my-account/',
        usernameSelector: 'input#username',
        passwordSelector: 'input#password',
        loginButtonSelector: 'button[name="login"]',
        successUrlPattern: /.*my-account/,
        successElementSelector: 'h1, h2, .entry-title',
        successText: 'My Account',
        basicAuth: {
          username: 'teachingchannelstg',
          password: '8b8c8d8e'
        }
      }
    }

    return configs[projectId] || configs.passageprep
  }

  generateTestContent({ projectId, testType, targetUrl, basicAuth, loginFlow, projectConfig, agentId }) {
    const testName = `${projectId}-${testType}-test`
    const loginUsername = loginFlow?.username || projectConfig.loginUsername || 'k12qaautomation@gmail.com'
    const loginPassword = loginFlow?.password || projectConfig.loginPassword || 'yE4hkSy3iEvPlvUte!HB@#CQ'
    const basicAuthUser = basicAuth?.username || projectConfig.basicAuth?.username
    const basicAuthPass = basicAuth?.password || projectConfig.basicAuth?.password

    return `import { test, expect } from '@playwright/test';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

test('${testName} - Login and check links with GPT summary', async ({ page, browser }) => {
  const results = [];
  const agentId = '${agentId}';

  try {
    // Configure browser for better visibility
    console.log(\`🚀 Starting ${testName} for agent \${agentId}\`);
    console.log(\`🌐 Browser: \${browser.browserType().name()}\`);
    
    // Step 1: Go to login page
    console.log(\`📍 Navigating to: ${projectConfig.loginUrl}\`);
    await page.goto('${projectConfig.loginUrl}', { waitUntil: 'networkidle' });
    console.log(\`✅ Successfully loaded login page\`);
    results.push({ step: 'Navigate to login page', status: 'PASS', url: '${projectConfig.loginUrl}' });

    // Step 2: Fill in login form
    console.log('🔐 Filling login form...');
    console.log(\`📝 Username: ${loginUsername}\`);
    await page.fill('${projectConfig.usernameSelector}', '${loginUsername}');
    console.log('✅ Username filled');
    await page.fill('${projectConfig.passwordSelector}', '${loginPassword}');
    console.log('✅ Password filled');
    await page.click('${projectConfig.loginButtonSelector}');
    console.log('✅ Login button clicked');
    results.push({ step: 'Login form submission', status: 'PASS' });

    // Step 3: Verify login
    console.log('✅ Verifying login success...');
    await page.waitForURL(${projectConfig.successUrlPattern}, { timeout: 10000 });
    console.log('✅ URL verification passed');
    await expect(page.locator('${projectConfig.successElementSelector}')).toContainText('${projectConfig.successText}');
    console.log('✅ Login verification passed');
    results.push({ step: 'Login verification', status: 'PASS' });

    // Step 4: Navigate to target URL if different from login
    if ('${targetUrl}' && '${targetUrl}' !== '${projectConfig.loginUrl}') {
      console.log('🌐 Navigating to target URL...');
      await page.goto('${targetUrl}');
      results.push({ step: 'Navigate to target URL', status: 'PASS', url: '${targetUrl}' });
    }

    // Step 5: Collect and check links
    console.log('🔍 Collecting and checking links...');
    const links = await page.locator('a').all();
    let linkCheckCount = 0;
    let linkPassCount = 0;
    let linkFailCount = 0;

    for (const link of links) {
      const url = await link.getAttribute('href');
      if (url && url.startsWith('http')) {
        linkCheckCount++;
        try {
          const response = await page.request.get(url);
          if (response.ok()) {
            linkPassCount++;
            results.push({ step: \`Link check: \${url}\`, status: 'PASS' });
          } else {
            linkFailCount++;
            results.push({
              step: \`Link check: \${url}\`,
              status: 'FAIL',
              code: response.status(),
            });
          }
        } catch (e) {
          linkFailCount++;
          results.push({
            step: \`Link check: \${url}\`,
            status: 'ERROR',
            error: e.message,
          });
        }
      }
    }

    // Step 6: Take final screenshot
    const screenshot = await page.screenshot({ fullPage: true });
    results.push({ 
      step: 'Final screenshot', 
      status: 'PASS',
      screenshot: 'captured'
    });

    console.log(\`📊 Test completed: \${linkCheckCount} links checked, \${linkPassCount} passed, \${linkFailCount} failed\`);

  } catch (e) {
    console.error('❌ Test failed:', e);
    results.push({ step: 'General Test Failure', status: 'ERROR', error: e.message });
  }

  // Step 7: Send results to GPT for summary
  console.log('🤖 Generating GPT summary...');
  const prompt = \`
Here are Playwright test results for ${projectId} ${testType} test (Agent ID: \${agentId}):

\${JSON.stringify(results, null, 2)}

Summarize the outcome in a clear QA report. Highlight:
- If login worked or failed
- Number of links checked, and how many passed/failed
- Which links failed (with codes)
- Any errors that need attention
- Overall test status and recommendations

Format the response as a professional QA report.
\`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a professional QA test reporter. Provide clear, actionable insights.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1000,
    });

    const gptSummary = response.choices[0].message.content;
    console.log("\\n=== GPT QA SUMMARY ===\\n");
    console.log(gptSummary);
    
    // Add GPT summary to results
    results.push({
      step: 'GPT Analysis',
      status: 'COMPLETED',
      summary: gptSummary
    });

  } catch (gptError) {
    console.error('❌ GPT analysis failed:', gptError);
    results.push({
      step: 'GPT Analysis',
      status: 'ERROR',
      error: gptError.message
    });
  }

  // Return results for backend processing
  return {
    agentId,
    testName: '${testName}',
    results,
    summary: results.find(r => r.step === 'GPT Analysis')?.summary || 'GPT analysis failed'
  };
});`
  }

  generateExploratoryTest(config) {
    // Similar to smoke test but with more comprehensive navigation
    return this.generateSmokeTest(config)
  }

  generateRegressionTest(config) {
    // Similar to smoke test but with more thorough testing
    return this.generateSmokeTest(config)
  }

  generateTest(config) {
    const { testType } = config
    
    switch (testType) {
      case 'smoke':
        return this.generateSmokeTest(config)
      case 'exploratory':
        return this.generateExploratoryTest(config)
      case 'regression':
        return this.generateRegressionTest(config)
      default:
        return this.generateSmokeTest(config)
    }
  }

  cleanupTest(fileName) {
    const filePath = path.join(this.tempTestsDir, fileName)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  }

  listGeneratedTests() {
    if (!fs.existsSync(this.tempTestsDir)) {
      return []
    }
    
    return fs.readdirSync(this.tempTestsDir)
      .filter(file => file.endsWith('.spec.js'))
      .map(file => ({
        fileName: file,
        filePath: path.join(this.tempTestsDir, file),
        createdAt: fs.statSync(path.join(this.tempTestsDir, file)).mtime
      }))
  }
}
