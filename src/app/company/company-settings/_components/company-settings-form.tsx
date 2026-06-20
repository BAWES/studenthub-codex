"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { update } from "../actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { CompanySettings, UpdateCompanySettingsInput } from "../schemas";

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{companyName ?? `Company #${companyId}`}</CardTitle>
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save"}
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {feedback && (
            <div
              className={`rounded-md px-3 py-2 text-sm ${
                feedback.type === "success"
                  ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                  : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
              }`}
            >
              {feedback.message}
            </div>
          )}

          {/* Company Identity */}
          <fieldset>
            <legend className="text-sm font-medium text-muted-foreground mb-3">
              Company Identity
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" name="companyName" defaultValue={settings.company_name ?? ""} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="companyCommonNameEn">Common Name (EN)</Label>
                <Input id="companyCommonNameEn" name="companyCommonNameEn" defaultValue={settings.company_common_name_en ?? ""} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="companyCommonNameAr">Common Name (AR)</Label>
                <Input id="companyCommonNameAr" name="companyCommonNameAr" defaultValue={settings.company_common_name_ar ?? ""} dir="rtl" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="companyWebsite">Website</Label>
                <Input id="companyWebsite" name="companyWebsite" defaultValue={settings.company_website ?? ""} type="url" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="companyEmail">Email</Label>
                <Input id="companyEmail" name="companyEmail" defaultValue={settings.company_email ?? ""} type="email" />
              </div>
            </div>
          </fieldset>

          {/* Descriptions */}
          <fieldset>
            <legend className="text-sm font-medium text-muted-foreground mb-3">
              Descriptions
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="companyDescriptionEn">Description (EN)</Label>
                <Textarea id="companyDescriptionEn" name="companyDescriptionEn" defaultValue={settings.company_description_en ?? ""} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="companyDescriptionAr">Description (AR)</Label>
                <Textarea id="companyDescriptionAr" name="companyDescriptionAr" defaultValue={settings.company_description_ar ?? ""} dir="rtl" />
              </div>
            </div>
          </fieldset>

          {/* Rates & Finance */}
          <fieldset>
            <legend className="text-sm font-medium text-muted-foreground mb-3">
              Rates & Finance
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="companyHourlyRate">Hourly Rate (KWD)</Label>
                <Input id="companyHourlyRate" name="companyHourlyRate" defaultValue={settings.company_hourly_rate?.toString() ?? ""} type="number" step="0.001" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="companyBonusCommission">Bonus Commission</Label>
                <Input id="companyBonusCommission" name="companyBonusCommission" defaultValue={settings.company_bonus_commission?.toString() ?? ""} type="number" step="0.01" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="currencyCode">Currency Code</Label>
                <Input id="currencyCode" name="currencyCode" defaultValue={settings.currency_code ?? ""} maxLength={3} placeholder="KWD" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="companyFollowupIntervalWeeks">Follow-up Interval (weeks)</Label>
                <Input id="companyFollowupIntervalWeeks" name="companyFollowupIntervalWeeks" defaultValue={settings.company_followup_interval_weeks?.toString() ?? ""} type="number" min={1} max={52} />
              </div>
            </div>
          </fieldset>

          {/* Toggles */}
          <fieldset>
            <legend className="text-sm font-medium text-muted-foreground mb-3">
              Settings
            </legend>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Checkbox id="companyFollowup" name="companyFollowup" defaultChecked={settings.company_followup === true} />
                <Label htmlFor="companyFollowup" className="cursor-pointer">Enable follow-up</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="companyApprovedToHire" name="companyApprovedToHire" defaultChecked={settings.company_approved_to_hire === true} />
                <Label htmlFor="companyApprovedToHire" className="cursor-pointer">Approved to hire</Label>
              </div>
            </div>
          </fieldset>
        </CardContent>
      </Card>
    </form>
  );
}
