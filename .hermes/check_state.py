#!/usr/bin/env python3
"""Check worktree state."""
import json, os, subprocess

worktree = "/Users/BAWES/Sites/studenthub/studenthub-next-coder2"

# Git status
r = subprocess.run(["git", "status"], capture_output=True, text=True, timeout=10, cwd=worktree)
print("=== GIT STATUS ===")
print(r.stdout)
if r.stderr:
    print("STDERR:", r.stderr)

# Current branch
r2 = subprocess.run(["git", "branch", "--show-current"], capture_output=True, text=True, timeout=10, cwd=worktree)
print("Branch:", r2.stdout.strip())

# Recent commits
r3 = subprocess.run(["git", "log", "--oneline", "-5"], capture_output=True, text=True, timeout=10, cwd=worktree)
print("\n=== RECENT COMMITS ===")
print(r3.stdout)
