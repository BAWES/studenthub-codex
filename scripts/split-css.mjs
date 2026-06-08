/**
 * Splits src/app/styles.css into layered CSS files:
 * - ui.css    — shadcn component primitives (.ui*)
 * - shell.css — workspace layout (.shell, .workspace*, .topbar, etc.)
 * - pages.css — page-level patterns (everything else)
 *
 * Usage: node scripts/split-css.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const INPUT = resolve(ROOT, "src/app/styles.css");
const STYLES_DIR = resolve(ROOT, "src/styles");

// Ensure output directory exists
mkdirSync(STYLES_DIR, { recursive: true });

const css = readFileSync(INPUT, "utf-8");

// ── Parse into top-level blocks ──────────────────────────────────────────

function parseTopLevelBlocks(css) {
  const blocks = [];
  let depth = 0;
  let blockStart = -1;
  let inBlock = false;
  let i = 0;

  while (i < css.length) {
    // Handle @import / @theme — they end at first `;` or `}`
    if (!inBlock && css[i] === "@") {
      blockStart = i;
      // For @import, find the semicolon
      if (css.startsWith("@import", i)) {
        const semi = css.indexOf(";", i);
        blocks.push(css.substring(blockStart, semi + 1));
        i = semi + 1;
        inBlock = false;
        blockStart = -1;
        continue;
      }
      // For @theme, @media, @keyframes — find the closing brace
      inBlock = true;
      i++;
      continue;
    }

    if (css[i] === "{") {
      if (!inBlock) {
        // A CSS rule block starts — backtrack to find the selector start
        blockStart = findSelectorStart(css, i);
        inBlock = true;
      }
      depth++;
      i++;
      continue;
    }

    if (css[i] === "}") {
      depth--;
      if (depth === 0 && inBlock) {
        blocks.push(css.substring(blockStart, i + 1));
        inBlock = false;
        blockStart = -1;
      }
      i++;
      continue;
    }

    if (!inBlock && css[i] !== "{" && css[i] !== "}" && css[i] !== "@") {
      blockStart = i;
    }

    i++;
  }

  return blocks;
}

function findSelectorStart(css, braceIndex) {
  // Walk backward from the opening brace to find where the selector starts
  let i = braceIndex - 1;
  while (i >= 0) {
    const ch = css[i];
    if (ch === "}") {
      // Hit end of previous block — selector starts after this
      return i + 1;
    }
    if (ch === ";" && i > 0 && css[i - 1] === "}") {
      return i + 1;
    }
    i--;
  }
  return 0;
}

// ── Classification ───────────────────────────────────────────────────────

// Shell selectors: workspace layout that wraps every authenticated page
const SHELL_PREFIXES = [
  /^\.shell\b/,
  /^\.shellEmbedded\b/,
  /^\.workspaceRail\b/,
  /^\.workspaceMark\b/,
  /^\.workspaceRailNav\b/,
  /^\.workspaceRailFooter\b/,
  /^\.workspaceSignout\b/,
  /^\.themeToggle\b/,
  /^\.workspaceStage\b/,
  /^\.workTabs?\b/,
  /^\.workTab\b/,
  /^\.workTabClose\b/,
  /^\.workTabsClear\b/,
  /^\.topbar\b/,
  /^\.eyebrow\b/,
  /^\.accountBox\b/,
  /^\.environment\b/,
  /^\.mobileTabBar\b/,
  /^\.workspaceNav\b/,
  /^\.workspace\b/, // .workspace is the 2-col layout used across pages
];

// Base element selectors that are part of the shell layer
const SHELL_BASE_SELECTORS = [/^\*$/, /^body\b/, /^h1\b/, /^h2\b/, /^p\b/];

// UI selectors: shadcn component primitives
const UI_PREFIXES = [/^\.ui[A-Z]/];

// Sheet/slide panel — part of workspace shell
const SHELL_SHEET_PREFIXES = [
  /^\.sheetOverlay\b/,
  /^\.sheetContent\b/,
  /^\.sheetContent(?:Right|Left|Top|Bottom)\b/,
  /^\.sheetClose\b/,
  /^\.sheetHeader\b/,
  /^\.sheetFooter\b/,
  /^\.sheetTitle\b/,
  /^\.sheetDescription\b/,
  /^\.sheetBody\b/,
  /^\.slidePanel\b/,
  /^\.slidePanelInner\b/,
];

// Shared animations — put in ui.css since they're used by shadcn components
const UI_KEYFRAMES = [
  /^@keyframes\s+fadeIn\b/,
  /^@keyframes\s+fadeOut\b/,
  /^@keyframes\s+scaleIn\b/,
  /^@keyframes\s+slideIn(?:Right|Left|Down|Up)\b/,
  /^@keyframes\s+slideOut(?:Right|Left|Down|Up)\b/,
  /^@keyframes\s+accordion-(?:down|up)\b/,
];

function getFirstSelector(block) {
  // Extract the selector part of the block
  const braceIdx = block.indexOf("{");
  if (braceIdx === -1) {
    // @import or similar; return the whole block as the "selector"
    return block.trim();
  }
  return block.substring(0, braceIdx).trim();
}

function classifyBlock(block) {
  const sel = getFirstSelector(block);
  const trimmed = sel.replace(/^[,\s]+/, "").trim();

  // @import / @theme stay in styles.css
  if (trimmed.startsWith("@import") || trimmed.startsWith("@theme")) {
    return "root";
  }

  // Token-related (custom properties) stay in styles.css or go to tokens
  // (tokens.css already handles this)

  // UI keyframe animations
  if (UI_KEYFRAMES.some((r) => r.test(trimmed))) {
    return "ui";
  }

  // Extract the first actual selector (before any comma)
  const firstSel = trimmed.split(",")[0].trim();

  // Dark theme overrides — check what classes they target
  if (firstSel.startsWith("[data-theme=")) {
    return classifyDarkBlock(sel);
  }

  // @media blocks — check the first nested selector
  if (trimmed.startsWith("@media")) {
    return classifyMediaBlock(block);
  }

  // Check UI prefixes
  if (UI_PREFIXES.some((r) => r.test(firstSel))) {
    return "ui";
  }

  // Check shell prefixes
  if (SHELL_PREFIXES.some((r) => r.test(firstSel))) {
    return "shell";
  }

  // Check shell sheet prefixes
  if (SHELL_SHEET_PREFIXES.some((r) => r.test(firstSel))) {
    return "shell";
  }

  // Check base element selectors
  if (SHELL_BASE_SELECTORS.some((r) => r.test(firstSel))) {
    return "shell";
  }

  // Everything else is pages
  return "pages";
}

function classifyDarkBlock(selector) {
  // [data-theme="dark"] .someClass — check the classes listed
  const classes = selector.replace(/\[data-theme="dark"\]\s*/g, "");

  // Extract individual class selectors
  const classSels = classes
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // If ALL selectors target shell classes, go to shell; else pages
  const allShell = classSels.length > 0 && classSels.every((s) => {
    const sel = s.replace(/:[a-zA-Z-]+(\s*\([^)]*\))?/g, "").trim();
    return (
      SHELL_PREFIXES.some((r) => r.test(sel)) ||
      SHELL_SHEET_PREFIXES.some((r) => r.test(sel)) ||
      /^\.mobileTabBar\b/.test(sel) ||
      /^\.topbar\b/.test(sel) ||
      /^\.accountBox\b/.test(sel) ||
      /^\.workspaceMark\b/.test(sel) ||
      /^\.workTab\b/.test(sel) ||
      /^\.workTabClose\b/.test(sel)
    );
  });

  if (allShell) return "shell";

  // Check if ALL target UI classes
  const allUi = classSels.length > 0 && classSels.every((s) => {
    const sel = s.replace(/:[a-zA-Z-]+(\s*\([^)]*\))?/g, "").trim();
    return UI_PREFIXES.some((r) => r.test(sel));
  });

  if (allUi) return "ui";

  // Mixed or page-only dark overrides go to pages
  return "pages";
}

