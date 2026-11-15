# RenHan MED — strona internetowa

Statyczna strona firmowa (Astro 7): 7 podstron × 3 języki (PL, EN, UK), tryb jasny i ciemny.

## Wymagania

- Node.js ≥ 22 (projekt rozwijany na Node 26), npm
- Do testów: zainstalowana przeglądarka Google Chrome (testy używają systemowego Chrome)

## Komendy

| Komenda | Co robi |
|---|---|
| `npm install` | instaluje zależności |
| `npm run dev` | serwer deweloperski → http://localhost:4321 |
| `npm run build` | build produkcyjny do `dist/` |
| `npm run preview` | podgląd zbudowanej strony z `dist/` |
| `npm run check` | sprawdzenie typów (`astro check`) |
| `npm test` | build + testy e2e Playwright i axe (≈ 2 min) |
| `npm run test:ui` | testy w trybie interaktywnym |

## Konfiguracja (zmienne środowiskowe)

| Zmienna | Domyślnie | Znaczenie |
|---|---|---|
| `SITE_URL` | `https://renhan.pl` | adres strony: canonical, hreflang, sitemap, robots, OG |
| `PUBLIC_FORM_ENDPOINT` | brak | adres, na który formularz wysyła JSON (POST). Bez niego formularz otwiera program pocztowy (`mailto:` na adres firmy) |

Przykład: `SITE_URL=https://test.renhan.pl npm run build`.

## Wdrożenie

Domyślnie: GitHub Pages przez CI/CD (sekcja niżej). Ręcznie: `npm run build` → wgrać zawartość `dist/` na dowolny hosting statyczny (Netlify, Cloudflare Pages, Vercel, serwer z nginx).
Hosting powinien serwować `404.html` dla nieznanych adresów. Adresy kończą się `/` (np. `/oferta/`).

## CI/CD i publikacja na GitHub Pages

Workflow w `.github/workflows/`:

| Plik | Kiedy | Co robi |
|---|---|---|
| `integration.yml` (CI) | pull request do `master`, push na inne gałęzie | kontrole (niżej) → build (artefakt `dist`) |
| `deployment.yml` (CD) | push na `master`, ręcznie (Actions → Run workflow) | te same kontrole → build → publikacja na GitHub Pages → kontrola, czy strona odpowiada |
| `checks.yml` | wywoływany przez oba powyższe | równolegle: `astro check`, `npm audit` (błędy high/critical), testy Playwright + axe |

Zmiany wyłącznie w dokumentacji (`docs/`, pliki `.md`) nie uruchamiają CD ani CI dla pushy (pull requesty zawsze są sprawdzane).
| `pr-title.yml` | pull request | tytuł PR w formacie `feat: …`, `fix: …`, `docs: …`, `ci: …`, `chore: …` |

Publikacja jest możliwa tylko po zielonych testach (`deploy` czeka na `build`, a ten na `test`). Raport Playwright jest
w artefaktach przebiegu (7 dni). `.github/dependabot.yml` co tydzień proponuje aktualizacje npm i akcji.

**Jednorazowa konfiguracja na GitHubie:**

1. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
2. Zweryfikować domenę `renhan.pl` na koncie GitHub (ustawienia konta/organizacji → Pages → Add a domain, rekord TXT
   u rejestratora) — zalecenie GitHuba przeciw przejęciu domeny.
3. Settings → Pages → Custom domain: `renhan.pl`, zapisać. **Dopiero potem** ustawić DNS (kolejność ważna dla bezpieczeństwa).
4. DNS u rejestratora domeny (domena główna): rekordy **A** `185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
   `185.199.111.153` oraz **AAAA** `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`,
   `2606:50c0:8003::153`. Opcjonalnie `www`: rekord **CNAME** → `<użytkownik>.github.io` (bez nazwy repozytorium).
   Bez rekordów wildcard (`*.renhan.pl`). Propagacja może trwać do kilku godzin; potem włączyć **Enforce HTTPS**.
5. Settings → Branches → reguła dla `master`: wymagaj pull requesta i statusów **Checks / Quality (astro check)**,
   **Checks / Dependency audit** oraz **Checks / Tests (Playwright + axe)** (pojawią się po pierwszym przebiegu CI).
6. `master` musi być gałęzią domyślną repozytorium (Settings → General): środowisko `github-pages` domyślnie
   przyjmuje wdrożenia tylko z gałęzi domyślnej. Środowisko powstaje samo; w Settings → Environments można dodać ręczną akceptację wdrożeń.

Strona musi działać pod **korzeniem domeny** (`https://renhan.pl/`): wszystkie linki i zasoby są względem korzenia
(`/oferta/`, `/_astro/…`), więc adres projektu `https://<użytkownik>.github.io/<repo>/` nie zadziała. Plik `public/CNAME`
GitHub przy wdrożeniu przez Actions ignoruje (domenę ustawia się w Settings → Pages); zostaje jako zapis domeny dla innych hostingów. Adres w canonical/sitemap
można zmienić zmienną repozytorium `SITE_URL` (Settings → Variables → Actions); domyślnie `https://renhan.pl`.

**Ponowne wdrożenie bez zmian w kodzie:** Actions → „CD Pipeline for RenHan MED Web Page” → Run workflow (gałąź `master`).
Pierwsza publikacja przed ustawieniem DNS się uda, ale kontrola końcowa (nieblokująca) może pokazać ostrzeżenie.

## Najczęstsze zmiany

- **Dane firmy** (telefon, e-mail, adres, godziny, NIP/KRS): `src/data/company.ts` — jedyne miejsce, zmiana działa na całej stronie i w danych dla Google.
- **Sprzęt w wypożyczalni:** dopisać obiekt w `src/data/rental.ts` (nazwa, zastosowanie w 3 językach, piktogram).
- **Działy i pozycje oferty:** `src/data/categories.ts`.
- **Teksty stron:** `src/i18n/pl.ts` (wzorzec), `en.ts`, `uk.ts` — TypeScript pilnuje, by żadnego tekstu nie brakowało.
- **Adresy podstron:** `src/i18n/slugs.mjs`.
- **Kolory i typografia:** `src/styles/tokens.css` (motyw jasny i ciemny).
- **Piktogramy sprzętu:** `src/assets/pictograms/` (zasady w tamtejszym `README.md`).

## Do uzupełnienia przed startem

- Zdjęcie w sekcji „O RenHan MED” na stronie głównej jest zastępcze (Wikimedia Commons, CC BY-SA 4.0, podpis w stopce) — podmienić na własne.
- Endpoint formularza (`PUBLIC_FORM_ENDPOINT`), jeśli formularz ma wysyłać wiadomości bez programu pocztowego.
- REGON (opcjonalnie) w `company.ts`.
