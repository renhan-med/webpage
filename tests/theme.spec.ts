import { expect, test } from '@playwright/test';
import { presetTheme } from './helpers';

/** Theme: system default, toggle, persistence across navigation/reload, no flash of the wrong theme. */

const html = (page: import('@playwright/test').Page) => page.locator('html');

for (const scheme of ['light', 'dark'] as const) {
  test(`default theme follows prefers-color-scheme: ${scheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto('/');
    await expect(html(page)).toHaveAttribute('data-theme', scheme);
    await expect(page.getByTestId('theme-toggle')).toHaveAttribute('aria-pressed', String(scheme === 'dark'));
    expect(await html(page).evaluate((el) => getComputedStyle(el).colorScheme)).toContain(scheme);
    const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(themeColor?.toLowerCase()).toBe(scheme === 'dark' ? '#08182d' : '#ffffff');
  });
}

test('without a saved choice, a system change is followed live', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/en/');
  await expect(html(page)).toHaveAttribute('data-theme', 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(html(page)).toHaveAttribute('data-theme', 'dark');
});

test('toggle switches theme, updates state, persists across navigation and reload', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const toggle = page.getByTestId('theme-toggle');
  await expect(html(page)).toHaveAttribute('data-theme', 'light');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  // It has an accessible name.
  expect((await toggle.getAttribute('aria-label'))?.trim()).toBeTruthy();

  await toggle.click();
  await expect(html(page)).toHaveAttribute('data-theme', 'dark');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  expect(await html(page).evaluate((el) => getComputedStyle(el).colorScheme)).toContain('dark');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', /#08182d/i);
  expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('dark');

  // Navigation (link click) keeps the choice.
  await page.locator('header nav a[href="/oferta/"]').click();
  await expect(page).toHaveURL(/\/oferta\/$/);
  await expect(html(page)).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByTestId('theme-toggle')).toHaveAttribute('aria-pressed', 'true');

  // Other language, reload.
  await page.goto('/uk/prokat/');
  await expect(html(page)).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(html(page)).toHaveAttribute('data-theme', 'dark');

  // A saved choice wins over the system setting.
  await page.emulateMedia({ colorScheme: 'light' });
  await page.reload();
  await expect(html(page)).toHaveAttribute('data-theme', 'dark');

  // Toggle back to light persists too, even when the system prefers dark.
  await page.getByTestId('theme-toggle').click();
  await expect(html(page)).toHaveAttribute('data-theme', 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.reload();
  await expect(html(page)).toHaveAttribute('data-theme', 'light');
  await expect(page.getByTestId('theme-toggle')).toHaveAttribute('aria-pressed', 'false');
});

test('no flash: stored dark theme is applied before <body> is parsed', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await presetTheme(page, 'dark');
  // Record data-theme at the moment <body> is inserted, i.e. before anything can paint.
  await page.addInitScript(() => {
    const record = (window as unknown as { __themeAtBody?: string | null });
    const observer = new MutationObserver(() => {
      if (document.body) {
        record.__themeAtBody = document.documentElement.getAttribute('data-theme');
        observer.disconnect();
      }
    });
    observer.observe(document, { childList: true, subtree: true });
  });
  await page.goto('/kontakt/');
  expect(await page.evaluate(() => (window as unknown as { __themeAtBody?: string | null }).__themeAtBody)).toBe('dark');
});

test('theme script is inline in <head> before any stylesheet', async ({ request }) => {
  const source = await (await request.get('/')).text();
  const head = source.slice(0, source.indexOf('</head>'));
  const script = head.search(/<script>[^<]*localStorage\.getItem\('theme'\)/);
  const stylesheet = head.search(/<link[^>]+rel="stylesheet"|<style/);
  expect(script, 'inline theme script in <head>').toBeGreaterThan(-1);
  if (stylesheet > -1) expect(script).toBeLessThan(stylesheet);
});

test('storage blocked: theme still works for the page without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('blocked', 'SecurityError');
      },
    });
  });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(html(page)).toHaveAttribute('data-theme', 'dark');
  await page.getByTestId('theme-toggle').click();
  await expect(html(page)).toHaveAttribute('data-theme', 'light');
  expect(errors).toEqual([]);
});
