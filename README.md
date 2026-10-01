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
| `npm run check` | `astro check` plus Biome |

Restart `npm run dev` when `new-day` adds a font to `src/fonts.ts` (Astro only reads the font config at startup, so the new page fails with `FontFamilyNotFound`) and after any `npm install` (the running server can lose track of Sharp and every optimized image fails with `MissingSharp`).

## How it fits together

- `src/data/days.ts`: the 31 themes, in order, and `isReleased()`, which decides whether a day is out yet (see [Scheduled releases](#scheduled-releases)). Theme names double as Octothorpes hashtags, so they match the official list exactly.
- `src/fonts.ts`: every font the site uses. I self-host them through Astro's Fonts API with the Fontsource provider, so nothing loads from Google's CDN. Each font is exposed as a CSS variable, e.g. `var(--font-special-elite)`. An entry with `src` is a font file in the repo, served by Astro's local provider instead of Fontsource. `astro.config.ts` casts those entries' options `as never`, because Astro can only type local-font options in a literal array, not a mapped one.
- `src/assets/fonts/special-elite-typed.woff2`: "Special Elite Typed", day 1's body font. It's Special Elite (Apache 2.0, from `@fontsource/special-elite`) with a few glyphs shifted up or down by a fixed amount, like bent typebars, and its hinting removed. `scripts/misalign-font.py` builds it; edit the `FLAWS` table there (offsets in px at 17px) and run `npm run font:typed -- --write`, then restart `npm run dev`.
- `src/layouts/Day.astro`: the shared shell. It renders the head tags through `src/components/Seo.astro`, adds both Octothorpes tags, loads only the fonts the page asks for, and renders a small prev/next nav that only links to days that are built and released. It ships no visual styles, so every day can look completely different.
- `src/components/HiddenCat.astro`: the hidden cat. Position it with `style`, tint it with `color`. Finding it is remembered in `localStorage`, and the index shows the tally.
- `src/pages/index.astro`: the calendar. A day links up once its page file exists and it's released. It's styled as a photocopied zine in Rubik Mono One and Space Mono: each day is a torn paper scrap (two layers roughened by the inline `#torn-1` / `#torn-2` SVG filters), built days are pink, today's date is circled in marker (New York time), and a grain overlay covers the page.

## Day 2's room

Day 2 (Spark) lives in Illustrator: `src/assets/02-spark-room.svg` is the one source for the dining room's shapes, Tybalt's hiding spots and the spark targets, and the page reads it at build time, so exporting over that file updates the page.

- **Coordinates** are the reference photo's pixels (2000×1500), in one-point perspective toward the window. The ceiling, wall and floor shapes run far past the artboard so wide and tall screens still show room; leave that overhang.
- **A shape's id picks its look.** Each id starts with a class name from `CLASSES` in `src/pages/02-spark.astro` (`chair-5` is a `chair`, longest match wins, so `table-top-1` is a `table-top`). The page's CSS colors each class twice: a dark silhouette in the flash, and the room's real colors once the power's back. Illustrator's own colors are ignored; its `.stN` styles only matter for marking unfilled shapes, which become lines (vines, chair legs, hanger cords). An unnamed shape or an unknown name fails the build with the list of valid names.
- **Top-level groups decide the layer.** `room` draws under the darkness (its `room-shell` sub-group under the lamp glow too). `window-and-chandelier` draws above it, so the window and everything hanging in front of it stay visible at 3 A.M. as silhouettes; its `night-window` sub-group keeps its own colors. `tybalt-spots` and `spark-targets` aren't drawn at all.
- **Tybalt's spots** are his outline, one `spot-<name>` group per spot. The page reads his position and size from the outline's first two path points (the base of his left ear at 20,22 on a 64-unit cat, then 14 units up), so keep it as that outline and scale it evenly. Each spot name needs a line in `SPOT_LABELS` for the zap log, or the build fails.
- **Spark targets** are circles named `spark-<name>`. The log names them with dashes as spaces, or from `TARGET_LABELS`.
- **Pothos leaves** (`leaf-pothos-*`) each get their own outline from `npm run leaves:pothos`. It keeps every leaf's stem (the path's start point), length, direction and width, and picks the outline from the leaf's id, so re-running only changes leaves that are new or copied.
- **Exporting from Illustrator:** set Object IDs to Layer Names; any styling option works. Delete or hide the photo layer first, and make sure the export has no `<image>`: the committed file must not carry the photo. My working copy with the photo embedded lives in `design/`, which `.git/info/exclude` keeps out of git.
- **The page's styles are global** (`<style is:global>`), because shapes injected from the SVG don't carry Astro's scope attribute, so scoped rules never reach them. They still load only on day 2.
- **Flashes are rate-limited** to one per 450 ms, so mashing the mouse can't strobe past 3 flashes a second (WCAG 2.3.1). With reduced motion, a zap fades the room in and out instead.

## Day 3's marketplace

Day 3 (Fake) is FURMU, a knockoff marketplace in the style of Temu that sells counterfeit cats: real photos of Tybalt and Dante, badly listed. Every listing is a decoy; the one real cat is Dante's photo in the one-star review. It's set in Rubik, with Schoolbell for the crayon badge.

- **Photos** are my own photos of the cats, and the originals stay out of the repo. My working copies live in `design/day-3/` (git-excluded) with all metadata stripped, because the originals carry GPS coordinates for my home. `scripts/crop-listings.py` (`npm run photos:fake`) cuts the square product shots into `src/assets/03-fake/`; its `CROPS` table places each crop by its top-left corner and side as fractions of the photo, plus quarter turns (`darnte-reversible` is rotated 180°). Saving drops metadata again, and I placed the crops to keep people in the background out of frame. Astro then ships only optimized WebP.
- **The prize wheel** is a native `<dialog>` that opens 1.5 s after load, once per browser session (`sessionStorage` key `wwo:furmu-wheel`). It's rigged by the `SPINS` table: spins 1 and 2 stop just inside FREE CAT* and $100 COUPON, then crawl over the line into SPIN AGAIN; spin 3 pays out FREE CAT* and adds it to the cart. The close × dodges a mouse three times, then gives up ("fine."); keyboard focus never dodges. Escape or × goes to a confirmshaming step first, and a second Escape closes. Closing starts the coupon countdown, which resets to 09:59 with "EXTENDED!" every time it runs out.
- **The big orange buttons' 3D lip is a `border-bottom`, not an offset shadow,** and their focus ring is a `box-shadow` ring. Both are deliberate: an outline on the breathing (scaling) button breaks apart in Firefox, and a ring drawn around a shadow lip runs through it.
- **The search bar and cart are flimsy.** Clicking either (or submitting the search) creaks it down on one screw, then drops it off the page. The fall animates a `position: fixed` copy so it never adds page scroll, and the empty spot stays. The creak is synthesized in Web Audio from the `CREAK` keyframes, one burst per downward jerk: a jittery pulse train (its rate is the pitch) ringing four wooden-door resonances in `DOOR_MODES`. Lower `low`/`high` in `creakSound()` for a deeper groan, raise them for a squeak. Screen readers hear "The cart fell off the page."
- **Decoys:** each listing photo is a button ("Is this cat real?") that stamps it COUNTERFEIT and counts down the fakes in a toast; stamping all 12 points to the reviews. Only the transparent `HiddenCat` hotspot on Dante's face in the review photo counts for the tally.
- **Fake signals:** "N people viewing" wanders every 2–5 s and shows its own `Math.random()` code on hover, focus or tap (Escape hides it); the Mystery Box's "Only 3 left" climbs by one every 6 s; the perks strip promises delivery in "7–29 business lives". The crayon "Verified Purchase" badge is Schoolbell roughened by the inline `#crayon` SVG filter.
- **Bad-shop gags** are per-listing `fx` values: `led` (glowing dots placed on Darnte's pupils), `stretch`, `watermark` and `sticker`.

## Day 4's Tybalgotchi

Day 4 (Plastic) is the Tybalgotchi, a 1998 virtual pet in translucent grape plastic. Tybalt lives on its screen and does what the real one does: the moment he's even a little hungry, he skips the kibble and goes for plastic, and eventually that includes the toy itself. It's set in Chewy, with Nunito for everything else.

- **The toy is one inline SVG,** drawn in the page: the shell, the circuit board and parts you can see through the plastic, the faceplate and the LCD glass. The live screen (`<canvas class="lcd">`), the printed icons, the A/B/C buttons, the reset pinhole and the battery tab are HTML laid over it, placed by percentages of the SVG's 320×360 viewBox, so moving something in the SVG means moving its overlay too.
- **The screen is a 32×16 dot matrix** drawn on the canvas, with short ghosting like a real LCD (the 40 ms fade in `paint()`; longer smears the vet's scrolling text). Sprites and the 3×5 pixel font are `#`/`.` strings in the page script: `TYBALT` is him facing right, with filled ears and tail tip for his colored points, and `CAT` derives the blink, walk, happy and chomp frames from it.
- **Hunger:** one game tick is 320 ms (`TICK`). He loses a heart every 9 s (`HUNGER_EVERY`); below 4 hearts he picks a target, walks toward it one dot every other tick, and eats it. Plastic never fills him, so he goes straight for the next thing. Kibble adds a heart, and at 4 hearts he forgets the target. Menus, status and the vet pause him.
- **Bites:** every third target is the toy itself. He walks off the edge of the screen and a bite comes out of the real shell: three circles in the `#bites` mask, plus the same circles stroked in `.bite-lips` for the stress-whitened edge. `BITES` lists the six spots as fractions of the way around the outline (0 is the top, clockwise); after six, he sticks to other plastic.
- **Saving:** `localStorage` key `wwo:tybalgotchi` holds whether he's hatched, which bites are taken and the ingestion log, which the patient chart lists. Coming back skips the egg and starts him at 3 hearts. The reset pinhole clears it all and goes back to the egg. The sound toggle is saved under `wwo:tybalgotchi-sound`.
- **Sound** is synthesized in Web Audio and only starts after a click: quiet square-wave piezo beeps, three for "he's spotted something", and a filtered noise burst per chomp (sharper when he's biting the shell).
- **Controls:** A cycles the icons (feed, play, vet, status), B chooses, C cancels; the A, B and C keys work too. Feed offers kibble or a bag (the bag goes in the log). Play drops a toy in its packaging, and he eats the packaging. The vet scrolls "DX: GROSS, WEIRD CAT" with the plastic count. Screen readers get the caption under the toy and a hidden status line for menu changes.
- **The hidden cat** is Tybalt's outline printed on the circuit board (silkscreen `TB1`), left of the screen and seen through the plastic, with a transparent `HiddenCat` hotspot over it. It sits between bite spots, so no bite ever covers it.
- **Reduced motion** drops the shell shake, the plastic crumbs and the battery tab's fall; the screen still animates.

## Scheduled releases

Each day goes live at midnight New York time on its date, on its own. I push a finished day to `main` whenever it's ready, and production builds hold it back until then. A nightly GitHub Action rebuilds the site just after midnight so the new day appears.

- **The gate:** `isReleased()` in `src/data/days.ts` compares a day's date with today in New York. In a production build, the `release-gate` integration in `astro.config.ts` deletes unreleased days from `dist/` after the build, and the sitemap leaves them out. The calendar and the prev/next nav don't link to them. The build log names what it held back (`held back until their date: 02-spark, 03-fake`).
- **`npm run dev` shows every day.** To build everything locally, e.g. to check a future day in a real build, run `RELEASE_ALL=1 npm run build`. The `weird-web-build-preview` entry in `.claude/launch.json` serves `dist/` on port 4329.
- **The nightly rebuild:** `.github/workflows/release-day.yml` runs at 04:05 UTC every day in October, which is 00:05 in New York (all of October is on daylight time), and POSTs to a Netlify build hook. It also has a manual **Run workflow** button. The hook's URL lives in the `NETLIFY_BUILD_HOOK` repository secret; the workflow fails loudly if it's missing. To make one: Netlify → Site configuration → Build & deploy → Build hooks → add a hook on `main`, then `gh secret set NETLIFY_BUILD_HOOK`.
- **Timing isn't exact.** GitHub can start scheduled runs late, often 5–30 minutes, so a day can appear a little after midnight. A manual run or any push to `main` releases it too, since every production build applies the gate.
- **The source isn't secret.** The repo is public, so anyone can read a pushed day on GitHub before its date; only the site holds it back. Its images also ship to `dist/_astro/` under hashed names.

## Formatting

Biome formats and lints everything, including the HTML in `.astro` files: `npm run format` writes, and `npm run check` fails on anything unformatted. Zed uses the same Biome through `.zed/settings.json`, which runs `node_modules/.bin/biome` as an external formatter, so no Zed extension is needed.

- **Full `.astro` formatting is experimental** in Biome 2.5: it needs `html.experimentalFullSupportEnabled` and `html.formatter.enabled` in `biome.json`. On an unformatted file it takes two passes to settle, then stays stable.
- **I don't use Prettier.** `prettier-plugin-astro` 1.0.0 puts line breaks inside inline elements, which adds visible whitespace (day 1's redaction highlights overhang their words), and it ignores `htmlWhitespaceSensitivity`.
- **Four lint rules are off on purpose**, scoped in `biome.json` overrides: `a11y/useSemanticElements` on day 1 (its redaction bars are `span role="button"` because a `<button>` can't wrap across lines), `a11y/noNoninteractiveTabindex` on day 2 (the room is a focusable `role="application"` for arrow-key shuffling, which Biome doesn't count as interactive), `a11y/noRedundantRoles` on the calendar (`role="list"` keeps list semantics in Safari once `list-style` is removed), and `complexity/noImportantStyles` in `.astro` files (the reduced-motion override needs `!important`).
- **SVGs in `src/assets` aren't formatted**, so Illustrator exports drop in untouched.

## Days with dev shortcuts

Some days take a `?jump=` query parameter in `npm run dev` so I can skip ahead while testing. Production builds strip it.

| Day | Parameter | Skips to |
| --- | --- | --- |
| 1, Reveal | `?jump=unseal` | Every text redaction lifted, Exhibit A unsealed |
| 1, Reveal | `?jump=photo` | Exhibit A's cover lifted, Dante still a smudge |
| 1, Reveal | `?jump=dante` | The reveal and DECLASSIFIED slam, without saving the cat as found |
| 2, Spark | `?jump=charge` | A full 25 kV charge, ready to zap |
| 2, Spark | `?jump=lights` | The power back on, without saving the cat as found (Tybalt stays unclickable until a zap) |
| 3, Fake | `?jump=wheel` | The prize wheel opens at once, even if it was already shown this session |
| 3, Fake | `?jump=shop` | Straight to the shop with the coupon countdown running, no wheel |
| 4, Plastic | `?jump=hatched` | Hatched and remotely hungry, as if coming back to him |
| 4, Plastic | `?jump=hungry` | Hatched at 1 heart, already going for plastic |
| 4, Plastic | `?jump=chewed` | Every bite taken out of the shell, without saving them |

## Finding which file renders something

In `npm run dev`, Astro stamps every element in the page body with `data-astro-source-file` and `data-astro-source-loc` (line:column), so the browser's element inspector shows the file an element was typed in. Slotted markup names the page it was written in, not the layout it renders inside. For an opening tag that spans several lines, the line points at its closing `>`. Builds carry none of these attributes.

## Sharing

Pages are listed on the [#weirdweboctober](https://octothorp.es/~/weirdweboctober) feed once the domain is registered at [octothorp.es/register](https://octothorp.es/register). The production URL is set in `astro.config.ts` and has to match the deployed domain.

For search engines and link previews, `src/components/Seo.astro` renders every page's head tags in one place: title, description, canonical URL, Open Graph and Twitter card, with `public/weird-web-october-og-image.png` (1200×630) as the preview image on every page. A day's description is the `description` prop on `<Day>`; leave it out and the layout falls back to the day number and theme. `@astrojs/sitemap` writes `sitemap-index.xml` on every build (new days are added automatically) and `public/robots.txt` points to it. `netlify.toml` 301-redirects the default `weird-web-october-2026.netlify.app` address to the real domain.
