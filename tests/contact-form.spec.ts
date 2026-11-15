import { expect, test, type Page } from '@playwright/test';
import { isMobileProject, locales, pathFor, routes } from './helpers';

/**
 * Contact form: validation, prefill from ?topic=&item=, safe handling of hostile query values,
 * mailto: fallback (no PUBLIC_FORM_ENDPOINT in the build) and the endpoint path (exercised by
 * injecting an endpoint into the served HTML's data-config, without rebuilding).
 * Expected strings come from the form's own data-config (i.e. the dictionaries), not hard-coded copy.
 */

interface FormConfig {
  endpoint: string;
  email: string;
  phone: string;
  /** Item names per topic: { equipment: {...departments}, rental: {...rental items} }. */
  items: Record<string, Record<string, string>>;
  topics: Record<string, string>;
  prefill: Record<string, string>;
  errors: Record<string, string>;
  status: Record<'sending' | 'success' | 'error' | 'mailto', string>;
}

const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);

async function config(page: Page): Promise<FormConfig> {
  return JSON.parse((await page.getByTestId('contact-form').getAttribute('data-config')) ?? '{}');
}

const field = (page: Page, name: string) => page.getByTestId('contact-form').locator(`[name="${name}"]`);
const errorFor = (page: Page, key: string) => page.locator(`[data-error-for="${key}"]`);

async function fillValid(page: Page) {
  await field(page, 'name').fill('Anna');
  await field(page, 'phone').fill('+48 600 700 800');
  await field(page, 'email').fill('anna@example.com');
  await field(page, 'message').fill('Test message');
  await field(page, 'consent').check();
}

const submit = (page: Page) => page.getByTestId('contact-form').locator('[type="submit"]').click();

