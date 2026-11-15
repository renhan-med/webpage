import type { Page, TestInfo } from '@playwright/test';
import { locales, defaultLocale, slugs, pathFor } from '../src/i18n/slugs.mjs';

export type Locale = (typeof locales)[number];
export type PageId = keyof typeof slugs;

export { locales, defaultLocale, pathFor };
export const pageIds = Object.keys(slugs) as PageId[];

/** The configured site origin: the same source as astro.config.mjs. */
// Origin only: route paths from pathFor() already carry the base path.
export { siteOrigin as SITE } from '../src/site.mjs';

export interface Route {
  page: PageId;
  locale: Locale;
  path: string;
}

/** Every page × locale (21 routes), from the route map in src/i18n/slugs.mjs. */
export const routes: Route[] = locales.flatMap((locale) =>
  pageIds.map((page) => ({ page, locale, path: pathFor(page, locale) })),
);

export const routeName = (route: Route) => `${route.locale}/${route.page} (${route.path})`;

export const isMobileProject = (testInfo: TestInfo) => testInfo.project.name === 'mobile';

/** Store a theme before any page script runs (the inline head script reads it). */
export async function presetTheme(page: Page, theme: 'light' | 'dark'): Promise<void> {
  await page.addInitScript((value) => {
    try {
      localStorage.setItem('theme', value);
    } catch {
      // ignore
    }
  }, theme);
}

/** Wait for web fonts and every finite CSS animation/transition to settle. */
export async function settle(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready;
    // Only time-based, finite animations (scroll-driven ones never "finish").
    const finite = document.getAnimations().filter((animation) => {
      const end = animation.effect?.getComputedTiming().endTime;
      return animation.timeline === document.timeline && Number.isFinite(Number(end));
    });
    await Promise.race([
      Promise.all(finite.map((animation) => animation.finished.catch(() => undefined))),
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ]);
  });
}

/** Scroll through the whole page so lazy images load, then return to the top. */
export async function loadLazyContent(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((resolve) => setTimeout(resolve, 100));
    const pending = [...document.images]
      .filter((image) => !image.complete)
      .map(
        (image) =>
          new Promise((resolve) => {
            image.addEventListener('load', resolve, { once: true });
            image.addEventListener('error', resolve, { once: true });
          }),
      );
    await Promise.race([Promise.all(pending), new Promise((resolve) => setTimeout(resolve, 5000))]);
    window.scrollTo(0, 0);
  });
}
