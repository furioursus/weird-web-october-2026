# Weird Web October 2026

A small, weird website every day of October, following the [Weird Web October](https://weirdweboctober.website/) themes. Each day has its own page, palette and fonts, and one of the cats is hidden somewhere on every one.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run dev:inspect` | Dev server with the astro-pathfinder component inspector |
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
- `src/pages/index.astro`: the calendar. A day links up once its page file exists.

## Finding which file renders something

`npm run dev:inspect` runs the dev server with [astro-pathfinder](https://github.com/furioursus/astro-pathfinder), installed as a devDependency from its v1.0.0 release tarball. Hover any element and a corner panel lists the `.astro` files that produced it, innermost first, each one clickable into the editor:

```
src/components/HiddenCat.astro:38
src/layouts/Day.astro:45
src/pages/01-reveal.astro:6
```

- It only runs when `INSPECT=1` and the command is `dev`. A build with `INSPECT=1` set is byte-identical to one without it.
- Content from `set:html` names the component that injected it, with no line number.
- Astro 7.3's own `data-astro-source-file` / `data-astro-source-loc` attributes work in plain `npm run dev` too, but they name only the one file an element was typed in. Pathfinder adds the whole chain of layouts and components around it.

## Sharing

Pages are listed on the [#weirdweboctober](https://octothorp.es/~/weirdweboctober) feed once the domain is registered at [octothorp.es/register](https://octothorp.es/register). The production URL is set in `astro.config.ts` and has to match the deployed domain.
