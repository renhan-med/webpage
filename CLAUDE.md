# CLAUDE.md — RenHan MED website

Static company website for **RenHan MED spółka z o.o. — Centrum Niezależnego Życia** (sale and rental of rehabilitation
equipment, home accessibility products, advice on choosing equipment). Frontend only, no backend.
Read this file instead of the whole repo; open source files only for the part you change.

## Sources of truth
- `resources/renhan-oferta.pdf` — client spec (Polish). The ONLY source of facts for copy. Invent nothing:
  no prices, brands, models, statistics, reviews, certificates, named funding programmes, promises of funding.
- `resources/renhan-logo.png` — logo + 5 ring icons. Palette: navy `#002448`, teal `#0C849C`, gold `#C08430`.
- `DESIGN.md` — structural design model only (editorial rhythm, serif display 400, colour-block cards). Not the brand.
- `README.md` (root) is deliberately minimal, for people outside the company (public repo): what it is, the URL,
  4 commands, rights. Team/maintainer docs belong in `docs/README.md`, never in the root README.
- `docs/PLAN.md` — original plan (historical); `docs/README.md` — run/build/deploy docs for humans.

## Stack and commands
Astro 7 (static, `trailingSlash: 'always'`, `build.format: 'directory'`), TypeScript strict, plain CSS with tokens,
vanilla TS for interactivity (no UI framework). `astro-icon` + Phosphor (`ph:`) only for small UI icons.
Fonts self-hosted via Fontsource: Source Serif 4 (headings, `wght` files) and Onest (body). Both have Cyrillic.
`npm run dev` (:4321) · `npm run build` · `npm run check` (must stay 0 errors) · `npm test` (Playwright + axe on
system Chrome, `channel: 'chrome'`, builds and serves on :4373, ≈2 min). Never download Playwright browsers.
The user often runs their own `astro dev` on :4321 — don't kill it; use other ports.
Astro 7 is newer than model training data: check https://docs.astro.build before relying on an API.

## CI/CD
`.github/workflows/`: `integration.yml` (CI: PR/branches), `deployment.yml` (CD: push to master → tests → build → GitHub Pages),
`checks.yml` (reusable, parallel jobs: `astro check`, `npm audit --audit-level=high`, `npm test`; used by both).
Deploy `needs` the checks; never add `if: always()`. Docs-only pushes (`docs/**`, `**/*.md`) skip CI/CD; PRs always run
(required checks). Site is served from the custom-domain root (`renhan.pl`); no base-path support. `public/CNAME` is
ignored by the Actions deploy (domain set in Settings → Pages). Node from `.nvmrc`. Validate with actionlint locally.
Repo: github.com/renhan-med/webpage (public). Stay on TypeScript 6: `@astrojs/check` peers TS ^5||^6, TS 7 breaks
`npm ci`/`astro check` (Dependabot ignores TS majors). `pr-title.yml` needs `statuses: write` because of `wip: true`.

## Architecture (where things live)
- `src/site.mjs` — site origin (`SITE_URL` env, default `https://renhan.pl`); used by config, layout, tests.
- `src/i18n/slugs.mjs` — PageId → localized slug (single source; PL has no prefix, `/en/`, `/uk/`).
  `routes.ts` helpers, `sitemap.mjs` hreflang for the sitemap.
- `src/i18n/pl.ts` is the dictionary type; `en.ts`/`uk.ts` `satisfy` it. `index.ts` runs PL/UK through
  `typeset.ts` (non-breaking space after one-letter words: w, i, z / в, і, з). `fill.ts` = `{placeholder}` filling.
- `src/pages/[...path].astro` generates all 21 routes and maps PageId → `src/views/*View.astro`. `404.astro`
  is one PL page with EN/UK lines. `robots.txt.ts` is an endpoint.
- `src/layouts/BaseLayout.astro` — head (SEO, canonical, hreflang + x-default, OG, JSON-LD `MedicalBusiness` from
  `company.ts`), inline no-flash theme script, header, footer.
- `src/data/company.ts` — the ONLY place with company data (phone, e-mail, address, hours, NIP/KRS, map URLs).
  The map uses `address.mapQuery` ('Nakielska, Łochowice'), not the full address: Google doesn't know
  "1A" there and the full address jumps to Nakielska in Bydgoszcz. Swap in 'lat,lng' once the client gives a pin.
