# RenHan pictograms

- Grid: `viewBox="0 0 48 48"`, no width/height; the glyph sits in a centred ~40×40 live area (4–44), strokes included.
- Root carries `fill="none" stroke-linecap="round" stroke-linejoin="round"`; strokes are 3.5 (details 2.6–3.2, chunky parts up to 8.4); figures are solid fills.
- Colours only through `var(--pg-ink, #002448)` (main), `var(--pg-teal, #0C849C)` (secondary), `var(--pg-gold, #C08430)` (one small accent). Dark mode: set them to `#F4F0E7` / `#4FBFD2` / `#DDAA5E`.
- Seated figures reuse the logo-mark paths (`src/assets/brand/logo-mark.svg`) scaled with `transform`; standing figures use a head of r 4.1 with limbs drawn as round-capped strokes of 7.2 / 5.4 / 4.4.
- Inline the SVG (it must inherit the CSS variables); `<img>` shows only the fallback colours. In `RingIcon`, size the glyph to ~64% of the ring to match the logo's icons.
- To add one: draw `<name>.svg` to these rules (no ids, `<style>`, text or external refs), add the name to `pictogramNames` in `index.ts`, and check it at 32 px and 128 px on light and navy backgrounds.
