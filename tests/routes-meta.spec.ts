import { expect, test } from '@playwright/test';
import { SITE, locales, pathFor, routeName, routes, type Route } from './helpers';

/**
 * Routes and SEO metadata on every page × language (desktop project only):
 * status, one h1, <html lang>, title/description, canonical, hreflang, Open Graph,
 * JSON-LD, heading order. Plus site-wide checks: unique titles/descriptions,
 * internal links, sitemap, robots.txt, 404.
 */

const decode = (value: string) =>
  value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

for (const route of routes) {
  test(`meta: ${routeName(route)}`, async ({ page }) => {
    const response = await page.goto(route.path);
    expect(response?.status(), 'HTTP status').toBe(200);

    await expect(page.locator('h1'), 'exactly one h1').toHaveCount(1);
    expect(await page.locator('h1').innerText()).not.toBe('');
    await expect(page.locator('html')).toHaveAttribute('lang', route.locale);

    const title = await page.title();
    expect(title.trim(), 'title').not.toBe('');
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description?.trim(), 'meta description').toBeTruthy();

    // Canonical = own absolute URL on the configured site.
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveCount(1);
    await expect(canonical).toHaveAttribute('href', new URL(route.path, SITE).href);
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);

    // hreflang: pl, en, uk + x-default (Polish), each pointing at the same page.
    const alternates = await page
      .locator('link[rel="alternate"][hreflang]')
      .evaluateAll((links) => links.map((link) => [link.getAttribute('hreflang'), link.getAttribute('href')]));
    const expected = [
      ...locales.map((locale) => [locale, new URL(pathFor(route.page, locale), SITE).href]),
      ['x-default', new URL(pathFor(route.page, 'pl'), SITE).href],
    ];
    expect(alternates.sort()).toEqual(expected.sort());

    // Open Graph.
    const og = async (property: string) => page.locator(`meta[property="${property}"]`).getAttribute('content');
    expect(await og('og:title'), 'og:title').toBeTruthy();
    expect(await og('og:description'), 'og:description').toBeTruthy();
    const ogImage = await og('og:image');
    expect(ogImage, 'og:image').toBeTruthy();
    expect(await og('og:url'), 'og:url').toBe(new URL(route.path, SITE).href);
    // The OG image file itself must exist in the build.
    const imageResponse = await page.request.get(new URL(ogImage!).pathname);
    expect(imageResponse.status(), `og:image ${ogImage}`).toBe(200);

    // JSON-LD parses; every block has @type; the business block has a name.
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(blocks.length, 'JSON-LD blocks').toBeGreaterThan(0);
    const parsed = blocks.map((text) => JSON.parse(text) as Record<string, unknown>);
    for (const block of parsed) expect(block['@type'], 'JSON-LD @type').toBeTruthy();
    // MedicalBusiness is a LocalBusiness subtype, so the redundant LocalBusiness type is not listed.
    const business = parsed.find((block) => [block['@type']].flat().includes('MedicalBusiness'));
    expect(business, 'MedicalBusiness JSON-LD').toBeTruthy();
    expect(business?.name).toBeTruthy();
    expect(business?.telephone, 'JSON-LD telephone').toBeTruthy();
    expect((business?.address as Record<string, unknown> | undefined)?.['@type'], 'JSON-LD PostalAddress').toBe('PostalAddress');
    expect(business?.openingHoursSpecification, 'JSON-LD opening hours').toBeTruthy();
    if (route.page !== 'home') {
      const breadcrumbs = parsed.find((block) => block['@type'] === 'BreadcrumbList');
      expect(breadcrumbs, 'BreadcrumbList on sub-pages').toBeTruthy();
    }

    // Heading levels never skip downwards (h2 -> h4).
    const levels = await page
      .locator('h1, h2, h3, h4, h5, h6')
      .evaluateAll((headings) => headings.map((h) => [Number(h.tagName[1]), (h.textContent ?? '').trim().slice(0, 40)] as const));
    const skips: string[] = [];
    levels.reduce((previous, [level, text]) => {
      if (level > previous + 1) skips.push(`h${previous} -> h${level} "${text}"`);
      return level;
    }, 1);
    expect(skips, 'heading level skips').toEqual([]);
    expect(levels[0]?.[0], 'first heading is the h1').toBe(1);
  });
}

