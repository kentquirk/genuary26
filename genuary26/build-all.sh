#!/bin/bash

set -e  # Exit on error

CHECKSUM_FILE=".build-checksums"

# Function to calculate checksum of a directory's source files
calculate_checksum() {
  local dir="$1"
  # Find all source files, excluding node_modules and dist
  # Sort them to ensure consistent ordering, then calculate checksum
  find "$dir" -type f \
    ! -path "*/node_modules/*" \
    ! -path "*/dist/*" \
    ! -path "*/.git/*" \
    ! -name ".DS_Store" \
    -print0 | sort -z | xargs -0 shasum 2>/dev/null | shasum | awk '{print $1}'
}

# Function to get stored checksum for a sketch
get_stored_checksum() {
  local sketch_name="$1"
  if [ -f "$CHECKSUM_FILE" ]; then
    grep "^${sketch_name}:" "$CHECKSUM_FILE" 2>/dev/null | cut -d':' -f2
  fi
}

# Function to update stored checksum for a sketch
update_checksum() {
  local sketch_name="$1"
  local checksum="$2"

  # Create temp file, excluding old entry
  if [ -f "$CHECKSUM_FILE" ]; then
    grep -v "^${sketch_name}:" "$CHECKSUM_FILE" > "${CHECKSUM_FILE}.tmp" 2>/dev/null || true
    mv "${CHECKSUM_FILE}.tmp" "$CHECKSUM_FILE"
  fi

  # Add new entry
  echo "${sketch_name}:${checksum}" >> "$CHECKSUM_FILE"
}

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
  echo "  Checking sketch: $sketch_name"

  # Calculate current checksum
  current_checksum=$(calculate_checksum "$sketch_dir")
  stored_checksum=$(get_stored_checksum "$sketch_name")

  if [ "$current_checksum" = "$stored_checksum" ] && [ -d "${sketch_dir}dist" ]; then
    echo "  ⏭️  Skipping $sketch_name (unchanged)"
  else
    echo "  📦 Building sketch: $sketch_name"

    # Build the sketch
    (cd "$sketch_dir" && npm run build)

    # Update checksum after successful build
    update_checksum "$sketch_name" "$current_checksum"
  fi

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
