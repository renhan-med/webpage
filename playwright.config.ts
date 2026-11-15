import { defineConfig } from '@playwright/test';

const PORT = Number(process.env.TEST_PORT ?? 4373);
const baseURL = `http://localhost:${PORT}`;

/**
 * End-to-end tests against the production build (`astro build` + `astro preview`).
 * Browsers: the system Chrome (`channel: 'chrome'`), no Playwright browser downloads.
 *
 *   npm test                         build, serve and run everything
 *   npx playwright test --project=desktop tests/theme.spec.ts
 *   SCREENSHOT_DIR=/some/dir npm test -- tests/visual.spec.ts   keep the screenshots elsewhere
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : '60%',
  timeout: 60_000,
  expect: { timeout: 5_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    channel: 'chrome',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },
  projects: [
    {
      name: 'desktop',
      testIgnore: /mobile-menu\.spec\.ts/,
      use: { viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile',
      // Routes/meta, theme logic and the responsive sweep do not depend on the device; run them once (desktop).
      testIgnore: /(routes-meta|responsive|theme)\.spec\.ts/,
      use: {
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: `npm run build && npx astro preview --port ${PORT} --ignore-lock`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
