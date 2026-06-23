#!/usr/bin/env tsx
/**
 * Testing thread watchdog — CLI runner.
 *
 * Usage:
 *   npx tsx scripts/testing-watchdog.ts
 *   npm run watchdog:testing
 *
 * Env vars:
 *   DISCORD_BOT_TOKEN       — Required. Bot token for Discord API.
 *   TESTING_WATCHDOG_FORUM_CHANNEL_ID — Optional. Default: #testing channel ID.
 *   TESTING_WATCHDOG_GITHUB_REPO      — Optional. Default: BAWES/studenthub-codex.
 *   TESTING_WATCHDOG_LOOKBACK         — Optional. Minutes to look back. Default: 10.
 *
 * Exit codes:
 *   0 — OK (no errors)
 *   1 — Config error or critical failure
 */

import { runTestingWatchdog } from '../src/modules/testing-watchdog';

async function main(): Promise<number> {
  try {
    const result = await runTestingWatchdog();

    // Print summary
    console.log(`[${result.timestamp}] Testing watchdog run complete`);
    console.log(`  PRs checked:     ${result.checked.length}`);
    console.log(`  Threads created: ${result.threadsCreated}`);
    console.log(`  Already existed: ${result.threadsExisting}`);
    console.log(`  Skipped:         ${result.skipped}`);

    if (result.threadsCreated > 0) {
      console.log(
        `\nCreated ${result.threadsCreated} new testing thread(s).`,
      );
    }

    if (result.errors.length > 0) {
      console.error('\nErrors:');
      for (const err of result.errors) {
        console.error(`  - ${err}`);
      }
      return 1;
    }

    return 0;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Fatal error: ${msg}`);
    return 1;
  }
}

main().then((code) => process.exit(code));
