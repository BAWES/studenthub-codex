/**
 * StudentHub Component Specifications
 *
 * Defines the API contract, variants, interaction states, accessibility
 * requirements, and design intent for every component in the shared library.
 *
 * CSS class name convention: `.uiComponentName` (PascalCase prefixed with `ui`).
 * All interactive components use Radix UI primitives for accessibility.
 */

// ════════════════════════════════════════════════════════════════════════════════
// Batch 1 — Form Inputs
// ════════════════════════════════════════════════════════════════════════════════

/**
 * ## Switch
 *
 * A toggle control for binary on/off settings.
 *
 * ### Variants
 * - `default`: standard switch (default)
 *
 * ### Sizes
 * - `default`: 24px track, 16px thumb (default)
 *
 * ### Interaction States
 * | State     | Visual                                                    |
 * |-----------|-----------------------------------------------------------|
 * | off       | `border-input` background, thumb translates left           |
 * | on        | `--primary` background, thumb translates right             |
 * | hover     | border darkens, cursor pointer                             |
 * | focus-visible | ring-[3px] ring-ring/50                               |
 * | disabled  | opacity-50, cursor-not-allowed                             |
 *
 * ### Accessibility
 * - Role: `switch`
 * - Keyboard: Space/Enter to toggle
 * - ARIA: `aria-checked` managed by Radix
 * - Label: must be paired with `<Label>` via `id`/`htmlFor`
 *
 * ### CSS Classes
 * - Root: `.uiSwitch`
 * - Thumb: `.uiSwitchThumb`
 *
 * ### Design Intent
 * Used for preference toggles (notifications, visibility, auto-features).
 * Should feel mechanical and immediate — no debounce.
 * Always paired with a visible Label.
 */
interface SwitchSpec {
  Root: React.ComponentProps<typeof import("@/components/ui/switch").Switch>;
}

/**
 * ## RadioGroup
 *
 * A set of mutually exclusive options where exactly one is always selected.
 *
 * ### Variants
 * - `default`: vertically stacked radio items (default)
 *
 * ### Interaction States
 * | State       | Visual                                                       |
 * |-------------|--------------------------------------------------------------|
 * | unchecked   | border-input, empty circle                                   |
 * | checked     | primary border and fill                                      |
 * | hover       | border-input darkened                                        |
 * | focus-visible | ring-[3px] ring-ring/50                                     |
 * | disabled    | opacity-50, cursor-not-allowed                               |
 *
 * ### Accessibility
 * - Role: `radiogroup` on Root, `radio` on Item
 * - Keyboard: Arrow keys to navigate, Space to select
 * - ARIA: `aria-required`, `aria-invalid` supported
 * - Orientation: vertical by default
 *
 * ### Sub-components
 * - `<RadioGroup>` — container
 * - `<RadioGroupItem>` — individual option
 *
 * ### CSS Classes
 * - Root: `.uiRadioGroup`
 * - Item: `.uiRadioGroupItem`
 * - Indicator: `.uiRadioGroupIndicator`
 *
 * ### Design Intent
 * Use when options are mutually exclusive and there are 2-6 choices.
 * For 2 options, Switch may be more appropriate.
 * Always provide a default selection — a radio group should never be empty.
 */
interface RadioGroupSpec {
  Root: React.ComponentProps<typeof import("@/components/ui/radio-group").RadioGroup>;
  Item: React.ComponentProps<typeof import("@/components/ui/radio-group").RadioGroupItem>;
}

/**
 * ## Select
 *
 * A dropdown picker for choosing one option from a list.
 *
 * ### Sizes
 * - `default` (h-9)
 * - `sm` (h-8)
 *
 * ### Variants
 * - Single select (default)
 * - Scrollable list with up/down scroll buttons
 * - Grouped options with labels and separators
 *
 * ### Interaction States
 * | State        | Visual                                                    |
 * |--------------|-----------------------------------------------------------|
 * | closed       | Trigger shows placeholder or selected value               |
 * | open         | Dropdown content with slide-in animation                  |
 * | hover        | Trigger border darkens                                    |
 * | focus-visible | ring-[3px] ring-ring/50                                  |
 * | disabled     | opacity-50, cursor-not-allowed                            |
 * | invalid      | border-destructive, ring-destructive/20                   |
 *
 * ### Accessibility
 * - Role: `combobox` / `listbox`
 * - Keyboard: Enter/Space to open, Arrow keys to navigate, Enter to select, Escape to close
 * - ARIA: `aria-expanded`, `aria-controls`, `aria-activedescendant` managed by Radix
 * - Supports grouped options via `<SelectGroup>` + `<SelectLabel>`
 *
 * ### Sub-components
 * - Select, SelectGroup, SelectValue, SelectTrigger
 * - SelectContent, SelectLabel, SelectItem, SelectSeparator
 * - SelectScrollUpButton, SelectScrollDownButton
 *
 * ### CSS Classes
 * Uses Tailwind utility classes (no custom `.uiSelect` class).
 *
 * ### Design Intent
 * Used when 5+ options exist. For fewer options, prefer RadioGroup.
 * The trigger should show the current value when possible.
 * Supports grouped/categorized options.
 */
