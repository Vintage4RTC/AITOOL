# ✍️ BDD Test Creator - User Guide

## 🎯 What is This?

The **BDD Creator** lets you write tests in **plain English** using Given/When/Then format. The system automatically converts your English steps into executable Playwright code!

---

## 🚀 How to Use

### Step 1: Write Your Test in Plain English

```gherkin
Scenario: User Login
  Given I navigate to "https://example.com/login"
  When I fill "username" with "testuser@example.com"
  And I fill "password" with "password123"
  And I click button "Login"
  Then I should see "Welcome"
  And I should be on "https://example.com/dashboard"
```

### Step 2: Click "Generate Playwright Code"

The system will:
- ✅ Parse your BDD steps
- ✅ Match against common patterns
- ✅ Use AI (GPT-4o) for complex steps
- ✅ Generate executable Playwright code

### Step 3: View/Edit Generated Code

```javascript
import { test, expect } from '@playwright/test';

test('User Login', async ({ page }) => {
  // Given I navigate to "https://example.com/login"
  await page.goto("https://example.com/login");

  // When I fill "username" with "testuser@example.com"
  await page.fill('[name="username"]', "testuser@example.com");

  // And I fill "password" with "password123"
  await page.fill('[name="password"]', "password123");

  // And I click button "Login"
  await page.click('button:has-text("Login")');

  // Then I should see "Welcome"
  await expect(page.getByText("Welcome")).toBeVisible();

  // And I should be on "https://example.com/dashboard"
  await expect(page).toHaveURL("https://example.com/dashboard");
});
```

### Step 4: Save & Run

- Enter test name (e.g., "LoginTest")
- Select product (Lavinia, Passage Prep, Teaching Channel)
- Click "Save Test"
- Go to "Automation Scripts" section to run it!

---

## 📝 BDD Syntax Guide

### Keywords

| Keyword | Purpose | Example |
|---------|---------|---------|
| **Given** | Initial state/context | `Given I navigate to "URL"` |
| **When** | Action performed | `When I click "Button"` |
| **Then** | Expected outcome | `Then I should see "Text"` |
| **And** | Additional step | `And I fill "field" with "value"` |
| **But** | Negative condition | `But I should not see "Error"` |

---

## 🎯 Supported Step Patterns

### 🧭 Navigation

```gherkin
Given I navigate to "https://example.com"
Given I go to "https://example.com/login"
Given I visit "https://example.com/about"
Given I am on the login page
When I reload the page
When I go back
```

### 👆 Interactions

```gherkin
When I click "Login"
When I click button "Submit"
When I fill "username" with "testuser"
When I enter "text" in "search"
When I type "hello" into "message"
When I select "Option 1" from "dropdown"
When I check "Remember me"
When I uncheck "Subscribe"
When I press Enter
When I press "Tab"
```

### ✅ Assertions

```gherkin
Then I should see "Welcome"
Then I should see text "Success"
Then I should not see "Error"
Then I should be on "https://example.com/dashboard"
Then the page title should be "Dashboard"
Then "Submit" should be visible
Then "Submit" should be enabled
Then "Cancel" should be disabled
```

### ⏱️ Waits

```gherkin
And I wait for "3" seconds
And I wait for "Loading" to appear
And I wait for "Spinner" to be visible
And I wait for navigation
```

---

## 🤖 AI-Powered Step Interpretation

If your step doesn't match a predefined pattern, **GPT-4o will interpret it**!

### Examples:

**You write:**
```gherkin
When I hover over the profile icon
```

**AI generates:**
```javascript
await page.hover('[data-testid="profile-icon"]');
```

**You write:**
```gherkin
Then the error message should contain "Invalid credentials"
```

**AI generates:**
```javascript
await expect(page.locator('.error-message')).toContainText('Invalid credentials');
```

---

## 💾 Dual Storage

When you save a BDD test, **two files are created**:

1. **`.feature` file** - Your original BDD text (human-readable)
2. **`.spec.js` file** - Generated Playwright code (executable)

### Example:
```
backend/test-classes/lavinia/
├── LoginTest.feature      ← BDD version
└── LoginTest.spec.js      ← Playwright version
```

### Benefits:
- ✅ Non-technical users can read/edit `.feature` files
- ✅ Developers can edit `.spec.js` files directly
- ✅ Both stay in sync
- ✅ Version control friendly

---

## 📚 Complete Examples

### Example 1: Simple Login

```gherkin
Scenario: Successful Login
  Given I navigate to "https://app.example.com/login"
  When I fill "email" with "test@example.com"
  And I fill "password" with "SecurePass123"
  And I click button "Sign In"
  Then I should see "Dashboard"
  And I should be on "https://app.example.com/dashboard"
```

### Example 2: Form Submission

