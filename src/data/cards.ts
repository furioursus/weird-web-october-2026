/**
 * The words on each day's link-preview card (src/lib/og-card.ts). Keep them short and different
 * from the page's `description`, since previews show the card and the description side by side.
 * A day without an entry gets a card with just its number and theme. See README.md#preview-cards.
 */
/** Open Graph's recommended size. */
export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;

export interface CardText {
	/** The page's own name, e.g. "Cellmates". Shown under the theme. */
	title?: string;
	/** One short line, about 60 characters. Wraps to two lines at most. */
	line?: string;
}

export const CARDS: Partial<Record<number, CardText>> = {
	1: { title: "Incident Report", line: "Mostly redacted. Somebody’s running the halls at 3 A.M." },
	2: { title: "Power’s Out", line: "3 A.M., wool socks, and static sparks to see by." },
	3: { title: "FURMU", line: "Counterfeit cats. The prize wheel is rigged." },
	4: { title: "Tybalgotchi", line: "A 1998 virtual pet that would rather eat the plastic." },
	5: { title: "Cellmates", line: "A perfectly ordinary spreadsheet whose cells have feelings." },
	6: { title: "Scope", line: "Twist the knobs until the phosphor grows ears." },
};
