# Weird Web October 2026

I'm making a small, weird website every day of October, following the [Weird Web October](https://weirdweboctober.website/) themes. Each day gets its own page, palette and fonts, and one of my cats, Tybalt or Dante, is hidden somewhere on every one.

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
| `npm run photos:fake` | List day 3's listing crops and whether their source photos are in `design/day-3/`; add `-- --write` to save them (needs uv) |
| `npm run icons` | List the favicon files built from `src/assets/favicon-eye.png`; add `-- --write` to save them to `public/` |
| `npm run check` | `astro check` plus Biome |

Restart `npm run dev` when `new-day` adds a font to `src/fonts.ts` (Astro only reads the font config at startup, so the new page fails with `FontFamilyNotFound`) and after any `npm install` (the running server can lose track of Sharp and every optimized image fails with `MissingSharp`).

## Docs

- [How it fits together](docs/architecture.md): the shared layout, fonts, hidden cat and data files.
- [The calendar](docs/calendar.md): the index page's torn felt, textures and background.
- [Scheduled releases](docs/releases.md): how each day stays hidden until midnight New York time, and the nightly rebuild.
- [Sharing](docs/sharing.md): head tags, the favicon and each day's generated preview card.
- [Formatting](docs/formatting.md): Biome, and the lint rules that are off on purpose.
- [Dev shortcuts](docs/dev-shortcuts.md): the `?jump=` parameters and finding which file renders an element.
- Days: [2, Spark](docs/days/02-spark.md) · [3, Fake](docs/days/03-fake.md) · [4, Plastic](docs/days/04-plastic.md) · [5, Sheet](docs/days/05-sheet.md) · [6, Analog](docs/days/06-analog.md) · [7, Organic](docs/days/07-organic.md). A day with enough moving parts gets its own file in `docs/days/`, named after its page.
