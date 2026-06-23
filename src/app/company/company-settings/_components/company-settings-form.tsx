"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { update } from "../actions";
import type { CompanySettings, UpdateCompanySettingsInput } from "../schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function CompanySettingsForm({
  companyId,
  companyName,
  settings,
}: {
  companyId: number;
  companyName: string | null;
  settings: CompanySettings;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setFeedback(null);

      const form = new FormData(e.currentTarget);
      const input: UpdateCompanySettingsInput = {};

      const name = form.get("companyName") as string;
      if (name?.trim()) input.companyName = name.trim();

      const commonEn = form.get("companyCommonNameEn") as string;
      if (commonEn?.trim()) input.companyCommonNameEn = commonEn.trim();

      const commonAr = form.get("companyCommonNameAr") as string;
      if (commonAr?.trim()) input.companyCommonNameAr = commonAr.trim();

      const descEn = form.get("companyDescriptionEn") as string;
      if (descEn?.trim()) input.companyDescriptionEn = descEn.trim();

      const descAr = form.get("companyDescriptionAr") as string;
      if (descAr?.trim()) input.companyDescriptionAr = descAr.trim();

      const website = form.get("companyWebsite") as string;
      if (website?.trim()) input.companyWebsite = website.trim();

      const email = form.get("companyEmail") as string;
      if (email?.trim()) input.companyEmail = email.trim();

      const rate = form.get("companyHourlyRate") as string;
      if (rate?.trim()) input.companyHourlyRate = parseFloat(rate) || 0;

      const commission = form.get("companyBonusCommission") as string;
      if (commission?.trim()) input.companyBonusCommission = parseFloat(commission) || 0;

      const followup = form.get("companyFollowup") as string;
      if (followup) input.companyFollowup = followup === "on";

      const interval = form.get("companyFollowupIntervalWeeks") as string;
      if (interval?.trim()) input.companyFollowupIntervalWeeks = parseInt(interval, 10) || 0;

      const approved = form.get("companyApprovedToHire") as string;
      if (approved) input.companyApprovedToHire = approved === "on";

      const currency = form.get("currencyCode") as string;
      if (currency?.trim()) input.currencyCode = currency.trim().toUpperCase();

      startTransition(async () => {
        const result = await update(companyId, input);
        if (result.operation === "success") {
          setFeedback({ type: "success", message: result.message });
          router.refresh();
        } else {
          setFeedback({ type: "error", message: result.message });
        }
      });
    },
    [companyId, router],
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-border bg-card p-6 space-y-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          {companyName ?? `Company #${companyId}`}
        </h3>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving..." : "Save"}
        </Button>
      </div>

      {feedback && (
        <Alert variant={feedback.type === "success" ? "default" : "destructive"}>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}

      {/* Name & Identity */}
      <fieldset>
        <legend className="text-xs font-medium mb-3 text-muted-foreground">
          Company Identity
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField label="Company Name" name="companyName" defaultValue={settings.company_name ?? ""} />
          <InputField label="Common Name (EN)" name="companyCommonNameEn" defaultValue={settings.company_common_name_en ?? ""} />
          <InputField label="Common Name (AR)" name="companyCommonNameAr" defaultValue={settings.company_common_name_ar ?? ""} dir="rtl" />
          <InputField label="Website" name="companyWebsite" defaultValue={settings.company_website ?? ""} type="url" />
          <InputField label="Email" name="companyEmail" defaultValue={settings.company_email ?? ""} type="email" />
        </div>
      </fieldset>

      {/* Descriptions */}
      <fieldset>
        <legend className="text-xs font-medium mb-3 text-muted-foreground">
          Descriptions
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextareaField label="Description (EN)" name="companyDescriptionEn" defaultValue={settings.company_description_en ?? ""} />
          <TextareaField label="Description (AR)" name="companyDescriptionAr" defaultValue={settings.company_description_ar ?? ""} dir="rtl" />
        </div>
      </fieldset>

      {/* Rates & Finance */}
      <fieldset>
        <legend className="text-xs font-medium mb-3 text-muted-foreground">
          Rates & Finance
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField label="Hourly Rate (KWD)" name="companyHourlyRate" defaultValue={settings.company_hourly_rate?.toString() ?? ""} type="number" step="0.001" />
          <InputField label="Bonus Commission" name="companyBonusCommission" defaultValue={settings.company_bonus_commission?.toString() ?? ""} type="number" step="0.01" />
          <InputField label="Currency Code" name="currencyCode" defaultValue={settings.currency_code ?? ""} maxLength={3} placeholder="KWD" />
          <InputField label="Follow-up Interval (weeks)" name="companyFollowupIntervalWeeks" defaultValue={settings.company_followup_interval_weeks?.toString() ?? ""} type="number" min={1} max={52} />
        </div>
      </fieldset>

      {/* Toggles */}
      <fieldset>
        <legend className="text-xs font-medium mb-3 text-muted-foreground">
          Settings
        </legend>
        <div className="flex flex-wrap gap-6">
          <CheckboxField label="Enable follow-up" name="companyFollowup" defaultChecked={settings.company_followup === true} />
          <CheckboxField label="Approved to hire" name="companyApprovedToHire" defaultChecked={settings.company_approved_to_hire === true} />
        </div>
      </fieldset>
    </form>
  );
}

// ── Field helpers ──────────────────────────────────────────────────────────

function InputField({
  label,
  name,
  defaultValue,
  type = "text",
  step,
  min,
  max,
  maxLength,
  placeholder,
  dir,
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
  step?: string;
  min?: number;
  max?: number;
  maxLength?: number;
  placeholder?: string;
  dir?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name} className="text-xs text-muted-foreground">{label}</Label>
      <Input
        id={name}
        type={type}
        name={name}
        defaultValue={defaultValue}
        step={step}
        min={min}
        max={max}
        maxLength={maxLength}
        placeholder={placeholder}
        dir={dir}
      />
    </div>
  );
}

function TextareaField({
  label,
  name,
  defaultValue,
  dir,
}: {
  label: string;
  name: string;
  defaultValue: string;
  dir?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name} className="text-xs text-muted-foreground">{label}</Label>
      <Textarea
        id={name}
        name={name}
        defaultValue={defaultValue}
        dir={dir}
        rows={3}
      />
    </div>
  );
}

function CheckboxField({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked: boolean;
}) {
  return (
    <Label className="flex items-center gap-2 cursor-pointer text-xs text-foreground">
      <Checkbox
        name={name}
        defaultChecked={defaultChecked}
        className="data-[state=checked]:bg-coral data-[state=checked]:border-coral"
      />
      {label}
    </Label>
  );
}
