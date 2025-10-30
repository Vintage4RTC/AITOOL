import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

class BDDService {
  constructor() {
    this.stepDefinitions = this.initializeStepDefinitions();
  }

  /**
   * Initialize common step definitions (reusable patterns)
   */
  initializeStepDefinitions() {
    return {
      navigation: [
        { pattern: /^I (?:navigate to|go to|visit|open) "([^"]+)"$/, code: 'await page.goto("$1");' },
        { pattern: /^I am on the (.+) page$/, code: 'await page.goto("$1");' },
        { pattern: /^I reload the page$/, code: 'await page.reload();' },
        { pattern: /^I go back$/, code: 'await page.goBack();' }
      ],
      authentication: [
        { pattern: /^I authenticate with basic auth using "([^"]+)" and "([^"]+)"$/, code: 'await page.context().setHTTPCredentials({ username: "$1", password: "$2" });' },
        { pattern: /^I set basic auth credentials "([^"]+)" and "([^"]+)"$/, code: 'await page.context().setHTTPCredentials({ username: "$1", password: "$2" });' },
        { pattern: /^I login with basic auth as "([^"]+)"$/, code: 'await page.context().setHTTPCredentials({ username: "$1", password: process.env.BASIC_AUTH_PASSWORD || "password" });' },
        { pattern: /^I navigate to "([^"]+)" with basic auth "([^"]+)" and "([^"]+)"$/, code: 'await page.context().setHTTPCredentials({ username: "$2", password: "$3" });\n  await page.goto("$1");' },
        { pattern: /^I clear basic auth credentials$/, code: 'await page.context().setHTTPCredentials(null);' }
      ],
      interaction: [
        { pattern: /^I click (?:on |the )?"([^"]+)"$/, code: 'await page.click(\'text="$1"\');' },
        { pattern: /^I click button "([^"]+)"$/, code: 'await page.click(\'button:has-text("$1")\');' },
        { pattern: /^I fill "([^"]+)" with "([^"]+)"$/, code: 'await page.fill(\'[name="$1"]\', "$2");' },
        { pattern: /^I enter "([^"]+)" in "([^"]+)"$/, code: 'await page.fill(\'[name="$2"]\', "$1");' },
        { pattern: /^I type "([^"]+)" into "([^"]+)"$/, code: 'await page.type(\'[name="$2"]\', "$1");' },
        { pattern: /^I select "([^"]+)" from "([^"]+)"$/, code: 'await page.selectOption(\'[name="$2"]\', "$1");' },
        { pattern: /^I check "([^"]+)"$/, code: 'await page.check(\'[name="$1"]\');' },
        { pattern: /^I uncheck "([^"]+)"$/, code: 'await page.uncheck(\'[name="$1"]\');' },
        { pattern: /^I press Enter$/, code: 'await page.keyboard.press("Enter");' },
        { pattern: /^I press "([^"]+)"$/, code: 'await page.keyboard.press("$1");' }
      ],
      assertion: [
        { pattern: /^I should see "([^"]+)"$/, code: 'await expect(page.getByText("$1")).toBeVisible();' },
        { pattern: /^I should see (?:the )?text "([^"]+)"$/, code: 'await expect(page.getByText("$1")).toBeVisible();' },
        { pattern: /^I should not see "([^"]+)"$/, code: 'await expect(page.getByText("$1")).not.toBeVisible();' },
        { pattern: /^I should be on "([^"]+)"$/, code: 'await expect(page).toHaveURL("$1");' },
        { pattern: /^the page (?:title |)should (?:be|contain) "([^"]+)"$/, code: 'await expect(page).toHaveTitle(/$1/);' },
        { pattern: /^"([^"]+)" should be visible$/, code: 'await expect(page.getByText("$1")).toBeVisible();' },
        { pattern: /^"([^"]+)" should be enabled$/, code: 'await expect(page.locator(\'text="$1"\')).toBeEnabled();' },
        { pattern: /^"([^"]+)" should be disabled$/, code: 'await expect(page.locator(\'text="$1"\')).toBeDisabled();' }
      ],
      wait: [
        { pattern: /^I wait for "([^"]+)" seconds?$/, code: 'await page.waitForTimeout($1 * 1000);' },
        { pattern: /^I wait for "([^"]+)" to (?:be visible|appear)$/, code: 'await page.waitForSelector(\'text="$1"\', { state: "visible" });' },
        { pattern: /^I wait for navigation$/, code: 'await page.waitForLoadState("networkidle");' }
      ],
      environment: [
        { pattern: /^I am testing in "([^"]+)"$/, code: '// Testing in $1 environment' },
        { pattern: /^I switch to "([^"]+)" environment$/, code: '// Switching to $1 environment' },
        { pattern: /^Given the environment is "([^"]+)"$/, code: '// Environment: $1' }
      ]
    };
  }

  /**
   * Parse BDD text into structured scenarios
   */
  parseBDD(bddText) {
    const lines = bddText.trim().split('\n');
    const scenarios = [];
    let currentScenario = null;

    for (let line of lines) {
      line = line.trim();
      
      // Skip empty lines and comments
      if (!line || line.startsWith('#') || line.startsWith('//')) continue;

      // Parse Feature
      if (line.match(/^Feature:/i)) {
        continue; // Skip for now
      }

      // Parse Scenario
      if (line.match(/^Scenario:/i)) {
        if (currentScenario) scenarios.push(currentScenario);
        currentScenario = {
          name: line.replace(/^Scenario:\s*/i, '').trim(),
          steps: []
        };
        continue;
      }

      // Parse steps (Given, When, Then, And, But)
      const stepMatch = line.match(/^(Given|When|Then|And|But)\s+(.+)$/i);
      if (stepMatch && currentScenario) {
        currentScenario.steps.push({
          keyword: stepMatch[1],
          text: stepMatch[2].trim(),
          originalLine: line
        });
      }
    }

    if (currentScenario) scenarios.push(currentScenario);
    return scenarios;
  }

  /**
   * Convert a single step to Playwright code
   */
  convertStepToCode(step) {
    const stepText = step.text;

    // Try to match against predefined patterns
    for (const [category, patterns] of Object.entries(this.stepDefinitions)) {
      for (const def of patterns) {
        const match = stepText.match(def.pattern);
        if (match) {
          let code = def.code;
          // Replace captured groups
          for (let i = 1; i < match.length; i++) {
            code = code.replace(`$${i}`, match[i]);
          }
          return {
            code,
            comment: `// ${step.keyword} ${stepText}`,
            matched: true,
            category
          };
        }
      }
    }

    // If no pattern matched, return a placeholder
    return {
      code: `// TODO: Implement step - ${stepText}`,
      comment: `// ${step.keyword} ${stepText}`,
      matched: false,
      category: 'custom'
    };
  }

  /**
   * Use AI to generate Playwright code for unmatched steps
   */
  async generateCodeWithAI(step, context = '') {
    try {
      const prompt = `You are a Playwright test automation expert. Convert this BDD step into Playwright code.

Step: ${step.keyword} ${step.text}
${context ? `Context: ${context}` : ''}

Return ONLY the Playwright code (one or two lines), no explanations. Use modern Playwright syntax with 'page' object.
Examples:
- For "I click Login": await page.click('button:has-text("Login")');
- For "I see Welcome": await expect(page.getByText('Welcome')).toBeVisible();

Code:`;

      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a Playwright code generator. Return only executable Playwright code, no markdown, no explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.3
      });

      let code = response.choices[0].message.content.trim();
      
      // Clean up markdown if present
      code = code.replace(/^```(?:javascript|js)?\s*/i, '').replace(/\s*```$/i, '');
      code = code.trim();

      return {
        code,
        comment: `// ${step.keyword} ${step.text}`,
        matched: true,
        category: 'ai-generated'
      };
    } catch (error) {
      console.error('AI generation error:', error);
      return {
        code: `// TODO: AI generation failed - ${step.text}`,
        comment: `// ${step.keyword} ${step.text}`,
        matched: false,
        category: 'error'
      };
    }
  }

  /**
   * Convert BDD scenario to complete Playwright test
   */
  async convertScenarioToPlaywright(scenario, useAI = true) {
    const convertedSteps = [];

    for (const step of scenario.steps) {
      const basicConversion = this.convertStepToCode(step);
      
      if (basicConversion.matched) {
        convertedSteps.push(basicConversion);
      } else if (useAI) {
        // Use AI for unmatched steps
        const aiConversion = await this.generateCodeWithAI(step);
        convertedSteps.push(aiConversion);
      } else {
        convertedSteps.push(basicConversion);
      }
    }

    // Generate complete test
    const testCode = this.generateTestCode(scenario.name, convertedSteps);
    
    return {
      scenario: scenario.name,
      steps: convertedSteps,
      testCode,
      summary: {
        total: scenario.steps.length,
        matched: convertedSteps.filter(s => s.matched).length,
        aiGenerated: convertedSteps.filter(s => s.category === 'ai-generated').length,
        todo: convertedSteps.filter(s => !s.matched).length
      }
    };
  }

  /**
   * Generate complete Playwright test code
   */
  generateTestCode(scenarioName, steps) {
    const imports = `import { test, expect } from '@playwright/test';\n`;
    
    const testBody = steps.map(step => {
      return `  ${step.comment}\n  ${step.code}`;
    }).join('\n\n');

    return `${imports}
test('${scenarioName}', async ({ page }) => {
${testBody}
});
`;
  }

  /**
   * Convert full BDD feature to Playwright tests
   */
  async convertBDDToPlaywright(bddText, options = {}) {
    const { useAI = true, testName = 'BDD Generated Test' } = options;
    
    try {
      // Parse BDD
      const scenarios = this.parseBDD(bddText);
      
      if (scenarios.length === 0) {
        throw new Error('No valid scenarios found in BDD text');
      }

      // Convert each scenario
      const convertedScenarios = [];
      for (const scenario of scenarios) {
        const converted = await this.convertScenarioToPlaywright(scenario, useAI);
        convertedScenarios.push(converted);
      }

      // Combine all test code
      const allTestCode = convertedScenarios.map(s => s.testCode).join('\n');

      return {
        success: true,
        scenarios: convertedScenarios,
        fullCode: allTestCode,
        bddText,
        metadata: {
          totalScenarios: scenarios.length,
          totalSteps: scenarios.reduce((sum, s) => sum + s.steps.length, 0),
          generatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('BDD conversion error:', error);
      return {
        success: false,
        error: error.message,
        bddText
      };
    }
  }
}

export default BDDService;

