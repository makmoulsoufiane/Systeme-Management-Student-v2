import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  timeout: 120000,
  use: {
    baseURL: 'http://127.0.0.1:5174',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    reducedMotion: 'reduce',
    launchOptions: { args: ['--disable-gpu'] },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
  webServer: [
    { command: '../env/bin/python tests/browser_server.py', url: 'http://127.0.0.1:8001/api/session/', reuseExistingServer: false, timeout: 60000 },
    { command: 'npm run dev -- --host 127.0.0.1 --port 5174 --strictPort', url: 'http://127.0.0.1:5174',
      env: { DJANGO_API_TARGET: 'http://127.0.0.1:8001' }, reuseExistingServer: false, timeout: 60000 },
  ],
});
