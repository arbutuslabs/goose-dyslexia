#!/usr/bin/env python3
"""Generate branding assets for Arbutus Labs from the favicon.png source.

This script reads the favicon.png at the repo root and exports all formats the
Electron desktop build expects under ui/desktop/src/images/.
"""
import base64
import io
import os
import subprocess
import tempfile
from PIL import Image, ImageDraw, ImageFilter, ImageOps

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
SOURCE = os.path.join(PROJECT_ROOT, "favicon.png")
IMAGES_DIR = os.path.join(PROJECT_ROOT, "ui", "desktop", "src", "images")


def load_source() -> Image.Image:
    """Load the favicon and make it a clean square with transparent fill."""
    img = Image.open(SOURCE).convert("RGBA")
    # Crop to a square centered on the image.
    w, h = img.size
    size = min(w, h)
    left = (w - size) // 2
    top = (h - size) // 2
    img = img.crop((left, top, left + size, top + size))
    return img


def make_app_icon(source: Image.Image, size: int, radius: int | None = None) -> Image.Image:
    """Create a square app icon with optional rounded corners."""
    img = source.resize((size, size), Image.Resampling.LANCZOS)
    if radius is None:
        radius = size // 8
    # Create a rounded mask.
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size, size), radius=radius, fill=255)
    # Apply rounded mask.
    rounded = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    rounded.paste(img, (0, 0), mask)
    return rounded


def make_svg(path: str, source: Image.Image) -> None:
    """Write an SVG logo with the favicon embedded as a base64 data URI."""
    buf = io.BytesIO()
    source.resize((1024, 1024), Image.Resampling.LANCZOS).save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    radius = 1024 // 8
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <defs>
    <clipPath id="round">
      <rect x="0" y="0" width="1024" height="1024" rx="{radius}" ry="{radius}"/>
    </clipPath>
  </defs>
  <image href="data:image/png;base64,{b64}" x="0" y="0" width="1024" height="1024" clip-path="url(#round)" preserveAspectRatio="xMidYMid slice"/>
</svg>'''
    with open(path, "w") as f:
        f.write(svg)


def make_icns(png_1024: str, output: str) -> None:
    """Build a .icns from a 1024x1024 PNG using macOS iconutil."""
    iconset = tempfile.mkdtemp(suffix=".iconset")
    sizes = [16, 32, 64, 128, 256, 512, 1024]
    base = Image.open(png_1024).convert("RGBA")
    for sz in sizes:
        img = base.resize((sz, sz), Image.Resampling.LANCZOS)
        img.save(os.path.join(iconset, f"icon_{sz}x{sz}.png"), "PNG")
        if sz <= 512:
            img2 = base.resize((sz * 2, sz * 2), Image.Resampling.LANCZOS)
            img2.save(os.path.join(iconset, f"icon_{sz}x{sz}@2x.png"), "PNG")
    subprocess.run(["iconutil", "--convert", "icns", "--output", output, iconset], check=True)


def make_ico(png_1024: str, output: str) -> None:
    """Build a multi-size .ico."""
    base = Image.open(png_1024).convert("RGBA")
    sizes = [16, 24, 32, 48, 64, 128, 256]
    images = [base.resize((sz, sz), Image.Resampling.LANCZOS) for sz in sizes]
    images[0].save(output, format="ICO", sizes=[(sz, sz) for sz in sizes])


def make_template(size: int, output: str) -> None:
    """Make a monochrome macOS menu-bar template icon (simple white circle)."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    pad = size // 8
    draw.rounded_rectangle((pad, pad, size - pad, size - pad), radius=size // 5, fill=(255, 255, 255, 220))
    # Simple tree-ish glyph: a curved trunk and small leaves.
    trunk_color = (0, 0, 0, 200)
    cx = size // 2
    cy = size // 2 + size // 12
    # Trunk
    draw.line([(cx, cy + size // 6), (cx, cy - size // 6)], fill=trunk_color, width=max(2, size // 16))
    # Branches
    draw.line([(cx, cy - size // 12), (cx - size // 6, cy - size // 4)], fill=trunk_color, width=max(2, size // 24))
    draw.line([(cx, cy - size // 12), (cx + size // 6, cy - size // 4)], fill=trunk_color, width=max(2, size // 24))
    # Leaves as small circles
    leaf_r = max(2, size // 16)
    for dx, dy in [(-size // 6, -size // 4), (size // 6, -size // 4), (0, -size // 3)]:
        draw.ellipse([cx + dx - leaf_r, cy + dy - leaf_r, cx + dx + leaf_r, cy + dy + leaf_r], fill=trunk_color)
    img.save(output, "PNG")


def main():
    if not os.path.exists(SOURCE):
        raise FileNotFoundError(f"Source favicon not found: {SOURCE}")
    os.makedirs(IMAGES_DIR, exist_ok=True)

    source = load_source()
    # App icons: rounded square with the image filling the square.
    app_1024 = make_app_icon(source, 1024)
    app_1024.save(os.path.join(IMAGES_DIR, "icon.png"), "PNG")
    app_1024.save(os.path.join(IMAGES_DIR, "icon-light.png"), "PNG")
    app_1024.resize((2048, 2048), Image.Resampling.LANCZOS).save(
        os.path.join(IMAGES_DIR, "icon@2x.png"), "PNG"
    )
    app_1024.resize((512, 512), Image.Resampling.LANCZOS).save(
        os.path.join(IMAGES_DIR, "icon-512.png"), "PNG"
    )
    make_ico(os.path.join(IMAGES_DIR, "icon.png"), os.path.join(IMAGES_DIR, "icon.ico"))
    make_icns(os.path.join(IMAGES_DIR, "icon.png"), os.path.join(IMAGES_DIR, "icon.icns"))
    make_icns(os.path.join(IMAGES_DIR, "icon-light.png"), os.path.join(IMAGES_DIR, "icon-light.icns"))
    make_template(22, os.path.join(IMAGES_DIR, "iconTemplate.png"))
    make_template(44, os.path.join(IMAGES_DIR, "iconTemplate@2x.png"))
    app_1024.resize((22, 22), Image.Resampling.LANCZOS).save(
        os.path.join(IMAGES_DIR, "iconTemplateUpdate.png"), "PNG"
    )
    app_1024.resize((44, 44), Image.Resampling.LANCZOS).save(
        os.path.join(IMAGES_DIR, "iconTemplateUpdate@2x.png"), "PNG"
    )
    make_svg(os.path.join(IMAGES_DIR, "icon.svg"), source)
    make_svg(os.path.join(IMAGES_DIR, "glyph.svg"), source)

    # Also write a small inline icon for the UI watermark.
    source.resize((64, 64), Image.Resampling.LANCZOS).save(
        os.path.join(IMAGES_DIR, "logo-inline.png"), "PNG"
    )

    print(f"Branding assets written to {IMAGES_DIR}")


if __name__ == "__main__":
    main()
