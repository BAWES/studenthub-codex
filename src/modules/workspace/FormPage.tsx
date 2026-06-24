"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ── Types ──────────────────────────────────────────────────

export type FormSection = {
  /** Section title shown as a heading. */
  title: string;
  /** Section description / helper text. */
  description?: string;
  /** Section body content (form fields). */
  content: ReactNode;
};

export type FormPageProps = {
  /** Page title. */
  title: string;
  /** Page description / subtitle. */
  description?: string;
  /** Form sections to render. */
  sections?: FormSection[];
  /** Loading/saving state — disables save button. */
  loading?: boolean;
  /** Submitting state — disables save and shows saving text. */
  isSubmitting?: boolean;
  /** Whether the form has unsaved changes. */
  isDirty?: boolean;
  /** Save handler. */
  onSave?: () => void;
  /** Cancel handler. */
  onCancel?: () => void;
  /** Validation error messages to display. */
  errors?: string[];
  /** Custom footer actions to render alongside save/cancel. */
  footerActions?: ReactNode;
  /** Save button text. Default: "Save". */
  saveLabel?: string;
  /** Cancel button text. Default: "Cancel". */
  cancelLabel?: string;
  /** Optional className override. */
  className?: string;
};

// ── Component ──────────────────────────────────────────────

export function FormPage({
  title,
  description,
  sections = [],
  loading = false,
  isSubmitting = false,
  isDirty = false,
  onSave,
  onCancel,
  errors,
  footerActions,
  saveLabel = "Save",
  cancelLabel = "Cancel",
  className,
}: FormPageProps) {
  const disabled = loading || isSubmitting;

  return (
    <section className={cn(className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h1 className="m-0">{title}</h1>
          {description ? <p className="text-sm text-muted-foreground m-0 mt-1">{description}</p> : null}
        </div>
        {isDirty ? (
          <span className="shrink-0 rounded-full bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
            Unsaved changes
          </span>
        ) : null}
      </div>

      {/* Validation errors */}
      {errors && errors.length > 0 ? (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 mb-4"
          role="alert"
        >
          <strong className="text-sm font-semibold text-destructive">Please fix the following errors:</strong>
          <ul className="m-0 mt-1.5 pl-5 text-sm text-destructive/90">
            {errors.map((err, i) => (
              <li key={i} className="leading-relaxed">{err}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Form sections */}
      <div className="grid gap-6">
        {sections.map((section) => (
          <fieldset
            key={section.title}
            className="rounded-lg border border-border bg-card p-4 md:p-5"
          >
            <legend className="mb-3">
              <h2 className="text-base font-semibold text-foreground m-0">{section.title}</h2>
              {section.description ? (
                <p className="text-sm text-muted-foreground m-0 mt-0.5">{section.description}</p>
              ) : null}
            </legend>
            <div className="grid gap-4">{section.content}</div>
          </fieldset>
        ))}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2">{footerActions}</div>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" onClick={onCancel} disabled={disabled}>
            {cancelLabel}
          </Button>
          <Button onClick={onSave} disabled={disabled}>
            {loading ? "Saving..." : saveLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
