// Single source of truth for localized URL slugs. Plain .mjs so astro.config.mjs can import it too.
// PageId -> slug per locale ('' = locale root).

export const locales = /** @type {const} */ (['pl', 'en', 'uk']);
export const defaultLocale = 'pl';

export const slugs = /** @type {const} */ ({
  home: { pl: '', en: '', uk: '' },
  offer: { pl: 'oferta', en: 'offer', uk: 'propozytsiia' },
  rental: { pl: 'wypozyczalnia', en: 'rental', uk: 'prokat' },
  advice: { pl: 'doradztwo', en: 'advice', uk: 'konsultatsii' },
  funding: { pl: 'dofinansowania', en: 'funding', uk: 'finansuvannia' },
  about: { pl: 'o-nas', en: 'about', uk: 'pro-nas' },
  contact: { pl: 'kontakt', en: 'contact', uk: 'kontakty' },
});

/**
 * @param {keyof typeof slugs} page
 * @param {(typeof locales)[number]} locale
 */
export function pathFor(page, locale) {
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  const slug = slugs[page][locale];
  return slug ? `${prefix}/${slug}/` : `${prefix}/`;
}
