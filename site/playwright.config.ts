import { defineConfig } from '@playwright/test';

const PLAYWRIGHT_BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4323/';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: PLAYWRIGHT_BASE_URL,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4323',
    url: PLAYWRIGHT_BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
