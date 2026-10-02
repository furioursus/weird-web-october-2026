/**
 * Each built day's link-preview card at /<slug>/og.jpg. It sits inside the day's folder so the
 * release gate deletes it along with an unreleased page. See README.md#preview-cards.
 */
import type { APIRoute, GetStaticPaths } from "astro";
import { CARDS } from "@/data/cards";
import { DAYS, type Day } from "@/data/days";
import { renderCard } from "@/lib/og-card";

const built = new Set(
	Object.keys(import.meta.glob("../[0-9][0-9]-*.astro")).map((path) =>
		path.replace(/^.*\//, "").replace(/\.astro$/, ""),
	),
);

export const getStaticPaths = (() =>
	DAYS.filter((day) => built.has(day.slug)).map((day) => ({
		params: { slug: day.slug },
		props: { day },
	}))) satisfies GetStaticPaths;

export const GET: APIRoute<{ day: Day }> = async ({ props: { day } }) => {
	const jpg = await renderCard({ number: day.number, theme: day.theme, ...CARDS[day.number] });
	return new Response(new Uint8Array(jpg), { headers: { "Content-Type": "image/jpeg" } });
};
