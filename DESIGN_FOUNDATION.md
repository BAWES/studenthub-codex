# StudentHub Design Foundation

> One-page reference for agents. Read before every heartbeat.

## 🎨 Visual Identity

| Element | Value | Hex |
|---------|-------|-----|
| **Primary accent** | Blue | `#0b63ce` |
| Hover | Darker blue | `#084b9b` |
| **Secondary CTA** | Amber | `#f59e0b` |
| Secondary hover | Darker amber | `#d97706` |
| Success | Green | `#24835b` |
| Text | Ink (near-black) | `#182230` (light) / `#e7ecf5` (dark) |
| Body bg | Paper | `#f5f7fa` (light) / `#090d14` (dark) |
| Cards | Surface | `#ffffff` (light) / `#111824` (dark) |
| Borders | Subtle grey | `#d6dce7` (light) / `#2a3547` (dark) |

## ✅ Landing Page Design

- **Primary accent**: Blue (#0b63ce) — trust-signalling, used for CTAs, badges, links
- **Secondary CTAs**: Amber/gold (#f59e0b) gradient — employer-facing actions
- **Glass effects**: `backdrop-filter: blur()` on nav, stat cards, step cards, testimonial cards, CTA sections
- **Dark mode**: Supported — page respects system preference and localStorage theme
- **Hero**: "Connecting students with the right employers" — blue emphasis on "the right employers"
- **Dual CTAs**: "Create your free profile" (students, blue) + "Hire students" (employers, amber)
- **Scroll-reveal animations**: Staggered fade+slide-up on all sections
- **Staff recruiters**: Accurately reflected as the primary matching mechanism
- **Persona switching**: Student/Company tabs change all section content
- **CSS variables only**: No hardcoded theme colors — uses var(--ink), var(--surface), var(--border), etc.
- **Components**: `src/components/landing/` — modular, per-section components

## 🚫 Forbidden on Landing Page

- Generic "AI matches" as primary value prop — staff recruiters drive matching, AI assists
- "Candidate" terminology for public-facing content (use "student")
- Zendesk Coral (#eb6651) palette — landing page uses blue primary (internal dashboards may differ)

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
- `src/app/LandingContent.tsx` — Legacy landing (FROZEN — do not modify)
- `src/components/landing/` — Active landing page components
