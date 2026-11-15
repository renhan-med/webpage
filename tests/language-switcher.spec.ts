import { expect, test } from '@playwright/test';
import { isMobileProject, locales, pathFor, routeName, routes } from './helpers';

/**
 * From every page in every language, switching to each other language lands on the
 * SAME page (route map in src/i18n/slugs.mjs). Desktop: dropdown. Mobile: inside the menu sheet.
 */

for (const route of routes) {
  test(`language switcher keeps the page: ${routeName(route)}`, async ({ page }, testInfo) => {
    const mobile = isMobileProject(testInfo);
    await page.goto(route.path);

    // Current language is marked.
    await expect(page.getByTestId(`lang-link-${route.locale}`)).toHaveAttribute('aria-current', 'true');

    for (const target of locales.filter((locale) => locale !== route.locale)) {
      await page.goto(route.path);
      const link = page.getByTestId(`lang-link-${target}`);
      await expect(link).toHaveAttribute('href', pathFor(route.page, target));
      await expect(link).toHaveAttribute('hreflang', target);

      if (mobile) {
        await page.getByTestId('menu-toggle').click();
        await expect(page.getByTestId('mobile-menu')).toBeVisible();
        await expect(page.getByTestId('lang-switcher'), 'dropdown button is hidden in the sheet').toBeHidden();
      } else {
        const button = page.getByTestId('lang-switcher');
        await expect(link).toBeHidden();
        await button.click();
        await expect(button).toHaveAttribute('aria-expanded', 'true');
      }
      await expect(link).toBeVisible();
      await link.click();
      await expect(page).toHaveURL((url) => url.pathname === pathFor(route.page, target));
      await expect(page.locator('html')).toHaveAttribute('lang', target);
    }
  });
}

test('desktop language dropdown: Escape closes and returns focus, outside click closes', async ({ page }, testInfo) => {
  test.skip(isMobileProject(testInfo), 'desktop dropdown only');
  await page.goto('/oferta/');
  const button = page.getByTestId('lang-switcher');
  await button.click();
  await expect(page.getByTestId('lang-link-en')).toBeVisible();
  await page.getByTestId('lang-link-en').focus();
  await page.keyboard.press('Escape');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(button).toBeFocused();
  await expect(page.getByTestId('lang-link-en')).toBeHidden();

  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await page.locator('main').click({ position: { x: 5, y: 5 } });
  await expect(button).toHaveAttribute('aria-expanded', 'false');
});

test('on the contact page, switching language keeps ?topic=&item= (and nothing else)', async ({ page }, testInfo) => {
  await page.goto(`${pathFor('contact', 'pl')}?topic=rental&item=hoist&utm_source=x`);
  const link = page.getByTestId('lang-link-en');
  await expect(link).toHaveAttribute('href', `${pathFor('contact', 'en')}?topic=rental&item=hoist#form`);
  if (isMobileProject(testInfo)) await page.getByTestId('menu-toggle').click();
  else await page.getByTestId('lang-switcher').click();
  await link.click();
  await expect(page).toHaveURL((url) => url.pathname === pathFor('contact', 'en') && url.search === '?topic=rental&item=hoist');
  await expect(page.getByTestId('contact-form').locator('[name="topic"]')).toHaveValue('rental');
});
