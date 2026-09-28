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
}

export const FONTS: FontFamily[] = [
	{ name: "Inter", weights: ["100 900"] },
	// new-day: fonts are added above this line
];

/** Defaults applied to entries that don't set weights or styles. */
export const DEFAULT_WEIGHTS: NonEmpty<number | string> = [400];
export const DEFAULT_STYLES: NonEmpty<"normal" | "italic" | "oblique"> = ["normal"];

/** "Special Elite" → "--font-special-elite". Use it in CSS as var(--font-special-elite). */
export const cssVariableFor = (name: string) =>
	`--font-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
