# StudentHub OS Design System

> StudentHub is evolving from a collection of pages into a cohesive **Operating System** experience — closable tabs, smooth transitions, and a professional workspace feel inspired by Zendesk.

---

## 1. Brand & Color

### Primary Accent: Zendesk Coral `#eb6651`

```
--sh-coral:      #eb6651
--sh-coral-hover: #d45441
--sh-coral-light: #fef1ef   (for backgrounds/badges)
--sh-coral-glow:  0 0 12px rgba(235,102,81,0.25)
```

### Semantic Colors (from existing CSS vars)

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--ink` | #182230 | #e7ecf5 | Primary text |
| `--muted` | #667085 | #9da8ba | Secondary text |
| `--paper` | #f5f7fa | #090d14 | Page background |
| `--surface` | #ffffff | #111824 | Card/sheet surfaces |
| `--border` | #d6dce7 | #2a3547 | Borders & dividers |
| `--success` | #24835b | #6ed5a0 | Success states |
| `--warning` | #a66212 | #e8ae63 | Warning states |
| `--error` | #b42318 | #ff8a8a | Error states |

### Theme Toggle

The app uses `data-theme="light"|"dark"` on `<html>`. All components must use CSS variables (`var(--ink)`, `var(--surface)`, etc.) — never hardcode hex values. The existing `ThemeToggle` and `ThemeScript` handle the switch.

---

## 2. OS Layout

### Tab Bar (Top)

The tab bar is the primary navigation for the workspace:

```
┌──────────────────────────────────────────────────┐
│ [SH]  [x Dashboard]  [x Candidates]  [x Jobs] + │
├──────────────────────────────────────────────────┤
│                                                    │
│              Active tab content                     │
│                                                    │
└──────────────────────────────────────────────────┘
```

Rules:
- Tabs are closable (× button) and reorderable
- Active tab has a coral bottom indicator (3px)
- Tab bar has glass effect: `backdrop-filter: blur(18px)` with `var(--sh-header-glass-bg)`
- "+" button opens new tab menu
- Maximum 12 open tabs before oldest auto-closes
- Tabs persist their state when switching (no re-mount)

### Sidebar (Left)

Collapsible sidebar for navigation within a tab's context. Collapsed state shows icons only (64px width).

### Content Area

Scrollable content fills the remaining space. Uses the grid background pattern from the existing theme system.

---

## 3. Component Patterns

### Buttons

```
Primary   → bg: #eb6651, text: white, hover: brightness(1.1)
Secondary → bg: var(--secondary), text: var(--secondary-foreground)
Outline   → border: var(--border), text: var(--foreground)
Ghost     → bg: transparent, text: var(--foreground)
Danger    → bg: var(--error), text: white
```

All buttons: `border-radius: var(--radius)`, 44px min-height, `transition: background 160ms ease`

### Cards

```
background: var(--surface)
border: 1px solid var(--border)
border-radius: var(--radius-lg)  // 12px
padding: var(--space-5)          // 20px
Hover state: box-shadow: var(--shadow-sm)
```

### Form Inputs

```
background: var(--surface)
border: 1px solid var(--border)
border-radius: var(--radius-md)
padding: 10px 14px
font-size: var(--fs-sm)
Focus: ring-2 with color-mix(in srgb, var(--ring) 28%, transparent)
```

### Badges / Tags

```
border-radius: var(--radius-full)
padding: 3px 8px
font-size: 0.76rem
font-weight: 760
line-height: 1
```

Variants: default, secondary, success (green), warning (amber), outline

### Modals / Dialogs

```
background: var(--surface)
border-radius: var(--radius-xl)   // 16px
box-shadow: var(--shadow-xl)
overlay: var(--overlay)           // rgba(0,0,0,0.5)
Animation: scale + fade (300ms)
Close button in top-right corner
```

### Dropdowns / Selects

Trigger looks like an input. Dropdown has subtle shadow, matches surface color.

---

## 4. Tab System Implementation

```tsx
// Tab type
interface Tab {
  id: string;
  title: string;
  icon?: LucideIcon;
  path: string;       // route path
  state?: unknown;    // persisted state
  pinned?: boolean;   // prevents auto-close
}

// TabBar state
const [tabs, setTabs] = useState<Tab[]>([]);
const [activeTab, setActiveTab] = useState<string | null>(null);

// Max 12 tabs (or configured limit)
// Pinned tabs don't count toward limit
// Tab state saved to sessionStorage for crash recovery
```

Tab context provider wraps the workspace so child routes can access tab state.

---

## 5. Animations & Transitions

| Token | Value | Usage |
|-------|-------|-------|
| `--dur-fast` | 120ms | Hover, active states |
| `--dur-default` | 160ms | Button, link transitions |
| `--dur-slow` | 240ms | Panel show/hide |
| `--dur-modal` | 300ms | Modal open/close |
| `--sh-easing` | cubic-bezier(0.16, 1, 0.3, 1) | Standard motion |
| `--sh-easing-spring` | cubic-bezier(0.34, 1.56, 0.64, 1) | Fun/hero motions |

### Rules

- **Never** animate layout-affecting properties (width, height, top, left) — causes reflow
- Prefer `opacity`, `transform`, and `background-color` transitions
- Scroll-reveal: `translateY(16px) + opacity`, 500ms ease-out
- No bounce animations in production UI (keep it professional)
- Page transitions: fade in 160ms, no slide

---

## 6. Typography

```
Font: Inter, ui-sans-serif, system-ui
Scale:
  --fs-hero: 3rem      (48px)  — Landing page hero only
  --fs-h1: 1.75rem     (28px)  — Page titles
  --fs-h2: 1.5rem      (24px)  — Section headers
  --fs-h3: 1.25rem     (20px)  — Card titles
  --fs-body: 0.9375rem (15px)  — Body text
  --fs-sm: 0.8125rem   (13px)  — Labels, descriptions
  --fs-xs: 0.75rem     (12px)  — Metadata, badges
  --fs-xxs: 0.6875rem  (11px)  — Legal, footnotes

Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 760 (button weight)
Line-height: 1.5 default, 1.1 for headings
```

---

## 7. Spacing

4px base grid:

```
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px
```

Page max-width: `1200px` (workspace), `640px` (forms)

---

## 8. Landing Page Frozen Design

The landing page at `src/app/LandingContent.tsx` has been finalized with:
- **Zendesk coral (#eb6651)** accent
- **CSS variable theming** (light default, dark on toggle)
- **White cards with subtle borders**
- **Staff-recruiter-driven copy** (accurate business process)

**⚠️ DO NOT MODIFY** `src/app/LandingContent.tsx` without explicit direction from board. It is a frozen, finished design.

---

## 9. When to Ask for Help

- **Design uncertainty?** Check this document first
- **Need business model context?** Use **Dosu MCP** (connected via Hermes MCP client) to query legacy repos and documentation
- **Layout broken?** Check CSS variables — never hardcode colors that should theme
- **Tab system questions?** Reference the existing workspace pattern in `src/modules/workspace/`
