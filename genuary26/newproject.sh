#!/bin/bash

# Check if day number is provided
if [ -z "$1" ]; then
  echo "Error: Please provide a day number"
  echo "Usage: ./newproject.sh <day no> <project-name> <project-title>"
  exit 1
fi

# Check if project name is provided
if [ -z "$2" ]; then
  echo "Error: Please provide a project name"
  echo "Usage: ./newproject.sh <day no> <project-name> <project-title>"
  exit 1
fi

# Check if project title is provided
if [ -z "$3" ]; then
  echo "Error: Please provide a project title"
  echo "Usage: ./newproject.sh <day no> <project-name> <project-title>"
  exit 1
fi

PROJECT_DAY="$1"
PROJECT_NAME="$2"
PROJECT_TITLE="$3"
TEMPLATE_DIR="sketches/_template"
TARGET_DIR="sketches/$PROJECT_NAME"

# Check if template exists
if [ ! -d "$TEMPLATE_DIR" ]; then
  echo "Error: Template directory not found at $TEMPLATE_DIR"
  exit 1
fi

# Check if target directory already exists
if [ -d "$TARGET_DIR" ]; then
  echo "Error: Project '$PROJECT_NAME' already exists at $TARGET_DIR"
  exit 1
fi

# Copy template to new directory
echo "Creating new project: $PROJECT_NAME"
cp -r "$TEMPLATE_DIR" "$TARGET_DIR"

# Navigate to new project directory
cd "$TARGET_DIR" || exit 1

# replace __DAY__, __NAME__ and __TITLE__ in files
echo "Customizing project files..."

# Create temporary config file for replacements
TEMP_CONFIG=$(mktemp)
cat > "$TEMP_CONFIG" << EOF
DAY=$PROJECT_DAY
NAME=$PROJECT_NAME
TITLE=$PROJECT_TITLE
EOF

# Run Python replacement script
python3 ../../replace_all.py "$TEMP_CONFIG"

# Clean up temp file
rm "$TEMP_CONFIG"

# Install dependencies
echo "Installing dependencies..."
npm install

# Open in VS Code
echo "Opening in VS Code..."
code .

# Start dev server
echo "Starting dev server..."
npm run dev