function classifyMediaBlock(block) {
  // Count nested selectors in the media block by category
  // Extract all nested selectors
  const body = block.substring(block.indexOf("{") + 1, block.lastIndexOf("}"));
  const nestedSels = [];
  let depth = 0;
  let current = "";
  let i = 0;

  while (i < body.length) {
    if (body[i] === "{") {
      if (depth === 0) {
        nestedSels.push(current.trim());
        current = "";
      }
      depth++;
    } else if (body[i] === "}") {
      depth--;
    } else if (depth === 0) {
      current += body[i];
    }
    i++;
  }

  // Check the nested selectors — if mostly shell, put in shell; if mostly ui, put in ui, else pages
  let shellCount = 0;
  let uiCount = 0;
  let pagesCount = 0;

  for (const ns of nestedSels) {
    const firstSel = ns.split(",")[0].trim().replace(/^[,\s]+/, "");
    if (!firstSel) continue;

    if (UI_PREFIXES.some((r) => r.test(firstSel))) {
      uiCount++;
    } else if (
      SHELL_PREFIXES.some((r) => r.test(firstSel)) ||
      SHELL_SHEET_PREFIXES.some((r) => r.test(firstSel)) ||
      SHELL_BASE_SELECTORS.some((r) => r.test(firstSel)) ||
      /^\.mobileTabBar\b/.test(firstSel) ||
      /^\.loginShell\b/.test(firstSel) ||
      /^\.environment\b/.test(firstSel) ||
      /^\.workspaceMark\b/.test(firstSel) ||
      /^\.workTab\b/.test(firstSel)
    ) {
      shellCount++;
    } else {
      pagesCount++;
    }
  }

  // If media query is empty, treat as pages (most common for page layout)
  if (shellCount + uiCount + pagesCount === 0) return "pages";

  // If it has mostly shell selectors, put in shell
  if (shellCount > pagesCount && shellCount > uiCount) return "shell";
  if (uiCount > pagesCount && uiCount > shellCount) return "ui";
  return "pages";
}

