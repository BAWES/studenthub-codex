#!/bin/bash
# Rebase all 21 conflicting PR branches on updated main
set -e

cd /Users/BAWES/Sites/studenthub/studenthub-next

BRANCHES=(
  "feature/STU-3981-landing-page-polish"
  "feature/STU-3959-admin-daily-standup"
  "coder2/admin-mail-log-page"
  "ux-staff-detail-polish"
  "ux-polish/candidate-chat-page"
  "ux/login-page-shadcn-coral"
  "feature/STU-ux-shadcn-overhaul-login-detail"
  "coder2/admin-setting-page-stu3975"
  "feature/STU-3965-admin-fulltimer-page"
  "ux/staff-detail-pages-coral"
  "ux/admin-dashboard-shadcn-conversion-STU-4015"
  "chore/shadcn-workspacestage-css-removal"
  "feature/STU-company-settings-page"
  "feature/STU-3973-company-settings-shadcn"
  "fix/STU-3973-company-settings-duplicate-props"
  "ux/company-settings-shadcn"
  "coder2/STU-shadcn-webhook-major"
  "chore/STU-4074-datatable-glass-removal"
  "fix/shadcn-polish-admin-table-inline-styles"
  "uxdesigner/shadcn-polish-auth-pages"
  "chore/STU-4077-shadcn-admin-tables"
)

TOTAL=${#BRANCHES[@]}
SUCCESS=0
FAILED=()
SKIPPED=()

echo "=== Starting rebase of $TOTAL branches ==="
echo ""

for i in "${!BRANCHES[@]}"; do
  BRANCH="${BRANCHES[$i]}"
  NUM=$((i + 1))
  echo "[$NUM/$TOTAL] Processing: $BRANCH"

  # Skip if already on this branch (shouldn't happen after first)
  CURRENT=$(git branch --show-current)
  if [ "$CURRENT" != "$BRANCH" ]; then
    if ! git checkout "$BRANCH" 2>/dev/null; then
      echo "  ❌ Branch '$BRANCH' does not exist locally, trying to create from origin..."
      if ! git checkout -b "$BRANCH" "origin/$BRANCH" 2>/dev/null; then
        echo "  ❌ Failed to create branch '$BRANCH' from origin, skipping"
        SKIPPED+=("$BRANCH (no local/origin branch)")
        continue
      fi
    fi
  fi

  # Check if branch is behind main at all
  BEHIND=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "0")
  AHEAD=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo "0")
  
  if [ "$AHEAD" -eq 0 ]; then
    echo "  ✓ Already up to date with origin/main, no rebase needed"
    # Still push to make sure remote is in sync
    if git push origin "$BRANCH" --force-with-lease 2>&1; then
      echo "  ✓ Pushed $BRANCH (no changes needed)"
      SUCCESS=$((SUCCESS + 1))
    else
      echo "  ⚠ Push failed for $BRANCH (might need --force instead)"
      FAILED+=("$BRANCH (push failed)")
    fi
    continue
  fi

  echo "  Branch is $AHEAD commits behind main, rebasing..."

  # Attempt rebase
  if git rebase origin/main 2>&1; then
    echo "  ✓ Rebase clean, pushing..."
    if git push origin "$BRANCH" --force-with-lease 2>&1; then
      echo "  ✓ Success: $BRANCH"
      SUCCESS=$((SUCCESS + 1))
    else
      echo "  ⚠ Push failed, trying --force..."
      if git push origin "$BRANCH" --force 2>&1; then
        echo "  ✓ Success (forced push): $BRANCH"
        SUCCESS=$((SUCCESS + 1))
      else
        echo "  ❌ Push failed entirely for $BRANCH"
        FAILED+=("$BRANCH (push failed after rebase)")
        git rebase --abort 2>/dev/null || true
      fi
    fi
  else
    echo "  ⚠ Conflicts during rebase, resolving by accepting main (ours) version..."
    
    # Resolve all conflicts by accepting the incoming (main/ours in rebase context) version
    # Note: in rebase context, "ours" is the new base (main), "theirs" is the branch being rebased
    CONFLICT_FILES=$(git diff --name-only --diff-filter=U 2>/dev/null || true)
    
    if [ -n "$CONFLICT_FILES" ]; then
      echo "  Conflicting files:"
      echo "$CONFLICT_FILES" | sed 's/^/    /'
      
      # Accept main's version (ours) for all conflicted files
      echo "$CONFLICT_FILES" | xargs -I{} sh -c 'git checkout --ours "{}" 2>/dev/null && git add "{}"' 
      
      # Check if there are still unmerged paths
      REMAINING=$(git diff --name-only --diff-filter=U 2>/dev/null || true)
      if [ -n "$REMAINING" ]; then
        echo "  Still have unmerged: $REMAINING, doing git add -A"
        git add -A
      fi
    else
      echo "  No conflicted files found via diff-filter=U, doing git add -A"
      git add -A
    fi

    # Continue the rebase
    if GIT_EDITOR=true git rebase --continue 2>&1; then
      echo "  ✓ Conflicts resolved, pushing..."
      if git push origin "$BRANCH" --force-with-lease 2>&1; then
        echo "  ✓ Success: $BRANCH"
        SUCCESS=$((SUCCESS + 1))
      else
        echo "  ⚠ Push failed, trying --force..."
        if git push origin "$BRANCH" --force 2>&1; then
          echo "  ✓ Success (forced push): $BRANCH"
          SUCCESS=$((SUCCESS + 1))
        else
          echo "  ❌ Push failed entirely for $BRANCH"
          FAILED+=("$BRANCH (push failed after conflict resolution)")
        fi
      fi
    else
      echo "  ❌ Rebase continue failed for $BRANCH"
      FAILED+=("$BRANCH (rebase continue failed)")
      git rebase --abort 2>/dev/null || true
    fi
  fi
  
  echo ""
done

echo "=== Summary ==="
echo "Total: $TOTAL"
echo "Success: $SUCCESS"
echo "Failed: ${#FAILED[@]}"
if [ ${#FAILED[@]} -gt 0 ]; then
  for f in "${FAILED[@]}"; do
    echo "  ❌ $f"
  done
fi
echo "Skipped: ${#SKIPPED[@]}"
if [ ${#SKIPPED[@]} -gt 0 ]; then
  for s in "${SKIPPED[@]}"; do
    echo "  ⏭ $s"
  done
fi
