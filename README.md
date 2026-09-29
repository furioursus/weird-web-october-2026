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
| `npm run check` | `astro check` plus Biome |

## How it fits together

- `src/data/days.ts`: the 31 themes, in order. Theme names double as Octothorpes hashtags, so they match the official list exactly.
- `src/fonts.ts`: every font the site uses. They're self-hosted through Astro's Fonts API with the Fontsource provider, so nothing loads from Google's CDN. Each font is exposed as a CSS variable, e.g. `var(--font-special-elite)`.
- `src/layouts/Day.astro`: the shared shell. It sets the title and meta tags, adds both Octothorpes tags, loads only the fonts the page asks for, and renders a small prev/next nav. It ships no visual styles.
- `src/components/HiddenCat.astro`: the hidden cat. Position it with `style`, tint it with `color`. Finding it is remembered in `localStorage`, and the index shows the tally.
- `src/pages/index.astro`: the calendar. A day links up once its page file exists. It's styled as a photocopied zine in Rubik Mono One and Space Mono: each day is a torn paper scrap (two layers roughened by the inline `#torn-1` / `#torn-2` SVG filters), built days are pink, today's date is circled in marker (New York time), and a grain overlay covers the page.

## Finding which file renders something

In `npm run dev`, Astro stamps every element in the page body with `data-astro-source-file` and `data-astro-source-loc` (line:column), so the browser's element inspector shows the file an element was typed in. Slotted markup names the page it was written in, not the layout it renders inside. For an opening tag that spans several lines, the line points at its closing `>`. Builds carry none of these attributes.

## Sharing

Pages are listed on the [#weirdweboctober](https://octothorp.es/~/weirdweboctober) feed once the domain is registered at [octothorp.es/register](https://octothorp.es/register). The production URL is set in `astro.config.ts` and has to match the deployed domain.
