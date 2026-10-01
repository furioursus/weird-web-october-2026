# /// script
# dependencies = ["pillow"]
# ///
"""
Crops day 3's listing photos out of the cat photos in design/day-3/ (kept out of git) into square
product shots in src/assets/03-fake/. Each crop is placed by its top-left corner as fractions of
the photo's width and height, and its side as a fraction of the width. Saving drops all metadata,
so no GPS or camera data reaches the repo.

  npm run photos:fake             # dry run: lists each crop and whether its source is there
  npm run photos:fake -- --write  # saves the crops
"""

import sys
from pathlib import Path

from PIL import Image, ImageOps

SOURCE = Path("design/day-3")
OUT = Path("src/assets/03-fake")
SIZE = 1000

# name: (source file, left, top, side, quarter turns clockwise)
CROPS = {
    "tyball-chair": ("IMG_8841.jpeg", 0.0, 0.05, 1.0, 0),
    "dontay-loud": ("IMG_9442.jpeg", 0.0, 0.1, 1.0, 0),
    "darnte-pro-max": ("IMG_9787.jpeg", 0.22, 0.35, 0.78, 0),
    "cat-cat-cat": ("IMG_6627.jpeg", 0.0, 0.12, 1.0, 0),
    "tybalt-informant": ("IMG_9888.jpeg", 0.0, 0.2, 1.0, 0),
    "mystery-box": ("IMG_8445.jpeg", 0.15, 0.2, 0.8, 0),
    "bread-cat": ("IMG_8368.jpeg", 0.0, 0.05, 1.0, 0),
    "tybalt-lite": ("IMG_6421.jpeg", 0.0, 0.1, 1.0, 0),
    "darnte-reversible": ("IMG_9562.jpeg", 0.0, 0.125, 1.0, 2),
    "croc-stand": ("telegram-photo-0-4994532274007116895.jpeg", 0.1, 0.13, 0.9, 0),
    "tybalt-sealed": ("IMG_7432.jpeg", 0.0, 0.12, 1.0, 0),
    "heater-bundle": ("IMG_8416.jpeg", 0.0, 0.15, 1.0, 0),
    "review-dante": ("IMG_8485.jpeg", 0.27, 0.25, 0.7, 0),
}


def crop(name: str, spec: tuple[str, float, float, float, int]) -> Image.Image:
    file, left, top, side, turns = spec
    photo = ImageOps.exif_transpose(Image.open(SOURCE / file)).convert("RGB")
    w, h = photo.size
    px = round(side * w)
    x, y = round(left * w), round(top * h)
    if x + px > w or y + px > h:
        raise SystemExit(f"{name}: crop runs off the photo ({x},{y} +{px} on {w}x{h})")
    shot = photo.crop((x, y, x + px, y + px)).resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    return shot.rotate(-90 * turns) if turns else shot


def main() -> None:
    write = "--write" in sys.argv
    missing = [spec[0] for spec in CROPS.values() if not (SOURCE / spec[0]).exists()]
    for name, spec in CROPS.items():
        status = "missing" if spec[0] in missing else "ok"
        print(f"{name:18} {spec[0]:44} {status}")
    if missing:
        raise SystemExit(f"{len(missing)} source photos missing from {SOURCE}/")
    if not write:
        print("dry run; add --write to save")
        return
    OUT.mkdir(parents=True, exist_ok=True)
    for name, spec in CROPS.items():
        crop(name, spec).save(OUT / f"{name}.jpg", quality=82, optimize=True, progressive=True)
    print(f"saved {len(CROPS)} crops to {OUT}/")


if __name__ == "__main__":
    main()