interface SelectSpec {
  Root: React.ComponentProps<typeof import("@/components/ui/select").Select>;
  Trigger: React.ComponentProps<typeof import("@/components/ui/select").SelectTrigger>;
  Content: React.ComponentProps<typeof import("@/components/ui/select").SelectContent>;
  Item: React.ComponentProps<typeof import("@/components/ui/select").SelectItem>;
}

/**
 * ## Form
 *
 * A wrapper integrating react-hook-form with zod validation.
 * Provides field state context for validation errors, descriptions, and labels.
 *
 * ### Variants
 * - No visual variants — structural wrapper only
 *
 * ### Interaction States
 * | State     | Visual                                        |
 * |-----------|-----------------------------------------------|
 * | valid     | No message shown (default)                    |
 * | error     | FormMessage renders with `text-destructive`   |
 * | disabled  | Propagated to child via react-hook-form       |
 *
 * ### Accessibility
 * - `aria-invalid` set on FormControl when error exists
 * - `aria-describedby` links to description + message
 * - `id` auto-generated via `useId()`
 * - Error state visually propagated to FormLabel
 *
 * ### Sub-components
 * - `<Form>` — wraps FormProvider
 * - `<FormField>` — wraps Controller, provides field context
 * - `<FormItem>` — grid container for label + control + message
 * - `<FormLabel>` — enhanced Label with error styling
 * - `<FormControl>` — Slot wrapper, passes aria attributes to child
 * - `<FormDescription>` — help text below control
 * - `<FormMessage>` — validation error display
 * - `useFormField()` — hook for field state access
 *
 * ### CSS Classes
 * Uses `data-slot="form-*"` attributes for styling targets.
 *
 * ### Design Intent
 * Centralized form state management with declarative validation.
 * Error messages are rendered automatically based on zod schema.
 * No visual styles — consumers compose FormItem with their inputs.
 */
interface FormSpec {
  Form: React.ComponentProps<typeof import("@/components/ui/form").Form>;
  FormField: React.ComponentProps<typeof import("@/components/ui/form").FormField>;
  FormItem: React.ComponentProps<typeof import("@/components/ui/form").FormItem>;
  FormLabel: React.ComponentProps<typeof import("@/components/ui/form").FormLabel>;
  FormControl: React.ComponentProps<typeof import("@/components/ui/form").FormControl>;
  FormDescription: React.ComponentProps<typeof import("@/components/ui/form").FormDescription>;
  FormMessage: React.ComponentProps<typeof import("@/components/ui/form").FormMessage>;
}

// ════════════════════════════════════════════════════════════════════════════════
// Batch 2 — Layout & Display
// ════════════════════════════════════════════════════════════════════════════════

/**
 * ## Table
 *
 * A responsive HTML table for structured data display.
 * Styled wrapper around native `<table>` elements — no Radix dependency.
 *
 * ### Variants
 * - `default`: bordered rows, hover state on rows
 *
 * ### Interaction States
 * | State       | Visual                                      |
 * |-------------|---------------------------------------------|
 * | default     | border-b between rows                       |
 * | hover       | bg-muted/50 background                      |
 * | selected    | bg-muted background (when `data-state` set) |
 *
 * ### Accessibility
 * - Native HTML table semantics (`<table>`, `<th>`, `<td>`, `<caption>`, etc.)
 * - `role` attributes preserved from native elements
 * - Header cells use `<th>` with `text-left` alignment
 * - Caption via `<TableCaption>` for screen reader context
 * - Responsive: horizontal scroll container wraps the table
 *
 * ### Sub-components
 * - `<Table>` — container + responsive wrapper
 * - `<TableHeader>` — thead
 * - `<TableBody>` — tbody
 * - `<TableFooter>` — tfoot with muted background + top border
 * - `<TableHead>` — th with muted foreground, 40px height
 * - `<TableRow>` — tr with hover state
 * - `<TableCell>` — td with 1rem padding
 * - `<TableCaption>` — caption with muted text
 *
 * ### CSS Classes
 * Uses Tailwind utility classes (no custom `.uiTable` class).
 *
 * ### Design Intent
 * For data-dense screens requiring sortable, selectable rows.
 * White/transparent background — rows separated by subtle borders only.
 * No card style — this is traditional data-table formatting.
 * Meant as the base for a future virtualized DataTable component.
 */
