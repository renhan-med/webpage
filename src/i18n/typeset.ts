import { locales, type Locale } from './config';

/**
 * Polish and Ukrainian typography: a one-letter word (w, i, z / в, і, з …) must not end a line,
 * so it is joined to the next word with a non-breaking space.
 */
const oneLetterWords: Partial<Record<Locale, RegExp>> = {
  pl: /(^|[\s(„«])([aiouwzAIOUWZ]) /g,
  uk: /(^|[\s(„«])([аійвузоАІЙВУЗО]) /g,
};

export function typesetText(text: string, locale: Locale): string {
  const pattern = oneLetterWords[locale];
  // Applied twice so that two one-letter words in a row ("i w") are both joined.
  return pattern ? text.replace(pattern, '$1$2 ').replace(pattern, '$1$2 ') : text;
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype;

const isLocalized = (value: Record<string, unknown>) => locales.every((locale) => typeof value[locale] === 'string');

function walk(value: unknown, locale: Locale | null): unknown {
  if (typeof value === 'string') return locale ? typesetText(value, locale) : value;
  if (Array.isArray(value)) return value.map((item) => walk(item, locale));
  // Image metadata from astro:assets is passed through untouched.
  if (!isPlainObject(value) || 'src' in value) return value;
  if (!locale && isLocalized(value)) {
    return { ...value, ...Object.fromEntries(locales.map((code) => [code, typesetText(value[code] as string, code)])) };
  }
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, walk(item, locale)]));
}

/** Typesets every string of a dictionary written in one language. */
export function typesetDictionary<T>(dictionary: T, locale: Locale): T {
  return walk(dictionary, locale) as T;
}

/** Typesets every `{ pl, en, uk }` text inside site data (categories, rental items). */
export function typesetData<T>(data: T): T {
  return walk(data, null) as T;
}
