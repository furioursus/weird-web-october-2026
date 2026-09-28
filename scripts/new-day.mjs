#!/usr/bin/env node
/**
 * Scaffolds a day's page:
 *   npm run new-day -- 5
 *   npm run new-day -- 5 --cat dante --fonts "Special Elite,Inter"
 * Fonts not yet in src/fonts.ts are added there (self-hosted via Fontsource). Refuses to
 * overwrite a page that already exists.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Themes live in src/data/days.ts; read them from there so there's one source of truth.
const source = readFileSync(join(root, "src/data/days.ts"), "utf8");
const block = source.match(/THEMES = \[([\s\S]*?)\] as const/);
if (!block) throw new Error("Couldn't find the THEMES array in src/data/days.ts.");
const themes = [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);

const args = process.argv.slice(2);
const day = Number(args.find((a) => /^\d+$/.test(a)));
if (!Number.isInteger(day) || day < 1 || day > themes.length) {
	console.error(
		`Usage: npm run new-day -- <1-${themes.length}> [--cat tybalt|dante] [--fonts "Family A,Family B"]`,
	);
	process.exit(1);
}

const catIndex = args.indexOf("--cat");
const cat = catIndex >= 0 ? args[catIndex + 1] : day % 2 === 1 ? "tybalt" : "dante";
if (cat !== "tybalt" && cat !== "dante") {
	console.error(`--cat must be "tybalt" or "dante", not "${cat}".`);
	process.exit(1);
}

const fontsIndex = args.indexOf("--fonts");
const fonts = (fontsIndex >= 0 ? (args[fontsIndex + 1] ?? "") : "Inter")
	.split(",")
	.map((f) => f.trim())
	.filter(Boolean);
if (fonts.length === 0) {
	console.error('--fonts needs a comma-separated list, e.g. --fonts "Special Elite,Inter".');
	process.exit(1);
}
const cssVariableFor = (name) => `--font-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

const theme = themes[day - 1];
const slug = `${String(day).padStart(2, "0")}-${theme.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
const file = join(root, "src/pages", `${slug}.astro`);

if (existsSync(file)) {
	console.error(`src/pages/${slug}.astro already exists; not overwriting it.`);
	process.exit(1);
}

// Register any new fonts in src/fonts.ts, just above the marker comment.
const fontsFile = join(root, "src/fonts.ts");
const MARKER = "\t// new-day: fonts are added above this line";
let fontsSource = readFileSync(fontsFile, "utf8");
if (!fontsSource.includes(MARKER)) {
	throw new Error("Couldn't find the new-day marker comment in src/fonts.ts.");
}
const known = new Set([...fontsSource.matchAll(/name: "([^"]+)"/g)].map((m) => m[1]));
const added = fonts.filter((f) => !known.has(f));
if (added.length > 0) {
	fontsSource = fontsSource.replace(
		MARKER,
		`${added.map((f) => `\t{ name: ${JSON.stringify(f)} },`).join("\n")}\n${MARKER}`,
	);
	writeFileSync(fontsFile, fontsSource);
}

const [bodyFont, ...otherFonts] = fonts;
const headingFont = otherFonts[0] ?? bodyFont;

const page = `---
import HiddenCat from "@/components/HiddenCat.astro";
import Day from "@/layouts/Day.astro";

// Day ${day}: ${theme}
---

<Day
	day={${day}}
	description="TODO: one line about today's page."
	fonts={${JSON.stringify(fonts)}}
>
	<main>
		<h1>${theme}</h1>
		<p>Something weird goes here.</p>
	</main>

	<HiddenCat cat="${cat}" day={${day}} style="bottom: 12%; left: 8%;" />
</Day>

<style>
	/* Own palette and fonts every day. Black and pink show up somewhere. */
	:root {
		--bg: #0b0b0c;
		--fg: #f4eef2;
		--accent: #ff2e93;
	}
	body {
		margin: 0;
		min-block-size: 100dvh;
		background: var(--bg);
		color: var(--fg);
		font-family: var(${cssVariableFor(bodyFont)});
	}
	main {
		padding: 2rem;
	}
	h1 {
		font-family: var(${cssVariableFor(headingFont)});
		color: var(--accent);
	}
	@media (prefers-reduced-motion: reduce) {
		*,
		*::before,
		*::after {
			animation: none !important;
			transition: none !important;
		}
	}
</style>
`;

writeFileSync(file, page);
console.log(`Created src/pages/${slug}.astro (${theme}, hiding ${cat}).`);
if (added.length > 0) {
	console.log(
		`Added to src/fonts.ts: ${added.join(", ")}. Set weights there if you need more than 400.`,
	);
}
