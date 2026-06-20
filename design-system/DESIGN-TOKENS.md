# StudentHub Unified Design System — Design Tokens

## 1. Color Palette

### Light Mode (default)
| Token | CSS Variable | Light Value | Usage |
|-------|-------------|-------------|-------|
| ink | --ink | #182230 | Primary text |
| muted | --muted | #667085 | Secondary text |
| faint | --faint | #5c6a7c | Placeholder, disabled text |
| line | --line | #d6dce7 | Borders, dividers |
| paper | --paper | #f5f7fa | Page background |
| surface | --surface | #ffffff | Card, modal, dropdown bg |
| surface-soft | --surface-soft | #fbfcfe | Subtle surface variant |
| blue | --blue | #0b63ce | Interactive accent |
| blue-deep | --blue-deep | #084b9b | Active/pressed accent |
| green | --green | #24835b | Success |
| amber | --amber | #a66212 | Warning |
| rose | --rose | #b42357 | Error on surfaces |
| destructive | --destructive | #b42318 | Destructive actions |

### Dark Mode ([data-theme="dark"])
| Token | Dark Value |
|-------|-----------|
| ink | #e7ecf5 |
| muted | #9da8ba |
| faint | #78859b |
| line | #2a3547 |
| paper | #090d14 |
| surface | #111824 |
| surface-soft | #151d2a |
| blue | #8abfff |
| blue-deep | #5aa4ff |
| green | #6ed5a0 |
| amber | #e8ae63 |
| rose | #ff8aac |
| destructive | #ff8a8a |

## 2. Status Color Tokens (NEW — add to styles.css)
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| --status-pending | #d97706 | #e8ae63 | Waiting, unconfirmed |
| --status-approved | #24835b | #6ed5a0 | Approved, confirmed |
| --status-rejected | #b42318 | #ff8a8a | Rejected, denied |
| --status-started | #0b63ce | #8abfff | In progress, active |
| --status-completed | #24835b | #6ed5a0 | Completed, finished |
| --status-cancelled | #667085 | #78859b | Cancelled, voided |

CSS class pattern for consistency:
```css
.badgePending { background: color-mix(in srgb, var(--status-pending) 12%, transparent); color: var(--status-pending); }
.badgeApproved { background: color-mix(in srgb, var(--status-approved) 12%, transparent); color: var(--status-approved); }
.badgeRejected { background: color-mix(in srgb, var(--status-rejected) 12%, transparent); color: var(--status-rejected); }
.badgeStarted { background: color-mix(in srgb, var(--status-started) 12%, transparent); color: var(--status-started); }
.badgeCompleted { background: color-mix(in srgb, var(--status-completed) 12%, transparent); color: var(--status-completed); }
.badgeCancelled { background: color-mix(in srgb, var(--status-cancelled) 12%, transparent); color: var(--status-cancelled); }
```

## 3. Typography Scale (NEW — add to styles.css)
| Token | Value | Usage |
|-------|-------|-------|
| --font-xs | 0.75rem / 1rem | Small labels, metadata |
| --font-sm | 0.8125rem / 1.25rem | Labels, captions |
| --font-base | 0.875rem / 1.5rem | Body text |
| --font-lg | 1rem / 1.5rem | Large body |
| --font-xl | 1.25rem / 1.75rem | Subheadings |
| --font-2xl | 1.5rem / 2rem | Section headings |
| --font-3xl | 2rem / 2.5rem | Page headings |
| --font-weight-normal | 400 | Body |
| --font-weight-medium | 560 | Buttons, labels |
| --font-weight-bold | 760 | Headings (matches existing uiButton) |

## 4. Spacing System (NEW — add to styles.css)
| Token | Value | Usage |
|-------|-------|-------|
| --space-1 | 4px | Tiny gaps |
| --space-2 | 8px | Element padding |
| --space-3 | 12px | Dense card padding |
| --space-4 | 16px | Standard padding |
| --space-5 | 24px | Section padding |
| --space-6 | 32px | Between sections |
| --space-7 | 48px | Page sections |
| --space-8 | 64px | Major sections |

## 5. Border Radii (already consistent — document)
| Token | Value | Usage |
|-------|-------|-------|
| --radius-sm | 4px | Small elements |
| --radius (default) | 8px | Cards, buttons, inputs |
| --radius-lg | 12px | Modals, dialogs |
| --radius-xl | 16px | Full-page panels |

## 6. Shadow Levels (NEW)
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| --shadow-sm | 0 1px 2px rgba(0,0,0,0.04) | same | Cards on flat surfaces |
| --shadow-md | 0 4px 12px rgba(0,0,0,0.06) | 0 4px 12px rgba(0,0,0,0.18) | Dropdowns, elevated cards |
| --shadow-lg | 0 8px 24px rgba(0,0,0,0.08) | 0 8px 24px rgba(0,0,0,0.24) | Modals |
| --shadow-xl | 0 22px 80px rgba(16,24,40,0.12) | 0 24px 90px rgba(0,0,0,0.45) | (existing) Fullscreen overlays |

## 7. Animation Timing (NEW)
| Token | Value | Usage |
|-------|-------|-------|
| --ease-fast | 120ms | Hover states, toggles |
| --ease-base | 160ms | (existing) Button transitions |
| --ease-slow | 240ms | Panel slide-in, dialogs |
| --ease-modal | 300ms | Modal open/close |
