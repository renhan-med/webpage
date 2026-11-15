# Plan budowy strony RenHan MED

> Dokument historyczny (plan z początku prac). Aktualny stan opisują `CLAUDE.md` i `docs/README.md`.
> Zmiany względem planu: prawdziwe dane firmy i domena `https://renhan.pl` (zamiast wartości zastępczych),
> sprzęt pokazany autorskimi piktogramami zamiast zdjęć, hero bez ramy-domu, fonty `wght` zamiast `opsz`.

Źródła prawdy: `resources/renhan-oferta.pdf` (specyfikacja klienta), `resources/renhan-logo.png` (logo),
`DESIGN.md` (wzorzec systemu wizualnego — struktura, nie kolory ani marka).

## 1. Cel i zakres

Profesjonalna strona firmowa RenHan MED — Centrum Niezależnego Życia. Nie sklep.
Sam frontend, statyczny build. 7 podstron × 3 języki (PL domyślny, EN, UK), tryb jasny i ciemny.

Poza zakresem: backend, koszyk, ceny, regulamin wypożyczalni, konkretne marki i modele.

## 2. Stos

- Astro 7 (static output), TypeScript strict, zero frameworka UI, czysty CSS z tokenami (bez Tailwinda).
- Ikony: `astro-icon` + `@iconify-json/ph` (Phosphor, wariant duotone dla ikon treści, regular dla UI).
- Fonty lokalnie (Fontsource, bez Google Fonts — RODO): `Source Serif 4 Variable` (nagłówki),
  `Onest Variable` (tekst). Oba mają cyrylicę i latin-ext. Ładować tylko potrzebne osie i podzbiory.
- SEO: `@astrojs/sitemap`, hreflang, canonical, Open Graph, JSON-LD.
- Testy: `@playwright/test` na systemowym Chrome (`channel: 'chrome'`), `@axe-core/playwright`.
- Astro 7 jest nowsze niż wiedza modeli — przed użyciem API (i18n, obrazy, SVG, fonty) sprawdzić
  https://docs.astro.build lub typy w `node_modules/astro`.

## 3. Architektura

```
src/
  i18n/
    config.ts        # locales = ['pl','en','uk'], defaultLocale = 'pl', nazwy języków
    routes.ts        # PageId -> slug dla każdego języka; helpery: localizedPath(), alternates()
    pl.ts en.ts uk.ts# słowniki; pl.ts jest wzorcem typu (Dictionary = typeof pl), en/uk: `satisfies Dictionary`
    index.ts         # getDictionary(locale)
  data/
    company.ts       # JEDYNE miejsce z danymi firmy: telefon, e-mail, adres, godziny, mapa, rejestry
    categories.ts    # działy oferty (id, ikona, teksty per język, lista pozycji)
    rental.ts        # sprzęt w wypożyczalni (id, kategoria, ikona, opcjonalne zdjęcie, dostępność, teksty)
  layouts/BaseLayout.astro   # <head>, SEO, skrypt motywu (inline, przed renderem), header, footer
  components/        # Header, Footer, Logo, LanguageSwitcher, ThemeToggle, Button, RingIcon,
                     # SectionHeading, Card, HouseFrame, StepPath, ContactForm, ContactDetails, MapBlock...
  views/             # jeden komponent na podstronę: HomeView, OfferView, RentalView, AdviceView,
                     # FundingView, AboutView, ContactView (dostają `locale` i słownik)
  pages/[...path].astro      # getStaticPaths z routes.ts -> 21 stron; plus 404.astro
  styles/            # tokens.css (jasny + ciemny), base.css, utilities.css
  assets/brand/      # logo (właściciel: agent brand-assets)
  assets/photos/     # ewentualne zdjęcia zastępcze (właściciel: agent brand-assets)
tests/               # Playwright (właściciel: tester)
docs/                # dokumentacja
```

### Adresy URL (SEO, zlokalizowane slugi)

| PageId | pl (bez prefiksu) | en | uk |
|---|---|---|---|
| home | `/` | `/en/` | `/uk/` |
| offer | `/oferta/` | `/en/offer/` | `/uk/propozytsiia/` |
| rental | `/wypozyczalnia/` | `/en/rental/` | `/uk/prokat/` |
| advice | `/doradztwo/` | `/en/advice/` | `/uk/konsultatsii/` |
| funding | `/dofinansowania/` | `/en/funding/` | `/uk/finansuvannia/` |
| about | `/o-nas/` | `/en/about/` | `/uk/pro-nas/` |
| contact | `/kontakt/` | `/en/contact/` | `/uk/kontakty/` |

