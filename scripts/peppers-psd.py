# /// script
# dependencies = ["psd-tools", "numpy", "pillow"]
# ///
"""
Builds day 9's peppers from my Photoshop file (design/day-9/Peppers.psd, kept out of git). Each
pepper group becomes its own full-size PNG with a pixelated drop shadow, plus a bitten copy, and
src/assets/09/peppers.json records where each one sits on the 1280 x 960 canvas. The peppers are
drawn on a 4px grid, so shadows and bites are worked out on that grid too, one cell per art pixel.

- "Butcher paper" becomes the background. Hidden layers and layers named "Reference..." are skipped.
- A group named "<Pepper> bitten" is used as that pepper's bitten copy. Without one, a toothy bite
  is cut out of the bottom half.
- For each pepper it finds a spot where Tybalt's sprite is hidden by the whole pepper and shows once
  it's bitten. Peppers too thin to hide him are left out.

  npm run peppers:psd                     # dry run: lists what it found
  npm run peppers:psd -- --write          # saves the PNGs and peppers.json
  npm run peppers:psd -- --psd ~/Desktop/Peppers/Peppers.psd --write
"""

import json
import math
import re
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from psd_tools import PSDImage

PSD = Path("design/day-9/Peppers.psd")
OUT = Path("src/assets/09")
GRID = 4  # canvas px per art pixel
PAPER = "Butcher paper"
ALIASES = {"ghost-reaper": "ghost-pepper"}  # a group's name in the PSD -> the page's id

# Shadows, in art pixels. The reference photo's shadows fall straight down.
SHADOW_DROP = 3  # how far the shadow runs down past the pepper
SHADOW_BLUR = 1.2
SHADOW_MARGIN = 6  # room left around each pepper for its shadow
SHADOW_TONES = [(0, 0, 0, 0), (96, 44, 26, 50), (96, 44, 26, 96)]  # none, light, dark

# Bites
BITE_SHARE = 0.5  # how much of the pepper a bite takes, from the bottom
TOOTH_WIDTH = 3.5  # art pixels per tooth mark
FLESH = (246, 236, 208, 255)  # the inside of the pepper, along the bite

# Tybalt's sprite on the page, in art pixels (TYBALT in src/pages/09-spicy.astro)
CAT_SIZE = (12, 11)

BAYER = (np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) + 0.5) / 16
PAD = 64  # canvas px of empty room around the canvas, so boxes can run off the edge


def slug(name: str) -> str:
    plain = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return ALIASES.get(plain, plain)


def on_canvas(layer, size) -> np.ndarray:
    """The layer's pixels placed on a padded, transparent copy of the canvas."""
    width, height = size
    canvas = np.zeros((height + PAD * 2, width + PAD * 2, 4), dtype=np.uint8)
    image = layer.composite()
    if image is None:
        return canvas
    pixels = np.asarray(image.convert("RGBA"))
    left, top = layer.bbox[:2]
    h, w = pixels.shape[:2]
    y0, x0 = top + PAD, left + PAD
    y1, x1 = min(y0 + h, canvas.shape[0]), min(x0 + w, canvas.shape[1])
    canvas[y0:y1, x0:x1] = pixels[: y1 - y0, : x1 - x0]
    return canvas


def grid_phase(pixels: np.ndarray) -> tuple[int, int]:
    """Where this layer's 4px grid starts, from where its colors change."""
    flat = pixels.astype(int)
    xs = np.nonzero(np.any(flat[:, 1:] != flat[:, :-1], axis=2))[1] + 1
    ys = np.nonzero(np.any(flat[1:, :] != flat[:-1, :], axis=2))[0] + 1
    return (
        int(np.bincount((xs - PAD) % GRID, minlength=GRID).argmax()),
        int(np.bincount((ys - PAD) % GRID, minlength=GRID).argmax()),
    )


def cut_out(pixels: np.ndarray, x: int, y: int, columns: int, rows: int) -> np.ndarray:
    """The full-size pixels of a box of art cells."""
    return pixels[y + PAD : y + PAD + rows * GRID, x + PAD : x + PAD + columns * GRID].copy()


def cells_of(full: np.ndarray) -> np.ndarray:
    """Which art cells have any pepper in them."""
    rows, columns = full.shape[0] // GRID, full.shape[1] // GRID
    return np.any(full[..., 3].reshape(rows, GRID, columns, GRID) > 127, axis=(1, 3))


def full_size(cells: np.ndarray) -> np.ndarray:
    return np.repeat(np.repeat(cells, GRID, axis=0), GRID, axis=1)