test('titles and descriptions are unique across all routes', async ({ request }) => {
  const seen = { title: new Map<string, string>(), description: new Map<string, string>() };
  const duplicates: string[] = [];
  for (const route of routes) {
    const html = await (await request.get(route.path)).text();
    const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
    const description = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '');
    for (const [kind, value] of [['title', title], ['description', description]] as const) {
      const other = seen[kind].get(value);
      if (other) duplicates.push(`${kind} "${value}" on ${other} and ${route.path}`);
      seen[kind].set(value, route.path);
    }
  }
  expect(duplicates).toEqual([]);
});

test('no broken internal links or assets across the site', async ({ request }) => {
  const pages = new Map<string, string>();
  const fetchPage = async (path: string) => {
    if (!pages.has(path)) pages.set(path, await (await request.get(path)).text());
    return pages.get(path)!;
  };
  const references = new Map<string, Set<string>>();
  for (const route of [...routes, { path: '/404.html' } as Route]) {
    const html = await fetchPage(route.path);
    for (const match of html.matchAll(/\s(?:href|src)="(\/[^"]*)"/g)) {
      const url = decode(match[1]);
      if (url.startsWith('//')) continue;
      if (!references.has(url)) references.set(url, new Set());
      references.get(url)!.add(route.path);
    }
  }
  expect(references.size).toBeGreaterThan(10);

  const broken: string[] = [];
  const statuses = new Map<string, number>();
  for (const [url, from] of references) {
    const { pathname, search, hash } = new URL(url, 'http://x');
    const target = pathname + search;
    if (!statuses.has(target)) statuses.set(target, (await request.get(target, { maxRedirects: 0 })).status());
    const status = statuses.get(target)!;
    if (status !== 200) {
      broken.push(`${url} -> ${status} (linked from ${[...from].slice(0, 3).join(', ')})`);
      continue;
    }
    // In-page anchors must exist on the target page.
    if (hash && hash.length > 1) {
      const html = await fetchPage(pathname);
      const id = decodeURIComponent(hash.slice(1));
      if (!html.includes(`id="${id}"`)) broken.push(`${url} -> missing #${id} (linked from ${[...from].slice(0, 3).join(', ')})`);
    }
  }
  expect(broken).toEqual([]);
});

test('sitemap and robots.txt', async ({ request }) => {
  const index = await request.get('/sitemap-index.xml');
  expect(index.status()).toBe(200);
  const indexXml = await index.text();
  const sitemapUrls = [...indexXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  expect(sitemapUrls.length).toBeGreaterThan(0);

  const entries: string[] = [];
  let xml = '';
  for (const url of sitemapUrls) {
    const response = await request.get(new URL(url).pathname);
    expect(response.status(), url).toBe(200);
    xml += await response.text();
  }
  for (const match of xml.matchAll(/<url><loc>([^<]+)<\/loc>/g)) entries.push(match[1]);
  const expected = routes.map((route) => new URL(route.path, SITE).href);
  expect(entries.sort()).toEqual(expected.sort());
  expect(xml, 'no 404 in sitemap').not.toContain('404');
  // hreflang alternates in the sitemap.
  expect(xml).toContain('hreflang="x-default"');
  expect(xml).toContain(`href="${new URL(pathFor('rental', 'uk'), SITE).href}"`);

  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  const text = await robots.text();
  expect(text).toMatch(/User-agent:\s*\*/);
  expect(text).toContain(`Sitemap: ${new URL('/sitemap-index.xml', SITE).href}`);
});

test('unknown URL serves the 404 page', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).not.toBeEmpty();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  // Header, navigation and a way home are present.
  await expect(page.locator('header nav a').first()).toBeAttached();
  await expect(page.locator('main a[href="/"]').first()).toBeVisible();
  // Lines for the other languages link to their home pages.
  await expect(page.locator('main a[href="/en/"]')).toBeVisible();
  await expect(page.locator('main a[href="/uk/"]')).toBeVisible();
});
