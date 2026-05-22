import { defineConfig } from '@playwright/test';

const launchOptions = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
  ? {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-features=BlockInsecurePrivateNetworkRequests']
    }
  : {
      args: ['--disable-features=BlockInsecurePrivateNetworkRequests']
    };

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4321',
    trace: 'on-first-retry',
    launchOptions
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'npm run dev -- --host 127.0.0.1',
        url: 'http://127.0.0.1:4321',
        reuseExistingServer: true,
        timeout: 120_000
      }
});
