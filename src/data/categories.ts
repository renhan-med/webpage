import type { ImageMetadata } from 'astro';
import type { PictogramName } from '../assets/pictograms';
import type { Localized } from '../i18n/config';
import { typesetData } from '../i18n/typeset';
import type { PageId } from '../i18n/routes';

/**
 * Offer departments. To add one, append an object here: the offer page,
 * the home page list and the contact-form prefill pick it up automatically.
 */
export interface CategoryItem {
  name: Localized;
  pictogram?: PictogramName;
}

export interface Category {
  /** Stable id: used as the `#anchor` on the offer page and as `?item=` in the contact form. */
  id: string;
  /** RenHan pictogram for the department (src/assets/pictograms). */
  pictogram: PictogramName;
  name: Localized;
  /** One sentence: what the department is for. */
  summary: Localized;
  /**
   * Product types in the department (types, not brands or models), each with its pictogram.
   * Without `pictogram`, the item shows the department's pictogram.
   */
  items: CategoryItem[];
  /** Set when the department has its own page: the section then links there instead of the form. */
  page?: PageId;
  /** Optional photo shown with the department on the offer page (credit it in src/assets/photos/credits.json). */
  image?: ImageMetadata;
  /** Alt text for the photo (required when `image` is set). */
  imageAlt?: Localized;
}

export const categories: Category[] = typesetData([
  {
    id: 'mobility',
    pictogram: 'mobility',
    name: {
      pl: 'Mobilność',
      en: 'Mobility',
      uk: 'Мобільність',
    },
    summary: {
      pl: 'Sprzęt, który wspiera poruszanie się w domu i poza nim.',
      en: 'Equipment that helps with getting around, at home and outside.',
      uk: 'Обладнання, яке допомагає пересуватися вдома і поза домом.',
    },
    items: [
      { name: { pl: 'Wózki', en: 'Wheelchairs', uk: 'Крісла колісні' }, pictogram: 'wheelchair' },
      { name: { pl: 'Balkoniki', en: 'Walking frames', uk: 'Ходунки' }, pictogram: 'walking-frame' },
      { name: { pl: 'Chodziki', en: 'Rollators', uk: 'Ролятори' }, pictogram: 'rollator' },
      { name: { pl: 'Kule', en: 'Crutches', uk: 'Милиці' }, pictogram: 'crutches' },
      { name: { pl: 'Laski', en: 'Walking sticks', uk: 'Тростини' }, pictogram: 'cane' },
      {
        name: {
          pl: 'Inne rozwiązania wspierające poruszanie się',
          en: 'Other mobility aids',
          uk: 'Інші засоби для пересування',
        },
        pictogram: 'mobility',
      },
    ],
  },
  {
    id: 'rehabilitation',
    pictogram: 'rehab-care',
    name: {
      pl: 'Rehabilitacja i sprzęt pomocniczy',
      en: 'Rehabilitation and care equipment',
      uk: 'Реабілітація та допоміжне обладнання',
    },
    summary: {
      pl: 'Wyposażenie do rehabilitacji i codziennej opieki nad bliską osobą.',
      en: 'Equipment for rehabilitation and for everyday care of a family member.',
      uk: 'Обладнання для реабілітації та щоденного догляду за близькою людиною.',
    },
    items: [
      { name: { pl: 'Łóżka rehabilitacyjne', en: 'Care beds', uk: 'Реабілітаційні ліжка' }, pictogram: 'care-bed' },
      { name: { pl: 'Podnośniki', en: 'Patient hoists', uk: 'Підйомники' }, pictogram: 'hoist' },
      { name: { pl: 'Sprzęt do transferu', en: 'Transfer aids', uk: 'Засоби для переміщення' }, pictogram: 'transfer' },
      {
        name: {
          pl: 'Wyposażenie wspierające opiekę',
          en: 'Other care equipment',
          uk: 'Обладнання для догляду',
        },
        pictogram: 'rehab-care',
      },
    ],
  },
  {
    id: 'orthopaedics',
    pictogram: 'orthosis',
    name: {
      pl: 'Ortopedia i komfort',
      en: 'Orthopaedics and comfort',
      uk: 'Ортопедія та комфорт',
    },
    summary: {
      pl: 'Produkty ortopedyczne i wyposażenie, które ułatwia codzienne funkcjonowanie.',
      en: 'Orthopaedic products and items that make everyday life easier.',
      uk: 'Ортопедичні вироби та речі, які полегшують повсякденне життя.',
    },
    items: [
      { name: { pl: 'Ortezy', en: 'Orthoses', uk: 'Ортези' }, pictogram: 'orthosis' },
      { name: { pl: 'Stabilizatory', en: 'Braces and supports', uk: 'Фіксатори' }, pictogram: 'wrist-brace' },
      { name: { pl: 'Wyroby uciskowe', en: 'Compression garments', uk: 'Компресійні вироби' }, pictogram: 'compression' },
      { name: { pl: 'Poduszki', en: 'Cushions', uk: 'Подушки' }, pictogram: 'cushion' },
      { name: { pl: 'Materace', en: 'Mattresses', uk: 'Матраци' }, pictogram: 'mattress' },
      {
        name: {
          pl: 'Produkty wspierające codzienne funkcjonowanie',
          en: 'Daily living aids',
          uk: 'Вироби для повсякденного побуту',
        },
        pictogram: 'ortho-comfort',
      },
    ],
  },
  {
    id: 'home',
    pictogram: 'bathroom',
    name: {
      pl: 'Łazienka i dom bez barier',
      en: 'Bathroom and barrier-free home',
      uk: 'Ванна кімната і дім без бар’єрів',
    },
    summary: {
      pl: 'Wyposażenie, które zwiększa bezpieczeństwo i samodzielność w domu.',
      en: 'Fittings that make the home safer and help people manage on their own.',
      uk: 'Обладнання, яке робить дім безпечнішим і допомагає бути самостійнішим.',
    },
    items: [
      { name: { pl: 'Uchwyty', en: 'Grab rails', uk: 'Поручні' }, pictogram: 'grab-rail' },
      { name: { pl: 'Krzesełka', en: 'Shower chairs', uk: 'Стільці для ванної' }, pictogram: 'shower-chair' },
      { name: { pl: 'Taborety', en: 'Shower stools', uk: 'Табурети для ванної' }, pictogram: 'stool' },
      {
        name: {
          pl: 'Rozwiązania do wanny i prysznica',
          en: 'Bath and shower aids',
          uk: 'Пристосування для ванни й душу',
        },
        pictogram: 'bath-board',
      },
      {
        name: {
          pl: 'Wyposażenie zwiększające bezpieczeństwo i samodzielność',
          en: 'Fittings for safety and independence',
          uk: 'Обладнання для безпеки й самостійності',
        },
        pictogram: 'home-safety',
      },
    ],
  },
  {
    id: 'rental',
    pictogram: 'rental',
    name: {
      pl: 'Wypożyczalnia',
      en: 'Rental',
      uk: 'Прокат',
    },
    summary: {
      pl: 'Sprzęt dostępny do czasowego użytkowania. O aktualną listę zapytaj.',
      en: 'Equipment available for temporary use. Ask us for the current list.',
      uk: 'Обладнання для тимчасового користування. Актуальний перелік уточнюйте в нас.',
    },
    items: [],
    page: 'rental',
  },
]);
