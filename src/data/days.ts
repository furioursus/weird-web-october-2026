/**
 * The Weird Web October 2026 theme list, in order. Theme names are used verbatim as
 * Octothorpes hashtags, so keep them exactly as published on weirdweboctober.website
 * (including the official spelling of "Skeumorphism").
 */
export const THEMES = [
	"Reveal",
	"Spark",
	"Fake",
	"Plastic",
	"Sheet",
	"Analog",
	"Organic",
	"Skeumorphism",
	"Spicy",
	"Layers",
	"Stuck",
	"Pointy",
	"Scratch",
	"Origami",
	"Wooden",
	"Instant",
	"Branching",
	"Geometric",
	"Distorted",
	"Undefined",
	"Illusion",
	"Skeletons",
	"Incognito",
	"Collage",
	"Ascending",
	"Net",
	"Spiral",
	"Smooth",
	"The End",
	"Pastel",
	"Spooky",
] as const;

export type Theme = (typeof THEMES)[number];

export interface Day {
	/** 1–31 */
	number: number;
	theme: Theme;
	/** URL slug, e.g. "01-reveal" */
	slug: string;
	/** ISO date, e.g. "2026-10-01" */
	date: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

export const slugFor = (number: number, theme: string) =>
	`${pad(number)}-${theme.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

export const DAYS: Day[] = THEMES.map((theme, i) => ({
	number: i + 1,
	theme,
	slug: slugFor(i + 1, theme),
	date: `2026-10-${pad(i + 1)}`,
}));

/** Today's date in New York as YYYY-MM-DD. Every day goes live at midnight there. */
export const todayInNewYork = (now = new Date()) =>
	new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(now);

/**
 * Whether a day's page is out: its date has arrived in New York, or RELEASE_ALL=1 is set for the
 * build. Pages also show every day under `npm run dev`. See README.md#scheduled-releases.
 */
export const isReleased = (day: Day, now = new Date()) =>
	process.env.RELEASE_ALL === "1" || day.date <= todayInNewYork(now);

export function getDay(number: number): Day {
	const day = DAYS[number - 1];
	if (!day) throw new Error(`No Weird Web October day ${number}; expected 1–31.`);
	return day;
}
