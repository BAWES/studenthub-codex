/**
 * Configuration loader for the testing thread watchdog.
 *
 * Reads from environment variables with sensible defaults.
 * All env vars are prefixed with TESTING_WATCHDOG_.
 */

import type { TestingWatchdogConfig } from './types';

/** The Discord testing forum channel ID. */
export const TESTING_FORUM_CHANNEL_ID =
  process.env.TESTING_WATCHDOG_FORUM_CHANNEL_ID ?? '1513600918678016221';

/** GitHub repo the watchdog monitors. */
export const GITHUB_REPO =
  process.env.TESTING_WATCHDOG_GITHUB_REPO ?? 'BAWES/studenthub-codex';

/** How far back to look for merged PRs (in minutes). Default 10 minutes. */
export const LOOKBACK_MINUTES = parseInt(
  process.env.TESTING_WATCHDOG_LOOKBACK ?? '10',
  10,
);

/** Validate config at startup. Returns list of error messages (empty = OK). */
export function validateConfig(): string[] {
  const errors: string[] = [];

  if (!process.env.DISCORD_BOT_TOKEN) {
    errors.push('DISCORD_BOT_TOKEN is not set');
  }

  // Forum channel ID should be numeric
  if (!/^\d+$/.test(TESTING_FORUM_CHANNEL_ID)) {
    errors.push(
      `TESTING_WATCHDOG_FORUM_CHANNEL_ID must be numeric, got "${TESTING_FORUM_CHANNEL_ID}"`,
    );
  }

  if (isNaN(LOOKBACK_MINUTES) || LOOKBACK_MINUTES < 1) {
    errors.push(
      `TESTING_WATCHDOG_LOOKBACK must be >= 1, got "${process.env.TESTING_WATCHDOG_LOOKBACK}"`,
    );
  }

  return errors;
}

/** Build the full config object. */
export function getConfig(): TestingWatchdogConfig {
  return {
    discordBotToken: process.env.DISCORD_BOT_TOKEN ?? '',
    githubRepo: GITHUB_REPO,
    testingForumChannelId: TESTING_FORUM_CHANNEL_ID,
  };
}
