#!/bin/bash

# Check if project name is provided
if [ -z "$1" ]; then
  echo "Error: Please provide a project name"
  echo "Usage: ./newproject.sh <project-name>"
  exit 1
fi

PROJECT_NAME="$1"
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

# Install dependencies
echo "Installing dependencies..."
npm install

# Open in VS Code
echo "Opening in VS Code..."
code .

# Start dev server
echo "Starting dev server..."
npm run dev
