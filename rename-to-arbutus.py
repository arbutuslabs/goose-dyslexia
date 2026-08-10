#!/usr/bin/env python3
"""Rename ReadWing branding to Arbutus Labs in known source files."""
import os
import re

REPO = os.path.dirname(os.path.abspath(__file__))

FILES = [
    os.path.join(REPO, "ui", "desktop", "package.json"),
    os.path.join(REPO, "ui", "desktop", "forge.config.ts"),
    os.path.join(REPO, "ui", "desktop", "index.html"),
    os.path.join(REPO, "ui", "desktop", "forge.deb.desktop"),
    os.path.join(REPO, "ui", "desktop", "forge.rpm.desktop"),
    os.path.join(REPO, "ui", "desktop", "src", "main.ts"),
    os.path.join(REPO, "ui", "desktop", "src", "components", "BaseChat.tsx"),
    os.path.join(REPO, "ui", "desktop", "src", "app-update.yml"),
    os.path.join(REPO, "crates", "goose", "src", "prompts", "system.md"),
]

# Per-file replacements: list of (pattern, replacement) tuples.
REPLACEMENTS = {
    os.path.join(REPO, "ui", "desktop", "package.json"): [
        (r'("productName":\s*)"ReadWing"', r'\1"Arbutus Labs"'),
    ],
    os.path.join(REPO, "ui", "desktop", "forge.config.ts"): [
        (r"name:\s*'ReadWing'", "name: 'ArbutusLabs'"),
        (r"executableName:\s*'ReadWing'", "executableName: 'ArbutusLabs'"),
        (r"name:\s*'ReadWingProtocol'", "name: 'ArbutusLabsProtocol'"),
        (r"'ReadWing needs access", "'Arbutus Labs needs access"),
        (r"'ReadWing (Custom Goose Distribution)'", "'Arbutus Labs (Custom Goose Distribution)'"),
        (r"id:\s*'ai\.readwing\.ReadWing'", "id: 'ai.arbutuslabs.ArbutusLabs'"),
        (r"homepage:\s*'https://github\.com/ReadWing/ReadWing'", "homepage: 'https://github.com/arbutuslabs/arbutuslabs'"),
    ],
    os.path.join(REPO, "ui", "desktop", "index.html"): [
        (r"<title>ReadWing</title>", "<title>Arbutus Labs</title>"),
    ],
    os.path.join(REPO, "ui", "desktop", "forge.deb.desktop"): [
        (r"^Name=ReadWing$", "Name=Arbutus Labs"),
        (r"Exec=/usr/lib/readwing/ReadWing %U", "Exec=/usr/lib/arbutuslabs/ArbutusLabs %U"),
        (r"Icon=/usr/share/pixmaps/readwing.png", "Icon=/usr/share/pixmaps/arbutuslabs.png"),
    ],
    os.path.join(REPO, "ui", "desktop", "forge.rpm.desktop"): [
        (r"^Name=ReadWing$", "Name=Arbutus Labs"),
        (r"Exec=/usr/lib/ReadWing/ReadWing %U", "Exec=/usr/lib/ArbutusLabs/ArbutusLabs %U"),
        (r"Icon=/usr/share/pixmaps/ReadWing.png", "Icon=/usr/share/pixmaps/ArbutusLabs.png"),
    ],
    os.path.join(REPO, "ui", "desktop", "src", "main.ts"): [
        (r"ReadWing", "Arbutus Labs"),
    ],
    os.path.join(REPO, "ui", "desktop", "src", "components", "BaseChat.tsx"): [
        (r"ReadWing", "Arbutus Labs"),
    ],
    os.path.join(REPO, "ui", "desktop", "src", "app-update.yml"): [
        (r"readwing-updater", "arbutuslabs-updater"),
    ],
    os.path.join(REPO, "crates", "goose", "src", "prompts", "system.md"): [
        (r"ReadWing", "Arbutus Labs"),
    ],
}


def main():
    for path in FILES:
        if not os.path.exists(path):
            print(f"Skip missing file: {path}")
            continue
        with open(path, "r") as f:
            content = f.read()
        original = content
        for pattern, replacement in REPLACEMENTS.get(path, []):
            content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
        if content != original:
            with open(path, "w") as f:
                f.write(content)
            print(f"Updated: {path}")
        else:
            print(f"No changes: {path}")


if __name__ == "__main__":
    main()