test.describe('contact form', () => {
  // Logic matrix on desktop; the mobile project runs the separate narrow-layout check below.
  test.skip(({ isMobile }) => isMobile, 'form logic runs on desktop');

  test('empty submit: errors under fields, summary, focus on the first invalid field', async ({ page }) => {
    await page.goto(pathFor('contact', 'pl'));
    const cfg = await config(page);
    await submit(page);

    for (const key of ['name', 'contact', 'message', 'consent']) {
      await expect(errorFor(page, key), `error for ${key}`).toBeVisible();
      await expect(errorFor(page, key)).toHaveText(cfg.errors[key]);
    }
    await expect(errorFor(page, 'phone')).toBeHidden();
    await expect(errorFor(page, 'email')).toBeHidden();
    await expect(field(page, 'name')).toBeFocused();
    for (const name of ['name', 'phone', 'email', 'message', 'consent']) {
      await expect(field(page, name)).toHaveAttribute('aria-invalid', 'true');
    }
    // Errors are referenced by the controls.
    await expect(field(page, 'name')).toHaveAttribute('aria-describedby', /cf-name-error/);
    const status = page.getByTestId('form-status');
    await expect(status).toHaveText(cfg.errors.summary);
    await expect(status).toHaveAttribute('data-state', 'error');
    // role="status" is an implicit polite live region (a separate aria-live would be redundant).
    await expect(status).toHaveAttribute('role', 'status');
    await expect(status).not.toHaveText(cfg.status.success);
  });

  test('errors clear as fields are corrected; focus goes to the first remaining invalid field', async ({ page }) => {
    await page.goto(pathFor('contact', 'en'));
    await submit(page);
    await field(page, 'name').fill('John');
    await expect(errorFor(page, 'name')).toBeHidden();
    await expect(field(page, 'name')).not.toHaveAttribute('aria-invalid', /.*/);
    await field(page, 'email').fill('john@example.com');
    await expect(errorFor(page, 'contact')).toBeHidden();
    await field(page, 'message').fill('Hello');
    await submit(page);
    // Only consent left.
    await expect(errorFor(page, 'consent')).toBeVisible();
    await expect(field(page, 'consent')).toBeFocused();
  });

  test('invalid e-mail and phone are rejected; consent is required', async ({ page }) => {
    await page.goto(pathFor('contact', 'uk'));
    const cfg = await config(page);
    await field(page, 'name').fill('Олена');
    await field(page, 'message').fill('Тест');
    await field(page, 'consent').check();

    for (const bad of ['anna@', 'anna@example', 'anna example.com', '@example.com']) {
      await field(page, 'email').fill(bad);
      await submit(page);
      await expect(errorFor(page, 'email'), `email "${bad}"`).toHaveText(cfg.errors.email);
      await expect(field(page, 'email')).toBeFocused();
    }
    await field(page, 'email').fill('');
    for (const bad of ['123', '12-34-56', 'abc defg hij']) {
      await field(page, 'phone').fill(bad);
      await submit(page);
      await expect(errorFor(page, 'phone'), `phone "${bad}"`).toHaveText(cfg.errors.phone);
      await expect(field(page, 'phone')).toBeFocused();
    }
    await field(page, 'phone').fill('600 700 800');
    await field(page, 'consent').uncheck();
    await submit(page);
    await expect(errorFor(page, 'consent')).toHaveText(cfg.errors.consent);
    await expect(errorFor(page, 'phone')).toBeHidden();
    await expect(field(page, 'consent')).toBeFocused();
  });

  for (const locale of locales) {
    test(`prefill ?topic=rental&item=<real id> preselects topic and writes the message: ${locale}`, async ({ page }) => {
      // Take a real rental CTA from the rental page, so the id is one the site actually uses.
      await page.goto(pathFor('rental', locale));
      const href = await page.locator(`main a[href*="topic=rental"][href*="item="]`).first().getAttribute('href');
      expect(href, 'rental page links to the form with an item').toBeTruthy();
      const url = new URL(href!, 'http://x');
      const item = url.searchParams.get('item')!;
      expect(url.pathname).toBe(pathFor('contact', locale));

      await page.goto(href!);
      const cfg = await config(page);
      expect(cfg.items.rental?.[item], `item "${item}" known to the form`).toBeTruthy();
      await expect(field(page, 'topic')).toHaveValue('rental');
      await expect(field(page, 'message')).toHaveValue(fill(cfg.prefill.rental, { item: cfg.items.rental![item]! }));
      // The link's #form anchor scrolls the form into view.
      await expect(page.locator('#form')).toBeInViewport();
    });
  }

  test('prefill for every topic', async ({ page }) => {
    await page.goto(pathFor('contact', 'pl'));
    const cfg = await config(page);
    const expected: Record<string, string> = {
      equipment: cfg.prefill.equipmentGeneral,
      rental: cfg.prefill.rentalGeneral,
      advice: cfg.prefill.advice,
      funding: cfg.prefill.funding,
      other: '',
    };
    for (const [topic, message] of Object.entries(expected)) {
      await page.goto(`${pathFor('contact', 'pl')}?topic=${topic}`);
      await expect(field(page, 'topic'), topic).toHaveValue(topic);
      await expect(field(page, 'message'), topic).toHaveValue(message);
    }
  });

  for (const locale of ['pl', 'uk'] as const) {
    test(`changing the topic swaps the generated message, never the visitor's own text: ${locale}`, async ({ page }) => {
      // Prefilled from a rental button: switching topic and back restores the item-specific text.
      await page.goto(`${pathFor('contact', locale)}?topic=rental&item=hoist`);
      const cfg = await config(page);
      const hoist = fill(cfg.prefill.rental, { item: cfg.items.rental!.hoist! });
      const message = field(page, 'message');
      await expect(message).toHaveValue(hoist);
      await field(page, 'topic').focus();
      await field(page, 'topic').selectOption('advice');
      await expect(message).toHaveValue(cfg.prefill.advice);
      await expect(field(page, 'topic'), 'focus stays on the select').toBeFocused();
      await field(page, 'topic').selectOption('funding');
      await expect(message).toHaveValue(cfg.prefill.funding);
      await field(page, 'topic').selectOption('rental');
      await expect(message, 'back to rental: the item from the link applies again').toHaveValue(hoist);
      // `hoist` is not an offer department, so equipment gets the general template.
      await field(page, 'topic').selectOption('equipment');
      await expect(message).toHaveValue(cfg.prefill.equipmentGeneral);
      await field(page, 'topic').selectOption('other');
      await expect(message).toHaveValue('');

      // From an empty page: an empty message takes the template.
      await page.goto(pathFor('contact', locale));
      await field(page, 'topic').selectOption('funding');
      await expect(message).toHaveValue(cfg.prefill.funding);

      // An edited message is kept, even after one more keystroke on the generated text.
      await message.press('End');
      await message.pressSequentially(' 2');
      await field(page, 'topic').selectOption('advice');
      await expect(message).toHaveValue(`${cfg.prefill.funding} 2`);
      await message.fill('Moje pytanie');
      await field(page, 'topic').selectOption('rental');
      await expect(message).toHaveValue('Moje pytanie');

      // Validation still follows the field: an empty message after a submit attempt shows its error.
      await message.fill('');
      await field(page, 'topic').selectOption('other');
      await page.getByTestId('contact-form').locator('[type="submit"]').click();
      await expect(errorFor(page, 'message')).toHaveText(cfg.errors.message);
      await field(page, 'topic').selectOption('advice');
      await expect(message).toHaveValue(cfg.prefill.advice);
      await expect(errorFor(page, 'message'), 'error clears once the template fills the field').toBeHidden();
    });
  }

  test('every ?topic=&item= link on the site is understood by the form', async ({ page, request }) => {
    const problems: string[] = [];
    const configs = new Map<string, FormConfig>();
    for (const locale of locales) {
      await page.goto(pathFor('contact', locale));
      configs.set(locale, await config(page));
    }
    for (const route of routes) {
      const html = await (await request.get(route.path)).text();
      for (const match of html.matchAll(/href="([^"]*\?[^"]*topic=[^"]*)"/g)) {
        const url = new URL(match[1].replace(/&amp;/g, '&'), 'http://x');
        const cfg = configs.get(route.locale)!;
        const topic = url.searchParams.get('topic')!;
        const item = url.searchParams.get('item');
        if (url.pathname !== pathFor('contact', route.locale)) problems.push(`${route.path}: ${match[1]} points to another language`);
        if (!(topic in cfg.topics)) problems.push(`${route.path}: unknown topic ${topic}`);
        if (item && !Object.hasOwn(cfg.items[topic] ?? {}, item)) problems.push(`${route.path}: unknown item ${item}`);
      }
    }
    expect(problems).toEqual([]);
  });

  test('hostile ?item= is never rendered as HTML', async ({ page }) => {
    let dialog = false;
    page.on('dialog', async (d) => {
      dialog = true;
      await d.dismiss();
    });
    const payload = '<img src=x onerror=alert(1)>';
    await page.goto(`${pathFor('contact', 'pl')}?topic=rental&item=${encodeURIComponent(payload)}`);
    const cfg = await config(page);
    await page.waitForTimeout(300);
    expect(dialog, 'no alert() fired').toBe(false);
    await expect(page.locator('main img[src="x"]')).toHaveCount(0);
    await expect(field(page, 'topic')).toHaveValue('rental');
    // Unknown item -> the general rental template, payload not echoed anywhere.
    await expect(field(page, 'message')).toHaveValue(cfg.prefill.rentalGeneral);
    expect(await page.locator('body').innerHTML()).not.toContain('onerror=alert');

    // Script-ish topic is ignored.
    await page.goto(`${pathFor('contact', 'pl')}?topic=${encodeURIComponent('"><script>alert(1)</script>')}`);
    await page.waitForTimeout(200);
    expect(dialog).toBe(false);
    await expect(field(page, 'topic')).toHaveValue('equipment');
    await expect(field(page, 'message')).toHaveValue('');
  });

  // Names that exist on every plain object (Object.prototype) must not count as topics or items.
  for (const topic of ['nonsense', 'constructor', '__proto__', 'toString', 'hasOwnProperty']) {
    test(`unknown ?topic=${topic} is ignored safely`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(`${pathFor('contact', 'en')}?topic=${topic}&item=wheelchair`);
      await expect.soft(field(page, 'topic'), 'topic stays on the default option').toHaveValue('equipment');
      await expect.soft(field(page, 'message'), 'message stays empty').toHaveValue('');
      expect(errors).toEqual([]);
    });
  }

  for (const item of ['constructor', '__proto__', 'toString']) {
    test(`unknown ?item=${item} falls back to the general message`, async ({ page }) => {
      await page.goto(`${pathFor('contact', 'en')}?topic=rental&item=${item}`);
      const cfg = await config(page);
      await expect(field(page, 'topic')).toHaveValue('rental');
      await expect(field(page, 'message')).toHaveValue(cfg.prefill.rentalGeneral);
    });
  }

  test('no endpoint: mailto fallback with an honest message, never "sent"', async ({ page }, testInfo) => {
    await page.goto(`${pathFor('contact', 'pl')}?topic=advice`);
    const cfg = await config(page);
    expect(cfg.endpoint, 'this build has no PUBLIC_FORM_ENDPOINT').toBe('');
    await expect(page.getByTestId('contact-form')).toHaveAttribute('action', `mailto:${cfg.email}`);

    // Capture the mailto: navigation the script requests (Chrome DevTools Protocol).
    const navigations: string[] = [];
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Page.enable');
    cdp.on('Page.frameRequestedNavigation', (event: { url: string }) => navigations.push(event.url));
    let posted = false;
    page.on('request', (request) => {
      if (request.method() === 'POST') posted = true;
    });

    await fillValid(page);
    await submit(page);
    const status = page.getByTestId('form-status');
    await expect(status).toHaveText(fill(cfg.status.mailto, { email: cfg.email, phone: cfg.phone }));
    await expect(status).toHaveAttribute('data-state', 'info');
    await expect(status).not.toHaveText(cfg.status.success);
    expect(posted, 'no POST request without an endpoint').toBe(false);
    // Still on the contact page.
    expect(new URL(page.url()).pathname).toBe(pathFor('contact', 'pl'));

    await expect.poll(() => navigations.length, { message: 'mailto: navigation requested' }).toBeGreaterThan(0);
    const mailto = navigations.find((url) => url.startsWith('mailto:'))!;
    expect(mailto.startsWith(`mailto:${cfg.email}?subject=`)).toBe(true);
    const body = decodeURIComponent(new URL(mailto).searchParams.get('body') ?? mailto.split('body=')[1] ?? '');
    for (const part of ['Anna', '+48 600 700 800', 'anna@example.com', 'Test message', cfg.topics.advice]) {
      expect(body, `mail body contains ${part}`).toContain(part);
    }
    testInfo.annotations.push({ type: 'mailto', description: mailto.slice(0, 200) });
  });

  /** Serve the contact page with an endpoint injected into data-config (as if built with PUBLIC_FORM_ENDPOINT). */
  async function withEndpoint(page: Page, endpoint: string) {
    await page.route(`**${pathFor('contact', 'pl')}*`, async (route) => {
      if (route.request().resourceType() !== 'document') return route.continue();
      const response = await route.fetch();
      const body = (await response.text()).replace('&quot;endpoint&quot;:&quot;&quot;', `&quot;endpoint&quot;:&quot;${endpoint}&quot;`);
      await route.fulfill({ response, body });
    });
  }

  test('endpoint 2xx: "sending" first, success only after the response, form reset', async ({ page }) => {
    const endpoint = 'https://forms.test/submit';
    await withEndpoint(page, endpoint);
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    let payload: Record<string, unknown> | null = null;
    await page.route(endpoint, async (route) => {
      payload = route.request().postDataJSON();
      await gate;
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });
    await page.goto(`${pathFor('contact', 'pl')}?topic=funding`);
    const cfg = await config(page);
    expect(cfg.endpoint).toBe(endpoint);
    await fillValid(page);
    await submit(page);

    const status = page.getByTestId('form-status');
    await expect(status).toHaveText(cfg.status.sending);
    await expect(page.getByTestId('contact-form').locator('[type="submit"]')).toBeDisabled();
    await page.waitForTimeout(300);
    await expect(status, 'no success before the server answers').not.toHaveText(cfg.status.success);
    release();
    await expect(status).toHaveText(cfg.status.success);
    await expect(status).toHaveAttribute('data-state', 'success');
    await expect(field(page, 'name')).toHaveValue('');
    await expect(page.getByTestId('contact-form').locator('[type="submit"]')).toBeEnabled();
    expect(payload).toMatchObject({ name: 'Anna', email: 'anna@example.com', topic: 'funding', consent: true, locale: 'pl' });
  });

  for (const failure of ['500', 'network'] as const) {
    test(`endpoint ${failure} failure: error with phone, never success, data kept`, async ({ page }) => {
      const endpoint = 'https://forms.test/submit';
      await withEndpoint(page, endpoint);
      await page.route(endpoint, (route) =>
        failure === 'network' ? route.abort('failed') : route.fulfill({ status: 500, body: 'oops' }),
      );
      await page.goto(pathFor('contact', 'pl'));
      const cfg = await config(page);
      await fillValid(page);
      await submit(page);
      const status = page.getByTestId('form-status');
      await expect(status).toHaveText(fill(cfg.status.error, { phone: cfg.phone }));
      await expect(status).toHaveAttribute('data-state', 'error');
      await expect(field(page, 'name')).toHaveValue('Anna');
      await expect(page.getByTestId('contact-form').locator('[type="submit"]')).toBeEnabled();
    });
  }
});

test('mobile: form fields stack and are usable at 390 px', async ({ page }, testInfo) => {
  test.skip(!isMobileProject(testInfo), 'mobile layout check');
  await page.goto(pathFor('contact', 'uk'));
  const phone = await field(page, 'phone').boundingBox();
  const email = await field(page, 'email').boundingBox();
  expect(email!.y).toBeGreaterThan(phone!.y + phone!.height - 1);
  await fillValid(page);
  await submit(page);
  await expect(page.getByTestId('form-status')).toHaveAttribute('data-state', 'info');
});