- `src/data/categories.ts` (offer departments + items) and `src/data/rental.ts` (rental equipment): adding an
  item/department is data-only. Every item has a `pictogram`; optional `image` field for future real photos.
- `src/assets/pictograms/*.svg` — 27 custom pictograms in the logo's style (48 grid, colours via
  `--pg-ink/teal/gold`); `index.ts` exports `PictogramName`. Inlined by `Pictogram.astro`, shown in `RingIcon`
  at ~64% of the ring. Weak glyphs (crutches, cushion, mattress, bath-board, ortho-comfort) always need a label.
- `src/assets/brand/` — `logo-mark.svg` (faithful vector, colours via `--logo-ink/teal/gold`), PNG lockups
  (+ `-on-dark`). The mark is defined once per page (`LogoSymbol`) and drawn with `<use>` (`LogoMark`).
- `src/styles/tokens.css` — all colour/type/spacing tokens, light + dark (`html[data-theme]`); `--menu-breakpoint`.
- `src/scripts/site.ts` (theme toggle, mobile menu, language dropdown), `src/scripts/contact-form.ts` (form).
- `tests/*.spec.ts` — routes/meta, console, language switcher, theme, mobile menu, contact form, a11y, responsive,
  visual (screenshots only). `tests/helpers.ts` derives routes from `slugs.mjs`; tests never hard-code copy.

## Behaviour contracts (don't break)
- Theme: `data-theme` on `<html>`, key `theme` in localStorage (try/catch), default = `prefers-color-scheme`.
- Language switcher goes to the SAME page in another locale; on the contact page it keeps `?topic=&item=`.
- Contact form: prefill via `?topic=equipment|rental|advice|funding|other&item=<id>` (lookups with `Object.hasOwn`,
  items keyed per topic). Changing the topic replaces the message only if it still equals the last generated text.
  Submit: `PUBLIC_FORM_ENDPOINT` → POST JSON, success only after 2xx; otherwise honest `mailto:` fallback. Never a fake
  "sent". Map: Google embed loads only after a click; "Wyznacz trasę" opens directions in a new tab.
- Fixed PL texts from the spec, verbatim: motto „Od dobrego wyboru zaczyna się niezależność.”, slogan „Przestrzeń bez
  barier.”, CTAs „Zapytaj o sprzęt”, „Umów doradztwo”, „Zapytaj o wypożyczenie”, „Zapytaj o dofinansowanie”.
- Funding copy must stay non-committal (depends on product type, client's situation, current programme rules).
- Copy voice: PL „Ty”, UK „ви”, EN British spelling. Plain, calm, no marketing filler.

## Design rules (agreed with the user)
- Equipment is shown with pictograms, NOT product photos (user decision). One stand-in lifestyle photo (home,
  "O RenHan MED"; CC BY-SA, credited in the footer from `src/assets/photos/credits.json`) awaits a client photo.
- Serif headings weight 400, tight tracking, `text-wrap: balance`; 18px body; gold only for ornaments (3:1 on light),
  `--gold-text` for small text. Light sections alternate with navy bands (dark-mode band `#173a63`).
- House outline motif only in page headers; hero = logo mark on a plate + 5-pictogram strip (from the logo).
- Accessibility is a client requirement: AA contrast both themes, ≥44–48px targets, visible focus, skip link,
  label-in-name (no aria-label that hides visible text), reduced motion = no transitions/animations.
- No scroll fade-ins, parallax, carousels, gradients-as-decoration, glassmorphism, emoji, purple.

## Status and open items
Release-ready (final review 2026-11-15: design 7.5/10, `npm test` 315 passed / 0 failed / 58 intentional skips).
- Client input: photo for the home "O RenHan MED" section (current one is a CC BY-SA stand-in that doesn't fit
  the pictogram system); exact map pin/coordinates for `mapQuery`; optional REGON; form endpoint if wanted.
- Logo label „Refundacje i formalności” vs the spec's „dofinansowania” wording — confirm with the client.
- Polish backlog (nits): home "Kontakt i dane firmy" left column leaves empty space at 1440 (sticky it);
  orphan last tile in 3-col offer grids (4 and 5 items); department ring repeats an item pictogram;
  page-header house walls cut off by the band edge; offer mobile: "Zapytaj o sprzęt" before the item list;
  long pages slightly monotonous (beige plate after plate, mostly 2-col splits).
- Rental terms/prices/regulations will come from the client — don't imply open-ended rental periods meanwhile.
