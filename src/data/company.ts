import type { Localized } from '../i18n/config';

/**
 * The ONLY place with company data. Pages, the footer, the map and the JSON-LD all read it.
 * Empty values ('' / null / []) are skipped on the site and in JSON-LD.
 */

interface Address {
  /** Street and number as written on letters, e.g. 'ul. Nakielska 1A'. */
  street: string;
  /** Village or town where the premises are. */
  locality: string;
  postalCode: string;
  /** Post office town for the postal code (in Poland it can differ from the locality). */
  postTown: string;
  /** ISO 3166-1 alpha-2 code. */
  country: string;
  /** Country name shown on the site. */
  countryName: Localized;
  /**
   * What the map embed and "directions" link search for. Google does not know the house number in
   * Łochowice: the full address resolves to Nakielska street in Bydgoszcz, while 'Nakielska, Łochowice'
   * finds the right street. Replace with 'lat,lng' coordinates (e.g. '53.1234,17.8765') or the
   * Google Business name once the client has a pin, for an exact location.
   */
  mapQuery?: string;
}

interface OpeningHours {
  /** Short day range shown on the site, e.g. { pl: 'pon.–pt.', en: 'Mon–Fri', uk: 'пн–пт' }. */
  days: Localized;
  /** schema.org day names for JSON-LD, e.g. ['Monday', 'Tuesday'] */
  schemaDays: string[];
  /** 24h times, e.g. '09:00'. Leave both out for a closed day range. */
  opens?: string;
  closes?: string;
}

interface Company {
  name: string;
  legalName: string;
  phone: { display: string; href: string };
  email: string;
  address: Address | null;
  hours: OpeningHours[];
  /** Tax and court register numbers. `nipDisplay` is the grouped form shown on the site. */
  registry: { nip: string; nipDisplay: string; regon: string; regonDisplay: string; krs: string };
}

export const company: Company = {
  name: 'RenHan-med',
  legalName: 'RenHan MED spółka z o.o.',
  phone: { display: '+48 736 215 287', href: 'tel:+48736215287' },
  email: 'biuro@renhan.pl',
  address: {
    street: 'ul. Nakielska 1A',
    locality: 'Łochowice',
    postalCode: '86-065',
    postTown: 'Łochowice',
    country: 'PL',
    countryName: { pl: 'Polska', en: 'Poland', uk: 'Польща' },
    mapQuery: 'Nakielska, Łochowice',
  },
  hours: [
    {
      days: { pl: 'pon.–pt.', en: 'Mon–Fri', uk: 'пн–пт' },
      schemaDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '17:00',
    },
    {
      days: { pl: 'sob.–niedz.', en: 'Sat–Sun', uk: 'сб–нд' },
      schemaDays: ['Saturday', 'Sunday'],
    },
  ],
  registry: { nip: '5543051139', nipDisplay: '554-305-11-39', regon: '545847467', regonDisplay: '545 847 467', krs: '0001269935' },
};

/** The address on one line, as a maps service expects it. */
export const addressLine = company.address
  ? `${company.address.street}, ${company.address.locality}, ${company.address.postalCode} ${company.address.postTown}`
  : '';

/** The search the maps service gets (see `Address.mapQuery`). */
const mapQuery = encodeURIComponent(company.address?.mapQuery || addressLine);

/** Google Maps links for the address: no API key; the embed loads only after a click (see MapBlock). */
export const maps = addressLine
  ? {
      place: `https://www.google.com/maps?q=${mapQuery}`,
      embed: `https://www.google.com/maps?q=${mapQuery}&output=embed`,
      directions: `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`,
    }
  : null;

/** '09:00' -> '9:00' for display. */
export const displayTime = (time: string) => time.replace(/^0(\d)/, '$1');

/** Registry numbers that are filled in, in display form. */
export const registryEntries = (labels: { nip: string; regon: string; krs: string }) =>
  [
    { label: labels.nip, value: company.registry.nipDisplay || company.registry.nip },
    { label: labels.regon, value: company.registry.regonDisplay || company.registry.regon },
    { label: labels.krs, value: company.registry.krs },
  ].filter((entry) => entry.value);
