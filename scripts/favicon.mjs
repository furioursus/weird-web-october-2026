#!/usr/bin/env node
/**
 * Builds the site's icons from src/assets/favicon-eye.png (the eye from Zur's Weirding):
 *   npm run icons            (dry run: lists what it would write)
 *   npm run icons -- --write
 * Writes public/favicon.ico (16, 32 and 48px), public/icon-192.png and
 * public/apple-touch-icon.png (180px on the calendar's ink, since iOS fills transparency).
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "src/assets/favicon-eye.png");
const INK = "#0b0b0c";

const resized = (size) =>
	sharp(source)
		.resize(size, size, { kernel: "lanczos3" })
		.png({ palette: true, effort: 10 })
		.toBuffer();

// An .ico is a 6-byte header, a 16-byte entry per image, then the images; PNG payloads are fine.
function ico(images) {
	const header = Buffer.alloc(6);
	header.writeUInt16LE(1, 2);
	header.writeUInt16LE(images.length, 4);
	let offset = 6 + 16 * images.length;
	const entries = images.map(({ size, data }) => {
		const entry = Buffer.alloc(16);
		entry.writeUInt8(size % 256, 0);
		entry.writeUInt8(size % 256, 1);
		entry.writeUInt16LE(1, 4);
		entry.writeUInt16LE(32, 6);
		entry.writeUInt32LE(data.length, 8);
		entry.writeUInt32LE(offset, 12);
		offset += data.length;
		return entry;
	});
	return Buffer.concat([header, ...entries, ...images.map(({ data }) => data)]);
}

const outputs = {
	"public/favicon.ico": ico(
		await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await resized(size) }))),
	),
	"public/icon-192.png": await resized(192),
	"public/apple-touch-icon.png": await sharp(await resized(180))
		.flatten({ background: INK })
		.png({ palette: true, effort: 10 })
		.toBuffer(),
};

const write = process.argv.includes("--write");
for (const [path, data] of Object.entries(outputs)) {
	if (write) writeFileSync(join(root, path), data);
	console.log(`${write ? "wrote" : "would write"} ${path} (${(data.length / 1024).toFixed(1)}KB)`);
}
if (!write) console.log("Dry run. Pass --write to save.");
