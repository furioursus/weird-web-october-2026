import sitemap from "@astrojs/sitemap";
import { defineConfig, fontProviders } from "astro/config";
import { cssVariableFor, DEFAULT_STYLES, DEFAULT_WEIGHTS, FONTS } from "./src/fonts";

// Production URL. Octothorpes indexes pages by their absolute URL, so this has to match
// wherever the site is actually deployed.
const SITE = "https://weirdweb.furioursus.dev";

// https://astro.build/config
export default defineConfig({
	site: SITE,
	compressHTML: true,
	trailingSlash: "always",
	integrations: [sitemap()],
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
