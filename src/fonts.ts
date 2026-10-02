/**
 * Every font used anywhere on the site. Each one is self-hosted through Astro's Fonts API with
 * the Fontsource provider: downloaded at build time and served from our own domain, never from
 * Google's CDN. `npm run new-day -- 5 --fonts "Special Elite,Inter"` adds missing entries here.
 *
 * A page only loads the fonts it asks for (the `fonts` prop on the Day layout), so this list
 * can grow all month without slowing any single page down.
 */
type NonEmpty<T> = [T, ...T[]];

export interface FontFamily {
	/** Family name as listed on fontsource.org, e.g. "Special Elite". */
	name: string;
	/** Defaults to [400]. Use a range like "100 900" for variable fonts. */
	weights?: NonEmpty<number | string>;
	/** Defaults to ["normal"]. */
	styles?: NonEmpty<"normal" | "italic" | "oblique">;
	/** A font file in the repo instead of Fontsource, e.g. a modified font. Single weight and style. */
	src?: string;
}

export const FONTS: FontFamily[] = [
	{ name: "Inter", weights: ["100 900"] },
	{ name: "Rubik Mono One" },
	{ name: "Space Mono", weights: [400, 700] },
	{ name: "Stardos Stencil" },
	{ name: "Special Elite Typed", src: "./src/assets/fonts/special-elite-typed.woff2" },
	{ name: "Big Shoulders", weights: [500, 900] },
	{ name: "DSEG7 Classic", weights: [700] },
	{ name: "Rubik", weights: ["300 900"] },
	{ name: "Schoolbell" },
	{ name: "Nunito", weights: ["200 900"] },
	{ name: "Chewy" },
	{ name: "Instrument Sans", weights: ["400 700"] },
	{ name: "Fredoka", weights: ["300 700"] },
	{ name: "Barlow Condensed", weights: [500, 700] },
	{ name: "Share Tech Mono" },
	// new-day: fonts are added above this line
];

/** Defaults applied to entries that don't set weights or styles. */
export const DEFAULT_WEIGHTS: NonEmpty<number | string> = [400];
export const DEFAULT_STYLES: NonEmpty<"normal" | "italic" | "oblique"> = ["normal"];

/** "Special Elite" → "--font-special-elite". Use it in CSS as var(--font-special-elite). */
export const cssVariableFor = (name: string) =>
	`--font-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
