# 📚 QA Testing Agent - Complete Documentation

## 🚀 Quick Start

### Starting the Application

```bash
# Terminal 1 - Backend
cd backend
node --env-file=.env src/index.js

# Terminal 2 - Frontend
cd frontend
npm run dev

# Open browser: http://localhost:5173
```

### First Time Setup

1. **Install Dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

2. **Configure Environment**
```bash
# Copy template and update values
cd backend
cp src/config/env.config.template.js src/config/env.config.js
# Edit .env file with your credentials
```

3. **Run Tests**
```bash
cd backend/test-classes
npx playwright test
```

---

## 📁 Project Structure

```
qa-testing-agent-starter/
├── backend/                     # Node.js/Express backend
│   ├── src/
│   │   ├── routes/             # API endpoints
│   │   │   ├── automation.routes.js
│   │   │   ├── jira.routes.js
│   │   │   └── jenkins.routes.js
│   │   ├── services/           # Business logic
│   │   │   ├── healingService.js      # AI test healing
│   │   │   ├── jenkinsService.js      # Jenkins integration
│   │   │   ├── jiraService.js         # Jira integration
│   │   │   ├── notificationService.js # Slack/Email
│   │   │   ├── openaiTestGenerator.js # AI test generation
│   │   │   ├── testParserService.js   # Parse test files
│   │   │   └── testRunner.js          # Execute tests
│   │   ├── config/             # Configuration
│   │   │   ├── env.config.js
│   │   │   └── playwright.config.js
│   │   └── index.js            # Main server
│   └── test-classes/           # Playwright tests
│       ├── lavinia/
│       ├── passage-prep/
│       └── teaching-channel/
│
└── frontend/                    # React frontend
    ├── src/
    │   ├── ui/
    │   │   ├── pages/          # Main pages
    │   │   ├── sections/       # Feature sections
    │   │   └── modals/         # Modal components
    │   └── api.js              # API client
    └── index.html
```

---

## 🔧 Features

### 1. **BDD Test Creator** ✨ NEW!
- Write tests in plain English (Given/When/Then)
- AI-powered conversion to Playwright code
- Dual storage (.feature + .spec.js files)
- Monaco editor for code editing
- 50+ predefined step patterns
- GPT-4o interprets custom steps

**Example:**
```gherkin
Given I navigate to "https://example.com/login"
When I fill "username" with "test@example.com"
And I click button "Login"
Then I should see "Dashboard"
```

**See [BDD_FEATURE_GUIDE.md](./BDD_FEATURE_GUIDE.md) for complete guide**

### 2. **Jira Integration**
- Fetch Jira tickets by username
- Generate BDD test cases from tickets
- Generate Playwright scripts from test cases
- Download test cases as CSV for Zephyr

**API Endpoints:**
- `GET /api/jira/tickets/:username`
- `POST /api/jira/generate-test-cases`
- `POST /api/jira/generate-playwright`

### 2. **Test Automation**
- Create and manage Playwright tests
- Run tests in headed/headless mode
- Real-time log streaming
- Monaco editor for code editing
- Individual test case execution

**API Endpoints:**
- `GET /api/automation/test-cases`
- `POST /api/automation/run-test-case-streaming`
- `POST /api/automation/save-test-class`

### 3. **AI Test Healing**
- Automatically fixes broken locators
- Uses GPT-4o to analyze page HTML
- Suggests working CSS selectors
- Tracks healing attempts

**API Endpoints:**
- `POST /api/automation/run-test-case-healing`

### 4. **Jenkins CI/CD**
- View all Jenkins jobs
- Trigger builds
- Monitor build status
- View console output

**API Endpoints:**
- `GET /api/jenkins/jobs`
- `POST /api/jenkins/jobs/:jobName/build`
- `GET /api/jenkins/jobs/:jobName/builds/:buildNumber`

### 5. **Screenshot/File Upload**
- Upload screenshots → Generate test cases
- Upload spreadsheets → Generate Playwright scripts
- AI-powered analysis using GPT-4o Vision

**API Endpoints:**
- `POST /api/upload/process`

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file in `backend/` directory:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-...

# Jira Configuration
JIRA_HOST=your-domain.atlassian.net
JIRA_USERNAME=your-email@domain.com
JIRA_API_TOKEN=your-jira-token