interface TableSpec {
  Table: React.ComponentProps<typeof import("@/components/ui/table").Table>;
  Header: React.ComponentProps<typeof import("@/components/ui/table").TableHeader>;
  Body: React.ComponentProps<typeof import("@/components/ui/table").TableBody>;
  Row: React.ComponentProps<typeof import("@/components/ui/table").TableRow>;
  Head: React.ComponentProps<typeof import("@/components/ui/table").TableHead>;
  Cell: React.ComponentProps<typeof import("@/components/ui/table").TableCell>;
  Caption: React.ComponentProps<typeof import("@/components/ui/table").TableCaption>;
}

/**
 * ## Accordion
 *
 * Expandable/collapsible sections for progressive disclosure of content.
 *
 * ### Variants
 * - `single`: one section open at a time (default)
 * - `multiple`: multiple sections open simultaneously (`type="multiple"`)
 *
 * ### Interaction States
 * | State       | Visual                                          |
 * |-------------|-------------------------------------------------|
 * | collapsed   | Chevron point down, content hidden              |
 * | expanded    | Chevron rotates 180°, content slides down       |
 * | hover       | Trigger text underlined                         |
 * | focus-visible | ring not applied (relies on Radix)            |
 * | disabled    | Item not clickable                              |
 *
 * ### Accessibility
 * - Role: Regions use native disclosure pattern
 * - Keyboard: Enter/Space to toggle section
 * - ARIA: `aria-expanded` managed by Radix
 * - Header wraps trigger in `<AccordionPrimitive.Header>` for semantic structure
 *
 * ### Sub-components
 * - `<Accordion>` — Root with type + collapsible props
 * - `<AccordionItem>` — Single section wrapper
 * - `<AccordionTrigger>` — Clickable header (rotating chevron)
 * - `<AccordionContent>` — Collapsible body with slide animation
 *
 * ### CSS Classes
 * Uses Tailwind utility classes (no custom `.uiAccordion` class).
 * Animations: `animate-accordion-down` / `animate-accordion-up` (200ms ease-out).
 *
 * ### Design Intent
 * Progressive disclosure — hide secondary information behind expandable sections.
 * Commonly used for: FAQ sections, filter panels, multi-step forms with collapsed steps.
 * Chevron icon should always indicate expandability.
 */
interface AccordionSpec {
  Root: React.ComponentProps<typeof import("@/components/ui/accordion").Accordion>;
  Item: React.ComponentProps<typeof import("@/components/ui/accordion").AccordionItem>;
  Trigger: React.ComponentProps<typeof import("@/components/ui/accordion").AccordionTrigger>;
  Content: React.ComponentProps<typeof import("@/components/ui/accordion").AccordionContent>;
}

/**
 * ## ScrollArea
 *
 * A styled scroll container with customizable scrollbar.
 * Replaces native scrollbars for consistent cross-browser appearance.
 *
 * ### Variants
 * - `vertical`: vertical scrollbar (default)
 * - `horizontal`: horizontal scrollbar
 *
 * ### Interaction States
 * | State     | Visual                                       |
 * |-----------|----------------------------------------------|
 * | idle      | Scrollbar hidden or thin (2.5px wide)        |
 * | hovering  | Scrollbar visible, thumb shows               |
 * | scrolling | Scrollbar visible with full opacity          |
 *
 * ### Accessibility
 * - Preserves native scroll behavior and keyboard navigation
 * - Touch scroll support via `touch-none` on scrollbar
 * - Focus visible ring on viewport for keyboard users
 * - Corner element for overlapping scrollbars
 *
 * ### Sub-components
 * - `<ScrollArea>` — Root scroll container
 * - `<ScrollBar>` — Styled scrollbar (vertical or horizontal)
 *
 * ### CSS Classes
 * Uses Tailwind utility classes (no custom `.uiScrollArea` class).
 *
 * ### Design Intent
 * Use for content areas that overflow (side panels, code blocks, long lists).
 * Scrollbar should be unobtrusive — thin, translucent, appearing on hover.
 * Never use for page-level scrolling — only for bounded containers.
 */