// ── Main split logic ─────────────────────────────────────────────────────

console.log("Parsing CSS blocks...");
const blocks = parseTopLevelBlocks(css);
console.log(`Found ${blocks.length} top-level blocks`);

const output = { root: [], ui: [], shell: [], pages: [] };

for (const block of blocks) {
  const trimmed = block.trim();
  if (!trimmed) continue;

  const category = classifyBlock(block);
  output[category].push(block);
}

// Count lines per category
for (const [cat, blks] of Object.entries(output)) {
  const total = blks.reduce((sum, b) => sum + b.split("\n").length, 0);
  console.log(`  ${cat}: ${blks.length} blocks, ~${total} lines`);
}

// ── Write output files ───────────────────────────────────────────────────

// ui.css — shadcn component primitives
const uiHeader = [
  "/* ==========================================================================",
  "   StudentHub UI Primitives",
  "   shadcn/ui component CSS extracted from styles.css",
  "   ========================================================================== */",
  "",
].join("\n");

const uiContent = uiHeader + output.ui.map(cleanBlock).join("\n\n");
writeFileSync(resolve(STYLES_DIR, "ui.css"), uiContent + "\n");
console.log(`Wrote src/styles/ui.css (${uiContent.split("\n").length} lines)`);

// shell.css — workspace layout
const shellHeader = [
  "/* ==========================================================================",
  "   StudentHub Shell Layout",
  "   Workspace layout styles extracted from styles.css",
  "   Covers: sidebar rail, topbar, work tabs, mobile tab bar, account box",
  "   ========================================================================== */",
  "",
].join("\n");

const shellContent = shellHeader + output.shell.map(cleanBlock).join("\n\n");
writeFileSync(resolve(STYLES_DIR, "shell.css"), shellContent + "\n");
console.log(
  `Wrote src/styles/shell.css (${shellContent.split("\n").length} lines)`
);

// pages.css — page-level patterns
const pagesHeader = [
  "/* ==========================================================================",
  "   StudentHub Page Patterns",
  "   Page-level CSS extracted from styles.css",
  "   Covers: login, landing, dashboards, data tables, console views, etc.",
  "   ========================================================================== */",
  "",
].join("\n");

const pagesContent = pagesHeader + output.pages.map(cleanBlock).join("\n\n");
writeFileSync(resolve(STYLES_DIR, "pages.css"), pagesContent + "\n");
console.log(
  `Wrote src/styles/pages.css (${pagesContent.split("\n").length} lines)`
);

// Update styles.css to @import the split files
const rootBlocks = output.root.map(cleanBlock).join("\n\n");
const newStylesCss = [
  rootBlocks,
  "",
  '/* Split CSS layers — see docs/design-system.md §4.6 */',
  '@import "../styles/ui.css";',
  '@import "../styles/shell.css";',
  '@import "../styles/pages.css";',
  "",
].join("\n");

writeFileSync(INPUT, newStylesCss);
console.log(`Updated src/app/styles.css with @import directives`);

// ── Helpers ──────────────────────────────────────────────────────────────

function cleanBlock(block) {
  // Remove excessive blank lines within blocks but preserve single blank lines
  return block.replace(/\n{3,}/g, "\n\n").trimEnd();
}