```gherkin
Scenario: Contact Form Submission
  Given I navigate to "https://example.com/contact"
  When I fill "name" with "John Doe"
  And I fill "email" with "john@example.com"
  And I fill "subject" with "Question about pricing"
  And I fill "message" with "I would like to know more"
  And I click button "Send Message"
  Then I should see "Thank you for contacting us"
  And I should see "We'll respond within 24 hours"
```

### Example 3: Multi-Step Navigation

```gherkin
Scenario: Navigate Through Menu
  Given I navigate to "https://example.com"
  When I click "Products"
  Then I should see "Product Catalog"
  When I click "Pricing"
  Then I should see "Choose Your Plan"
  When I click "Contact"
  Then I should see "Get in Touch"
  And the page title should be "Contact Us"
```

### Example 4: Form Validation

```gherkin
Scenario: Login with Invalid Credentials
  Given I navigate to "https://app.example.com/login"
  When I fill "email" with "wrong@example.com"
  And I fill "password" with "wrongpass"
  And I click button "Login"
  Then I should see "Invalid credentials"
  And I should not see "Dashboard"
  And I should be on "https://app.example.com/login"
```

---

## 🎨 UI Features

### 📖 Load Examples
- Click "Load Example..." dropdown
- Choose from pre-built examples
- Modify to fit your needs

### 📝 BDD Syntax Guide
- Always visible in the UI
- Shows common patterns
- Quick reference

### 💻 Monaco Code Editor
- Syntax highlighting
- Auto-completion
- Edit generated code
- Professional IDE experience

### 💾 Save Options
- Choose product
- Name your test
- Saves both BDD and Playwright versions

---

## 🔄 Workflow

```
1. Write BDD in plain English
   ↓
2. Click "Generate Code"
   ↓
3. AI converts to Playwright
   ↓
4. View/Edit generated code
   ↓
5. Save test (creates .feature + .spec.js)
   ↓
6. Go to "Automation Scripts" section
   ↓
7. Find your test and run it!
```

---

## 💡 Pro Tips

### 1. Be Specific with Selectors
```gherkin
❌ When I click "Submit"
✅ When I click button "Submit"
```

### 2. Use Quotes for Values
```gherkin
✅ Given I navigate to "https://example.com"
✅ When I fill "username" with "testuser"
```

### 3. Use Descriptive Scenario Names
```gherkin
✅ Scenario: User Login with Valid Credentials
❌ Scenario: Test 1
```

### 4. Keep Steps Simple
```gherkin
✅ When I click "Login"
✅ And I wait for "2" seconds
❌ When I click login and wait for the page to load and verify success
```

### 5. One Action Per Step
```gherkin
✅ When I fill "username" with "test"
✅ And I fill "password" with "pass"
❌ When I fill username and password
```

---

## 🐛 Troubleshooting

### "No valid scenarios found"
- Make sure you start with `Scenario: Name`
- Use Given/When/Then keywords
- Check for typos

### "Failed to generate code"
- Check your OpenAI API key in `.env`
- Verify internet connection
- Try simpler steps first

### Generated code doesn't work
- Edit the code in Monaco editor
- Adjust selectors to match your app
- Save the edited version

---

## 🎓 Learning Path

### Beginner
1. Start with examples
2. Modify URLs and values
3. Use simple patterns

### Intermediate
1. Write custom scenarios
2. Combine multiple steps
3. Use waits and assertions

### Advanced
1. Let AI interpret complex steps
2. Edit generated code
3. Create reusable test patterns

---

## 📊 What Gets Generated

### BDD File (.feature)
```gherkin
Scenario: User Login
  Given I navigate to "https://example.com/login"
  When I fill "username" with "test"
  Then I should see "Dashboard"
```

### Playwright File (.spec.js)
```javascript
import { test, expect } from '@playwright/test';

test('User Login', async ({ page }) => {
  // Given I navigate to "https://example.com/login"
  await page.goto("https://example.com/login");
  
  // When I fill "username" with "test"
  await page.fill('[name="username"]', "test");
  
  // Then I should see "Dashboard"
  await expect(page.getByText("Dashboard")).toBeVisible();
});
```

---

## 🎉 Benefits

### For QA Engineers
- ✅ Write tests in plain English
- ✅ No coding required
- ✅ Fast test creation
- ✅ Easy to understand

### For Developers
- ✅ Can edit generated code
- ✅ Full Playwright power
- ✅ Version control friendly
- ✅ Maintainable tests

### For Teams
- ✅ Shared language (BDD)
- ✅ Better collaboration
- ✅ Clear test documentation
- ✅ Faster test coverage

---

## 🚀 Get Started!

1. Open the app: http://localhost:5173
2. Click on **"BDD Creator"** tab
3. Write your first test in plain English
4. Click **"Generate Playwright Code"**
5. Save and run!

**It's that simple!** ✨

