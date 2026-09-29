# /// script
# dependencies = ["fonttools", "brotli"]
# ///
"""
Bakes typewriter misalignment into Special Elite: each flawed glyph is shifted up or down by a
fixed amount, so every instance of that letter sits off the baseline the same way, like a bent
typebar. Offsets are in px at the 17px body size and scale with the font.

  npm run font:typed             # dry run: prints the flaw table
  npm run font:typed -- --write  # writes src/assets/fonts/special-elite-typed.woff2
"""

import sys

from fontTools.ttLib import TTFont

BODY_PX = 17
FAMILY = "Special Elite Typed"
SOURCE = "node_modules/@fontsource/special-elite/files/special-elite-latin-400-normal.woff2"
OUTPUT = "src/assets/fonts/special-elite-typed.woff2"

# px at BODY_PX; positive sits high, negative sits low
FLAWS = {
    "d": -0.5,
    "m": 0.5,
    "g": -1,
    "y": 1,
    "w": -0.5,
    "b": -1,
    "k": 2,
    "A": 0.5,
    "R": -1,
    "3": 1,
    "7": -2,
}


def main(write: bool) -> None:
    font = TTFont(SOURCE)
    upm = font["head"].unitsPerEm

    for char, px in FLAWS.items():
        print(f"  {char}  {px:+}px  ({round(px / BODY_PX * upm):+} units)")
    if not write:
        print(f"Dry run: {len(FLAWS)} flawed glyphs. Pass --write to update {OUTPUT}.")
        return

    cmap = font.getBestCmap()
    glyf = font["glyf"]

    for char, px in FLAWS.items():
        name = cmap[ord(char)]
        glyph = glyf[name]
        dy = round(px / BODY_PX * upm)
        if glyph.isComposite():
            for component in glyph.components:
                component.y += dy
        else:
            glyph.coordinates.translate((0, dy))
        glyph.recalcBounds(glyf)

    # Shifted outlines no longer match the hinting programs, so drop hinting entirely.
    for tag in ("fpgm", "prep", "cvt "):
        if tag in font:
            del font[tag]
    for name in font.getGlyphOrder():
        glyph = glyf[name]
        if hasattr(glyph, "program"):
            glyph.program.fromBytecode(b"")

    names = font["name"]
    for record in names.names:
        if record.nameID in (1, 4, 16):
            record.string = FAMILY
        elif record.nameID == 6:
            record.string = FAMILY.replace(" ", "")

    font.flavor = "woff2"
    font.save(OUTPUT)
    print(f"Wrote {OUTPUT}: {len(FLAWS)} flawed glyphs, 1px = {round(upm / BODY_PX)} units.")


if __name__ == "__main__":
    main("--write" in sys.argv[1:])
