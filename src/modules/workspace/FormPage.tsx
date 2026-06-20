"use client";

import type { ReactNode } from "react";
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
    <section className={className}>
      {/* Header */}
      <div className="formPageHeader">
        <div>
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
        {isDirty ? (
          <span className="dirtyIndicator">Unsaved changes</span>
        ) : null}
      </div>

      {/* Validation errors */}
      {errors && errors.length > 0 ? (
        <div className="formErrors" role="alert">
          <strong>Please fix the following errors:</strong>
          <ul>
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Form sections */}
      <div className="formSections">
        {sections.map((section) => (
          <fieldset className="formSection" key={section.title}>
            <legend>
              <h2>{section.title}</h2>
              {section.description ? <p>{section.description}</p> : null}
            </legend>
            <div className="formSectionBody">{section.content}</div>
          </fieldset>
        ))}
      </div>

      {/* Footer actions */}
      <div className="formFooter">
        <div className="formFooterLeft">
          {footerActions}
        </div>
        <div className="formFooterRight">
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
