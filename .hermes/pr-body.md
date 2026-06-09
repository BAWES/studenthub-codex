## Summary

Add a keyboard-accessible skip-to-content link to the two workspace shells that were missing one (WorkspaceOS and RoleLayoutShell). WorkspaceShell already had one.

## Accessibility impact (P0)

Screen reader and keyboard-only users can now bypass the sidebar rail (5+ navigation items) on every page using WorkspaceOS or RoleLayoutShell. This satisfies WCAG 2.4.1 (Bypass Blocks).

## Changes

- **RoleLayoutShell.tsx** — Add skip link as first element; add `id="main-content"` to existing `<main>`
- **WorkspaceOS.tsx** — Add skip link before wrapper `<main>`; add `id="main-content"` to it
- **RoleLayoutShell.test.tsx** — 2 new tests verifying skip link renders and targets `#main-content`
- **WorkspaceOS.test.tsx** — New test file (4 tests) verifying skip link, main target, and child rendering

## Verification

- 19 tests pass (15 RoleLayoutShell + 4 WorkspaceOS)
- 1846 unit tests pass (only pre-existing AWS SDK module fail unrelated to this change)
