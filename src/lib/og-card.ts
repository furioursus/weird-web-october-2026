/**
 * Draws a day's 1200×630 link-preview card: the calendar's dark background, the day's number on a
 * torn scrap of pink felt, and the theme, title and line from src/data/cards.ts. Satori lays out
 * the text as paths, so no fonts need installing where it builds; sharp renders the result.
 * See README.md#preview-cards.
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import satori from "satori";
import sharp from "sharp";
import { CARD_HEIGHT, CARD_WIDTH } from "@/data/cards";

export interface CardInput {
	number: number;
	theme: string;
	title?: string | undefined;
	line?: string | undefined;
}

const INK = "#0b0b0c";
const PINK = "#ff2e93";
const PAPER = "#f4eef2";
const DIM = "#a49aa8";

const SCRAP = { x: 72, y: 118, width: 360, height: 394 };
const TEXT_X = 500;
const TEXT_WIDTH = CARD_WIDTH - TEXT_X - 72;

// Rubik Mono One is monospaced: every glyph is this many ems wide.
const RUBIK_ADVANCE = 0.84;

const fromRoot = (path: string) => readFile(resolve(path));
const dataUri = (type: string, data: Buffer) => `data:${type};base64,${data.toString("base64")}`;

type Node = { type: string; props: Record<string, unknown> };
// Satori wants every box with children to say `display: flex`, and a lone text child as a bare
// string (that's the only kind `lineClamp` works on).
const h = (type: string, style: Record<string, unknown>, ...children: unknown[]): Node => {
	const kids = children.filter((c) => c != null);
	return {
		type,
		props: { style: { display: "flex", ...style }, children: kids.length === 1 ? kids[0] : kids },
	};
};
const img = (src: string, style: Record<string, unknown>): Node => ({
	type: "img",
	props: { src, style },
});

// Fonts and textures are the same on every card, so they load once per build.
let shared: ReturnType<typeof loadShared> | undefined;
async function loadShared() {
	const [rubik, mono, monoBold, background, felt, edge] = await Promise.all([
		fromRoot("node_modules/@fontsource/rubik-mono-one/files/rubik-mono-one-latin-400-normal.woff"),
		fromRoot("node_modules/@fontsource/space-mono/files/space-mono-latin-400-normal.woff"),
		fromRoot("node_modules/@fontsource/space-mono/files/space-mono-latin-700-normal.woff"),
		sharp(resolve("src/assets/index-bg.png"))
			.resize(CARD_WIDTH, CARD_HEIGHT, { fit: "cover" })
			.modulate({ brightness: 1.6 })
			.jpeg({ quality: 88 })
			.toBuffer(),
		fromRoot("public/calendar-bg.webp").then((b) => sharp(b).png().toBuffer()),
		fromRoot("public/calendar-edge-bg.webp").then((b) => sharp(b).png().toBuffer()),
	]);
	return {
		fonts: [
			{ name: "Rubik Mono One", data: rubik, weight: 400 as const, style: "normal" as const },
			{ name: "Space Mono", data: mono, weight: 400 as const, style: "normal" as const },
			{ name: "Space Mono", data: monoBold, weight: 700 as const, style: "normal" as const },
		],
		background: dataUri("image/jpeg", background),
		felt: dataUri("image/png", felt),
		edge: dataUri("image/png", edge),
	};
}

/**
 * The felt scrap with a cream fringe, torn by the same turbulence filter as the calendar's days
 * (scaled up for the bigger scrap) and seeded by the day, so no two cards tear alike.
 */
