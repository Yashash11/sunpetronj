#!/usr/bin/env python3
"""
beautify.py — resize + gently enhance photos for the Snack & Go site.

Usage:
    python tools/beautify.py raw/storefront.jpg hero-1 --slot hero
    python tools/beautify.py raw/hotdogs.jpg hotdogs --slot card
    python tools/beautify.py --all         # process every file in images/raw with auto preset

Input photos go in   images/raw/
Output (web-ready)   images/<name>.jpg   (optimized, EXIF-stripped, correct size)

The "beautify" is intentionally subtle and warm — a light lift in brightness,
contrast, color and sharpness plus a faint warm tone to match the red/white
palette. Nothing cartoonish; it just makes phone photos look crisp and inviting.
"""

import argparse
import sys
from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "images" / "raw"
OUT = ROOT / "images"

# Target size (w, h) per website slot. Center-cropped to this aspect ratio.
SLOTS = {
    "hero":      (2000, 1200),  # hero carousel slides
    "feature":   (1200,  900),  # big store feature photo
    "card":      ( 800,  600),  # category / service cards
    "gallery":   ( 800,  800),  # square gallery tiles
    "story":     (1000, 1100),  # Our Story portrait
    "community": (1600,  700),  # wide community banner
}

# Subtle enhancement amounts (1.0 = unchanged)
BRIGHTNESS = 1.04
CONTRAST   = 1.08
COLOR      = 1.10   # saturation
SHARPNESS  = 1.15
WARMTH     = 1.03   # multiply red channel, divide blue slightly for a cozy tone


def warm(img: Image.Image) -> Image.Image:
    """Nudge white balance warmer to match the red/cream palette."""
    r, g, b = img.split()[:3]
    r = r.point(lambda v: min(255, int(v * WARMTH)))
    b = b.point(lambda v: int(v / WARMTH))
    return Image.merge("RGB", (r, g, b))


def beautify(src: Path, name: str, slot: str) -> Path:
    if slot not in SLOTS:
        raise SystemExit(f"Unknown slot '{slot}'. Choose from: {', '.join(SLOTS)}")
    target = SLOTS[slot]

    img = Image.open(src)
    img = ImageOps.exif_transpose(img)          # honor phone rotation
    img = img.convert("RGB")

    # Smart center-crop to the slot's aspect ratio, then resize.
    img = ImageOps.fit(img, target, method=Image.LANCZOS, centering=(0.5, 0.45))

    # Gentle, warm enhancement.
    img = ImageEnhance.Brightness(img).enhance(BRIGHTNESS)
    img = ImageEnhance.Contrast(img).enhance(CONTRAST)
    img = ImageEnhance.Color(img).enhance(COLOR)
    img = ImageEnhance.Sharpness(img).enhance(SHARPNESS)
    img = warm(img)

    OUT.mkdir(parents=True, exist_ok=True)
    dest = OUT / f"{name}.jpg"
    img.save(dest, "JPEG", quality=82, optimize=True, progressive=True)
    kb = dest.stat().st_size / 1024
    print(f"  {src.name:32s} -> images/{dest.name:24s} [{slot}] {target[0]}x{target[1]}  {kb:.0f} KB")
    return dest


# Auto-guess a slot from the filename for the --all convenience mode.
def guess_slot(filename: str) -> str:
    f = filename.lower()
    if any(k in f for k in ("hero", "canopy", "front", "storefront")):
        return "hero"
    if any(k in f for k in ("story", "family", "owner")):
        return "story"
    if any(k in f for k in ("community", "town", "street", "neighbor")):
        return "community"
    if any(k in f for k in ("interior", "aisle", "inside", "feature")):
        return "feature"
    if any(k in f for k in ("gallery", "peek")):
        return "gallery"
    return "card"


def main():
    ap = argparse.ArgumentParser(description="Beautify photos for the Snack & Go site.")
    ap.add_argument("src", nargs="?", help="input image, relative to images/ (e.g. raw/store.jpg)")
    ap.add_argument("name", nargs="?", help="output name without extension (e.g. store-interior)")
    ap.add_argument("--slot", help="target slot: " + ", ".join(SLOTS))
    ap.add_argument("--all", action="store_true", help="process every file in images/raw (auto slot)")
    args = ap.parse_args()

    if args.all:
        files = sorted(p for p in RAW.glob("*") if p.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp", ".heic"))
        if not files:
            raise SystemExit(f"No images found in {RAW}")
        print(f"Beautifying {len(files)} file(s) from images/raw:")
        for p in files:
            slot = args.slot or guess_slot(p.name)
            beautify(p, p.stem, slot)
        print("Done. Now point the <img src> tags in index.html at images/<name>.jpg")
        return

    if not (args.src and args.name and args.slot):
        ap.error("provide SRC NAME --slot, or use --all")

    src = (OUT / args.src).resolve()
    if not src.exists():
        raise SystemExit(f"Not found: {src}")
    print("Beautifying:")
    beautify(src, args.name, args.slot)


if __name__ == "__main__":
    main()
