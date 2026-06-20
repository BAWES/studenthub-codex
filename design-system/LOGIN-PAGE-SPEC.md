# Login Page UX Polish — Design Spec

> **Status:** Design Complete | **Priority:** High | **Target:** OS Launch
> **Aesthetic:** Zendesk Coral (#eb6651) + Slack-inspired layout
> **Filed under:** Issue `e50a0930-7040-4684-baa9-38e84233dc6c`

---

## 1. Design Rationale

The login page currently uses 20+ custom CSS classes (`shLoginRoot`, `shLoginBrand`, `shLoginGradient`, `shLoginFormSide`, `shLoginFormWrap`, `shLoginFormCard`, etc.) defined in the 12,000+ line `styles.css`. The `LoginForm.tsx` also uses inline styles (`style={{ color: "var(--muted)" }}`) on label elements, and comments reference "glass card" aesthetics despite the actual styles being solid.

**Key violations to address:**
1. **Inline styles** — `LoginForm.tsx` lines 26 and 46 use `style={{ color: "var(--muted)" }}` instead of Tailwind utility classes
2. **Custom CSS classes** — 20+ `shLogin*` classes in `styles.css` should be replaced with Tailwind utilities
3. **Glass references in comments** — Line 52 in `page.tsx` says "glass card" but the card is solid; misleading to developers
4. **Stale animation classes** — `shLoginStagger` has nth-child selectors for entrance animations that could be Tailwind + CSS animation

The page needs conversion to pure Tailwind CSS with Zendesk Coral (#eb6651) + Slack-inspired aesthetic, removing all glass references.

---

## 2. Layout Architecture

```
+------------------------------------------------------------------+
|  DESKTOP (≥901px)                     MOBILE (<901px)            |
|                                                                  |
|  +---------------------------+----------------------------------+ |
|  |     Brand Panel (50%)     |    Form Side (50%)              | |
|  |                           |                                  | |
|  |  +---------------------+  |  +----------------------------+ | |
|  |  | SH  StudentHub      |  |  |  +------------------------+ | | |
|  |  |                     |  |  |  | Continue to StudentHub  | | | |
|  |  | Sign in once.       |  |  |  | Sign in with your...    | | | |
|  |  | The right workspace |  |  |  |                          | | | |
|  |  | opens.              |  |  |  | Email input              | | | |
|  |  |                     |  |  |  | Password input            | | | |
|  |  | [Pills]             |  |  |  | [Sign in button (coral)]  | | | |
|  |  +---------------------+  |  |  |                          | | | |
|  |                           |  |  | --- or choose account --- | | | |
|  |                           |  |  | [Account btn]             | | | |
|  |                           |  |  | [Account btn]             | | | |
|  |                           |  |  +------------------------+   | | |
|  +---------------------------+----------------------------------+ |
|                                                                  |
|  MOBILE: Brand collapses to compact header row                   |
|          Full-width form card below                              |
+------------------------------------------------------------------+
```

### Responsive Breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| Desktop | ≥901px | Split: brand (50%) | form (50%) |
| Mobile | <901px | Brand → compact header, form → full-width |

---

## 3. Component Breakdown

### 3a. Brand Panel (left side, desktop only)

| Property | Detail |
|---|---|
| **Purpose** | Visual identity + value proposition |
| **Background** | `bg-[#f4f2ef]` (warm Slack channels grey) |
| **Padding** | Desktop: `p-12` / Mobile: `p-5 pt-2` |
| **Logo** | `SH` monogram in coral circle (`bg-[#eb6651] text-white rounded-full w-10 h-10 flex items-center justify-center`), `font-bold text-lg` wordmark |
| **Headline** | `text-3xl md:text-4xl font-bold leading-tight` with coral highlight span `text-[#eb6651]` |
| **Subtitle** | `text-[#6e6b66] text-base leading-relaxed max-w-md` |
| **Pills** | Row of `inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-[#fef1ef] text-[#eb6651] border border-[#eb6651]/20` |
| **States** | Static content — no loading/empty/error needed |

### 3b. Form Panel (right side desktop, full width mobile)

| Property | Detail |
|---|---|
| **Purpose** | Authentication form + account chooser |
| **Background** | `bg-white` (--sh-main-bg) |
| **Border** | Desktop: `border-l border-[#e8e6e3]` (Slack subtle border) |
| **Padding** | Desktop: `p-6` / Mobile: `p-3` |

#### Form Card

| Property | Detail |
|---|---|
| **Max width** | `max-w-[420px] mx-auto` |
| **Surface** | `bg-white rounded-xl border border-[#e8e6e3] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]` |
| **Header** | `px-7 pt-7 pb-3` — Title `text-2xl font-bold text-[#1d1c1a]` + Subtitle `text-sm text-[#6e6b66]` |
| **Body** | `px-7 pb-7 grid gap-4` |

#### Form Inputs

| Property | Detail |
|---|---|
| **Label** | `text-xs font-semibold uppercase tracking-wider text-[#6e6b66]` |
| **Input** | `h-[50px] px-3.5 rounded-md border border-[#e8e6e3] bg-white text-[#1d1c1a] text-[15px] placeholder:text-[#a09d98] focus:border-[#eb6651] focus:ring-3 focus:ring-[#eb6651]/15 focus:outline-none transition-all` |
| **Hover** | `hover:border-[#d45441] hover:bg-[#fbfcfe]` |

#### CTA Button

| Property | Detail |
|---|---|
| **Default** | `w-full h-[52px] inline-flex items-center justify-center gap-2 rounded-md bg-[#eb6651] text-white text-[15px] font-semibold cursor-pointer transition-all` |
| **Hover** | `hover:bg-[#d45441] hover:-translate-y-px hover:shadow-[0_0_0_1px_rgba(235,102,81,0.3)]` |
| **Active** | `active:translate-y-0` |
| **Disabled** | `disabled:pointer-events-none disabled:opacity-55` |

#### Error Banner

| Property | Detail |
|---|---|
| **Container** | `flex items-start gap-2 p-2.5 rounded-md bg-[#fef1ef] border border-[#eb6651]/20 text-[#d32f2f] text-xs font-semibold` |

### 3c. Account Chooser (conditional)

| Property | Detail |
|---|---|
| **Container** | `border-t border-[#e8e6e3] p-5 pt-4 grid gap-3` |
| **Title** | `text-base font-semibold text-[#1d1c1a]` |
| **Subtitle** | `text-xs text-[#6e6b66]` |
| **Buttons** | `w-full text-left p-3 rounded-md border border-[#e8e6e3] bg-white hover:bg-[#fbfcfe] hover:border-[#eb6651]/30 transition-all cursor-pointer` |

---

## 4. State Matrix

| Component | Loading | Empty | Error | Edge Case |
|---|---|---|---|---|
| **Brand Panel** | N/A (static) | N/A | N/A | N/A |
| **Email input** | N/A | N/A | N/A | Pre-filled email from failed attempt (state.email) |
| **Password input** | N/A | N/A | N/A | Empty on re-render (security) |
| **CTA Button** | Disabled + "Checking credentials..." text | N/A | N/A | N/A |
| **Error Banner** | Hidden | Hidden | Visible with coral-light bg + error text | Multiple error types: expired vs account resolution |
| **Account Chooser** | N/A (no loading state) | Hidden (0-1 accounts) | N/A | 2+ accounts shown in bordered section below |

---

## 5. Color Semantics

| Element | Token | Value |
|---|---|---|
| CTA button | `--sh-coral` | `#eb6651` |
| CTA hover | `--sh-coral-hover` | `#d45441` |
| Light background | `--sh-coral-light` | `#fef1ef` |
| Brand side bg | `--sh-channels-bg` | `#f4f2ef` |
| Form side bg | `--sh-main-bg` | `#ffffff` |
| Card bg | `--sh-card-bg` | `#ffffff` |
| Card border | `--sh-card-border` | `#e8e6e3` |
| Text primary | `--sh-text-primary` | `#1d1c1a` |
| Text secondary | `--sh-text-secondary` | `#6e6b66` |
| Text muted | `--sh-text-muted` | `#a09d98` |
| Error | `--sh-error` | `#d32f2f` |

---

## 6. File Changes

### Files to modify:

| File | Changes |
|---|---|
| `src/app/login/page.tsx` | Replace `shLogin*` className values with Tailwind utilities. Update misleading "glass card" comment. |
| `src/modules/auth/LoginForm.tsx` | Replace inline `style={{ color: "var(--muted)" }}` with Tailwind class `text-[#6e6b66]`. Replace `shLogin*` class values with Tailwind. |
| `src/app/styles.css` | Remove all `shLogin*` class definitions (lines ~11093-11318+). Keep the `@keyframes` if they're still used, or migrate to Tailwind `animate-*`. |

### Files NOT to touch:
- `src/app/LandingContent.tsx` — FROZEN per UXDesigner skill

---

## 7. Data Contracts

```typescript
// Login page route params
interface LoginPageProps {
  searchParams: Promise<{ error?: "expired" | "account" }>;
}

// Form state from useActionState
interface LoginFormState {
  error?: string;
  email?: string;
  accounts?: LoginAccountChoice[];
}

// Account resolution option
interface LoginAccountChoice {
  accountKey: string;
  name: string;
  email: string;
  role: string;
}
```

---

## 8. Acceptance Criteria

- [ ] All `shLogin*` CSS classes removed from `login/page.tsx` — replaced with Tailwind utility classes
- [ ] All `shLogin*` CSS classes removed from `LoginForm.tsx` — replaced with Tailwind utilities
- [ ] Inline styles removed from `LoginForm.tsx` (`style={{ color: "var(--muted)" }}` → `text-[#6e6b66]`)
- [ ] Comment "glass card" updated to e.g. "solid card" (line 52 in `page.tsx`)
- [ ] All `shLogin*` class definitions removed from `styles.css`
- [ ] CTA button uses `bg-[#eb6651] text-white` with hover `bg-[#d45441]`
- [ ] Focus rings on inputs use ring color `#eb6651`
- [ ] Error banners use `bg-[#fef1ef]` with coral border
- [ ] Brand panel uses warm neutral `bg-[#f4f2ef]`
- [ ] Form card uses `bg-white` with subtle border and shadow
- [ ] Entrance animations preserved (can stay in CSS or migrate to Tailwind `animate-*`)
- [ ] Mobile responsive behavior preserved (brand collapses to compact header <901px)
- [ ] `tsc --noEmit` passes with zero errors
- [ ] Visual parity: login must look equivalent or better after conversion — no regressions
