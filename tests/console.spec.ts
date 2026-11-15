import { expect, test } from '@playwright/test';
import { loadLazyContent, routeName, routes } from './helpers';

/** Every route (and the 404 page) loads without console errors, page errors or failed requests. */

const targets = [...routes.map((route) => ({ name: routeName(route), path: route.path })), { name: '404', path: '/no-such-page/' }];

for (const { name, path } of targets) {
  test(`no console errors or failed requests: ${name}`, async ({ page }) => {
    const problems: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') {
        // The 404 route itself logs "Failed to load resource: 404" for the document; that one is expected.
        if (path === '/no-such-page/' && /status of 404/.test(message.text()) && message.location().url.endsWith(path)) return;
        problems.push(`console.${message.type()}: ${message.text()} @ ${message.location().url}`);
      }
    });
    page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
    page.on('requestfailed', (request) => problems.push(`requestfailed: ${request.url()} ${request.failure()?.errorText}`));
    page.on('response', (response) => {
      if (response.status() >= 400 && response.url() !== page.url() && !response.url().endsWith(path)) {
        problems.push(`HTTP ${response.status()}: ${response.url()}`);
      }
    });

    await page.goto(path, { waitUntil: 'load' });
    await loadLazyContent(page);
    await page.waitForLoadState('networkidle');
    expect(problems).toEqual([]);
  });
}