# Jenkins Configuration (optional)
JENKINS_URL=http://jenkins-server:8080
JENKINS_USERNAME=your-username
JENKINS_API_TOKEN=your-token

# Notification Configuration (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Test Credentials (product-specific)
laviniaBasicAuthUsername=username
laviniaBasicAuthPassword=password
laviniaUsername=test-user
laviniaPassword=test-pass
```

### Playwright Configuration

Located in `backend/test-classes/playwright.config.js`:

```javascript
export default {
  testDir: './',
  timeout: 120000,
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } }
  ]
}
```

---

## 🔌 API Reference

### Base URL
- Backend: `http://localhost:8787`
- Frontend: `http://localhost:5173`

### Health Check
```bash
GET /api/health
Response: {"status":"ok","timestamp":"...","port":8787}
```

### Automation Routes

**Get All Test Cases**
```bash
GET /api/automation/test-cases
Response: { success: true, testCases: [...] }
```

**Get Product Test Cases**
```bash
GET /api/automation/test-cases/:product
Response: { success: true, testCases: [...] }
```

**Run Test with Streaming Logs**
```bash
POST /api/automation/run-test-case-streaming
Body: { product, testClass, testId, mode, browser }
Response: Server-Sent Events stream
```

**Run Test with AI Healing**
```bash
POST /api/automation/run-test-case-healing
Body: { product, testClass, testId, mode, browser }
Response: Server-Sent Events stream with healing attempts
```

### Jira Routes

**Get Tickets**
```bash
GET /api/jira/tickets/:username
Response: { success: true, tickets: [...] }
```

**Generate Test Cases**
```bash
POST /api/jira/generate-test-cases
Body: { ticketKey, ticketDescription }
Response: { success: true, testCases: "..." }
```

**Generate Playwright Script**
```bash
POST /api/jira/generate-playwright
Body: { testCases, ticketKey }
Response: { success: true, script: "..." }
```

### Jenkins Routes

**Get All Jobs**
```bash
GET /api/jenkins/jobs
Response: { success: true, jobs: [...] }
```

**Trigger Build**
```bash
POST /api/jenkins/jobs/:jobName/build
Body: { parameters: {...} }
Response: { success: true, result: {...} }
```

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
cd backend/test-classes
npx playwright test

# Run specific product tests
npx playwright test lavinia/

# Run specific test file
npx playwright test lavinia/SmokeTest.spec.js

# Run in headed mode
npx playwright test --headed

# Run with UI
npx playwright test --ui
```

### Test Organization

Tests are organized by product:
- `lavinia/` - Lavinia product tests
- `passage-prep/` - Passage Prep tests
- `teaching-channel/` - Teaching Channel tests

Each test file follows this structure:
```javascript
import { test, expect } from '@playwright/test';

test('TEST-ID: Test Description', async ({ page }) => {
  // Test steps
});
```

### AI Healing Demo

```bash
# Run test with AI healing enabled
npx playwright test lavinia/HealingDemo.spec.js
```

The healing service will:
1. Detect failed locators
2. Send page HTML to GPT-4o
3. Get new working locator
4. Retry the test

---

## 🛠️ Development

### Adding a New Feature

1. **Create Service** (if needed)
```bash
# Add to backend/src/services/
touch backend/src/services/myFeature.js
```

2. **Create Route** (if needed)
```bash
# Add to backend/src/routes/
touch backend/src/routes/myFeature.routes.js
```

3. **Register Route in index.js**
```javascript
import myFeatureRoutes from './routes/myFeature.routes.js';
app.use('/api/my-feature', myFeatureRoutes);
```

4. **Create Frontend Component**
```bash
# Add to frontend/src/ui/sections/
touch frontend/src/ui/sections/MyFeatureSection.jsx
```

5. **Update API Client**
```javascript
// Add to frontend/src/api.js
export const api = {
  // ... existing methods
  myFeature(){ return request('/api/my-feature') }
}
```

### Code Organization Principles

✅ **DO:**
- Put business logic in `services/`
- Define API routes in `routes/`
- Store config in `config/`
- Create UI sections in `ui/sections/`
- Create modals in `ui/modals/`

❌ **DON'T:**
- Mix business logic with routes
- Hardcode configuration
- Create files in root `src/` directory
- Keep backup files

---

## 🐛 Troubleshooting

### Backend Won't Start

**Error:** `Cannot find module`
```bash
# Check import paths - should use relative paths:
# ./services/...
# ./config/...
# ./routes/...
```

**Error:** `Port already in use`
```bash
# Kill existing process
lsof -ti:8787 | xargs kill -9
```

### Frontend Build Errors

**Error:** `Could not resolve`
```bash
# Check import paths in sections:
# Should be: ../../api.js (not ../api.js)
```

**Error:** Module not found
```bash
# Rebuild
cd frontend
rm -rf node_modules dist
npm install
npm run build
```

### Playwright Test Failures

**Error:** `Timeout exceeded`
```bash
# Increase timeout in test file
test.setTimeout(180000) // 3 minutes
```

**Error:** `Locator not found`
```bash
# Use AI healing
# Set HEALING_MODE=true environment variable
# Or run with healing endpoint
```

### Jenkins Connection Issues

**Error:** `Cannot connect to Jenkins`
```bash
# Check Jenkins is running
curl http://jenkins-url:8080/api/json

