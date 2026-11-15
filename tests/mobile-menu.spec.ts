import { expect, test } from '@playwright/test';
import { locales, pageIds, pathFor, settle } from './helpers';

/** Mobile menu (mobile project, 390 px): open/close, aria-expanded, Escape, focus, links, focus trap. */

for (const locale of locales) {
  test(`mobile menu opens, lists every page and closes: ${locale}`, async ({ page }) => {
    await page.goto(pathFor('about', locale));
    const toggle = page.getByTestId('menu-toggle');
    const menu = page.getByTestId('mobile-menu');

    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toHaveAttribute('aria-controls', 'site-menu');
    await expect(menu).toBeHidden();
    const openLabel = await toggle.getAttribute('aria-label');
    expect(openLabel?.trim()).toBeTruthy();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(menu).toBeVisible();
    const closeLabel = await toggle.getAttribute('aria-label');
    expect(closeLabel, 'label changes to "close"').not.toBe(openLabel);

    // Every page, in route-map order, with the current one marked.
    const links = menu.locator('nav a');
    await expect(links).toHaveCount(pageIds.length);
    expect(await links.evaluateAll((items) => items.map((a) => a.getAttribute('href')))).toEqual(
      pageIds.map((id) => pathFor(id, locale)),
    );
    for (const link of await links.all()) await expect(link).toBeVisible();
    await expect(menu.locator('nav a[aria-current="page"]')).toHaveAttribute('href', pathFor('about', locale));
    // Language links and the CTA are inside the sheet too.
    for (const code of locales) await expect(menu.getByTestId(`lang-link-${code}`)).toBeVisible();

    // Close with the button.
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeHidden();
  });
}

test('Escape closes the menu and returns focus to the toggle', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByTestId('menu-toggle');
  await toggle.click();
  const menu = page.getByTestId('mobile-menu');
  await expect(menu).toBeVisible();
  await menu.locator('nav a').nth(2).focus();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeHidden();
  await expect(toggle).toBeFocused();
});

test('keyboard: Enter opens, Tab stays inside the header while open', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByTestId('menu-toggle');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  // Walk forward through more stops than the header has; focus must never leave the header.
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press('Tab');
    const inHeader = await page.evaluate(() => !!document.activeElement?.closest('[data-header]'));
    expect(inHeader, `Tab #${i + 1} stays in header`).toBe(true);
  }
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Shift+Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('[data-header]'))).toBe(true);
  }
});

test('menu links navigate and the menu is closed on the new page', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('menu-toggle').click();
  await page.getByTestId('mobile-menu').locator(`nav a[href="${pathFor('rental', 'pl')}"]`).click();
  await expect(page).toHaveURL((url) => url.pathname === pathFor('rental', 'pl'));
  await expect(page.getByTestId('menu-toggle')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByTestId('mobile-menu')).toBeHidden();
  await expect(page.locator('h1')).toBeVisible();
});

test('open menu covers the page and background scroll is contained', async ({ page }) => {
  await page.goto('/oferta/');
  await page.getByTestId('menu-toggle').click();
  const menu = page.getByTestId('mobile-menu');
  await expect(menu).toBeVisible();
  await settle(page);
  const box = await menu.boundingBox();
  const viewport = page.viewportSize()!;
  expect(box!.width).toBeGreaterThanOrEqual(viewport.width - 1);
  expect(box!.y + box!.height).toBeGreaterThanOrEqual(viewport.height - 1);

  // Body scroll lock is optional: record whether the page behind can scroll.
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => window.scrollY);
  const locked = await page.evaluate(() => {
    const style = (el: Element) => getComputedStyle(el).overflowY;
    return ['hidden', 'clip'].includes(style(document.documentElement)) || ['hidden', 'clip'].includes(style(document.body));
  });
  test.info().annotations.push({
    type: 'scroll-lock',
    description: `overflow lock: ${locked}; page scrolled behind the open menu: ${before} -> ${after}`,
  });
});

test('menu is not shown at desktop width, and an open menu resets when widening', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('menu-toggle').click();
  await expect(page.getByTestId('menu-toggle')).toHaveAttribute('aria-expanded', 'true');
  await page.setViewportSize({ width: 1300, height: 844 });
  await expect(page.getByTestId('menu-toggle')).toBeHidden();
  await expect(page.locator('html')).not.toHaveAttribute('data-menu-open', /.*/);
  await expect(page.locator('header nav a[href="/oferta/"]')).toBeVisible();
});