async function scrap(seed: number, felt: string, edge: string) {
	const pad = 40;
	const w = SCRAP.width + pad * 2;
	const hgt = SCRAP.height + pad * 2;
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${hgt}">
	<defs>
		<filter id="torn-face" x="-10%" y="-10%" width="120%" height="120%">
			<feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="4" seed="${seed}" />
			<feDisplacementMap in="SourceGraphic" scale="16" xChannelSelector="R" yChannelSelector="G" />
		</filter>
		<filter id="torn-edge" x="-10%" y="-10%" width="120%" height="120%">
			<feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="4" seed="${seed + 31}" />
			<feDisplacementMap in="SourceGraphic" scale="18" xChannelSelector="G" yChannelSelector="R" />
		</filter>
		<filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
			<feDropShadow dx="6" dy="10" stdDeviation="9" flood-color="#000" flood-opacity="0.7" />
		</filter>
	</defs>
	<g filter="url(#shadow)">
		<g filter="url(#torn-edge)">
			<image x="${pad - 10}" y="${pad - 10}" width="${SCRAP.width + 20}" height="${SCRAP.height + 20}" preserveAspectRatio="none" xlink:href="${edge}" />
		</g>
		<g filter="url(#torn-face)">
			<image x="${pad}" y="${pad}" width="${SCRAP.width}" height="${SCRAP.height}" preserveAspectRatio="xMidYMid slice" xlink:href="${felt}" />
		</g>
	</g>
</svg>`;
	return { src: dataUri("image/png", await sharp(Buffer.from(svg)).png().toBuffer()), pad };
}

export async function renderCard({ number, theme, title, line }: CardInput): Promise<Buffer> {
	shared ??= loadShared();
	const { fonts, background, felt, edge } = await shared;
	const torn = await scrap(number, felt, edge);
	const tilt = ((number % 5) - 2) * 1.4;

	const label = theme.toUpperCase();
	const themeSize = Math.min(112, Math.floor(TEXT_WIDTH / (label.length * RUBIK_ADVANCE)));
	const numberSize = number < 10 ? 250 : 200;

	const card = h(
		"div",
		{
			width: CARD_WIDTH,
			height: CARD_HEIGHT,
			display: "flex",
			position: "relative",
			background: INK,
		},
		img(background, {
			position: "absolute",
			left: 0,
			top: 0,
			width: CARD_WIDTH,
			height: CARD_HEIGHT,
		}),
		h(
			"div",
			{
				position: "absolute",
				left: SCRAP.x - torn.pad,
				top: SCRAP.y - torn.pad,
				width: SCRAP.width + torn.pad * 2,
				height: SCRAP.height + torn.pad * 2,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				transform: `rotate(${tilt}deg)`,
			},
			img(torn.src, { position: "absolute", left: 0, top: 0, width: "100%", height: "100%" }),
			h(
				"div",
				{
					fontFamily: "Rubik Mono One",
					fontSize: numberSize,
					lineHeight: 1,
					color: INK,
					letterSpacing: "-0.04em",
					textShadow: "4px 3px 0 rgba(255, 255, 255, 0.18)",
				},
				String(number),
			),
		),
		h(
			"div",
			{
				position: "absolute",
				left: TEXT_X,
				top: 72,
				width: TEXT_WIDTH,
				height: CARD_HEIGHT - 72 * 2,
				display: "flex",
				flexDirection: "column",
				fontFamily: "Space Mono",
				color: PAPER,
			},
			h(
				"div",
				{
					fontFamily: "Rubik Mono One",
					fontSize: themeSize,
					lineHeight: 1,
					letterSpacing: "-0.02em",
					color: PINK,
					textShadow: "4px 3px 0 rgba(255, 46, 147, 0.35)",
				},
				label,
			),
			title
				? h("div", { marginTop: 26, fontSize: 44, fontWeight: 700, lineHeight: 1.1 }, title)
				: null,
			line
				? h(
						"div",
						{
							display: "block",
							marginTop: 14,
							fontSize: 28,
							lineHeight: 1.35,
							color: DIM,
							lineClamp: 2,
						},
						line,
					)
				: null,
			h("div", { marginTop: "auto", fontSize: 30 }, `Weird Web October · Day ${number}`),
			h(
				"div",
				{
					marginTop: 6,
					display: "flex",
					justifyContent: "space-between",
					fontSize: 22,
					color: DIM,
				},
				h("span", { color: PINK }, "weirdweb.furioursus.dev"),
				h("span", {}, "a cat is hiding here"),
			),
		),
	);

	const svg = await satori(card as never, { width: CARD_WIDTH, height: CARD_HEIGHT, fonts });
	return sharp(Buffer.from(svg)).jpeg({ quality: 85, mozjpeg: true }).toBuffer();
}