# Verify firewall allows port 8080
# Check credentials in .env file
```

---

## 📊 Key Technologies

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Playwright** - Browser automation
- **OpenAI API** - AI features
- **WebSocket** - Real-time updates
- **SSE** - Log streaming

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Monaco Editor** - Code editing

---

## 🔐 Security

- API tokens stored in environment variables
- Basic auth for external services
- Input validation on all endpoints
- Sanitized file paths
- No sensitive data in logs
- CORS configured for specific origins

---

## 📈 Performance Tips

1. **Use Headless Mode** for CI/CD
2. **Enable Caching** for test artifacts
3. **Limit Concurrent Tests** to avoid resource exhaustion
4. **Clean Artifacts** regularly
5. **Use SSE** for real-time logs instead of polling

---

## 🚨 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Module not found | Check import paths match new folder structure |
| Port in use | Kill process: `lsof -ti:8787 \| xargs kill -9` |
| Build fails | Delete `node_modules` and `npm install` |
| Tests timeout | Increase timeout or check network |
| Healing not working | Verify `OPENAI_API_KEY` in `.env` |
| Jenkins not connecting | Check URL, credentials, and firewall |

---

## 📝 Useful Commands

```bash
# Backend
npm run dev:safe          # Start with port check
node src/index.js         # Start directly
npm run lint              # Run linter

# Frontend  
npm run dev               # Development server
npm run build             # Production build
npm run preview           # Preview build

# Playwright Tests
npx playwright test                    # Run all tests
npx playwright test --headed           # Headed mode
npx playwright test --ui               # UI mode
npx playwright show-report             # View report
npx playwright codegen                 # Record test
```

---

## 🎯 Best Practices

### Writing Tests
- Use meaningful test IDs (e.g., `LAV-001`)
- Add descriptions to test cases
- Use robust selectors (role, text, aria)
- Implement retry logic for flaky tests
- Use AI healing for unstable locators

### Code Quality
- Follow folder structure conventions
- Write descriptive function names
- Add comments for complex logic
- Keep functions small and focused
- Handle errors gracefully

### Performance
- Run tests in parallel when possible
- Use fixtures for common setup
- Clean up test artifacts
- Monitor resource usage

---

## 📞 Support & Resources

### Project Info
- **Project Root:** `/Users/faraz.khan/Downloads/qa-testing-agent-starter`
- **Backend Port:** 8787
- **Frontend Port:** 5173

### External Docs
- **Playwright:** https://playwright.dev
- **React:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com
- **OpenAI API:** https://platform.openai.com/docs

### Additional Docs (backend/docs/)
- `notification-setup.md` - Slack/Gmail notification setup
- `lavinia-testing-strategy.md` - Product-specific testing strategy
- `workflow.png` - Visual workflow diagram
- `explainable-model.md` - AI model explanation

---

## 🎉 That's It!

You now have everything you need to:
- ✅ Start the application
- ✅ Understand the structure
- ✅ Use all features
- ✅ Debug issues
- ✅ Add new features

**Happy Testing!** 🚀

