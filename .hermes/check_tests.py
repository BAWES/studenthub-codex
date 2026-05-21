#!/usr/bin/env python3
"""Check project status - tests, types, build."""
import json, os, subprocess

worktree = "/Users/BAWES/Sites/studenthub/studenthub-next-coder2"

# Check existing tests for employer dashboard
print("=== SEARCHING FOR TESTS ===")
r = subprocess.run(
    ["find", ".", "-name", "*.test.*", "-path", "*/employer/dashboard/*"],
    capture_output=True, text=True, timeout=10, cwd=worktree
)
print(r.stdout or "No test files found")
r2 = subprocess.run(
    ["find", ".", "-name", "*.spec.*", "-path", "*/employer/*"],
    capture_output=True, text=True, timeout=10, cwd=worktree
)
print("E2E specs:", r2.stdout or "None")

# Check if we're on develop or a feature branch
print("\n=== GIT BRANCH ===")
r3 = subprocess.run(
    ["git", "branch", "-a"],
    capture_output=True, text=True, timeout=10, cwd=worktree
)
print(r3.stdout)
