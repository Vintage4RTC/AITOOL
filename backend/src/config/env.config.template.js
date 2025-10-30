// Environment Configuration Template for QA Testing Agent
// Copy this file to env.config.js and fill in your actual credentials

export const testEnv = {
  // JIRA Configuration
  JIRA_HOST: 'your_jira_host.atlassian.net',
  JIRA_USERNAME: 'your_email@domain.com',
  JIRA_API_TOKEN: 'your_jira_api_token_here',

  // OpenAI Configuration
  OPENAI_API_KEY: 'your_openai_api_key_here',
  // Business Unit URLs
  SMARTAPP_URL: 'https://your-smartapp-url.com/',

  // Basic Auth Credentials (for HTTP Basic Authentication)
  LAVINIA_USERNAME: 'your_lavinia_basic_auth_username',
  LAVINIA_PASSWORD: 'your_lavinia_basic_auth_password',
  PASSAGE_PREP_USERNAME: 'your_passage_prep_basic_auth_username',
  PASSAGE_PREP_PASSWORD: 'your_passage_prep_basic_auth_password',

  // Application Login Credentials (for form-based login)
  LAVINIA_APP_USERNAME: 'your_lavinia_app_username',
  LAVINIA_APP_PASSWORD: 'your_lavinia_app_password',
  PASSAGE_PREP_APP_USERNAME: 'your_passage_prep_app_username',
  PASSAGE_PREP_APP_PASSWORD: 'your_passage_prep_app_password',
  SMARTAPP_APP_USERNAME: 'your_smartapp_username',
  SMARTAPP_APP_PASSWORD: 'your_smartapp_password'
};

// Set environment variables if not already set
Object.entries(testEnv).forEach(([key, value]) => {
  if (!process.env[key]) {
    process.env[key] = value;
  }
});

// Export individual credential objects for easy access
export const jiraConfig = {
  host: testEnv.JIRA_HOST,
  username: testEnv.JIRA_USERNAME,
  apiToken: testEnv.JIRA_API_TOKEN
};

export const basicAuthConfig = {
  lavinia: {
    username: testEnv.LAVINIA_USERNAME,
    password: testEnv.LAVINIA_PASSWORD
  },
  passagePrep: {
    username: testEnv.PASSAGE_PREP_USERNAME,
    password: testEnv.PASSAGE_PREP_PASSWORD
  }
};

export const appLoginConfig = {
  lavinia: {
    username: testEnv.LAVINIA_APP_USERNAME,
    password: testEnv.LAVINIA_APP_PASSWORD
  },
  passagePrep: {
    username: testEnv.PASSAGE_PREP_APP_USERNAME,
    password: testEnv.PASSAGE_PREP_APP_PASSWORD
  },
  smartApp: {
    username: testEnv.SMARTAPP_APP_USERNAME,
    password: testEnv.SMARTAPP_APP_PASSWORD
  }
};

export const urls = {
  smartApp: testEnv.SMARTAPP_URL
};
