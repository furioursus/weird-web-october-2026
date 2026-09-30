# /// script
# dependencies = []
# ///
"""
Gives every pothos leaf in a room SVG its own heart shape. Each `leaf-pothos-*` path keeps its
stem (the path's start point), its length, its direction and its width; only the outline changes,
chosen from the leaf's name, so re-running leaves an already reshaped leaf exactly as it is.
Leaves copied or drawn in Illustrator get a fresh outline on the next run.

  npm run leaves:pothos                       # dry run: says which leaves would change
  npm run leaves:pothos -- --write            # rewrites src/assets/02-spark-room.svg
  npm run leaves:pothos -- other.svg --write  # a different room file
"""

import math
import re
import sys
import zlib

DEFAULT = "src/assets/02-spark-room.svg"
LEAF = re.compile(r'<path id="(leaf-pothos-[\w-]+)"[^>]*\bd="([^"]*)"[^>]*/>')
TOKEN = re.compile(r"[MmLlHhVvCcSsQqTtZz]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?")
ARITY = {"M": 2, "L": 2, "H": 1, "V": 1, "C": 6, "S": 4, "Q": 4, "T": 2, "Z": 0}


def anchors(d: str) -> list[tuple[float, float]]:
    """End points of every path segment, in absolute coordinates."""
    toks = TOKEN.findall(d)
    i, cmd, x, y, sx, sy, out = 0, "M", 0.0, 0.0, 0.0, 0.0, []
    while i < len(toks):
        if toks[i].isalpha():
            cmd = toks[i]
            i += 1
        if cmd in "Zz":
            x, y = sx, sy
            continue
        n = ARITY[cmd.upper()]
        v = [float(t) for t in toks[i : i + n]]
        i += n
        rel, up = cmd.islower(), cmd.upper()
        if up == "H":
            x = x + v[0] if rel else v[0]
        elif up == "V":
            y = y + v[0] if rel else v[0]
        else:
            x, y = (v[-2] + x, v[-1] + y) if rel else (v[-2], v[-1])
            if up == "M":
                sx, sy = x, y
                cmd = "l" if rel else "L"
        out.append((x, y))
    return out


def measure(d: str):
    """Stem, stem-to-tip length and direction, and widest half-width across that direction."""
    pts = anchors(d)
    stem = pts[0]
    tip = max(pts, key=lambda p: math.dist(p, stem))
    length = math.dist(tip, stem)
    ux, uy = (tip[0] - stem[0]) / length, (tip[1] - stem[1]) / length
    half = max(abs((p[0] - stem[0]) * uy - (p[1] - stem[1]) * ux) for p in pts)
    return stem, length, (ux, uy), half


def outline(name: str) -> list[tuple[str, list[tuple[float, float]]]]:
    """A heart-shaped leaf with its stem at the origin, pointing down +y; varies by name."""
    state = zlib.crc32(name.encode()) or 1

    def rnd(lo: float, hi: float) -> float:
        nonlocal state
        state = (state * 16807) % 2147483647
        return lo + (hi - lo) * state / 2147483647

    w = rnd(0.7, 1.22)
    left, right = rnd(0.78, 1.18) * w, rnd(0.78, 1.18) * w
    notch = rnd(0.4, 1.8)
    belly = rnd(0.42, 0.7)
    tip = rnd(1.1, 1.6)
    curl = rnd(-0.28, 0.28)
    shoulder = rnd(0.82, 1.16)
    return [
        ("M", [(0, 0)]),
        ("C", [(-0.5 * left, -0.3 * notch), (-1.0 * left * shoulder, belly * 0.25), (-0.7 * left, belly)]),
        ("C", [(-0.45 * left, belly + 0.3), (curl - 0.12, tip - 0.25), (curl, tip)]),
        ("C", [(curl + 0.12, tip - 0.25), (0.45 * right, belly + 0.3), (0.7 * right, belly)]),
        ("C", [(1.0 * right * shoulder, belly * 0.25), (0.5 * right, -0.3 * notch), (0, 0)]),
    ]


def fit(name: str, d: str) -> str:
    """The name's outline, fitted to the existing leaf's stem, length, direction and width."""
    stem, length, (ux, uy), half = measure(d)
    shape = outline(name)
    tx, ty = shape[2][1][2]
    rot = math.atan2(tx, ty)
    c, s = math.cos(rot), math.sin(rot)

    def along(p):  # rotate so the outline's own tip lies on +y
        return (p[0] * c - p[1] * s, p[0] * s + p[1] * c)

    ends = [along(pts[-1]) for _, pts in shape]
    own_len = math.hypot(tx, ty)
    own_half = max(abs(x) for x, _ in ends)
    sx, sy = half / own_half, length / own_len

    def place(p):
        x, y = along(p)
        x, y = x * sx, y * sy
        return f"{stem[0] + x * uy + y * ux:.1f} {stem[1] - x * ux + y * uy:.1f}"

    return "".join(cmd + " ".join(place(p) for p in pts) for cmd, pts in shape) + "Z"


def main() -> None:
    args = [a for a in sys.argv[1:] if a != "--write"]
    write = "--write" in sys.argv
    file = args[0] if args else DEFAULT
    svg = open(file).read()
    changed: list[str] = []

    def reshape(m: re.Match) -> str:
        name, d = m.group(1), m.group(2)
        new = fit(name, d)
        old_pts, new_pts = anchors(d), anchors(new)
        same = len(old_pts) == len(new_pts) and all(
            math.dist(a, b) < 0.5 for a, b in zip(old_pts, new_pts)
        )
        if same:
            return m.group(0)
        changed.append(name)
        return m.group(0).replace(f'd="{d}"', f'd="{new}"')

    out = LEAF.sub(reshape, svg)
    total = len(LEAF.findall(svg))
    print(f"{total} pothos leaves in {file}; {len(changed)} get a new outline")
    for name in changed:
        print(f"  {name}")
    if write and changed:
        open(file, "w").write(out)
        print("written")
    elif changed:
        print("dry run; add --write to save")


if __name__ == "__main__":
    main()
