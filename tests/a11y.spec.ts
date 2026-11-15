import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { isMobileProject, loadLazyContent, pathFor, presetTheme, routeName, routes, settle, type Route } from './helpers';

/**
 * Accessibility: axe (serious/critical fail) on every route in both themes (desktop) and key
 * routes on mobile; skip link; visible focus; target sizes; reduced motion; images.
 */

const themes = ['light', 'dark'] as const;
const keyMobile = new Set(['home', 'rental', 'contact']);

async function axeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
  return results.violations
    .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
    .map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      nodes: violation.nodes.slice(0, 6).map((node) => `${node.target.join(' ')} :: ${node.failureSummary?.split('\n').slice(1, 2).join(' ').trim()}`),
    }));
}

const axeTargets: (Route | { page: '404'; locale: 'pl'; path: string })[] = [...routes, { page: '404', locale: 'pl', path: '/missing-page/' }];

for (const route of axeTargets) {
  for (const theme of themes) {
    test(`axe ${theme}: ${route.page === '404' ? '404' : routeName(route as Route)}`, async ({ page }, testInfo) => {
      if (isMobileProject(testInfo)) test.skip(!(route.locale !== 'en' && keyMobile.has(route.page)), 'mobile: key routes only');
      await presetTheme(page, theme);
      await page.goto(route.path);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await loadLazyContent(page);
      await settle(page);
      const violations = await axeViolations(page);
      expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
    });
  }
}

test('axe on the open mobile menu (both themes)', async ({ page }, testInfo) => {
  test.skip(!isMobileProject(testInfo), 'mobile only');
  for (const theme of themes) {
    await presetTheme(page, theme);
    await page.goto(pathFor('offer', 'uk'));
    await page.getByTestId('menu-toggle').click();
    await expect(page.getByTestId('mobile-menu')).toBeVisible();
    await settle(page);
    const violations = await axeViolations(page);
    expect(violations, `${theme}: ${JSON.stringify(violations, null, 2)}`).toEqual([]);
  }
});

test('axe on the contact form with errors shown and status (both themes)', async ({ page }) => {
  for (const theme of themes) {
    await presetTheme(page, theme);
    await page.goto(pathFor('contact', 'pl'));
    await page.getByTestId('contact-form').locator('[type="submit"]').click();
    await expect(page.getByTestId('form-status')).not.toBeEmpty();
    await settle(page);
    const violations = await axeViolations(page);
    expect(violations, `${theme}: ${JSON.stringify(violations, null, 2)}`).toEqual([]);
  }
});

test('skip link is the first Tab stop and moves focus to main', async ({ page }) => {
  for (const path of [pathFor('home', 'pl'), pathFor('contact', 'uk')]) {
    await page.goto(path);
    await page.keyboard.press('Tab');
    const skip = page.locator('a.skip-link');
    await expect(skip).toBeFocused();
    await expect(skip).toHaveAttribute('href', '#main');
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page.locator('main#main')).toBeFocused();
    // The next Tab continues inside main, not back at the header.
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('main'))).toBe(true);
  }
});

for (const path of [pathFor('home', 'pl'), pathFor('contact', 'en'), pathFor('rental', 'uk')]) {
  test(`focus is visible on every Tab stop: ${path}`, async ({ page }) => {
    await page.goto(path);
    await settle(page);
    const invisible: string[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < 80; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        // The indicator may be drawn on the element or on a close ancestor via :has(:focus-visible).
        const indicated = (node: Element) => {
          const style = getComputedStyle(node);
          return (style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) >= 2) || style.boxShadow !== 'none';
        };
        let visible = indicated(el);
        for (let node = el.parentElement, depth = 0; !visible && node && depth < 4; node = node.parentElement, depth++) {
          visible = node.matches(':has(:focus-visible)') && indicated(node);
        }
        const id = `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${[...el.classList].join('.')} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}" ${el.getAttribute('href') ?? ''}`;
        return { id, visible, rect: el.getBoundingClientRect().width > 0 };
      });
      if (!info) break;
      if (seen.has(info.id)) break; // wrapped around
      seen.add(info.id);
      if (!info.visible && info.rect) invisible.push(info.id);
    }
    expect(seen.size).toBeGreaterThan(5);
    expect(invisible).toEqual([]);
  });
}

/** Interactive controls that must be comfortable touch targets (not inline text links). */
const TARGETS = [
  'header a',
  'header button',
  'nav a',
  '.footer__link',
  'main button',
  'main a.button',
  'main a[class*="button"]',
  'main .arrow-link',
  'main .tile',
  'input:not([type="checkbox"]):not([type="hidden"])',
  'select',
  'textarea',
].join(', ');

