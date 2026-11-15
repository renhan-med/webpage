import type { Locale } from './config';
import { pl, type Dictionary } from './pl';
import { en } from './en';
import { uk } from './uk';
import { typesetDictionary } from './typeset';

export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = {
  pl: typesetDictionary(pl, 'pl'),
  en,
  uk: typesetDictionary(uk, 'uk'),
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export { fill } from './fill';
