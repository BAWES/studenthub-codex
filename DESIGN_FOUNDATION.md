# StudentHub Design Foundation

> One-page reference for agents. Read before every heartbeat.

## 🎨 Visual Identity

| Element | Value | Hex |
|---------|-------|-----|
| **Primary accent** | Zendesk Coral | `#eb6651` |
| Hover | Darker coral | `#d45441` |
| Light bg | Coral tint | `#fef1ef` |
| Success | Green | `#228e6c` |
| Text | Ink (near-black) | `#182230` |
| Body | Page bg | `#f5f7fa` |
| Cards | White | `#ffffff` |
| Borders | Subtle grey | `#d6dce7` |

## 🚫 Forbidden on Landing Page

- Glass/blur effects (`backdrop-blur`, `shGlass`, `var(--sh-glass-bg)`)
- Dark mode / theme toggle
- Blue or purple primary gradients
- "AI matches" as primary value prop
- "Candidate" terminology (use "student")

## ✅ Required on Landing Page

- Coral #eb6651 buttons, links, badges
- Clean white cards with `border: 1px solid var(--border)`
- Always light mode (`data-theme="light"` + hardcoded light CSS vars)
- "Staff recruiters match you" hero copy
- "Get matched by our staff" How It Works
- Two-sided persona: "I'm looking for work" / "I'm hiring"

## 📋 Business Facts (Dosu-Verified)

- **Matching**: Staff recruiters match students to roles. AI assists.
- **Students**: 10,000+ registered, 53,000+ in database
- **Employers**: 500+ partners, 524 companies
- **Staff**: 162 staff, admin, inspector roles
- **Process**: Profile → Staff match → Company review → Contract → Timesheets → Invoice → Payment
- **Region**: Kuwait only (KWD currency)

## 🛠️ Dosu MCP — Use Before Writing Copy

Every agent has access to `mcp_dosu_*` tools. Before writing marketing copy, landing text, or feature descriptions:

1. `mcp_dosu_init_knowledge(task="what is the business model for matching?")` 
2. `mcp_dosu_search_documentation(query="StudentHub business process")`
3. Cross-check your copy against the real business process

## 🔗 Key Files

- `DESIGN_SYSTEM.md` — Full design tokens, components, animations
- `src/app/LandingContent.tsx` — Landing page (reference implementation)
- `~/.hermes/hr/lessons.md` — All agent lessons and failure patterns
