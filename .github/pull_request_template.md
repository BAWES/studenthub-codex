## Summary

<!-- Brief description of what this PR does and why -->

## Changes

<!-- List key changes, files touched, and approach -->

-
-
-

## Type

- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Documentation
- [ ] CI / tooling
- [ ] Design system / UI

## Checklist

- [ ] Branch follows [CLAUDE.md](CLAUDE.md) naming: `feature/STU-N-*`, `fix/STU-N-*`, or `chore/STU-N-*`
- [ ] Commits follow [conventional commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`, `ci:`
- [ ] TypeScript passes (`npx tsc --noEmit`)
- [ ] Build passes (`npx next build`)
- [ ] Validation passes (`node scripts/validate.mjs`)
- [ ] Smoke tests pass (`node scripts/smoke-test.mjs`) — if applicable
- [ ] No hardcoded secrets or credentials
- [ ] Server actions start with `"use server"` in `actions.ts` files
- [ ] Auth gated via `requireRole()` or `requireCapability()` where needed
- [ ] Paths are revalidated after writes (`revalidatePath`)
- [ ] Added/updated tests for new behavior

## Test Plan

<!-- How can a reviewer verify this works? -->

1.
2.
3.

## Screenshots

<!-- If UI changes, add before/after screenshots -->

## Agent Notes

<!-- If this PR was generated with AI assistance, note the tool and approach -->

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
