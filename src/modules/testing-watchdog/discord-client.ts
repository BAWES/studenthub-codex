/**
 * Discord client for checking and creating testing forum threads.
 *
 * Uses Discord REST API v10 to:
 *   - List existing threads in the #testing forum
 *   - Search by name to find threads matching a PR
 *   - Create new threads for PRs without coverage
 */

import { BOT_TOKEN } from '../discord-watchdog/config';
import { discordGet } from '../discord-watchdog/discord-client';
import type { TestingForumThread, MergedPullRequest } from './types';
import { TESTING_FORUM_CHANNEL_ID } from './config';

/** Error class for Discord forum operations. */
export class DiscordForumError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'DiscordForumError';
  }
}

/** Discord forum thread list API response. */
interface ForumThreadListResponse {
  threads: Array<{
    id: string;
    name: string;
    thread_metadata?: {
      create_timestamp?: string;
    };
  }>;
  members: unknown[];
  has_more?: boolean;
}

/**
 * List all active forum threads in the #testing channel.
 */
export async function listForumThreads(): Promise<TestingForumThread[]> {
  const data = await discordGet<ForumThreadListResponse>(
    `/channels/${TESTING_FORUM_CHANNEL_ID}/threads/active`,
  );

  return (data.threads ?? []).map((t) => ({
    id: t.id,
    name: t.name ?? '',
    createdAt: t.thread_metadata?.create_timestamp ?? new Date().toISOString(),
  }));
}

/**
 * Find a thread whose name contains the PR identifier (e.g. "STU-123").
 * We prepend the PR number to thread names, so search by that.
 */
export function findThreadForPR(
  pr: MergedPullRequest,
  threads: TestingForumThread[],
): TestingForumThread | null {
  // Threads are named: [PR-N] Title
  // Search for PR number in thread name
  const prPattern = `[#${pr.number}]`;
  const prPattern2 = `PR #${pr.number}`;
  const prPattern3 = `STU-${pr.number}`;

  return (
    threads.find(
      (t) =>
        t.name.includes(prPattern) ||
        t.name.includes(prPattern2) ||
        t.name.includes(prPattern3),
    ) ?? null
  );
}

/**
 * Create a new testing forum thread for a merged PR.
 *
 * @returns The created thread ID
 */
export async function createTestingThread(
  pr: MergedPullRequest,
): Promise<string> {
  const threadName = `[#${pr.number}] ${pr.title}`.slice(0, 100);

  const body = {
    name: threadName,
    message: {
      content: [
        `**PR merged:** ${pr.title}`,
        `**Author:** ${pr.authorLogin}`,
        `**Branch:** \`${pr.headRefName}\` → \`${pr.baseRefName}\``,
        `**Merge commit:** \`${pr.mergeCommitSha}\``,
        `**PR link:** ${pr.url}`,
        '',
        '**Verification steps:**',
        '1. Pull develop and check out the merge commit',
        '2. Run `npm run test:all` to verify CI passes',
        '3. Smoke-test the affected pages on the dev server',
        '4. Report any regressions in this thread',
        '',
        '/cc @everyone',
      ].join('\n'),
    },
  };

  const data = await discordPost<{ id: string }>(
    `/channels/${TESTING_FORUM_CHANNEL_ID}/threads`,
    body,
  );

  return data.id;
}

/**
 * Make an authenticated POST request to the Discord REST API.
 */
async function discordPost<T>(path: string, body: unknown): Promise<T> {
  const url = `https://discord.com/api/v10${path}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get('Retry-After') ?? '1', 10);
    await new Promise((r) => setTimeout(r, (retryAfter + 1) * 1000));
    const retryRes = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!retryRes.ok) {
      const errBody = await parseErrorBody(retryRes);
      throw new DiscordForumError(
        retryRes.status,
        errBody?.message ?? retryRes.statusText,
      );
    }
    return retryRes.json() as Promise<T>;
  }

  if (!res.ok) {
    const errBody = await parseErrorBody(res);
    throw new DiscordForumError(
      res.status,
      errBody?.message ?? res.statusText,
    );
  }

  return res.json() as Promise<T>;
}

/** Parse error body from Discord API. */
async function parseErrorBody(
  res: Response,
): Promise<{ code?: number; message?: string } | null> {
  try {
    const text = await res.text();
    const parsed = JSON.parse(text);
    return { code: parsed.code, message: parsed.message };
  } catch {
    return null;
  }
}
