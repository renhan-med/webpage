import { locales, defaultLocale, type Locale } from './config';
import { slugs, pathFor } from './slugs.mjs';

export type PageId = keyof typeof slugs;
export const pageIds = Object.keys(slugs) as PageId[];

/** Pages shown in the main navigation, in order. `home` is the logo on desktop. */
export const navPages: PageId[] = ['home', 'offer', 'rental', 'advice', 'funding', 'about', 'contact'];

interface PathOptions {
  hash?: string;
  query?: Record<string, string | undefined>;
}

/** Site-relative URL of a page in a given language, e.g. `/uk/prokat/`. */
export function localizedPath(page: PageId, locale: Locale, { hash, query }: PathOptions = {}): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value) params.set(key, value);
  }
  const search = params.size ? `?${params}` : '';
  return `${pathFor(page, locale)}${search}${hash ? `#${hash}` : ''}`;
}

/** The same page in every language, plus `x-default` (Polish). */
export function alternates(page: PageId): { hreflang: string; path: string }[] {
  return [
    ...locales.map((locale) => ({ hreflang: locale as string, path: localizedPath(page, locale) })),
    { hreflang: 'x-default', path: localizedPath(page, defaultLocale) },
  ];
}

/** Every page × language, shaped for `getStaticPaths` of `pages/[...path].astro`. */
export function staticRoutes(): { path: string | undefined; locale: Locale; page: PageId }[] {
  return locales.flatMap((locale) =>
    pageIds.map((page) => ({
      path: localizedPath(page, locale).replace(/^\/|\/$/g, '') || undefined,
      locale,
      page,
    })),
  );
}

/** Link to the contact form with the topic (and optionally an item) preselected. */
export function contactPath(locale: Locale, topic: Topic, item?: string): string {
  return localizedPath('contact', locale, { query: { topic, item }, hash: 'form' });
}

export const topics = ['equipment', 'rental', 'advice', 'funding', 'other'] as const;
export type Topic = (typeof topics)[number];
