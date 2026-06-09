/**
 * Low-level Discord REST API client.
 *
 * Thin wrapper around fetch that handles:
 *   - Bearer token auth
 *   - Rate limiting (retry-after)
 *   - JSON parsing / error extraction
 */
import { BOT_TOKEN } from './config';
import type { DiscordApiError } from './types';

const API_BASE = 'https://discord.com/api/v10';

/** Custom error for Discord API failures with structured error data. */
export class DiscordApiClientError extends Error {
  constructor(
    public status: number,
    public discordCode: number | undefined,
    message: string,
  ) {
    super(message);
    this.name = 'DiscordApiClientError';
  }
}

/**
 * Make an authenticated GET request to the Discord REST API.
 * Handles rate-limit backoff automatically (one retry).
 */
export async function discordGet<T>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  // Rate limit handling
  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get('Retry-After') ?? '1', 10);
    await new Promise((r) => setTimeout(r, (retryAfter + 1) * 1000));
    // Retry once
    const retryRes = await fetch(url, {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    if (!retryRes.ok) {
      const body = await parseErrorBody(retryRes);
      throw new DiscordApiClientError(retryRes.status, body?.code, body?.message ?? retryRes.statusText);
    }
    return retryRes.json() as Promise<T>;
  }

  if (!res.ok) {
    const body = await parseErrorBody(res);
    throw new DiscordApiClientError(res.status, body?.code, body?.message ?? res.statusText);
  }

  return res.json() as Promise<T>;
}

/**
 * Make an authenticated PATCH request (for updating bot role permissions).
 */
export async function discordPatch<T>(path: string, body: unknown): Promise<T> {
  const url = `${API_BASE}${path}`;

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  // Rate limit handling
  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get('Retry-After') ?? '1', 10);
    await new Promise((r) => setTimeout(r, (retryAfter + 1) * 1000));
    const retryRes = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!retryRes.ok) {
      const errBody = await parseErrorBody(retryRes);
      throw new DiscordApiClientError(retryRes.status, errBody?.code, errBody?.message ?? retryRes.statusText);
    }
    return retryRes.json() as Promise<T>;
  }

  if (!res.ok) {
    const errBody = await parseErrorBody(res);
    throw new DiscordApiClientError(res.status, errBody?.code, errBody?.message ?? res.statusText);
  }

  return res.json() as Promise<T>;
}

/** Parse error body, which might be JSON or plain text. */
async function parseErrorBody(res: Response): Promise<{ code?: number; message?: string } | null> {
  try {
    const text = await res.text();
    const parsed = JSON.parse(text);
    return { code: parsed.code, message: parsed.message };
  } catch {
    return null;
  }
}
