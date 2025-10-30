import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'on', // Capture screenshots on every step
    video: 'on', // Capture videos for all tests, not just failures
    headless: process.env.PLAYWRIGHT_HEADLESS === 'true',
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        headless: process.env.PLAYWRIGHT_HEADLESS === 'true',
        video: 'on' // Capture videos for all tests
      },
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        headless: process.env.PLAYWRIGHT_HEADLESS === 'true',
        video: 'on' // Capture videos for all tests
      },
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        headless: process.env.PLAYWRIGHT_HEADLESS === 'true',
        video: 'on' // Capture videos for all tests
      },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        headless: process.env.PLAYWRIGHT_HEADLESS === 'true',
        video: 'on' // Capture videos for all tests
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        headless: process.env.PLAYWRIGHT_HEADLESS === 'true',
        video: 'on' // Capture videos for all tests
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});