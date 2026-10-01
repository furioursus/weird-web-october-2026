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
| `npm run leaves:pothos` | List the pothos leaves in day 2's room SVG that would get a new outline; add `-- --write` to save (needs uv) |
| `npm run check` | `astro check` plus Biome |

Restart `npm run dev` when `new-day` adds a font to `src/fonts.ts` (Astro only reads the font config at startup, so the new page fails with `FontFamilyNotFound`) and after any `npm install` (the running server can lose track of Sharp and every optimized image fails with `MissingSharp`).

## How it fits together

- `src/data/days.ts`: the 31 themes, in order, and `isReleased()`, which decides whether a day is out yet (see [Scheduled releases](#scheduled-releases)). Theme names double as Octothorpes hashtags, so they match the official list exactly.
- `src/fonts.ts`: every font the site uses. They're self-hosted through Astro's Fonts API with the Fontsource provider, so nothing loads from Google's CDN. Each font is exposed as a CSS variable, e.g. `var(--font-special-elite)`. An entry with `src` is a font file in the repo, served by Astro's local provider instead of Fontsource. `astro.config.ts` casts those entries' options `as never`, because Astro can only type local-font options in a literal array, not a mapped one.
- `src/assets/fonts/special-elite-typed.woff2`: "Special Elite Typed", day 1's body font. It's Special Elite (Apache 2.0, from `@fontsource/special-elite`) with a few glyphs shifted up or down by a fixed amount, like bent typebars, and its hinting removed. `scripts/misalign-font.py` builds it; edit the `FLAWS` table there (offsets in px at 17px) and run `npm run font:typed -- --write`, then restart `npm run dev`.
- `src/layouts/Day.astro`: the shared shell. It renders the head tags through `src/components/Seo.astro`, adds both Octothorpes tags, loads only the fonts the page asks for, and renders a small prev/next nav that only links to days that are built and released. It ships no visual styles.
- `src/components/HiddenCat.astro`: the hidden cat. Position it with `style`, tint it with `color`. Finding it is remembered in `localStorage`, and the index shows the tally.
- `src/pages/index.astro`: the calendar. A day links up once its page file exists and it's released. It's styled as a photocopied zine in Rubik Mono One and Space Mono: each day is a torn paper scrap (two layers roughened by the inline `#torn-1` / `#torn-2` SVG filters), built days are pink, today's date is circled in marker (New York time), and a grain overlay covers the page.

## Day 2's room

Day 2 (Spark) is drawn in Illustrator: `src/assets/02-spark-room.svg` is the one source for the dining room's shapes, Tybalt's hiding spots and the spark targets, and the page reads it at build time, so exporting over that file updates the page.

- **Coordinates** are the reference photo's pixels (2000×1500), in one-point perspective toward the window. The ceiling, wall and floor shapes run far past the artboard so wide and tall screens still show room; leave that overhang.
- **A shape's id picks its look.** Each id starts with a class name from `CLASSES` in `src/pages/02-spark.astro` (`chair-5` is a `chair`, longest match wins, so `table-top-1` is a `table-top`). The page's CSS colors each class twice: a dark silhouette in the flash, and the room's real colors once the power's back. Illustrator's own colors are ignored; its `.stN` styles only matter for marking unfilled shapes, which become lines (vines, chair legs, hanger cords). An unnamed shape or an unknown name fails the build with the list of valid names.
- **Top-level groups decide the layer.** `room` draws under the darkness (its `room-shell` sub-group under the lamp glow too). `window-and-chandelier` draws above it, so the window and everything hanging in front of it stay visible at 3 A.M. as silhouettes; its `night-window` sub-group keeps its own colors. `tybalt-spots` and `spark-targets` aren't drawn at all.
- **Tybalt's spots** are his outline, one `spot-<name>` group per spot. The page reads his position and size from the outline's first two path points (the base of his left ear at 20,22 on a 64-unit cat, then 14 units up), so keep it as that outline and scale it evenly. Each spot name needs a line in `SPOT_LABELS` for the zap log, or the build fails.
- **Spark targets** are circles named `spark-<name>`. The log names them with dashes as spaces, or from `TARGET_LABELS`.
- **Pothos leaves** (`leaf-pothos-*`) each get their own outline from `npm run leaves:pothos`. It keeps every leaf's stem (the path's start point), length, direction and width, and picks the outline from the leaf's id, so re-running only changes leaves that are new or copied.
- **Exporting from Illustrator:** set Object IDs to Layer Names; any styling option works. Delete or hide the photo layer first, and make sure the export has no `<image>`: the committed file must not carry the photo. The working copy with the photo embedded lives in `design/`, which `.git/info/exclude` keeps out of git.
- **The page's styles are global** (`<style is:global>`), because shapes injected from the SVG don't carry Astro's scope attribute, so scoped rules never reach them. They still load only on day 2.
- **Flashes are rate-limited** to one per 450 ms, so mashing the mouse can't strobe past 3 flashes a second (WCAG 2.3.1). With reduced motion, a zap fades the room in and out instead.

## Scheduled releases

Each day goes live at midnight New York time on its date, on its own: push a finished day to `main` whenever it's ready, and production builds hold it back until then. A nightly GitHub Action rebuilds the site just after midnight so the new day appears.

- **The gate:** `isReleased()` in `src/data/days.ts` compares a day's date with today in New York. In a production build, the `release-gate` integration in `astro.config.ts` deletes unreleased days from `dist/` after the build, and the sitemap leaves them out. The calendar and the prev/next nav don't link to them. The build log names what it held back (`held back until their date: 02-spark, 03-fake`).
- **`npm run dev` shows every day.** To build everything locally, e.g. to check a future day in a real build, run `RELEASE_ALL=1 npm run build`. The `weird-web-build-preview` entry in `.claude/launch.json` serves `dist/` on port 4329.
- **The nightly rebuild:** `.github/workflows/release-day.yml` runs at 04:05 UTC every day in October, which is 00:05 in New York (all of October is on daylight time), and POSTs to a Netlify build hook. It also has a manual **Run workflow** button. The hook's URL lives in the `NETLIFY_BUILD_HOOK` repository secret; the workflow fails loudly if it's missing. To make one: Netlify → Site configuration → Build & deploy → Build hooks → add a hook on `main`, then `gh secret set NETLIFY_BUILD_HOOK`.
- **Timing isn't exact.** GitHub can start scheduled runs late, often 5–30 minutes, so a day can appear a little after midnight. A manual run or any push to `main` releases it too, since every production build applies the gate.
- **The source isn't secret.** The repo is public, so a pushed day can be read on GitHub before its date; only the site holds it back. Its images also ship to `dist/_astro/` under hashed names.

## Formatting

Biome formats and lints everything, including the HTML in `.astro` files: `npm run format` writes, and `npm run check` fails on anything unformatted. Zed uses the same Biome through `.zed/settings.json`, which runs `node_modules/.bin/biome` as an external formatter, so no Zed extension is needed.

- **Full `.astro` formatting is experimental** in Biome 2.5: it needs `html.experimentalFullSupportEnabled` and `html.formatter.enabled` in `biome.json`. On an unformatted file it takes two passes to settle, then stays stable.
- **Prettier isn't used.** `prettier-plugin-astro` 1.0.0 puts line breaks inside inline elements, which adds visible whitespace (day 1's redaction highlights overhang their words), and it ignores `htmlWhitespaceSensitivity`.
- **Four lint rules are off on purpose**, scoped in `biome.json` overrides: `a11y/useSemanticElements` on day 1 (its redaction bars are `span role="button"` because a `<button>` can't wrap across lines), `a11y/noNoninteractiveTabindex` on day 2 (the room is a focusable `role="application"` for arrow-key shuffling, which Biome doesn't count as interactive), `a11y/noRedundantRoles` on the calendar (`role="list"` keeps list semantics in Safari once `list-style` is removed), and `complexity/noImportantStyles` in `.astro` files (the reduced-motion override needs `!important`).
- **SVGs in `src/assets` aren't formatted**, so Illustrator exports drop in untouched.

