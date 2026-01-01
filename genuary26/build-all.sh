#!/bin/bash

set -e  # Exit on error

echo "🏗️  Building Genuary 2026 projects..."

# Find and build all sketches (excluding _template)
echo ""
echo "🎨 Building sketches..."

# copy emptycontent.yaml to src/assets/content.yaml to start fresh
cp src/assets/emptycontent.yaml src/assets/content.yaml

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

  # append the sketch's content.yaml to the general content.yaml
  if [ -f "${sketch_dir}content.yaml" ]; then
    echo "  Merging content.yaml for $sketch_name"
    cat "${sketch_dir}content.yaml" >> src/assets/content.yaml
  fi
done

# Now we can build the main project
echo ""
echo "📦 Building main project..."
npm run build

echo ""
echo "✅ Build complete! All projects ready in dist/"
