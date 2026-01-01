#!/bin/bash

set -e  # Exit on error

echo "🏗️  Building Genuary 2026 projects..."

# Build main project
echo ""
echo "📦 Building main project..."
npm run build

# Find and build all sketches (excluding _template)
echo ""
echo "🎨 Building sketches..."

for sketch_dir in sketches/*/; do
  # Skip if it's the template directory
  if [[ "$sketch_dir" == "sketches/_template/" ]]; then
    continue
  fi

  # Skip if it doesn't have a package.json
  if [ ! -f "${sketch_dir}package.json" ]; then
    continue
  fi

  sketch_name=$(basename "$sketch_dir")
  echo ""
  echo "  Building sketch: $sketch_name"

  # Build the sketch
  (cd "$sketch_dir" && npm run build)

  # Copy sketch dist to main dist folder
  echo "  Copying $sketch_name to dist/$sketch_name"
  mkdir -p "dist/$sketch_name"
  cp -r "${sketch_dir}dist/"* "dist/$sketch_name/"
done

echo ""
echo "✅ Build complete! All projects ready in dist/"
