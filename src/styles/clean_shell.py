#!/usr/bin/env python3
"""Remove stale CSS blocks from shell.css."""

with open("shell.css", "r") as f:
    content = f.read()

original = content

# Block 1: .detailSection + .detailSection h3 + .detailFacts (lines ~1813-1847)
# Remove from "/* ── Detail Section ───" to the blank line before "/* ── Feature Grid ───"
block1_start = "/* ── Detail Section ─────────────────────────────────────────────────── */"
block1_end = "/* ── Feature Grid (Role dashboards) ─────────────────────────────── */"
idx1 = content.find(block1_start)
idx2 = content.find(block1_end)
if idx1 >= 0 and idx2 > idx1:
    # Remove from block1_start to just before block1_end
    # Include the blank lines before block1_end
    before = content[:idx1]
    after = content[idx2:]
    content = before + after
    print(f"Removed .detailSection/.detailFacts block ({idx2 - idx1} chars)")

# Block 2: .row animation block (lines ~1416-1425)
block2_start = "/* Row hover animation */"
block2_end = "/* ── Command Palette — Glass Raycast-style ─────────────────────────── */"
idx1 = content.find(block2_start)
idx2 = content.find(block2_end)
if idx1 >= 0 and idx2 > idx1:
    before = content[:idx1]
    after = content[idx2:]
    content = before + after
    print(f"Removed .row animation block ({idx2 - idx1} chars)")

# Block 3: .dataList (second occurrence, non-table layout) - lines ~967-974
block3_start = "/* ── Data List (non-table layout) ───────────────────────────────────── */"
block3_end = ".dataListRow {"
idx1 = content.find(block3_start)
idx2 = content.find(block3_end)
if idx1 >= 0 and idx2 > idx1:
    before = content[:idx1]
    after = content[idx2:]
    content = before + after
    print(f"Removed second .dataList block ({idx2 - idx1} chars)")

# Block 4: .accountBox (second occurrence) - lines ~857-905
block4_start = "/* ── Account Box ────────────────────────────────────────────────────── */"
block4_end = "/* ── Metric Cards ───────────────────────────────────────────────────── */"
idx1 = content.find(block4_start)
idx2 = content.find(block4_end)
if idx1 >= 0 and idx2 > idx1:
    before = content[:idx1]
    after = content[idx2:]
    content = before + after
    print(f"Removed second .accountBox block ({idx2 - idx1} chars)")

# Block 5: first .dataList (WorkspaceList) + .rows + .row + .row:hover
# Remove from "/* ── Data List (WorkspaceList) ───" to just before ".rowMain {"
block5_start = "/* ── Data List (WorkspaceList) ──────────────────────────────────────── */"
block5_end = ".rowMain {"
idx1 = content.find(block5_start)
idx2 = content.find(block5_end)
if idx1 >= 0 and idx2 > idx1:
    before = content[:idx1]
    after = content[idx2:]
    content = before + after
    print(f"Removed first .dataList, .rows, .row, .row:hover blocks ({idx2 - idx1} chars)")

# Block 6: first .accountBox - lines ~359-397
block6_start = "/* ── Account Box ────────────────────────────────────────────────────── */"
block6_end = "/* ── Metric Cards — Glass Panels with Data ──────────────────────────── */"
idx1 = content.find(block6_start)
idx2 = content.find(block6_end)
if idx1 >= 0 and idx2 > idx1:
    before = content[:idx1]
    after = content[idx2:]
    content = before + after
    print(f"Removed first .accountBox block ({idx2 - idx1} chars)")

if content != original:
    with open("shell.css", "w") as f:
        f.write(content)
    print(f"File written. Reduced by {len(original) - len(content)} chars.")
else:
    print("No changes made - blocks not found.")
