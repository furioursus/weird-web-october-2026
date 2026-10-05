# Sharing

Pages are listed on the [#weirdweboctober](https://octothorp.es/~/weirdweboctober) feed once the domain is registered at [octothorp.es/register](https://octothorp.es/register). The production URL is set in `astro.config.ts` and has to match the deployed domain.

For search engines and link previews, `src/components/Seo.astro` renders every page's head tags in one place: title, description, canonical URL, icons, Open Graph and Twitter card. The calendar uses `public/weird-web-october-og-image.png` (1200×630) as its preview image; every day gets its own generated card (below). A day's description is the `description` prop on `<Day>`; leave it out and the layout falls back to the day number and theme.

## Favicon

The favicon is the eye from Zur's Weirding, kept at its original 236px in `src/assets/favicon-eye.png`. `scripts/favicon.mjs` (`npm run icons -- --write`) builds `public/favicon.ico` (16, 32 and 48px), `public/icon-192.png` and `public/apple-touch-icon.png` (180px, flattened onto the calendar's ink because iOS fills transparent corners anyway). They're saved as palette PNGs, which keeps all three around 25KB or less; full-color PNGs of the painted texture were up to 95KB.

## Preview cards

Each built day gets a 1200×630 JPEG card at `/<slug>/og.jpg`, generated at build time: the day's number on a torn scrap of the calendar's pink felt, over the calendar's dark background, with the theme, the page's name and one short line beside it, and "Weird Web October · Day N" above the URL.

- **The words** live in `src/data/cards.ts`: a `title` (the page's own name) and a `line` (about 60 characters, clamped to two lines) per day. Keep the line different from the page's `description`, since previews show the card and the description side by side. A day without an entry still gets a card, with just its number and theme. The alt text is built from the same words in `src/layouts/Day.astro`.
- **The layout** is `src/lib/og-card.ts`. Satori lays out the text as paths (Rubik Mono One and Space Mono, read from their Fontsource packages' `.woff` files, since Satori can't read WOFF2), so nothing depends on fonts installed on the build machine. sharp renders the torn felt (the calendar's turbulence filter, scaled up and seeded by the day, so no two scraps tear alike) and the final JPEG. The theme shrinks to fit the column; `RUBIK_ADVANCE` is Rubik Mono One's glyph width in ems, which that math relies on.
- **Satori's quirks:** every box with more than one child needs `display: flex`, and a lone text child has to be a bare string (the only kind `lineClamp` works on). The `h()` helper handles both.
- **JPEG, not PNG:** the background texture made a PNG card about 920KB; the JPEG is about 120KB.
- **The release gate covers them.** The endpoint is `src/pages/[slug]/og.jpg.ts`, inside each day's folder, so the gate deletes an unreleased day's card along with its page. Each card takes about half a second to render. `@astrojs/sitemap` writes `sitemap-index.xml` on every build (new days are added automatically) and `public/robots.txt` points to it. `netlify.toml` 301-redirects the default `weird-web-october-2026.netlify.app` address to the real domain.
