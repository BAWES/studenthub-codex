/**
 * Testing thread watchdog — orchestrator.
 *
 * Workflow:
 *   1. Fetch recently merged PRs from GitHub (within LOOKBACK_MINUTES)
 *   2. Fetch existing active forum threads from #testing
 *   3. For each PR, check if a thread already exists
 *   4. Create threads for PRs without coverage
 *   5. Return a structured result
 *
 * Runs every 5 minutes as a cron job.
 */

import { validateConfig } from './config';
import { fetchRecentMergedPRs } from './github-client';
import {
  listForumThreads,
  findThreadForPR,
  createTestingThread,
} from './discord-client';
import type { TestingWatchdogResult } from './types';

/**
 * Run a full testing thread watchdog sweep.
 */
export async function runTestingWatchdog(): Promise<TestingWatchdogResult> {
  const timestamp = new Date().toISOString();
  const errors: string[] = [];

  // Validate config
  const configErrors = validateConfig();
  if (configErrors.length > 0) {
    return {
      timestamp,
      checked: [],
      threadsCreated: 0,
      threadsExisting: 0,
      skipped: 0,
      errors: configErrors.map((e) => `Config: ${e}`),
    };
  }

  // Step 1: Fetch recent merged PRs
  let prs;
  try {
    prs = fetchRecentMergedPRs();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      timestamp,
      checked: [],
      threadsCreated: 0,
      threadsExisting: 0,
      skipped: 0,
      errors: [`GitHub fetch failed: ${msg}`],
    };
  }

  if (prs.length === 0) {
    return {
      timestamp,
      checked: [],
      threadsCreated: 0,
      threadsExisting: 0,
      skipped: 0,
      errors: [],
    };
  }

  // Step 2: Fetch existing forum threads
  let threads: Awaited<ReturnType<typeof listForumThreads>>;
  try {
    threads = await listForumThreads();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      timestamp,
      checked: [],
      threadsCreated: 0,
      threadsExisting: 0,
      skipped: 0,
      errors: [`Discord thread list failed: ${msg}`],
    };
  }

  // Step 3 & 4: Check each PR and create threads
  const checked: Awaited<ReturnType<typeof runTestingWatchdog>>['checked'] = [];
  let threadsCreated = 0;
  let threadsExisting = 0;
  let skipped = 0;

  for (const pr of prs) {
    // Skip PRs that are not merged to develop or main
    if (
      pr.baseRefName !== 'develop' &&
      pr.baseRefName !== 'main'
    ) {
      checked.push({ pr, matchingThread: null, action: 'skipped' });
      skipped++;
      continue;
    }

    const existingThread = findThreadForPR(pr, threads);

    if (existingThread) {
      checked.push({ pr, matchingThread: existingThread, action: 'already_exists' });
      threadsExisting++;
      continue;
    }

    // Create a new thread
    try {
      await createTestingThread(pr);
      checked.push({ pr, matchingThread: null, action: 'created' });
      threadsCreated++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Thread creation failed for PR #${pr.number}: ${msg}`);
      checked.push({ pr, matchingThread: null, action: 'skipped' });
      skipped++;
    }
  }

  return {
    timestamp,
    checked,
    threadsCreated,
    threadsExisting,
    skipped,
    errors,
  };
}
