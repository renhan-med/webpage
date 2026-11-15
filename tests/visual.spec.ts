import path from 'node:path';
import { test } from '@playwright/test';
import { isMobileProject, loadLazyContent, pathFor, pageIds, presetTheme, settle } from './helpers';

/**
 * Visual smoke: full-page screenshots as artifacts (no baseline assertions) of every Polish page
 * and the Ukrainian home, at 390 (mobile project) and 1440 (desktop project), in both themes.
 * Output: $SCREENSHOT_DIR, or this test's output folder under test-results/.
 */

const targets = [...pageIds.map((page) => ({ name: `pl-${page}`, path: pathFor(page, 'pl') })), { name: 'uk-home', path: pathFor('home', 'uk') }];

for (const { name, path: url } of targets) {
  for (const theme of ['light', 'dark'] as const) {
    test(`screenshot ${name} ${theme}`, async ({ page }, testInfo) => {
      const width = isMobileProject(testInfo) ? 390 : 1440;
      await presetTheme(page, theme);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(url);
      await loadLazyContent(page);
      await settle(page);
      const dir = process.env.SCREENSHOT_DIR ?? testInfo.outputDir;
      // scale: 'css' keeps 2x mobile captures under Chrome's 16384 px capture limit (taller ones repeat the top).
      await page.screenshot({ path: path.join(dir, `${name}-${width}-${theme}.png`), fullPage: true, scale: 'css' });
    });
  }
}

for (const locale of ['pl', 'uk'] as const) {
  for (const theme of ['light', 'dark'] as const) {
    test(`screenshot open menu ${locale} ${theme}`, async ({ page }, testInfo) => {
      const mobile = isMobileProject(testInfo);
      await presetTheme(page, theme);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(pathFor('rental', locale));
      await page.getByTestId(mobile ? 'menu-toggle' : 'lang-switcher').click();
      await page.getByTestId('lang-link-en').waitFor({ state: 'visible' });
      await page.waitForTimeout(300);
      await settle(page);
      const dir = process.env.SCREENSHOT_DIR ?? testInfo.outputDir;
      await page.screenshot({ path: path.join(dir, `${locale}-${mobile ? 'menu-390' : 'lang-1440'}-${theme}.png`) });
    });
  }
}