interface ScrollAreaSpec {
  Root: React.ComponentProps<typeof import("@/components/ui/scroll-area").ScrollArea>;
  ScrollBar: React.ComponentProps<typeof import("@/components/ui/scroll-area").ScrollBar>;
}

/**
 * ## Progress
 *
 * A horizontal progress/loading indicator.
 *
 * ### Variants
 * - `default`: primary color fill
 *
 * ### Sizes
 * - `default`: height 8px, full-width rounded track
 *
 * ### Interaction States
 * | State      | Visual                                            |
 * |------------|---------------------------------------------------|
 * | 0%         | Indicator at left edge, invisible                 |
 * | indeterminate | Not supported (use Skeleton for unknown duration)  |
 * | complete   | Indicator fills full width                        |
 *
 * ### Accessibility
 * - Role: `progressbar`
 * - ARIA: `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"` managed by Radix
 * - Label via `aria-label` or `aria-labelledby`
 *
 * ### CSS Classes
 * Uses Tailwind utility classes (no custom `.uiProgress` class).
 *
 * ### Design Intent
 * For determinate progress scenarios (file upload, form wizard, batch processing).
 * Smooth transition (500ms ease-out) for natural feel.
 * For indeterminate loading, use `<Skeleton>` instead.
 * Should always have a text label or percentage companion for accessibility.
 */
interface ProgressSpec {
  Root: React.ComponentProps<typeof import("@/components/ui/progress").Progress>;
}

// ════════════════════════════════════════════════════════════════════════════════
// Batch 3 — Interaction
// ════════════════════════════════════════════════════════════════════════════════

/**
 * ## Popover
 *
 * A contextual pop-up overlay anchored to a trigger element.
 * For richer content than Tooltip — can include forms, lists, actions.
 *
 * ### Variants
 * - No visual variants; side/align/sideOffset control positioning
 *
 * ### Interaction States
 * | State       | Visual                                          |
 * |-------------|-------------------------------------------------|
 * | closed      | Trigger only visible                            |
 * | open        | Content appears with scale/fade animation       |
 * | click outside | Closes automatically                        |
 * | Escape      | Closes automatically                            |
 *
 * ### Accessibility
 * - Role: `dialog`
 * - Keyboard: Tab to move focus within, Escape to close
 * - ARIA: `aria-modal`, `aria-label` managed by Radix
 * - Focus trap within popover content
 * - Should not be used for complex forms (use Dialog instead)
 *
 * ### Sub-components
 * - `<Popover>` — Root state container
 * - `<PopoverTrigger>` — anchor element
 * - `<PopoverContent>` — floating content with portal
 * - `<PopoverAnchor>` — alternative anchor (when trigger ≠ anchor)
 *
 * ### CSS Classes
 * - Content: `.uiPopoverContent`
 *
 * ### Design Intent
 * For secondary actions that don't warrant a full dialog.
 * Examples: color picker, date picker, inline settings, quick-edit.
 * Content should be compact — avoid scrolling within a popover.
 * Side options: top, bottom, left, right. Default: bottom. Align: center.
 */
interface PopoverSpec {
  Root: React.ComponentProps<typeof import("@/components/ui/popover").Popover>;
  Trigger: React.ComponentProps<typeof import("@/components/ui/popover").PopoverTrigger>;
  Content: React.ComponentProps<typeof import("@/components/ui/popover").PopoverContent>;
  Anchor: React.ComponentProps<typeof import("@/components/ui/popover").PopoverAnchor>;
}

