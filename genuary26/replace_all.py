#!/usr/bin/env python3

"""Recursively replace all occurrences of keys matching the pattern
__KEY__ in files with values from a config file. We had to
write this because sed on macOS gets upset with UTF-8 files."""

import sys
import os

def read_replacements(filename):
    """Read key-value pairs from the config file."""
    replacements = {}
    try:
        with open(filename, 'r') as f:
            for line_num, line in enumerate(f, 1):
                line = line.strip()
                # Skip empty lines and comments
                if not line or line.startswith('#'):
                    continue

                # Parse KEY=value format
                if '=' not in line:
                    print(f"Warning: Skipping invalid line {line_num}: {line}", file=sys.stderr)
                    continue

                key, value = line.split('=', 1)
                key = key.strip()
                value = value.strip()

                if not key:
                    print(f"Warning: Empty key on line {line_num}", file=sys.stderr)
                    continue

                replacements[f"__{key}__"] = value

        return replacements

    except FileNotFoundError:
        print(f"Error: File '{filename}' not found", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error reading file '{filename}': {e}", file=sys.stderr)
        sys.exit(1)

def replace_in_file(filepath, replacements):
    """Replace all occurrences of __KEY__ in the file with corresponding values."""
    try:
        # Try to read the file as text
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except (UnicodeDecodeError, PermissionError):
        # Skip binary files or files we can't read
        return False
    except Exception as e:
        print(f"Warning: Could not read '{filepath}': {e}", file=sys.stderr)
        return False

    # Check if any replacements need to be made
    original_content = content
    for pattern, replacement in replacements.items():
        content = content.replace(pattern, replacement)

    # Only write if content changed
    if content != original_content:
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        except Exception as e:
            print(f"Error writing to '{filepath}': {e}", file=sys.stderr)
            return False

    return False

def main():
    if len(sys.argv) != 2:
        print("Usage: python replace_all.py <config_file>", file=sys.stderr)
        print("Config file should contain lines in the format: KEY=value", file=sys.stderr)
        sys.exit(1)

    config_file = sys.argv[1]

    # Read replacements from config file
    replacements = read_replacements(config_file)

    if not replacements:
        print("Warning: No replacements found in config file", file=sys.stderr)
        return

    print(f"Loaded {len(replacements)} replacement(s):")
    for pattern, value in replacements.items():
        print(f"  {pattern} -> {value}")
    print()

    # Walk through all files recursively
    files_processed = 0
    files_modified = 0

    for root, dirs, files in os.walk('.'):
        # Skip hidden directories and common ignore patterns
        dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', '__pycache__', 'dist', 'build']]

        for filename in files:
            # Skip hidden files
            if filename.startswith('.'):
                continue

            filepath = os.path.join(root, filename)
            files_processed += 1

            if replace_in_file(filepath, replacements):
                files_modified += 1
                print(f"Modified: {filepath}")

    print()
    print(f"Processed {files_processed} file(s), modified {files_modified} file(s)")

if __name__ == '__main__':
    main()
