#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

# Auto-commit and push changes
if git diff --quiet && git diff --cached --quiet; then
  echo "No changes to sync."
  exit 0
fi

# Stage everything except ignored files

git add -A

# Generate commit message with timestamp
msg="auto-sync $(date '+%Y-%m-%d %H:%M:%S')"

# Commit (no-op if nothing staged)
if git diff --cached --quiet; then
  echo "No staged changes to commit."
  exit 0
fi

git commit -m "$msg"

git push

echo "Synced to origin/main."