/**
 * ## AlertDialog
 *
 * A modal dialog for confirming destructive or important actions.
 * Blocks interaction with the rest of the page until dismissed.
 *
 * ### Variants
 * - Action button uses `uiButton_destructive` variant
 * - Cancel button uses `uiButton_ghost` variant
 *
 * ### Interaction States
 * | State          | Visual                                        |
 * |----------------|-----------------------------------------------|
 * | closed         | Hidden, no overlay                            |
 * | open           | Overlay fades in, content scales in           |
 * | action hover   | Destructive button hover state                |
 * | cancel hover   | Ghost button hover state                      |
 * | Escape key     | Triggers cancel (if onCancel defined)         |
 * | click overlay  | Closes dialog                                 |
 *
 * ### Accessibility
 * - Role: `alertdialog`
 * - Keyboard: Escape to cancel, Tab through focusable elements
 * - Focus trap: focus moves to first focusable element on open
 * - `aria-describedby` links to description
 * - `aria-labelledby` links to title
 *
 * ### Sub-components
 * - `<AlertDialog>` — Root state container
 * - `<AlertDialogTrigger>` — opens the dialog
 * - `<AlertDialogContent>` — modal container with overlay
 * - `<AlertDialogHeader>` — title + description area
 * - `<AlertDialogFooter>` — action/cancel buttons
 * - `<AlertDialogTitle>` — dialog heading
 * - `<AlertDialogDescription>` — dialog body text
 * - `<AlertDialogAction>` — confirm button (destructive)
 * - `<AlertDialogCancel>` — dismiss button (ghost)
 *
 * ### CSS Classes
 * - Overlay: `.uiAlertDialogOverlay`
 * - Content: `.uiAlertDialogContent`
 * - Header: `.uiAlertDialogHeader`
 * - Footer: `.uiAlertDialogFooter`
 * - Title: `.uiAlertDialogTitle`
 * - Description: `.uiAlertDialogDescription`
 * - Action reuses `.uiButton_uiButton_destructive`
 * - Cancel reuses `.uiButton_uiButton_ghost`
 *
 * ### Design Intent
 * Used only for high-consequence confirmations:
 *   - Deleting a record
 *   - Removing a user
 *   - Discarding unsaved work
 * Action button should be destructive-colored, cancel should be ghost.
 * Always provide a clear cancel path.
 */
interface AlertDialogSpec {
  Root: React.ComponentProps<typeof import("@/components/ui/alert-dialog").AlertDialog>;
  Trigger: React.ComponentProps<typeof import("@/components/ui/alert-dialog").AlertDialogTrigger>;
  Content: React.ComponentProps<typeof import("@/components/ui/alert-dialog").AlertDialogContent>;
  Header: React.ComponentProps<typeof import("@/components/ui/alert-dialog").AlertDialogHeader>;
  Title: React.ComponentProps<typeof import("@/components/ui/alert-dialog").AlertDialogTitle>;
  Description: React.ComponentProps<typeof import("@/components/ui/alert-dialog").AlertDialogDescription>;
  Action: React.ComponentProps<typeof import("@/components/ui/alert-dialog").AlertDialogAction>;
  Cancel: React.ComponentProps<typeof import("@/components/ui/alert-dialog").AlertDialogCancel>;
}

/**
 * ## Tooltip
 *
 * A small text label that appears on hover/focus to describe a UI element.
 * For supplementary information — never for critical content.
 *
 * ### Interaction States
 * | State       | Visual                                          |
 * |-------------|-------------------------------------------------|
 * | idle        | Hidden                                           |
 * | hover/focus | Appears after delay (0ms by default)            |
 * | leaving     | Fades out with zoom-out animation               |
 *
 * ### Accessibility
 * - Role: `tooltip`
 * - Keyboard: Focus on trigger element shows tooltip
 * - ARIA: `aria-describedby` links content to trigger
 * - Provider wraps the scope: `<TooltipProvider>` at app level
 *
 * ### Sub-components
 * - `<TooltipProvider>` — sets delayDuration context
 * - `<Tooltip>` — Root state container
 * - `<TooltipTrigger>` — anchor element
 * - `<TooltipContent>` — floating tooltip with arrow
 *
 * ### CSS Classes
 * Uses Tailwind utility classes (no custom `.uiTooltip` class).
 * Arrow uses `.size-2.5` with rotation and fill.
 *
 * ### Design Intent
 * For icon buttons, truncated text, or UI elements needing brief explanation.
 * Content should be 1-5 words — never sentences or paragraphs.
 * Not for error messages (use FormMessage) or rich content (use Popover).
 * Arrow points to the trigger element.
 */
interface TooltipSpec {
  Provider: React.ComponentProps<typeof import("@/components/ui/tooltip").TooltipProvider>;
  Root: React.ComponentProps<typeof import("@/components/ui/tooltip").Tooltip>;
  Trigger: React.ComponentProps<typeof import("@/components/ui/tooltip").TooltipTrigger>;
  Content: React.ComponentProps<typeof import("@/components/ui/tooltip").TooltipContent>;
}
