/**
 * Types for the testing thread watchdog.
 *
 * Tracks recently merged PRs and ensures each has a corresponding
 * testing forum thread in the #testing Discord channel.
 */

/** A recently merged PR from GitHub. */
export interface MergedPullRequest {
  /** PR number */
  number: number;
  /** PR title */
  title: string;
  /** ISO timestamp of merge */
  mergedAt: string;
  /** Merge commit SHA */
  mergeCommitSha: string;
  /** Base branch (should be 'develop' or 'main') */
  baseRefName: string;
  /** Head branch name */
  headRefName: string;
  /** Author login */
  authorLogin: string;
  /** PR URL */
  url: string;
}

/** A testing thread in the Discord forum. */
export interface TestingForumThread {
  /** Discord thread ID */
  id: string;
  /** Thread name (first 100 chars) */
  name: string;
  /** ISO timestamp of creation */
  createdAt: string;
}

/** Result of checking one PR against the forum. */
export interface PrCheckResult {
  pr: MergedPullRequest;
  /** Which Discord thread covers this PR, if any */
  matchingThread: TestingForumThread | null;
  /** Action taken */
  action: 'created' | 'already_exists' | 'skipped';
}

/** Full watchdog run result. */
export interface TestingWatchdogResult {
  timestamp: string;
  /** PRs that were checked */
  checked: PrCheckResult[];
  /** How many new threads were created */
  threadsCreated: number;
  /** How many PRs already had threads */
  threadsExisting: number;
  /** How many were skipped (e.g. old PR) */
  skipped: number;
  /** Errors encountered */
  errors: string[];
}

/** Configuration for the testing watchdog. */
export interface TestingWatchdogConfig {
  /** Discord bot token */
  discordBotToken: string;
  /** GitHub owner/repo (e.g. 'BAWES/studenthub-codex') */
  githubRepo: string;
  /** GitHub API token (or empty to use gh CLI) */
  githubToken?: string;
  /** Discord forum channel ID for #testing */
  testingForumChannelId: string;
}
