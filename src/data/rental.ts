import type { ImageMetadata } from 'astro';
import type { PictogramName } from '../assets/pictograms';
import type { Localized } from '../i18n/config';
import { typesetData } from '../i18n/typeset';

/**
 * Rental equipment. To add an item, append an object here: the rental page and
 * the contact-form prefill pick it up automatically.
 * Items are equipment types, not brands or models (those come once suppliers are agreed).
 */
export interface RentalItem {
  /** Stable id, used as `?item=` in the contact form link. */
  id: string;
  /** Offer department the item belongs to (sets the card's tint), e.g. 'mobility'. */
  category: string;
  /** RenHan pictogram shown on the card (src/assets/pictograms). */
  pictogram: PictogramName;
  /**
   * Optional photo of the real equipment (none yet: equipment is shown with pictograms).
   * Import it at the top of this file and assign it here; credit stock photos in
   * src/assets/photos/credits.json:
   *   import bed from '../assets/photos/care-bed.jpg';
   *   image: bed,
   */
  image?: ImageMetadata;
  /** Alt text for the photo (required when `image` is set). */
  imageAlt?: Localized;
  name: Localized;
  /** One sentence: what the equipment is used for. */
  use: Localized;
  /** Availability note. Leave out to show the default "Ask about availability". */
  availability?: Localized;
}

export const rentalItems: RentalItem[] = typesetData([
  {
    id: 'wheelchair',
    category: 'mobility',
    pictogram: 'wheelchair',
    name: { pl: 'Wózek', en: 'Wheelchair', uk: 'Крісло колісне' },
    use: {
      pl: 'Do poruszania się w domu i poza nim, gdy chodzenie jest utrudnione.',
      en: 'For getting around at home and outside when walking is difficult.',
      uk: 'Для пересування вдома і поза домом, коли ходити важко.',
    },
  },
  {
    id: 'walking-frame',
    category: 'mobility',
    pictogram: 'walking-frame',
    name: { pl: 'Balkonik lub chodzik', en: 'Walking frame or rollator', uk: 'Ходунки або ролятор' },
    use: {
      pl: 'Daje stabilne podparcie przy wstawaniu i chodzeniu.',
      en: 'Gives steady support when standing up and walking.',
      uk: 'Дають стійку опору, коли людина встає і ходить.',
    },
  },
  {
    id: 'crutches',
    category: 'mobility',
    pictogram: 'crutches',
    name: { pl: 'Kule', en: 'Crutches', uk: 'Милиці' },
    use: {
      pl: 'Odciążają nogę podczas chodzenia.',
      en: 'Take weight off a leg while walking.',
      uk: 'Зменшують навантаження на ногу під час ходьби.',
    },
  },
  {
    id: 'care-bed',
    category: 'rehabilitation',
    pictogram: 'care-bed',
    name: { pl: 'Łóżko rehabilitacyjne', en: 'Care bed', uk: 'Реабілітаційне ліжко' },
    use: {
      pl: 'Ułatwia zmianę pozycji i opiekę nad osobą, która dużo leży.',
      en: 'Makes it easier to change position and to care for someone who spends a lot of time in bed.',
      uk: 'Полегшує зміну положення тіла та догляд за людиною, яка багато лежить.',
    },
  },
  {
    id: 'hoist',
    category: 'rehabilitation',
    pictogram: 'hoist',
    name: { pl: 'Podnośnik', en: 'Patient hoist', uk: 'Підйомник' },
    use: {
      pl: 'Pomaga bezpiecznie podnieść i przenieść osobę, która nie wstaje samodzielnie.',
      en: 'Helps you lift and move a person safely when they cannot stand up on their own.',
      uk: 'Допомагає безпечно підняти й перемістити людину, яка не встає самостійно.',
    },
  },
  {
    id: 'transfer',
    category: 'rehabilitation',
    pictogram: 'transfer',
    name: { pl: 'Sprzęt do transferu', en: 'Transfer aids', uk: 'Засоби для переміщення' },
    use: {
      pl: 'Ułatwia przesiadanie się, na przykład z łóżka na wózek.',
      en: 'Make it easier to move from one seat to another, for example from bed to wheelchair.',
      uk: 'Полегшують пересаджування, наприклад із ліжка на крісло колісне.',
    },
  },
]);
