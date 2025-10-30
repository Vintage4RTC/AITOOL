import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class OpenAITestGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    this.tempTestsDir = path.join(__dirname, 'temp-tests')
    this.ensureTempDir()
  }

  ensureTempDir() {
    if (!fs.existsSync(this.tempTestsDir)) {
      fs.mkdirSync(this.tempTestsDir, { recursive: true })
    }
  }

  async generateCustomTest(config) {
    const {
      projectId,
      testType,
      targetUrl,
      customTestDescription,
      basicAuth,
      loginFlow,
      agentId
    } = config

    // Always use dynamic DOM analysis instead of OpenAI generation
    // This ensures we analyze the actual page structure and create proper locators
    console.log(`🔍 Using dynamic DOM analysis for test generation...`)
    console.log(`📝 Custom description: ${customTestDescription}`)
    console.log(`🎯 This approach will analyze the actual page DOM to find form elements`)
    
    return this.generateSimpleTest(config)
  }

  async generateCustomTestWithOpenAI(config) {
    const {
      projectId,
      testType,
      targetUrl,
      customTestDescription,
      basicAuth,
      loginFlow,
      agentId
    } = config

    console.log(`🤖 Generating custom test with OpenAI for ${projectId}...`)
    console.log(`📝 Custom description: ${customTestDescription}`)

    // Create the prompt for OpenAI
    const prompt = this.createTestGenerationPrompt({
      projectId,
      testType,
      targetUrl,
      customTestDescription,
      basicAuth,
      loginFlow,
      agentId
    })

    try {
      // Call OpenAI to generate the test
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o', // Using gpt-4o as gpt-5 is not generally available
        messages: [
          {
            role: 'system',
            content: `You are an expert QA automation engineer specializing in Playwright test generation. 
            Generate comprehensive, production-ready Playwright test scripts that are robust, maintainable, and follow best practices.
            
            Requirements:
            - Use modern Playwright syntax and best practices
            - Include proper error handling and timeouts
            - Add detailed console logging for each step (NO EMOJIS in console.log statements)
            - Use data-testid selectors when possible, fallback to semantic selectors
            - Include proper waits and assertions
            - Make tests resilient to timing issues
            - Include screenshots on failures
            - Generate realistic test data when needed
            - Follow the exact structure provided in the template
            - IMPORTANT: Do not use any emoji characters in the generated code
            - CRITICAL: Always use ES module syntax (import/export), never use require() or CommonJS syntax`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent, reliable code
        max_tokens: 4000
      })

      let generatedTest = response.choices[0].message.content
      
      // Clean up the response - remove markdown formatting if present
      if (generatedTest.includes('```javascript')) {
        generatedTest = generatedTest.split('```javascript')[1].split('```')[0].trim()
      } else if (generatedTest.includes('```')) {
        generatedTest = generatedTest.split('```')[1].split('```')[0].trim()
      }
      
      // Fix CommonJS syntax to ES modules
      generatedTest = generatedTest.replace(/const\s*{\s*test\s*,\s*expect\s*}\s*=\s*require\s*\(\s*['"]@playwright\/test['"]\s*\)\s*;?/g, "import { test, expect } from '@playwright/test';")
      generatedTest = generatedTest.replace(/const\s*{\s*test\s*}\s*=\s*require\s*\(\s*['"]@playwright\/test['"]\s*\)\s*;?/g, "import { test } from '@playwright/test';")
      generatedTest = generatedTest.replace(/const\s*{\s*expect\s*}\s*=\s*require\s*\(\s*['"]@playwright\/test['"]\s*\)\s*;?/g, "import { expect } from '@playwright/test';")
      
      // Fix page.authenticate() calls to use correct Playwright method
      generatedTest = generatedTest.replace(
        /await page\.authenticate\(\{\s*username:\s*['"]([^'"]+)['"],\s*password:\s*['"]([^'"]+)['"]\s*\}\);?/g,
        `await page.setExtraHTTPHeaders({
      'Authorization': 'Basic ' + Buffer.from('$1:$2').toString('base64')
    });`
      )
      
      // Fix empty passwords and placeholder text
      if (basicAuth && basicAuth.password) {
        generatedTest = generatedTest.replace(/password:\s*['"]\s*['"]/g, `password: '${basicAuth.password}'`)
        generatedTest = generatedTest.replace(/password:\s*['"]\s*['"]/g, `password: '${basicAuth.password}'`)
      }
      if (loginFlow && loginFlow.password) {
        // Get project config for selectors
        const projectConfigs = {
          passageprep: {
            loginUrl: 'https://passageprepstg.wpenginepowered.com/my-account/',
            usernameSelector: '#username',
            passwordSelector: '#password',
            loginButtonSelector: '#wp-submit, .woocommerce-form-login__submit, input[name="login"], button[name="login"]',
            dashboardUrl: 'https://passageprepstg.wpenginepowered.com/my-account/'
          },
          teachingchannel: {
            loginUrl: 'https://teachingchannel.wpenginepowered.com/my-account/',
            usernameSelector: '#username',
            passwordSelector: '#password',
            loginButtonSelector: '#wp-submit, .woocommerce-form-login__submit, input[name="login"], button[name="login"]',
            dashboardUrl: 'https://teachingchannel.wpenginepowered.com/dashboard/'
          }
        }
        const projectConfig = projectConfigs[projectId] || projectConfigs.passageprep
        
        generatedTest = generatedTest.replace(/await page\.fill\([^,]+,\s*['"]your-secure-password['"]/g, `await page.fill('${projectConfig.passwordSelector}', '${loginFlow.password}')`)
        generatedTest = generatedTest.replace(/await page\.fill\([^,]+,\s*['"]\s*['"]/g, `await page.fill('${projectConfig.passwordSelector}', '${loginFlow.password}')`)
      }
      
      console.log(`✅ OpenAI generated test successfully`)

      // Save the generated test to a file
      const testFileName = `custom-test-${agentId}.spec.js`
      const testFilePath = path.join(this.tempTestsDir, testFileName)
      
      fs.writeFileSync(testFilePath, generatedTest, 'utf8')
      console.log(`📁 Test file saved: ${testFilePath}`)

      return {
        testFilePath,
        testFileName,
        generatedTest
      }

    } catch (error) {
      console.error('❌ Error generating test with OpenAI:', error)
      console.log('🔄 Falling back to simple test generator...')
      
      // Fallback to simple test generator
      return this.generateSimpleTest(config)
    }
  }

  createTestGenerationPrompt(config) {
    const {
      projectId,
      testType,
      targetUrl,
      customTestDescription,
      basicAuth,
      loginFlow,
      agentId
    } = config

    // Project-specific configurations
    const projectConfigs = {
      passageprep: {
        loginUrl: 'https://passageprepstg.wpenginepowered.com/my-account/',
        usernameSelector: '#username',
        passwordSelector: '#password',
        loginButtonSelector: 'button[name="login"][type="submit"], .woocommerce-form-login__submit, #wp-submit',
        dashboardUrl: 'https://passageprepstg.wpenginepowered.com/dashboard/'
      },
      lavinia: {
        loginUrl: 'https://lavinia.wpenginepowered.com/login/',
        usernameSelector: '#user_login',
        passwordSelector: '#user_pass',
        loginButtonSelector: '#wp-submit',
        dashboardUrl: 'https://lavinia.wpenginepowered.com/dashboard/'
      },
      teachingchannel: {
        loginUrl: 'https://teachingchannel.wpenginepowered.com/login/',
        usernameSelector: '#user_login',
        passwordSelector: '#user_pass',
        loginButtonSelector: '#wp-submit',
        dashboardUrl: 'https://teachingchannel.wpenginepowered.com/dashboard/'
      }
    }

    const projectConfig = projectConfigs[projectId] || projectConfigs.passageprep

    // Build basic auth string if provided
    let basicAuthString = ''
    if (basicAuth) {
      basicAuthString = `
      // Set basic authentication
      await page.setExtraHTTPHeaders({
        'Authorization': 'Basic ' + Buffer.from('${basicAuth.username}:${basicAuth.password}').toString('base64')
      });`
    }

    // Build login flow if provided
    let loginFlowString = ''
    if (loginFlow) {
      loginFlowString = `
    // Step: Login to application
    console.log('Logging into application...');
    await page.goto('${projectConfig.loginUrl}', { waitUntil: 'networkidle' });
    await page.fill('${projectConfig.usernameSelector}', '${loginFlow.username}');
    await page.fill('${projectConfig.passwordSelector}', '${loginFlow.password}');
    await page.click('${projectConfig.loginButtonSelector}');
    await page.waitForLoadState('networkidle');
    console.log('Login completed');`
    }

    return `Generate a complete Playwright test script for the following requirements:

Project: ${projectId}
Test Type: ${testType}
Target URL: ${targetUrl}
Agent ID: ${agentId}
Custom Test Description: ${customTestDescription}

Authentication:
${basicAuth ? `Basic Auth: username="${basicAuth.username}", password="${basicAuth.password}"` : 'No Basic Auth'}
${loginFlow ? `Login Flow: username="${loginFlow.username}", password="${loginFlow.password}"` : 'No Login Flow'}

Project Config:
Login URL: ${projectConfig.loginUrl}
Username Selector: ${projectConfig.usernameSelector}
Password Selector: ${projectConfig.passwordSelector}
Login Button Selector: ${projectConfig.loginButtonSelector}

Generate a complete Playwright test that:
1. Uses ES module imports: import { test, expect } from '@playwright/test';
2. Sets up basic auth if provided (use the exact username and password values provided above)
3. Performs login if provided (use the exact username and password values provided above)
4. Implements the custom test requirements: ${customTestDescription}
5. Takes screenshots and logs results
6. Uses proper error handling

CRITICAL: Use ES module syntax (import/export) only. Do NOT use require() or CommonJS syntax.
CRITICAL: Use the exact password values provided in the authentication section above, do not use empty strings.

IMPORTANT: Use the EXACT values provided above. Do NOT use placeholder text like 'your-secure-password' or empty strings.

Template structure:
\`\`\`javascript
import { test, expect } from '@playwright/test';

test.describe('Test Suite', () => {
  test('test name', async ({ page }) => {
    ${basicAuth ? `// Basic auth setup
    await page.setExtraHTTPHeaders({
      'Authorization': 'Basic ' + Buffer.from('${basicAuth.username}:${basicAuth.password}').toString('base64')
    });` : ''}
    
    ${loginFlow ? `// Login flow
    await page.goto('${projectConfig.loginUrl}', { waitUntil: 'networkidle' });
    await page.fill('${projectConfig.usernameSelector}', '${loginFlow.username}');
    await page.fill('${projectConfig.passwordSelector}', '${loginFlow.password}');
    await page.click('${projectConfig.loginButtonSelector}');
    await page.waitForLoadState('networkidle');` : ''}
    
    // Your custom test logic here
    await page.goto('${targetUrl}', { waitUntil: 'networkidle' });
    
    // Add your test assertions and logic
  });
});
\`\`\`

Return ONLY the complete JavaScript test code, no explanations or markdown formatting.`
  }

  generateSimpleTest(config) {
    const {
      projectId,
      testType,
      targetUrl,
      customTestDescription,
      basicAuth,
      loginFlow,
      agentId
    } = config

    console.log(`🔧 Generating simple test for ${projectId}...`)

    // Project-specific configurations
    const projectConfigs = {
      passageprep: {
        loginUrl: 'https://passageprepstg.wpenginepowered.com/my-account/',
        usernameSelector: '#username',
        passwordSelector: '#password',
        loginButtonSelector: 'button[name="login"][type="submit"], .woocommerce-form-login__submit, #wp-submit',
        dashboardUrl: 'https://passageprepstg.wpenginepowered.com/dashboard/'
      },
      lavinia: {
        loginUrl: 'https://lavinia.wpenginepowered.com/login/',
        usernameSelector: '#user_login',
        passwordSelector: '#user_pass',
        loginButtonSelector: '#wp-submit',
        dashboardUrl: 'https://lavinia.wpenginepowered.com/dashboard/'
      },
      teachingchannel: {
        loginUrl: 'https://teachingchannel.wpenginepowered.com/login/',
        usernameSelector: '#user_login',
        passwordSelector: '#user_pass',
        loginButtonSelector: '#wp-submit',
        dashboardUrl: 'https://teachingchannel.wpenginepowered.com/dashboard/'
      }
    }

    const projectConfig = projectConfigs[projectId] || projectConfigs.passageprep

    // Build basic auth string if provided
    let basicAuthString = ''
    if (basicAuth) {
      basicAuthString = `
      // Set basic authentication
      await page.setExtraHTTPHeaders({
        'Authorization': 'Basic ' + Buffer.from('${basicAuth.username}:${basicAuth.password}').toString('base64')
      });`
    }

    // Build login flow if provided
    let loginFlowString = ''
    if (loginFlow) {
      loginFlowString = `
      // Navigate to login page first
      console.log('Navigating to login page...');
      await page.goto('${projectConfig.loginUrl}', { waitUntil: 'networkidle' });
      console.log('Login page loaded');
      
      // Dynamic form detection and execution
      console.log('Starting dynamic form detection...');
      
      // Look for both login and registration forms
      const formSelectors = [
        // Login form patterns
        'form[action*="login"]',
        'form[action*="signin"]',
        'form:has(input[name*="username"])',
        'form:has(input[name*="user"])',
        'form:has(input[name*="email"])',
        
        // Registration form patterns  
        'form[action*="register"]',
        'form[action*="signup"]',
        'form:has(input[name*="register"])',
        'form:has(input[name*="signup"])',
        
        // Generic form patterns
        'form:has(input[type="password"])',
        'form:has(input[name*="password"])'
      ];
      
      // Look for submit buttons - ordered by specificity
      const submitSelectors = [
        // Most specific patterns first
        'button[name="login"][type="submit"]',
        'button[name="register"][type="submit"]',
        'button.woocommerce-form-login__submit',
        'button.woocommerce-form-register__submit',
        'button[name="login"]',
        'button[name="register"]',
        '.woocommerce-form-login__submit',
        '.woocommerce-form-register__submit',
        
        // WordPress patterns
        '#wp-submit',
        'input[name="login"]',
        'input[name="register"]',
        
        // Generic submit patterns
        'button[type="submit"]:has-text("Log in")',
        'button[type="submit"]:has-text("Login")',
        'button[type="submit"]:has-text("Register")',
        'button[type="submit"]:has-text("Sign up")',
        'input[type="submit"][value*="Log in"]',
        'input[type="submit"][value*="Login"]',
        'input[type="submit"][value*="Register"]',
        'input[type="submit"][value*="Sign up"]',
        
        // Text-based patterns
        'button:has-text("Log in")',
        'button:has-text("Login")',
        'button:has-text("Register")',
        'button:has-text("Sign up")',
        
        // Generic patterns
        'form button[type="submit"]',
        'form input[type="submit"]',
        'input[value*="Sign"]',
        'button:has-text("Sign")'
      ];
      
      let submitButton = null;
      let targetForm = null;
      
      console.log('Looking for forms...');
      for (const formSelector of formSelectors) {
        try {
          const form = await page.locator(formSelector).first();
          const isVisible = await form.isVisible();
          const count = await page.locator(formSelector).count();
          console.log('Form selector "' + formSelector + '": count=' + count + ', visible=' + isVisible);
          
          if (isVisible) {
            targetForm = form;
            console.log('✅ Found form with selector:', formSelector);
            break;
          }
        } catch (e) {
          console.log('❌ Form selector "' + formSelector + '" failed:', e.message);
        }
      }
      
      // If we found a form, look for submit button within it
      if (targetForm) {
        console.log('Searching for submit button within form...');
        for (const selector of submitSelectors) {
          try {
            const button = targetForm.locator(selector).first();
            const isVisible = await button.isVisible();
            const count = await targetForm.locator(selector).count();
            console.log('Form button selector "' + selector + '": count=' + count + ', visible=' + isVisible);
            
            if (isVisible) {
              submitButton = button;
              console.log('✅ Found submit button within form with selector:', selector);
              break;
            }
          } catch (e) {
            console.log('❌ Form button selector "' + selector + '" failed:', e.message);
          }
        }
      }
      
      // If no form found, try direct selectors
      if (!submitButton) {
        console.log('No form found, trying direct selectors...');
        for (const selector of submitSelectors) {
          try {
            console.log('Trying selector:', selector);
            const button = await page.locator(selector).first();
            const isVisible = await button.isVisible();
            const count = await page.locator(selector).count();
            console.log('Selector "' + selector + '": count=' + count + ', visible=' + isVisible);
            
            if (isVisible) {
              submitButton = button;
              console.log('✅ Found submit button with direct selector:', selector);
              break;
            }
          } catch (e) {
            console.log('❌ Selector "' + selector + '" failed:', e.message);
          }
        }
      }
      
      if (submitButton) {
        console.log('Performing form submission...');
        
        // Find all input fields in the form
        const inputSelectors = [
          'input[name="username"]',
          'input[name="user"]',
          'input[name="email"]',
          'input[name="login"]',
          'input[name="register_email"]',
          'input[name="reg_email"]',
          'input[type="email"]',
          'input[type="text"]',
          'input[name="password"]',
          'input[name="pass"]',
          'input[name="register_password"]',
          'input[name="reg_password"]',
          'input[name="password_confirm"]',
          'input[name="confirm_password"]',
          'input[type="password"]'
        ];
        
        console.log('Finding and filling form fields...');
        let fieldsFilled = 0;
        
        for (const selector of inputSelectors) {
          try {
            const field = await page.locator(selector).first();
            if (await field.isVisible()) {
              const fieldName = await field.getAttribute('name') || selector;
              const fieldType = await field.getAttribute('type') || 'text';
              
              console.log('Found field:', fieldName, 'type:', fieldType);
              
              // Fill based on field type and name
              if (fieldType === 'email' || fieldName.includes('email') || fieldName.includes('username') || fieldName.includes('user') || fieldName.includes('login')) {
                await field.fill('${loginFlow.username}');
                console.log('Filled email/username field with:', '${loginFlow.username}');
                fieldsFilled++;
              } else if (fieldType === 'password' || fieldName.includes('password')) {
                await field.fill('${loginFlow.password}');
                console.log('Filled password field');
                fieldsFilled++;
              }
            }
          } catch (e) {
            // Continue to next selector
          }
        }
        
        if (fieldsFilled > 0) {
          console.log('Form fields filled, clicking submit button...');
          await submitButton.click();
          
          console.log('Waiting for navigation...');
          await page.waitForLoadState('networkidle');
          
          console.log('Form submission successful!');
        } else {
          throw new Error('Could not find any form fields to fill');
        }
      } else {
        throw new Error('Could not find submit button on page');
      }`
    }

    const simpleTest = `import { test, expect } from '@playwright/test';

test('Custom Test - ${agentId}', async ({ page }) => {
  const results = [];
  const agentId = '${agentId}';

  try {
    console.log('Starting custom test for agent ' + agentId);
    console.log('Target URL: ${targetUrl}');
    console.log('Test Description: ${customTestDescription}');

    // Configure browser for better visibility
    await page.setViewportSize({ width: 1280, height: 720 });
    
    ${basicAuthString}
    
    ${loginFlowString}
    
    ${!loginFlow ? `
    // No login flow provided - check if this is a registration flow
    const isRegistrationFlow = '${customTestDescription}'.toLowerCase().includes('register') || 
                               '${customTestDescription}'.toLowerCase().includes('sign up') ||
                               '${customTestDescription}'.toLowerCase().includes('new user');
    
    if (isRegistrationFlow) {
      console.log('Detected registration flow from description');
      
      // Navigate to registration page (usually same as login page for WooCommerce)
      console.log('Navigating to registration page...');
      await page.goto('${projectConfig.loginUrl}', { waitUntil: 'networkidle' });
      console.log('Registration page loaded');
      
      // Dynamic form detection for registration
      console.log('Starting dynamic registration form detection...');
      
      // Look for registration forms
      const registrationFormSelectors = [
        'form[action*="register"]',
        'form[action*="signup"]',
        'form:has(input[name*="register"])',
        'form:has(input[name*="signup"])',
        'form:has(input[name*="email"])',
        'form:has(input[type="password"])'
      ];
      
      const registrationSubmitSelectors = [
        'button[name="register"][type="submit"]',
        'button.woocommerce-form-register__submit',
        'button[name="register"]',
        '.woocommerce-form-register__submit',
        'input[name="register"]',
        'button[type="submit"]:has-text("Register")',
        'button[type="submit"]:has-text("Sign up")',
        'input[type="submit"][value*="Register"]',
        'input[type="submit"][value*="Sign up"]',
        'button:has-text("Register")',
        'button:has-text("Sign up")',
        'form button[type="submit"]',
        'form input[type="submit"]'
      ];
      
      let registrationForm = null;
      let submitButton = null;
      
      // Find registration form
      console.log('Looking for registration forms...');
      for (const formSelector of registrationFormSelectors) {
        try {
          const form = await page.locator(formSelector).first();
          const isVisible = await form.isVisible();
          const count = await page.locator(formSelector).count();
          console.log('Registration form selector "' + formSelector + '": count=' + count + ', visible=' + isVisible);
          
          if (isVisible) {
            registrationForm = form;
            console.log('✅ Found registration form with selector:', formSelector);
            break;
          }
        } catch (e) {
          console.log('❌ Registration form selector "' + formSelector + '" failed:', e.message);
        }
      }
      
      // Find submit button
      if (registrationForm) {
        console.log('Searching for registration submit button within form...');
        for (const selector of registrationSubmitSelectors) {
          try {
            const button = registrationForm.locator(selector).first();
            const isVisible = await button.isVisible();
            const count = await registrationForm.locator(selector).count();
            console.log('Registration button selector "' + selector + '": count=' + count + ', visible=' + isVisible);
            
            if (isVisible) {
              submitButton = button;
              console.log('✅ Found registration submit button with selector:', selector);
              break;
            }
          } catch (e) {
            console.log('❌ Registration button selector "' + selector + '" failed:', e.message);
          }
        }
      }
      
      // If no form found, try direct selectors
      if (!submitButton) {
        console.log('No registration form found, trying direct selectors...');
        for (const selector of registrationSubmitSelectors) {
          try {
            const button = await page.locator(selector).first();
            const isVisible = await button.isVisible();
            const count = await page.locator(selector).count();
            console.log('Direct registration selector "' + selector + '": count=' + count + ', visible=' + isVisible);
            
            if (isVisible) {
              submitButton = button;
              console.log('✅ Found registration submit button with direct selector:', selector);
              break;
            }
          } catch (e) {
            console.log('❌ Direct registration selector "' + selector + '" failed:', e.message);
          }
        }
      }
      
      if (submitButton) {
        console.log('Performing registration form submission...');
        
        // Generate test user data
        const testEmail = 'testuser' + Date.now() + '@example.com';
        const testPassword = 'TestPassword123!';
        const testUsername = 'testuser' + Date.now();
        const testOrganization = 'Test Organization';
        const testManager = 'Test Manager';
        
        // Direct field filling using exact selectors from the HTML
        console.log('Starting direct field filling with exact selectors...');
        
        // Wait for page to be fully loaded
        await page.waitForTimeout(3000);
        console.log('Page loaded, starting field filling...');
        
        let fieldsFilled = 0;
        
        // Fill Username field (billing_name)
        try {
          console.log('Filling username field...');
          await page.fill('input[name="billing_name"]', testUsername);
          console.log('✅ Filled username field with:', testUsername);
          fieldsFilled++;
          await page.waitForTimeout(2000);
        } catch (e) {
          console.log('❌ Failed to fill username field:', e.message);
        }
        
        // Fill Organization Name field (billing_organization_name)
        try {
          console.log('Filling organization field...');
          await page.fill('input[name="billing_organization_name"]', testOrganization);
          console.log('✅ Filled organization field with:', testOrganization);
          fieldsFilled++;
          await page.waitForTimeout(2000);
        } catch (e) {
          console.log('❌ Failed to fill organization field:', e.message);
        }
        
        // Fill Program Manager Name field (billing_program_manager_name)
        try {
          console.log('Filling program manager field...');
          await page.fill('input[name="billing_program_manager_name"]', testManager);
          console.log('✅ Filled program manager field with:', testManager);
          fieldsFilled++;
          await page.waitForTimeout(2000);
        } catch (e) {
          console.log('❌ Failed to fill program manager field:', e.message);
        }
        
        // Fill Email field (email)
        try {
          console.log('Filling email field...');
          await page.fill('input[name="email"]', testEmail);
          console.log('✅ Filled email field with:', testEmail);
          fieldsFilled++;
          await page.waitForTimeout(2000);
        } catch (e) {
          console.log('❌ Failed to fill email field:', e.message);
        }
        
        // Fill Password field (password)
        try {
          console.log('Filling password field...');
          await page.fill('input[name="password"]', testPassword);
          console.log('✅ Filled password field with:', testPassword);
          fieldsFilled++;
          await page.waitForTimeout(2000);
        } catch (e) {
          console.log('❌ Failed to fill password field:', e.message);
        }
        
        console.log('Registration field filling summary:');
        console.log('- Total fields filled:', fieldsFilled);
        
        if (fieldsFilled > 0) {
          console.log('Registration fields filled, clicking submit button...');
          await submitButton.click();
          
          console.log('Waiting for registration to complete...');
          await page.waitForLoadState('networkidle');
          
          console.log('Registration successful!');
          
          // Check if test description mentions additional steps like hovering and clicking
          const testDescription = '${customTestDescription}'.toLowerCase();
          if (testDescription.includes('hover') && testDescription.includes('click')) {
            console.log('Detected additional interaction steps in test description');
            
            // Wait a bit for the page to fully load
            await page.waitForTimeout(2000);
            
            // Look for states/stage elements to hover over
            const hoverSelectors = [
              'a:has-text("States")',
              'a:has-text("states")',
              '[data-testid="states"]',
              '[data-testid="stage"]',
              'li:has-text("States")',
              'li:has-text("states")',
              '.menu-item:has-text("States")',
              '.menu-item:has-text("states")'
            ];
            
            let hoverElement = null;
            for (const selector of hoverSelectors) {
              try {
                const element = await page.locator(selector).first();
                if (await element.isVisible()) {
                  hoverElement = element;
                  console.log('✅ Found hover element with selector:', selector);
                  break;
                }
              } catch (e) {
                console.log('Hover selector failed:', selector, e.message);
              }
            }
            
            if (hoverElement) {
              console.log('Hovering over states element...');
              await hoverElement.hover();
              await page.waitForTimeout(1000);
              
              // Look for TX element to click
              const txSelectors = [
                'a:has-text("TX")',
                'a:has-text("tx")',
                '[data-testid="tx"]',
                'li:has-text("TX")',
                'li:has-text("tx")',
                '.sub-menu a:has-text("TX")',
                '.sub-menu a:has-text("tx")'
              ];
              
              let txElement = null;
              for (const selector of txSelectors) {
                try {
                  const element = await page.locator(selector).first();
                  if (await element.isVisible()) {
                    txElement = element;
                    console.log('✅ Found TX element with selector:', selector);
                    break;
                  }
                } catch (e) {
                  console.log('TX selector failed:', selector, e.message);
                }
              }
              
              if (txElement) {
                console.log('Clicking on TX element...');
                await txElement.click();
                await page.waitForLoadState('networkidle');
                console.log('✅ Successfully clicked on TX');
              } else {
                console.log('⚠️ Could not find TX element to click');
              }
            } else {
              console.log('⚠️ Could not find states element to hover over');
            }
          }
        } else {
          throw new Error('Could not find any registration fields to fill');
        }
      } else {
        throw new Error('Could not find registration submit button on page');
      }
    } else {
      console.log('No form interaction needed - direct navigation to target URL');
    }
    ` : ''}

    ${loginFlow || (customTestDescription && (customTestDescription.toLowerCase().includes('register') || customTestDescription.toLowerCase().includes('sign up') || customTestDescription.toLowerCase().includes('new user'))) ? `
    // After form interaction (login/registration), navigate to target URL if different
    if ('${targetUrl}' !== '${projectConfig.loginUrl}') {
      console.log('Navigating to target URL after form interaction...');
      await page.goto('${targetUrl}', { waitUntil: 'networkidle' });
      results.push({ step: 'Navigate to target URL after form interaction', status: 'PASS', url: '${targetUrl}' });
    } else {
      console.log('Already on target URL after form interaction');
      results.push({ step: 'Navigate to target URL', status: 'PASS', url: '${targetUrl}' });
    }
    ` : `
    // Navigate to target URL
    console.log('Navigating to target URL...');
    await page.goto('${targetUrl}', { waitUntil: 'networkidle' });
    results.push({ step: 'Navigate to target URL', status: 'PASS', url: '${targetUrl}' });
    `}

    // Check if page contains expected content based on description
    console.log('Checking page content...');
    const pageContent = await page.textContent('body');
    
    // Look for "My account" text as mentioned in the description
    if (pageContent && pageContent.toLowerCase().includes('my account')) {
      console.log('Found "My account" text on page');
      results.push({ step: 'Check for My account text', status: 'PASS', found: true });
    } else {
      console.log('Did not find "My account" text on page');
      results.push({ step: 'Check for My account text', status: 'FAIL', found: false });
    }

    // Take screenshot
    const screenshot = await page.screenshot({ fullPage: true });
    console.log('Screenshot taken');

    console.log('Test completed successfully');
    results.push({ step: 'Test completion', status: 'PASS' });
    
  } catch (error) {
    console.error('Test failed:', error);
    results.push({ step: 'Test Execution', status: 'FAIL', error: error.message });
    
    // Take error screenshot
    try {
      await page.screenshot({ fullPage: true });
    } catch (screenshotError) {
      console.error('Could not take error screenshot:', screenshotError);
    }
  }
  
  console.log('Test Results:', JSON.stringify(results, null, 2));
});`

    // Save the simple test to a file
    const testFileName = `custom-test-${agentId}.spec.js`
    const testFilePath = path.join(this.tempTestsDir, testFileName)
    
    fs.writeFileSync(testFilePath, simpleTest, 'utf8')
    console.log(`📁 Simple test file saved: ${testFilePath}`)

    return {
      testFilePath,
      testFileName,
      generatedTest: simpleTest
    }
  }
}
