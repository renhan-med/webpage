import { locales, defaultLocale as fallback } from './slugs.mjs';

export { locales };
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = fallback;

/** A string that must exist in every language. */
export type Localized = Record<Locale, string>;

/** Language names in their own language (shown in the switcher). */
export const localeNames: Localized = { pl: 'Polski', en: 'English', uk: 'Українська' };

/** Short labels for the switcher button. */
export const localeLabels: Localized = { pl: 'PL', en: 'EN', uk: 'UK' };

/** Open Graph locale codes. */
export const ogLocales: Localized = { pl: 'pl_PL', en: 'en_GB', uk: 'uk_UA' };

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
