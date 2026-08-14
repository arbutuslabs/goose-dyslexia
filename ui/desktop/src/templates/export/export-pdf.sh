#!/bin/bash

# export-pdf.sh
# This script takes a generated Markdown lesson plan and renders it into
# a beautifully formatted PDF matching the school's exact layout.

# Ensure common tool locations are on PATH so the script works even when the
# user's shell environment is not fully configured.
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

MARKDOWN_FILE=$1
OUTPUT_PDF=$2

# Resolve the template relative to this script's directory so it can be run
# from anywhere.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE="$SCRIPT_DIR/school-template.tex"

if [ -z "$MARKDOWN_FILE" ] || [ -z "$OUTPUT_PDF" ]; then
  echo "Usage: ./export-pdf.sh <input.md> <output.pdf>"
  exit 1
fi

if ! command -v pandoc >/dev/null 2>&1; then
  echo "❌ pandoc not found. Please install pandoc (e.g. via Homebrew)."
  exit 1
fi

# Prefer pdflatex, but fall back to tectonic if the system does not have a
# full LaTeX distribution installed.
PDF_ENGINE="pdflatex"
if ! command -v pdflatex >/dev/null 2>&1; then
  if command -v tectonic >/dev/null 2>&1; then
    PDF_ENGINE="tectonic"
  else
    echo "❌ No PDF engine found. Please install pdflatex (TeX Live/MacTeX) or tectonic."
    exit 1
  fi
fi

echo "🎨 Merging $MARKDOWN_FILE with proprietary template ($TEMPLATE) using $PDF_ENGINE..."

pandoc "$MARKDOWN_FILE" \
    --template="$TEMPLATE" \
    --pdf-engine="$PDF_ENGINE" \
    -o "$OUTPUT_PDF"

if [ $? -eq 0 ]; then
  echo "✅ Success! Saved formatted lesson to $OUTPUT_PDF"
else
  echo "❌ Error during PDF generation. Check the pandoc/LaTeX output above."
fi