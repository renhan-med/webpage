# RenHan-med — dokumentacja dla zespołu

Statyczna strona firmowa w Astro 7: 7 podstron × 3 języki (PL, EN, UK), tryb jasny i ciemny.
Publikowana na GitHub Pages pod **https://renhan.pl** po przejściu testów w CI.

## Start

Wymagania: Node.js ≥ 22 (CI używa wersji z `.nvmrc`, obecnie 24), npm, Google Chrome (do testów).

```bash
npm ci
npm run dev        # http://localhost:4321
```

| Komenda | Co robi |
|---|---|
| `npm run dev` | serwer deweloperski z odświeżaniem |
| `npm run build` | build produkcyjny do `dist/` |
| `npm run preview` | podgląd zbudowanej strony z `dist/` |
| `npm run check` | sprawdzenie typów (`astro check`), musi być 0 błędów |
| `npm test` | build + testy e2e Playwright i axe (ok. 2–3 min) |
| `npm run test:ui` | testy w trybie interaktywnym |

## Praca z repozytorium

1. Nowa gałąź od `master`, zmiany, push → CI sprawdza gałąź.
2. Pull request do `master` z tytułem w formacie `feat: …`, `fix: …`, `docs: …`, `ci: …` lub `chore: …`.
3. Po zielonych kontrolach merge → strona publikuje się automatycznie (ok. 5 min).

Przed pushem warto uruchomić lokalnie `npm run check` i `npm test`.

## CI/CD (`.github/workflows/`)

| Plik | Kiedy | Co robi |
|---|---|---|
| `integration.yml` (CI) | pull request do `master`, push na inne gałęzie | kontrole → build (artefakt `dist`, 1 dzień) |
| `deployment.yml` (CD) | push na `master`, ręcznie | kontrole → build → publikacja na GitHub Pages → sprawdzenie, czy strona odpowiada |
| `checks.yml` | wywoływany przez CI i CD | równolegle: `astro check`, `npm audit` (high/critical), testy Playwright + axe |
| `pr-title.yml` | pull request | sprawdza format tytułu PR |

- Publikacja jest możliwa tylko po zielonych kontrolach. Nieudany test zatrzymuje wdrożenie.
- Zmiany wyłącznie w dokumentacji (`docs/`, pliki `.md`) nie uruchamiają CI dla pushy ani CD. Pull requesty są sprawdzane zawsze.
- Dependabot co tydzień otwiera PR z aktualizacjami npm i akcji GitHuba.

**Gdy testy w CI nie przejdą:** w przebiegu (zakładka Actions) pobierz artefakt `playwright-report` (raport HTML)
lub `test-results` (zrzuty ekranu i ślady), dostępne 3 dni.

**Ponowna publikacja bez zmian w kodzie:** Actions → „CD Pipeline for RenHan MED Web Page” → Run workflow → `master`.

## Konfiguracja

| Zmienna | Domyślnie | Znaczenie |
|---|---|---|
| `SITE_URL` | `https://renhan.pl` | adres strony (canonical, hreflang, sitemap, robots, OG). Może zawierać ścieżkę, np. `https://renhan-med.github.io/webpage` — wtedy wszystkie linki dostają prefiks `/webpage/` |
| `PUBLIC_FORM_ENDPOINT` | brak | adres, na który formularz wysyła JSON (POST). Bez niego formularz otwiera program pocztowy |

CD ustawia `SITE_URL` sam, na adres, pod którym GitHub Pages publikuje stronę: bez domeny
`https://renhan-med.github.io/webpage/`, po podpięciu domeny `https://renhan.pl/`. Ręcznie można go nadpisać zmienną
repozytorium `SITE_URL` (Settings → Variables → Actions).

## Jednorazowa konfiguracja GitHuba i domeny

1. Settings → General: `master` jako gałąź domyślna (środowisko `github-pages` przyjmuje wdrożenia tylko z niej).
2. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. Weryfikacja domeny `renhan.pl` w ustawieniach konta lub organizacji GitHub → Pages → Add a domain (rekord TXT u rejestratora).
4. Settings → Pages → Custom domain: `renhan.pl`. **Dopiero potem** DNS u rejestratora:
   - **A**: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - **AAAA**: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - opcjonalnie `www` → **CNAME** `<użytkownik>.github.io` (bez nazwy repozytorium); bez rekordów `*.renhan.pl`
5. Po propagacji DNS (do kilku godzin): Settings → Pages → **Enforce HTTPS**.
6. Settings → Branches → reguła dla `master`: wymagany pull request i statusy **Checks / Quality (astro check)**,
   **Checks / Dependency audit**, **Checks / Tests (Playwright + axe)** (pojawią się po pierwszym przebiegu CI).
7. Opcjonalnie: Settings → Environments → `github-pages` → ręczna akceptacja wdrożeń.

Pierwsza publikacja przed ustawieniem DNS się uda, ale końcowe sprawdzenie strony może pokazać ostrzeżenie (nie blokuje).

## Publikacja poza GitHub Pages

`npm run build` i wgranie zawartości `dist/` na dowolny hosting statyczny. Hosting powinien serwować `404.html`
dla nieznanych adresów. `public/CNAME` jest używany tylko przy publikacji z gałęzi, nie przez Actions.