- `trailingSlash: 'always'`, `build.format: 'directory'`.
- `site` z env `SITE_URL`, domyślnie `https://renhan-med.example` (domena do podania przez klienta).
- Przełącznik języka prowadzi na TĘ SAMĄ podstronę w innym języku. Bez automatycznych przekierowań.
- Każda strona: `<html lang>`, unikalny `<title>` i opis, canonical, `hreflang` pl/en/uk + `x-default` (pl),
  OG, jeden `<h1>`, poprawna hierarchia nagłówków.
- JSON-LD `MedicalBusiness`/`LocalBusiness` generowany z `company.ts` (pomija puste pola).

### Rozszerzalność (wymóg klienta)

Dodanie produktu lub kategorii = dopisanie obiektu w `src/data/rental.ts` / `src/data/categories.ts`.
Żadnych zmian w komponentach. Typy wymuszają komplet tłumaczeń (`Record<Locale, string>`).

### Motyw

- `data-theme="light|dark"` na `<html>`; skrypt inline w `<head>` (bez mignięcia): localStorage → `prefers-color-scheme`.
- Przełącznik w nagłówku (przycisk z `aria-pressed`/czytelną etykietą), zapis w localStorage (try/catch).
- `color-scheme` ustawione zgodnie z motywem; `<meta name="theme-color">` aktualizowany.

### Formularz kontaktowy (bez backendu)

- Pola: imię, telefon, e-mail, temat (select: sprzęt / wypożyczenie / doradztwo / dofinansowanie / inne),
  wiadomość, zgoda na kontakt. Widoczne etykiety, `autocomplete`, `inputmode`, błędy pod polem, `aria-live`.
- Przyciski CTA na stronach linkują do `/kontakt/?topic=...&item=...` — formularz wstępnie ustawia temat i treść.
- Wysyłka: jeśli ustawiono `PUBLIC_FORM_ENDPOINT` → `fetch POST` (JSON) i komunikat sukcesu dopiero po odpowiedzi 2xx;
  jeśli nie → złożenie wiadomości przez `mailto:` na adres z `company.ts` z uczciwym komunikatem
  („Otworzyliśmy Twój program pocztowy…”). Nigdy fałszywe „wysłano”.
- Mapa: `company.map.embedUrl` puste → estetyczny blok zastępczy z adresem; ustawione → iframe ładowany po kliknięciu.

## 4. Kierunek wizualny

Koncepcja: **spokojny, redakcyjny dom** — układ i rytm z `DESIGN.md` (ciepłe płótno, szeryfowe nagłówki 400
z ujemnym trackingiem, bezszeryfowy tekst, karty-bloki koloru zamiast cieni, pasma jasne/ciemne na przemian,
skala promieni 8/12/16/pill, sekcje co 96 px, kontener 1200 px), w kolorach z logo RenHan MED:
granat, turkus, niebieski, szarość, złoty akcent. Nie kopiować marki Anthropic (koral, znak-gwiazdka, teksty).

### Tokeny (punkt wyjścia; kontrast WCAG AA jest obowiązkowy, korygować gdy trzeba)

| Token | Jasny | Ciemny |
|---|---|---|
| `--canvas` | `#FAF8F3` | `#08182D` |
| `--surface-soft` | `#F3EFE6` | `#0C2038` |
| `--surface-card` | `#ECE6D9` | `#112A47` |
| `--surface-band` (pasmo kontrastowe, stopka) | `#0A1F3C` | `#050F1E` |
| `--ink` (nagłówki) | `#0A2342` | `#F4F0E7` |
| `--body` | `#33415A` | `#C9D2E0` |
| `--muted` | `#5B667A` | `#94A1B5` |
| `--hairline` | `#E4DDCF` | `#1E3554` |
| `--primary` (CTA, linki) | `#0A6E82` | `#4FBFD2` |
| `--primary-active` | `#085668` | `#7AD3E2` |
| `--on-primary` | `#FFFFFF` | `#04202B` |
| `--gold` (ozdobniki, nie tekst) | `#C08430` | `#DDAA5E` |
| `--gold-text` (mały tekst akcentowy) | `#8A5A14` | `#E3B56F` |
| `--blue` (drugi akcent, oszczędnie) | `#1F5FA8` | `#7FB2EE` |
| `--on-band` / `--on-band-soft` | `#F6F2E9` / `#A9B4C6` | to samo |

