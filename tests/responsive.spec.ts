import { expect, test, type Page } from '@playwright/test';
import { locales, pathFor, routeName, routes, settle } from './helpers';

/** No horizontal overflow from 320 to 1440 px (PL + UK), and a single-row, unclipped desktop header. */

const widths = [320, 390, 768, 1024, 1280, 1440];

async function overflow(page: Page) {
  return page.evaluate(() => {
    const viewport = document.documentElement.clientWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    const culprits: string[] = [];
    if (scrollWidth > viewport) {
      for (const el of document.querySelectorAll('body *')) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && (rect.right > viewport + 1 || rect.left < -1)) {
          // Report the outermost offenders only.
          const parent = el.parentElement?.getBoundingClientRect();
          if (!parent || !(parent.right > viewport + 1 || parent.left < -1)) {
            culprits.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList.length ? '.' + [...el.classList].join('.') : ''} right=${Math.round(rect.right)}`);
          }
        }
        if (culprits.length >= 5) break;
      }
    }
    return { scrollWidth, viewport, culprits };
  });
}

for (const route of routes.filter((r) => r.locale === 'pl' || r.locale === 'uk')) {
  test(`no horizontal overflow 320-1440: ${routeName(route)}`, async ({ page }) => {
    const failures: string[] = [];
    await page.setViewportSize({ width: widths[0], height: 800 });
    await page.goto(route.path);
    for (const width of widths) {
      await page.setViewportSize({ width, height: 800 });
      await page.waitForTimeout(50);
      const result = await overflow(page);
      if (result.scrollWidth > result.viewport) {
        failures.push(`${width}px: scrollWidth ${result.scrollWidth} > ${result.viewport} :: ${result.culprits.join(' | ')}`);
      }
    }
    expect(failures).toEqual([]);
  });
}

for (const locale of locales) {
  test(`desktop header is one row and nothing is clipped (1024-1440): ${locale}`, async ({ page }) => {
    const failures: string[] = [];
    await page.goto(pathFor('contact', locale));
    await settle(page);
    for (const width of [1024, 1100, 1199, 1200, 1280, 1340, 1360, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForTimeout(80);
      const report = await page.evaluate(() => {
        const header = document.querySelector<HTMLElement>('[data-header]')!;
        const bar = header.querySelector<HTMLElement>('.header__bar')!;
        const expected = parseFloat(getComputedStyle(bar).minHeight);
        const height = header.getBoundingClientRect().height;
        const visible = [...header.querySelectorAll<HTMLElement>('a, button, .logo__name, .logo__descriptor')].filter((el) => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && getComputedStyle(el).visibility !== 'hidden' && rect.bottom <= height + 2 && !el.closest('.lang__list');
        });
        const clipped = visible
          .filter((el) => el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow !== 'visible')
          .map((el) => `${el.className} "${el.textContent?.trim().slice(0, 20)}"`);
        // Top-level items of the bar must not overlap each other.
        const boxes = visible
          .filter((el) => el.matches('.header__logo, .header__link, .lang__button, .theme-toggle, .header__cta, .header__toggle'))
          .map((el) => ({ name: `${el.className.split(' ')[0]} "${el.textContent?.trim().slice(0, 14)}"`, r: el.getBoundingClientRect() }));
        const overlaps: string[] = [];
        for (let i = 0; i < boxes.length; i++)
          for (let j = i + 1; j < boxes.length; j++) {
            const a = boxes[i].r;
            const b = boxes[j].r;
            if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) overlaps.push(`${boxes[i].name} x ${boxes[j].name}`);
          }
        const links = [...header.querySelectorAll<HTMLElement>('.header__nav .header__link')].filter((el) => el.getBoundingClientRect().width > 0);
        const tops = new Set(links.map((el) => Math.round(el.getBoundingClientRect().top)));
        const multiline = links.filter((el) => el.getBoundingClientRect().height > 60).map((el) => el.textContent?.trim());
        return { height, expected, clipped, overlaps, rows: tops.size, multiline, desktop: links.length > 0 && innerWidth >= 1200 };
      });
      if (report.height > report.expected + 2) failures.push(`${width}px: header ${report.height}px > ${report.expected}px`);
      if (report.clipped.length) failures.push(`${width}px: clipped ${report.clipped.join(', ')}`);
      if (report.overlaps.length) failures.push(`${width}px: overlap ${report.overlaps.join(', ')}`);
      if (report.desktop && report.rows > 1) failures.push(`${width}px: nav wraps onto ${report.rows} rows`);
      if (report.desktop && report.multiline.length) failures.push(`${width}px: multi-line nav links ${report.multiline.join(', ')}`);
    }
    expect(failures).toEqual([]);
  });
}