## Days with dev shortcuts

Some days take a `?jump=` query parameter in `npm run dev` to skip ahead while testing. Production builds strip it.

| Day | Parameter | Skips to |
| --- | --- | --- |
| 1, Reveal | `?jump=unseal` | Every text redaction lifted, Exhibit A unsealed |
| 1, Reveal | `?jump=photo` | Exhibit A's cover lifted, Dante still a smudge |
| 1, Reveal | `?jump=dante` | The reveal and DECLASSIFIED slam, without saving the cat as found |
| 2, Spark | `?jump=charge` | A full 25 kV charge, ready to zap |
| 2, Spark | `?jump=lights` | The power back on, without saving the cat as found (Tybalt stays unclickable until a zap) |

## Finding which file renders something

In `npm run dev`, Astro stamps every element in the page body with `data-astro-source-file` and `data-astro-source-loc` (line:column), so the browser's element inspector shows the file an element was typed in. Slotted markup names the page it was written in, not the layout it renders inside. For an opening tag that spans several lines, the line points at its closing `>`. Builds carry none of these attributes.

## Sharing

Pages are listed on the [#weirdweboctober](https://octothorp.es/~/weirdweboctober) feed once the domain is registered at [octothorp.es/register](https://octothorp.es/register). The production URL is set in `astro.config.ts` and has to match the deployed domain.

For search engines and link previews, `src/components/Seo.astro` renders every page's head tags in one place: title, description, canonical URL, Open Graph and Twitter card, with `public/weird-web-october-og-image.png` (1200×630) as the preview image on every page. A day's description is the `description` prop on `<Day>`; leave it out and the layout falls back to the day number and theme. `@astrojs/sitemap` writes `sitemap-index.xml` on every build (new days are added automatically) and `public/robots.txt` points to it. `netlify.toml` 301-redirects the default `weird-web-october-2026.netlify.app` address to the real domain.