def shadow(mask: np.ndarray) -> np.ndarray:
    """A drop shadow under the shape's art cells, dithered into two tones, at full size."""
    # Smeared downward and fading, so it falls below the pepper instead of glowing around it
    shape = mask.astype(float)
    smear = np.zeros_like(shape)
    for drop in range(1, SHADOW_DROP + 1):
        moved = np.zeros_like(shape)
        moved[drop:] = shape[:-drop]
        smear = np.maximum(smear, moved * (1 - (drop - 1) / (SHADOW_DROP + 1)))
    blurred = Image.fromarray((smear * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(SHADOW_BLUR))
    soft = np.asarray(blurred, dtype=float) / 255
    strength = np.clip(soft * 1.8, 0, 1) * 2
    strength[strength < 0.2] = 0
    rows, columns = mask.shape
    threshold = np.tile(BAYER, (rows // 4 + 1, columns // 4 + 1))[:rows, :columns]
    tone = np.clip(np.floor(strength + threshold), 0, 2).astype(int)
    return full_size(np.array(SHADOW_TONES, dtype=np.uint8)[tone])


def over(top: np.ndarray, bottom: np.ndarray) -> np.ndarray:
    return np.asarray(Image.alpha_composite(Image.fromarray(bottom), Image.fromarray(top)))


def bite_edge(columns: int, cut: float, middle: float, half: float) -> np.ndarray:
    """How far down each column the bite reaches: an arch with a notch for every tooth."""
    teeth = max(3, min(6, round(2 * half / TOOTH_WIDTH)))
    tooth = 2 * half / teeth
    x = np.arange(columns) + 0.5
    across = np.clip((x - middle) / half, -1.5, 1.5)
    arch = 0.3 * half * (1 - across**2)
    notches = 0.45 * tooth * np.abs(np.cos(math.pi * (x - middle) / tooth))
    return cut - arch - notches


def bite(full: np.ndarray) -> tuple[np.ndarray, float]:
    """Takes about half the pepper from the bottom, and shows its pale inside along the edge."""
    mask = cells_of(full)
    rows, columns = mask.shape
    ys, xs = np.nonzero(mask)
    total = mask.sum()
    best = None
    for cut in range(ys.min(), ys.max() + 1):
        lower = xs[ys >= cut]
        if lower.size == 0:
            continue
        middle = (lower.min() + lower.max() + 1) / 2
        half = (lower.max() - lower.min() + 1) / 2 + 1
        edge = bite_edge(columns, cut, middle, half)
        removed = mask & ((np.arange(rows)[:, None] + 0.5) > edge[None, :])
        share = removed.sum() / total
        if best is None or abs(share - BITE_SHARE) < abs(best[1] - BITE_SHARE):
            best = (removed, share)
    removed, share = best
    remaining = mask & ~removed
    # The cut face: any pepper with bite right under it, or under either diagonal
    below = np.zeros_like(removed)
    below[:-1] = removed[1:]
    below[:-1, 1:] |= removed[1:, :-1]
    below[:-1, :-1] |= removed[1:, 1:]
    left = full.copy()
    left[full_size(removed)] = 0
    left[full_size(remaining & below) & (full[..., 3] > 127)] = FLESH
    return left, float(share)


def hiding_spot(whole: np.ndarray, bitten: np.ndarray) -> tuple[int, int] | None:
    """Art cells where the sprite is under solid pepper and in the bitten-off part, near its middle."""
    rows, columns = whole.shape[0] // GRID, whole.shape[1] // GRID
    solid = np.all(whole[..., 3].reshape(rows, GRID, columns, GRID) > 127, axis=(1, 3))
    gone = solid & ~cells_of(bitten)
    width, height = CAT_SIZE
    fits = [
        (x, y)
        for y in range(rows - height + 1)
        for x in range(columns - width + 1)
        if gone[y : y + height, x : x + width].all()
    ]
    if not fits:
        return None
    ys, xs = np.nonzero(gone)
    middle_x, middle_y = xs.mean(), ys.mean()
    return min(fits, key=lambda at: (at[0] + width / 2 - middle_x) ** 2 + (at[1] + height / 2 - middle_y) ** 2)


def trim(*images: np.ndarray) -> tuple[slice, slice]:
    """The smallest box that holds everything in all the images."""
    filled = np.any([image[..., 3] > 0 for image in images], axis=0)
    ys, xs = np.nonzero(filled)
    return slice(ys.min(), ys.max() + 1), slice(xs.min(), xs.max() + 1)


def box_of(image: np.ndarray, x: int, y: int) -> list[int]:
    """Where the pepper itself is, without its shadow, in canvas px."""
    ys, xs = np.nonzero(image[..., 3] > 127)
    return [x + int(xs.min()), y + int(ys.min()), int(xs.max() - xs.min() + 1), int(ys.max() - ys.min() + 1)]


def main() -> None:
    write = "--write" in sys.argv
    source = Path(sys.argv[sys.argv.index("--psd") + 1]).expanduser() if "--psd" in sys.argv else PSD
    if not source.exists():
        raise SystemExit(f"Can't find {source}")
    psd = PSDImage.open(source)
    width, height = psd.size
    layers = {layer.name: layer for layer in psd if layer.visible and not layer.name.startswith("Reference")}

    paper = layers.pop(PAPER, None)
    if paper is None:
        raise SystemExit(f'No "{PAPER}" layer in {source}')
    paper_pixels = on_canvas(paper, psd.size)[PAD : PAD + height, PAD : PAD + width, :3]
    print(f"{'paper':14} {width}x{height}")

    bitten_groups = {
        slug(name[: -len(" bitten")]): layer
        for name, layer in layers.items()
        if layer.is_group() and name.lower().endswith(" bitten")
    }
    outputs = {}
    peppers = []
    for name, layer in layers.items():
        if not layer.is_group() or name.lower().endswith(" bitten"):
            continue
        pepper_id = slug(name)
        pixels = on_canvas(layer, psd.size)
        gx, gy = grid_phase(pixels)
        left, top, right, bottom = layer.bbox
        drawn_bite = bitten_groups.get(pepper_id)
        if drawn_bite is not None:
            left, top = min(left, drawn_bite.bbox[0]), min(top, drawn_bite.bbox[1])
            right, bottom = max(right, drawn_bite.bbox[2]), max(bottom, drawn_bite.bbox[3])
        x = gx + (math.floor((left - gx) / GRID) - SHADOW_MARGIN) * GRID
        y = gy + (math.floor((top - gy) / GRID) - SHADOW_MARGIN) * GRID
        columns = math.ceil((right - x) / GRID) + SHADOW_MARGIN
        rows = math.ceil((bottom - y) / GRID) + SHADOW_MARGIN + SHADOW_DROP
        whole = cut_out(pixels, x, y, columns, rows)

        if drawn_bite is not None:
            bitten = cut_out(on_canvas(drawn_bite, psd.size), x, y, columns, rows)
            eaten = 1 - (bitten[..., 3] > 127).sum() / (whole[..., 3] > 127).sum()
            how = "drawn"
        else:
            bitten, eaten = bite(whole)
            how = "generated"

        spot = hiding_spot(whole, bitten)
        hide = [x + spot[0] * GRID, y + spot[1] * GRID] if spot else None

        whole_art = over(whole, shadow(cells_of(whole)))
        bitten_art = over(bitten, shadow(cells_of(bitten)))
        rows_kept, columns_kept = trim(whole_art, bitten_art)
        x += int(columns_kept.start)
        y += int(rows_kept.start)
        whole, bitten = whole[rows_kept, columns_kept], bitten[rows_kept, columns_kept]
        whole_art, bitten_art = whole_art[rows_kept, columns_kept], bitten_art[rows_kept, columns_kept]

        outputs[f"{pepper_id}.png"] = whole_art
        outputs[f"{pepper_id}-bitten.png"] = bitten_art
        peppers.append(
            {
                "id": pepper_id,
                "layer": name,
                "box": [x, y, whole_art.shape[1], whole_art.shape[0]],
                "hit": box_of(whole, x, y),
                "bittenHit": box_of(bitten, x, y),
                "hide": hide,
            }
        )
        print(
            f"{pepper_id:14} grid at ({gx % GRID},{gy % GRID})  {whole_art.shape[1]}x{whole_art.shape[0]}"
            f"  bite: {how}, {eaten:.0%} eaten  Tybalt: {'fits' if hide else 'too thin'}"
        )

    if not write:
        print("dry run; add --write to save")
        return
    OUT.mkdir(parents=True, exist_ok=True)
    # The paper is a photo, not pixel art, so it's a JPEG
    Image.fromarray(paper_pixels).save(OUT / "paper.jpg", quality=88, optimize=True, progressive=True)
    for file, image in outputs.items():
        Image.fromarray(image).save(OUT / file, optimize=True)
    data = {"canvas": [width, height], "grid": GRID, "peppers": peppers}
    # Number lists stay on one line, the way Biome formats them
    text = json.dumps(data, indent="\t")
    text = re.sub(r"\[\s+([-\d,\s]+?)\s+\]", lambda m: "[" + ", ".join(m.group(1).split(",\n")).replace("\t", "").strip() + "]", text)
    (OUT / "peppers.json").write_text(text + "\n")
    print(f"saved the paper, {len(outputs)} pepper images and peppers.json to {OUT}/")


if __name__ == "__main__":
    main()
