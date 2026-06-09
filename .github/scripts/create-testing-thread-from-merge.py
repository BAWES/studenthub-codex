#!/usr/bin/env python3
"""
Create a Discord testing forum thread from GitHub Actions merge event.

Called by .github/workflows/create-testing-thread.yml on push to develop.
Creates a forum thread in the #testing channel with PR details.

Environment variables (set by GHA):
  DISCORD_BOT_TOKEN — Discord bot token
  FORUM_CHANNEL_ID — The #testing forum channel ID
  PR_NUM — GitHub PR number
  PR_TITLE — PR title
  PR_AUTHOR — PR author login
  PR_URL — Full PR URL
"""

import json
import os
import sys
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError


def main():
    token = os.environ.get("DISCORD_BOT_TOKEN", "")
    forum_id = os.environ.get("FORUM_CHANNEL_ID", "1513600918678016221")
    pr_num = os.environ.get("PR_NUM", "?")
    pr_title = os.environ.get("PR_TITLE", "")
    pr_author = os.environ.get("PR_AUTHOR", "unknown")
    pr_url = os.environ.get("PR_URL", "")

    if not token:
        print("ERROR: DISCORD_BOT_TOKEN not set", file=sys.stderr)
        return 1

    # Build thread name (max 100 chars for Discord)
    thread_name = f"Test: PR #{pr_num} — {pr_title}"
    if len(thread_name) > 100:
        thread_name = thread_name[:97] + "..."

    # Build message content
    message = (
        f"**PR #{pr_num} — {pr_title}**\n"
        f"**Author:** {pr_author}\n"
        f"**Branch:** develop\n"
        f"**URL:** {pr_url}\n\n"
        "**How to test:**\n"
        "1. Dev server: http://localhost:3000\n"
        "2. Preview via tunnel: https://bot-sh-testing.studenthub.co\n\n"
        "**Instructions:**\n"
        "- Verify against the PR description scope\n"
        "- Check all affected routes/pages\n"
        "- Report any regressions or bugs\n"
        "- Comment with ✅ Pass or ❌ Fail\n\n"
        "_Auto-created from merge to develop via GitHub Actions_"
    )

    payload = json.dumps({
        "name": thread_name,
        "message": {"content": message},
        "auto_archive_duration": 1440,  # 24 hours
    }).encode()

    req = Request(
        f"https://discord.com/api/v10/channels/{forum_id}/threads",
        data=payload,
        headers={
            "Authorization": f"Bot {token}",
            "Content-Type": "application/json",
            "User-Agent": "GitHubActions (studenthub-codex, 1.0)",
        },
        method="POST",
    )

    try:
        resp = urlopen(req, timeout=15)
        result = json.loads(resp.read().decode())
        thread_id = result.get("id", "")
        print(f"✅ Testing thread created: {thread_name}")
        print(f"   Thread ID: {thread_id}")
        return 0
    except HTTPError as e:
        body = e.read().decode()[:500]
        print(f"❌ Discord API error {e.code}: {body}", file=sys.stderr)
        return 1
    except URLError as e:
        print(f"❌ Network error: {e.reason}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
