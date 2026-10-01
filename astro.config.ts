import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sitemap from "@astrojs/sitemap";
import type { AstroIntegration } from "astro";
import { defineConfig, fontProviders } from "astro/config";
import { DAYS, isReleased } from "./src/data/days";
import { cssVariableFor, DEFAULT_STYLES, DEFAULT_WEIGHTS, FONTS } from "./src/fonts";

// Production URL. Octothorpes indexes pages by their absolute URL, so this has to match
// wherever the site is actually deployed.
const SITE = "https://weirdweb.furioursus.dev";

// Days whose date hasn't arrived in New York yet: built, then dropped from dist/ and the sitemap.
// See README.md#scheduled-releases.
const UNRELEASED = DAYS.filter((day) => !isReleased(day)).map((day) => day.slug);

const releaseGate: AstroIntegration = {
	name: "release-gate",
	hooks: {
		"astro:build:done": async ({ dir, logger }) => {
			const held = UNRELEASED.filter((slug) => existsSync(fileURLToPath(new URL(`${slug}/`, dir))));
			for (const slug of held) {
				await rm(new URL(`${slug}/`, dir), { recursive: true });
			}
			logger.info(
				held.length ? `held back until their date: ${held.join(", ")}` : "every built day is out",
			);
		},
	},
};

// https://astro.build/config
export default defineConfig({
	site: SITE,
	compressHTML: true,
	trailingSlash: "always",
	integrations: [
		sitemap({ filter: (page) => !UNRELEASED.some((slug) => page.endsWith(`/${slug}/`)) }),
		releaseGate,
	],
	fonts: [
		...FONTS.filter((font) => !font.src).map(
			({ name, weights = DEFAULT_WEIGHTS, styles = DEFAULT_STYLES }) => ({
				provider: fontProviders.fontsource(),
				name,
				cssVariable: cssVariableFor(name),
				weights,
				styles,
			}),
		),
		...FONTS.filter((font) => font.src).map(({ name, src = "" }) => ({
			provider: fontProviders.local(),
			name,
			cssVariable: cssVariableFor(name),
			// `as never`: Astro only types local-font options in a literal array; see README.md#how-it-fits-together
			options: { variants: [{ src: [src] }] } as never,
		})),
	],
});