Kolory logo (próbkowane): granat `#002448`, złoto `#C08430`, turkus `#0C849C`.
Złoto jest rzadkie: cienkie linie, łuki pierścieni, drobne znaczniki. Turkus = interakcja. Bez fioletu.

### Typografia

- Nagłówki: Source Serif 4, waga 400, `letter-spacing` −0.01…−0.025em, `font-optical-sizing: auto`;
  h1 `clamp(2.4rem, 5.2vw, 4.25rem)`, h2 `clamp(1.9rem, 3.4vw, 3rem)`. Nigdy pogrubione.
- Tekst: Onest 400/500; bazowo **18 px** (grupa docelowa: seniorzy, osoby słabowidzące), `line-height` 1.6,
  maks. szerokość akapitu ~65 znaków. Wszystko w `rem` (szanuje ustawienia przeglądarki).
- Nadtytuły: Onest 500, 13–14 px, wersaliki, tracking 0.12em, kolor `--gold-text`.

### Motywy przewodnie z logo (to one robią „design”)

1. **Rama-dom** (`HouseFrame`): kształt domu z logo (złota linia dachu i ścian) jako rama głównej ilustracji hero
   i ozdobnik sekcji. W środku: znak z logo w dużej skali albo zdjęcie.
2. **Ikona w pierścieniu** (`RingIcon`): ikona duotone w okręgu z granatowym pierścieniem i złotymi łukami —
   dokładnie jak pasek pięciu ikon w logo (Sprzedaż sprzętu, Wypożyczalnia, Refundacje i formalności,
   Dobór sprzętu, Dom bez barier).
3. **Fala** turkusowo-złota z logo jako delikatny separator (np. pod hero lub nad stopką).
4. **Złota linia z sercem** (`——♡——`) jako wyśrodkowany przerywnik.

### Ruch

Subtelny i celowy: jednorazowe wejście hero, hover (karta-link +2 px, przycisk „krok” i „wciśnięcie”,
rysowane podkreślenia linków), jedna animacja powiązana ze scrollem — linia postępu w „Ścieżce klienta”
(`animation-timeline: view()` jako progressive enhancement), przejścia między stronami przez
`@view-transition { navigation: auto; }`. Wszystko wyłączone przy `prefers-reduced-motion: reduce`.
Zakazane: fade-in każdej sekcji, parallax tekstu, karuzele, autoodtwarzanie.

### Dostępność (wymóg klienta, priorytet)

- Kontrast AA (tekst 4.5:1, duży tekst i elementy UI 3:1) w OBU motywach.
- Cele dotykowe ≥ 48 px, przyciski główne wysokości ≥ 52 px, odstępy między celami ≥ 8 px.
- Widoczny focus (3 px, offset), skip-link, landmarki, `aria-current="page"`, menu mobilne obsługiwane klawiaturą
  (Esc zamyka, focus wraca na przycisk), `aria-expanded`.
- Brak poziomego scrolla od 320 px; treść czytelna przy powiększeniu 200%.

## 5. Podstrony i treść

Treść wyłącznie ze specyfikacji. Niczego nie wymyślać: żadnych cen, marek, opinii, liczb, lat doświadczenia,
certyfikatów, nazw programów dofinansowań ani obietnic świadczeń. Styl: spokojny, konkretny, ciepły, prosty język.

Nagłówek: logo (znak + „RenHan MED” + „Centrum Niezależnego Życia”), nawigacja: Oferta · Wypożyczalnia ·
Doradztwo · Dofinansowania · O nas · Kontakt („Strona główna” = logo; pełna pozycja w menu mobilnym i stopce),
przełącznik języka (PL / EN / UK), przełącznik motywu, CTA „Umów doradztwo”. Menu mobilne poniżej ~1100 px.

Stopka (pasmo granatowe): logo, motto, nawigacja, dane kontaktowe i dane firmy (RenHan MED spółka z o.o.),
języki, ©.

