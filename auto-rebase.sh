#!/bin/bash
set -e

cd /Users/BAWES/Sites/studenthub/studenthub-next-4231

# Start the rebase
git rebase origin/main 2>&1 || true

# Loop: resolve conflicts and continue until done
MAX_ITER=500
for i in $(seq 1 $MAX_ITER); do
  CONFLICTED=$(git diff --name-only --diff-filter=U)
  if [ -z "$CONFLICTED" ]; then
    echo "No more conflicts. Checking if rebase is complete..."
    if GIT_EDITOR=true git rebase --continue 2>&1; then
      echo "Rebase completed successfully!"
      exit 0
    else
      # Could be a different error
      echo "Rebase --continue failed. Checking status..."
      CONFLICTED2=$(git diff --name-only --diff-filter=U)
      if [ -z "$CONFLICTED2" ]; then
        echo "No conflicts but rebase --continue failed. Rebasing may be done."
        git status
        exit 0
      fi
    fi
  fi

  echo "=== Iteration $i: Resolving $(echo "$CONFLICTED" | wc -l) conflicted files ==="
  
  # Resolve each conflict by keeping the branch's version (--theirs in rebase context)
  echo "$CONFLICTED" | while IFS= read -r file; do
    if [ -n "$file" ]; then
      git checkout --theirs "$file" 2>/dev/null || true
    fi
  done
  
  # Add resolved files
  git add . 2>/dev/null || true
  
  # Continue rebase
  if GIT_EDITOR=true git rebase --continue 2>&1; then
    echo "Rebase completed successfully!"
    exit 0
  fi
  
  # Check if we're done
  if [ "$(git status --porcelain | head -1 | cut -d' ' -f1)" = "" ]; then
    echo "Rebase appears complete."
    git status
    exit 0
  fi
done

echo "Reached max iterations ($MAX_ITER) — rebase may still be in progress."
exit 1
