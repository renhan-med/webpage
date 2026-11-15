import { locales, defaultLocale, slugs, pathFor } from './slugs.mjs';

/**
 * hreflang alternates for one sitemap entry, or undefined when the URL is not a known page.
 * @param {string} url absolute URL of the entry
 * @param {string} site configured site origin
 */
export function sitemapLinks(url, site) {
  const { pathname } = new URL(url);
  const pages = /** @type {(keyof typeof slugs)[]} */ (Object.keys(slugs));
  const page = pages.find((id) => locales.some((locale) => pathFor(id, locale) === pathname));
  if (!page) return undefined;
  const href = (/** @type {(typeof locales)[number]} */ locale) => new URL(pathFor(page, locale), site).href;
  return [
    ...locales.map((locale) => ({ lang: locale, url: href(locale) })),
    { lang: 'x-default', url: href(defaultLocale) },
  ];
}