1. **Strona główna**: hero (h1 = motto „Od dobrego wyboru zaczyna się niezależność.”, hasło „Przestrzeń bez barier.”,
   krótki opis, CTA „Zapytaj o sprzęt” + „Umów doradztwo”, wizual w ramie-domu) → 4 kafle (Sprzęt rehabilitacyjny /
   Wyposażenie domu / Wypożyczalnia / Doradztwo i dobór sprzętu) → krótko o RenHan MED → najważniejsze działy oferty →
   ścieżka klienta (pasmo granatowe, 5 kroków) → dofinansowania (informacja + CTA) → kontakt i dane firmy.
2. **Oferta**: 5 działów z danych (Mobilność; Rehabilitacja i sprzęt pomocniczy; Ortopedia i komfort;
   Łazienka i dom bez barier; Wypożyczalnia) z listami pozycji ze specyfikacji, kotwice `#id`, CTA „Zapytaj o sprzęt”.
3. **Wypożyczalnia**: krótkie zasady (bez cen i regulaminu — „warunki podajemy przy zapytaniu”), lista sprzętu z danych:
   nazwa, obraz (zdjęcie lub ilustracyjny kafel z ikoną), zastosowanie, dostępność (domyślnie „Zapytaj o dostępność”),
   przycisk „Zapytaj o wypożyczenie” (prefill formularza). Pozycje = typy sprzętu ze specyfikacji, nie modele.
4. **Doradztwo i dobór sprzętu**: „Nie sprzedajemy przypadkowego sprzętu. Pomagamy wybrać rozwiązanie.”,
   co uwzględnia dobór (potrzeby, możliwości, sposób użytkowania, warunki), 9 punktów zakresu, ścieżka 5 kroków,
   CTA „Umów doradztwo”.
5. **Dofinansowania**: informacyjnie, bez obietnic; od czego zależy (rodzaj produktu, sytuacja klienta,
   aktualne zasady programu); CTA „Zapytaj o dofinansowanie”.
6. **O nas**: Centrum Niezależnego Życia — cel; wartości (indywidualne podejście, fachowe doradztwo, dostępność,
   szacunek dla klienta); pięć filarów z logo w `RingIcon`.
7. **Kontakt**: telefon, e-mail, adres, godziny otwarcia, formularz, mapa. Dane = wartości zastępcze z `company.ts`
   (telefon `+48 000 000 000`, e-mail na domenie `.example`, adres i godziny „do uzupełnienia”) — lista w dokumentacji.

## 6. Zespół i pętla pracy

| Agent | Rola | Pisze do |
|---|---|---|
| programmer | implementacja całej strony, poprawki po rundach | `src/` (bez `assets/brand`, `assets/photos`), `public/`, konfiguracja |
| brand-assets | logo SVG + wersja na ciemne tło, favicony, obraz OG, ewentualne licencjonowane zdjęcia zastępcze | `src/assets/brand`, `src/assets/photos`, `public/` (ikony, OG) |
| reviewer | przegląd kodu, zgodności ze specyfikacją i jakości designu — tylko czyta | — |
| tester | testy Playwright + axe, przegląd zrzutów w 5 szerokościach i 2 motywach | `tests/`, `playwright.config.ts` |
| language-editor | korekta PL / EN / UK (naturalność, spójność terminologii, zgodność ze specyfikacją) | wartości tekstowe w `src/i18n`, `src/data` |

Pętla: (1) programmer ∥ brand-assets → (2) orkiestrator ogląda zrzuty i koryguje kierunek →
(3) reviewer ∥ tester ∥ language-editor → (4) programmer naprawia → (5) ponowny test i weryfikacja →
powtarzać 3–5 aż brak błędów krytycznych i poważnych → (6) `CLAUDE.md`, `docs/README.md`, pamięć.

## 7. Definicja ukończenia

- `npm run build` i `npm run check` bez błędów; 21 stron + 404 w `dist/`.
- `npm test` zielone: trasy, hreflang/meta, przełącznik języka i motywu (z zapamiętaniem), menu mobilne,
  walidacja i prefill formularza, brak poziomego scrolla (320–1440), brak błędów konsoli, axe bez naruszeń
  serious/critical w obu motywach.
- Zrzuty każdej podstrony (jasny + ciemny, 390 i 1440) obejrzane; brak nakładania, ucinania, pustych wizuali.
- Wszystkie teksty w 3 językach; brak wymyślonych faktów; dane zastępcze tylko w `company.ts`.
- `CLAUDE.md` i `docs/README.md` aktualne.
