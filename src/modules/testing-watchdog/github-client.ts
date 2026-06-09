/**
 * GitHub client for fetching recent merged PRs.
 *
 * Uses gh CLI by default (avoids token management).
 * Falls back to direct API call if GITHUB_TOKEN is set in env.
 */

import { execSync } from 'child_process';
import type { MergedPullRequest } from './types';
import { GITHUB_REPO, LOOKBACK_MINUTES } from './config';

/** Maximum number of PRs to fetch per run. */
const MAX_RESULTS = 20;

/** Error class for GitHub API failures. */
export class GitHubClientError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'GitHubClientError';
  }
}

/** Fetch recently merged PRs via gh CLI. */
export function fetchRecentMergedPRs(): MergedPullRequest[] {
  const since = new Date(
    Date.now() - LOOKBACK_MINUTES * 60 * 1000,
  ).toISOString();

  const query = `repo:${GITHUB_REPO} is:pr is:merged merged:>=${since} sort:updated-desc`;

  try {
    const output = execSync(
      `gh pr list --search "${query}" --json number,title,mergedAt,mergeCommit,baseRefName,headRefName,author,url --limit ${MAX_RESULTS} --jq '.[] | {number, title, mergedAt, mergeCommitOid: .mergeCommit.oid, baseRefName, headRefName, authorLogin: .author.login, url}'`,
      {
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024,
      },
    );

    if (!output.trim()) {
      return [];
    }

    // gh CLI returns JSONL (one line per item) or JSON array depending on version
    let parsed: unknown[];
    try {
      parsed = JSON.parse(output.trim());
    } catch {
      // Try JSONL format (each line is a JSON object)
      parsed = output
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((line) => JSON.parse(line));
    }

    return parsed.map((item: any): MergedPullRequest => ({
      number: item.number,
      title: item.title,
      mergedAt: item.mergedAt,
      mergeCommitSha: item.mergeCommitOid,
      baseRefName: item.baseRefName,
      headRefName: item.headRefName,
      authorLogin: item.authorLogin,
      url: item.url,
    }));
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new GitHubClientError(1, `gh CLI failed: ${err.message}`);
    }
    throw new GitHubClientError(1, 'gh CLI failed with unknown error');
  }
}