for (const route of routes.filter((r) => r.locale !== 'en' || r.page === 'home')) {
  test(`targets are at least 44x44: ${routeName(route)}`, async ({ page }, testInfo) => {
    await page.goto(route.path);
    if (isMobileProject(testInfo)) await page.getByTestId('menu-toggle').click();
    await settle(page);
    const small = await page.locator(TARGETS).evaluateAll((elements) =>
      elements
        .filter((el) => {
          const style = getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && !el.closest('p') && !el.classList.contains('skip-link');
        })
        .map((el) => ({ el, rect: el.getBoundingClientRect() }))
        .filter(({ rect }) => rect.width < 44 - 0.5 || rect.height < 44 - 0.5)
        .map(({ el, rect }) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}" ${Math.round(rect.width)}x${Math.round(rect.height)}`),
    );
    expect.soft(small).toEqual([]);

    // Checkbox: WCAG 2.5.8 minimum (24 px); its label is also clickable.
    const checkbox = page.locator('input[type="checkbox"]');
    if (route.page === 'contact') {
      const box = (await checkbox.boundingBox())!;
      testInfo.annotations.push({ type: 'checkbox-size', description: `${Math.round(box.width)}x${Math.round(box.height)}` });
      expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(24);
    }
  });
}

test('prefers-reduced-motion: no running animations or long transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const path of [pathFor('home', 'pl'), pathFor('advice', 'uk'), pathFor('contact', 'en')]) {
    await page.goto(path);
    await page.waitForTimeout(200);
    const report = await page.evaluate(() => {
      const long = (value: string) => value.split(',').some((part) => parseFloat(part) * (part.trim().endsWith('ms') ? 1 : 1000) > 10);
      const offenders: string[] = [];
      for (const el of document.querySelectorAll('body *')) {
        for (const pseudo of [null, '::before', '::after']) {
          const style = getComputedStyle(el, pseudo);
          const animated = style.animationName !== 'none' && long(style.animationDuration);
          const transition = style.transitionProperty !== 'none' && long(style.transitionDuration);
          if (animated || transition) {
            offenders.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')}${pseudo ?? ''} anim=${style.animationName}/${style.animationDuration} trans=${style.transitionDuration}`);
          }
        }
        if (offenders.length > 10) break;
      }
      const running = document
        .getAnimations()
        .filter((a) => a.playState === 'running' && Number(a.effect?.getComputedTiming().duration) > 10)
        .map((a) => `${(a as CSSAnimation).animationName ?? 'animation'} on ${(a.effect as KeyframeEffect)?.target?.className}`);
      return { offenders, running };
    });
    expect(report.offenders, path).toEqual([]);
    expect(report.running, path).toEqual([]);
  }
});

test('prefers-reduced-motion: an opened menu shows all its items at once (no staggered reveal)', async ({ page }, testInfo) => {
  const mobile = isMobileProject(testInfo);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(pathFor('rental', 'uk'));
  await page.waitForTimeout(300);
  // Count animation frames until every link in the opened menu/dropdown is visibility:visible.
  const frames = await page.evaluate(async (isMobile) => {
    const container = document.querySelector(isMobile ? '#site-menu' : '.lang__list')!;
    const links = [...container.querySelectorAll('a')];
    (document.querySelector(isMobile ? '[data-menu-toggle]' : '[data-lang-button]') as HTMLElement).click();
    for (let frame = 1; frame <= 30; frame++) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      if (links.every((link) => getComputedStyle(link).visibility === 'visible')) return frame;
    }
    return 999;
  }, mobile);
  testInfo.annotations.push({ type: 'frames-until-visible', description: String(frames) });
  // Without reduced motion this is 1 frame; the reduced-motion override must not make it slower.
  expect(frames, 'frames until all menu links are visible').toBeLessThanOrEqual(2);
});

for (const locale of ['pl', 'uk'] as const) {
  test(`every image has alt text and loads: ${locale}`, async ({ page }) => {
    const problems: string[] = [];
    for (const route of routes.filter((r) => r.locale === locale)) {
      await page.goto(route.path);
      await loadLazyContent(page);
      const images = await page.locator('img').evaluateAll((imgs) =>
        (imgs as HTMLImageElement[]).map((img) => ({
          src: img.currentSrc || img.src,
          alt: img.getAttribute('alt'),
          hidden: img.closest('[aria-hidden="true"]') !== null,
          ok: img.complete && img.naturalWidth > 0,
        })),
      );
      for (const image of images) {
        if (image.alt === null) problems.push(`${route.path}: missing alt on ${image.src}`);
        if (!image.ok) problems.push(`${route.path}: not loaded ${image.src}`);
      }
      // SVG icons are decorative or labelled.
      const unlabelled = await page.locator('svg:not([aria-hidden="true"])').evaluateAll((svgs) =>
        svgs
          .filter((svg) => !svg.closest('[aria-hidden="true"]') && !svg.getAttribute('aria-label') && !svg.getAttribute('aria-labelledby') && !svg.querySelector('title') && svg.getAttribute('role') !== 'presentation')
          .map((svg) => svg.outerHTML.slice(0, 80)),
      );
      for (const svg of unlabelled) problems.push(`${route.path}: svg without aria-hidden/label ${svg}`);
    }
    expect(problems).toEqual([]);
  });
}
