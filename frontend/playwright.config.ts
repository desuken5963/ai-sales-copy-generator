import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }]
  ],
  timeout: 30000,
  use: {
    baseURL: 'http://frontend-test:3000',
    trace: 'on-first-retry',
    actionTimeout: 10000,
    navigationTimeout: 10000,
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://frontend-test:3000',
    reuseExistingServer: !process.env.CI,
    env: {
      APP_ENV: 'test',
      API_BASE_URL: 'http://api-test:8080'
    }
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ]
}); 