import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://127.0.0.1:4323/freeverse/',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4323',
    url: 'http://127.0.0.1:4323/freeverse/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
