# Weird Web October 2026

A small, weird website every day of October, following the [Weird Web October](https://weirdweboctober.website/) themes. Each day has its own page, palette and fonts, and one of the cats is hidden somewhere on every one.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run new-day -- 5` | Scaffold day 5's page (`src/pages/05-sheet.astro`) |
| `npm run new-day -- 5 --cat dante` | Same, choosing which cat hides (default alternates by day) |
| `npm run new-day -- 5 --fonts "Special Elite,Inter"` | Same, with the page's fonts (first is body, second is headings); new ones are added to `src/fonts.ts` |
| `npm run build` | Build to `dist/` |
| `npm run font:typed` | Print the typewriter flaw table; add `-- --write` to regenerate the font (needs [uv](https://docs.astral.sh/uv/)) |
| `npm run check` | `astro check` plus Biome |

Restart `npm run dev` when `new-day` adds a font to `src/fonts.ts` (Astro only reads the font config at startup, so the new page fails with `FontFamilyNotFound`) and after any `npm install` (the running server can lose track of Sharp and every optimized image fails with `MissingSharp`).

## How it fits together

- `src/data/days.ts`: the 31 themes, in order. Theme names double as Octothorpes hashtags, so they match the official list exactly.
- `src/fonts.ts`: every font the site uses. They're self-hosted through Astro's Fonts API with the Fontsource provider, so nothing loads from Google's CDN. Each font is exposed as a CSS variable, e.g. `var(--font-special-elite)`. An entry with `src` is a font file in the repo, served by Astro's local provider instead of Fontsource. `astro.config.ts` casts those entries' options `as never`, because Astro can only type local-font options in a literal array, not a mapped one.
- `src/assets/fonts/special-elite-typed.woff2`: "Special Elite Typed", day 1's body font. It's Special Elite (Apache 2.0, from `@fontsource/special-elite`) with a few glyphs shifted up or down by a fixed amount, like bent typebars, and its hinting removed. `scripts/misalign-font.py` builds it; edit the `FLAWS` table there (offsets in px at 17px) and run `npm run font:typed -- --write`, then restart `npm run dev`.
- `src/layouts/Day.astro`: the shared shell. It renders the head tags through `src/components/Seo.astro`, adds both Octothorpes tags, loads only the fonts the page asks for, and renders a small prev/next nav. It ships no visual styles.
- `src/components/HiddenCat.astro`: the hidden cat. Position it with `style`, tint it with `color`. Finding it is remembered in `localStorage`, and the index shows the tally.
- `src/pages/index.astro`: the calendar. A day links up once its page file exists. It's styled as a photocopied zine in Rubik Mono One and Space Mono: each day is a torn paper scrap (two layers roughened by the inline `#torn-1` / `#torn-2` SVG filters), built days are pink, today's date is circled in marker (New York time), and a grain overlay covers the page.

## Formatting

Biome formats and lints everything, including the HTML in `.astro` files: `npm run format` writes, and `npm run check` fails on anything unformatted. Zed uses the same Biome through `.zed/settings.json`, which runs `node_modules/.bin/biome` as an external formatter, so no Zed extension is needed.

- **Full `.astro` formatting is experimental** in Biome 2.5: it needs `html.experimentalFullSupportEnabled` and `html.formatter.enabled` in `biome.json`. On an unformatted file it takes two passes to settle, then stays stable.
- **Prettier isn't used.** `prettier-plugin-astro` 1.0.0 puts line breaks inside inline elements, which adds visible whitespace (day 1's redaction highlights overhang their words), and it ignores `htmlWhitespaceSensitivity`.
- **Three lint rules are off on purpose**, scoped in `biome.json` overrides: `a11y/useSemanticElements` on day 1 (its redaction bars are `span role="button"` because a `<button>` can't wrap across lines), `a11y/noRedundantRoles` on the calendar (`role="list"` keeps list semantics in Safari once `list-style` is removed), and `complexity/noImportantStyles` in `.astro` files (the reduced-motion override needs `!important`).

## Days with dev shortcuts

Some days take a `?jump=` query parameter in `npm run dev` to skip ahead while testing. Production builds strip it.

| Day | Parameter | Skips to |
| --- | --- | --- |
| 1, Reveal | `?jump=unseal` | Every text redaction lifted, Exhibit A unsealed |
| 1, Reveal | `?jump=photo` | Exhibit A's cover lifted, Dante still a smudge |
| 1, Reveal | `?jump=dante` | The reveal and DECLASSIFIED slam, without saving the cat as found |

## Finding which file renders something

In `npm run dev`, Astro stamps every element in the page body with `data-astro-source-file` and `data-astro-source-loc` (line:column), so the browser's element inspector shows the file an element was typed in. Slotted markup names the page it was written in, not the layout it renders inside. For an opening tag that spans several lines, the line points at its closing `>`. Builds carry none of these attributes.

## Sharing

Pages are listed on the [#weirdweboctober](https://octothorp.es/~/weirdweboctober) feed once the domain is registered at [octothorp.es/register](https://octothorp.es/register). The production URL is set in `astro.config.ts` and has to match the deployed domain.

For search engines and link previews, `src/components/Seo.astro` renders every page's head tags in one place: title, description, canonical URL, Open Graph and Twitter card, with `public/weird-web-october-og-image.png` (1200×630) as the preview image on every page. A day's description is the `description` prop on `<Day>`; leave it out and the layout falls back to the day number and theme. `@astrojs/sitemap` writes `sitemap-index.xml` on every build (new days are added automatically) and `public/robots.txt` points to it. `netlify.toml` 301-redirects the default `weird-web-october-2026.netlify.app` address to the real domain.
