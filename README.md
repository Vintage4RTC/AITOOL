# 🧪 RTCTEK QA Tool

AI-powered test automation platform with Jira integration, self-healing tests, and CI/CD support.

## 🚀 Quick Start

```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Configure environment
cd backend
cp src/config/env.config.template.js src/config/env.config.js
# Edit .env with your credentials

# 3. Start backend
node --env-file=.env src/index.js

# 4. Start frontend (new terminal)
cd frontend
npm run dev

# 5. Open browser
# http://localhost:5173
```

## ✨ Features

- ✅ **BDD Test Creator** - Write tests in plain English (Given/When/Then) ✨ NEW!
- ✅ **Jira Integration** - Generate tests from Jira tickets
- ✅ **AI Test Generation** - GPT-powered test creation
- ✅ **Self-Healing Tests** - Auto-fix broken locators with AI
- ✅ **Jenkins CI/CD** - Trigger and monitor builds
- ✅ **Real-time Logs** - Stream test execution logs
- ✅ **Monaco Editor** - Edit tests with code editor
- ✅ **Screenshot Analysis** - Generate tests from screenshots
- ✅ **Multi-Browser** - Chrome, Firefox, Mobile support

## 📚 Documentation

**See [DOCUMENTATION.md](./DOCUMENTATION.md) for complete documentation**

Includes:
- Quick Start Guide
- Project Structure
- API Reference
- Configuration
- Troubleshooting
- Development Guide
- Best Practices

## 🔧 Tech Stack

**Backend:**
- Node.js + Express
- Playwright
- OpenAI API
- WebSocket/SSE

**Frontend:**
- React + Vite
- Tailwind CSS
- Monaco Editor

## 📦 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   └── config/        # Configuration
│   └── test-classes/      # Playwright tests
└── frontend/
    └── src/
        ├── ui/
        │   ├── pages/     # Main pages
        │   ├── sections/  # Features
        │   └── modals/    # Modals
        └── api.js         # API client
```

## 🛠️ Development

```bash
# Run tests
cd backend/test-classes
npx playwright test

# Run specific test
npx playwright test lavinia/SmokeTest.spec.js

# Run with UI
npx playwright test --ui

# View report
npx playwright show-report
```

## 📝 Environment Variables

Required in `backend/.env`:
```bash
OPENAI_API_KEY=your_openai_api_key_here
JIRA_HOST=your-domain.atlassian.net
JIRA_USERNAME=your-email@domain.com
JIRA_API_TOKEN=your-token
```

Optional:
```bash
JENKINS_URL=http://jenkins:8080
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXX/YYY/ZZZ
DEMO_LOGIN_USERNAME=
DEMO_LOGIN_PASSWORD=
BASIC_AUTH_USERNAME=
BASIC_AUTH_PASSWORD=
GMAIL_USER=your-email@gmail.com
```

## 🔗 Useful Links

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:8787
- **Health Check:** http://localhost:8787/api/health
- **Full Docs:** [DOCUMENTATION.md](./DOCUMENTATION.md)

## 📞 Support

For detailed documentation, troubleshooting, and API reference, see:
**[DOCUMENTATION.md](./DOCUMENTATION.md)**

---

Made with ❤️ for QA Engineers
