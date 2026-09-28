import { defineConfig, fontProviders } from "astro/config";
import pathfinder from "astro-pathfinder";
import { cssVariableFor, DEFAULT_STYLES, DEFAULT_WEIGHTS, FONTS } from "./src/fonts";

// Production URL. Octothorpes indexes pages by their absolute URL, so this has to match
// wherever the site is actually deployed.
const SITE = "https://weirdweb.furioursus.dev";

// https://astro.build/config
export default defineConfig({
	site: SITE,
	compressHTML: true,
	trailingSlash: "always",
	integrations: [pathfinder()],
	fonts: FONTS.map(({ name, weights = DEFAULT_WEIGHTS, styles = DEFAULT_STYLES }) => ({
		provider: fontProviders.fontsource(),
		name,
		cssVariable: cssVariableFor(name),
		weights,
		styles,
	})),
});
