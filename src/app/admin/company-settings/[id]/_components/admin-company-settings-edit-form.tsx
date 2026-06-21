"use client";

import { useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateAdminCompanySettings } from "@/app/admin/company-settings/actions";
import type { AdminCompanySettingsItem } from "@/app/admin/company-settings/schemas";

type Props = {
  settings: AdminCompanySettingsItem;
};

/** Maps camelCase form field names to snake_case DB column names */
const FIELD_MAP: Record<string, keyof AdminCompanySettingsItem> = {
  companyName: "company_name",
  companyCommonNameEn: "company_common_name_en",
  companyCommonNameAr: "company_common_name_ar",
  companyDescriptionEn: "company_description_en",
  companyDescriptionAr: "company_description_ar",
  companyWebsite: "company_website",
  companyEmail: "company_email",
  companyHourlyRate: "company_hourly_rate",
  companyBonusCommission: "company_bonus_commission",
  companyFollowup: "company_followup",
  companyFollowupIntervalWeeks: "company_followup_interval_weeks",
  companyApprovedToHire: "company_approved_to_hire",
  currencyCode: "currency_code",
};

function getFieldValue(settings: AdminCompanySettingsItem, fieldName: string): unknown {
  const dbKey = FIELD_MAP[fieldName];
  return dbKey ? (settings as any)[dbKey] : undefined;
}

export function AdminCompanySettingsEditForm({ settings }: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const input: Record<string, unknown> = {};
      const fields = [
        "companyName",
        "companyCommonNameEn",
        "companyCommonNameAr",
        "companyDescriptionEn",
        "companyDescriptionAr",
        "companyWebsite",
        "companyEmail",
      ] as const;
      for (const f of fields) {
        const v = formData.get(f) as string;
        if (v !== undefined && v !== null) {
          input[f] = v || null;
        }
      }

      // Numeric fields
      const hourlyRate = formData.get("companyHourlyRate") as string;
      if (hourlyRate !== "" && hourlyRate !== null) {
        input.companyHourlyRate = Number(hourlyRate);
      }
      const bonus = formData.get("companyBonusCommission") as string;
      if (bonus !== "" && bonus !== null) {
        input.companyBonusCommission = Number(bonus);
      }
      const interval = formData.get("companyFollowupIntervalWeeks") as string;
      if (interval !== "" && interval !== null) {
        input.companyFollowupIntervalWeeks = Number(interval);
      }

      // Boolean fields
      const followup = formData.get("companyFollowup") as string;
      if (followup !== "") {
        input.companyFollowup = followup === "true";
      }
      const approved = formData.get("companyApprovedToHire") as string;
      if (approved !== "") {
        input.companyApprovedToHire = approved === "true";
      }

      // Currency
      const currency = formData.get("currencyCode") as string;
      if (currency !== "") {
        input.currencyCode = currency || null;
      }

      const result = await updateAdminCompanySettings(settings.company_id, input);
      if (result.operation === "success") {
        setExpanded(false);
        router.refresh();
        return { error: undefined };
      }
      return { error: result.message };
    },
    null,
  );

  if (!expanded) {
    return (
      <Button
        type="button"
        onClick={() => setExpanded(true)}
        className="mt-6"
      >
        Edit settings
      </Button>
    );
  }

  return (
    <Card className="mt-6">
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold mb-4 text-foreground">
          Edit {settings.company_name || `Company #${settings.company_id}`}
        </h3>
        <form
          ref={formRef}
          action={action}
          className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        >
          {/* Text fields */}
          {[
            { name: "companyName", label: "Company name", maxLength: 255 },
            { name: "companyCommonNameEn", label: "Common name (EN)", maxLength: 255 },
            { name: "companyCommonNameAr", label: "Common name (AR)", maxLength: 255 },
            { name: "companyWebsite", label: "Website" },
            { name: "companyEmail", label: "Email", maxLength: 225 },
          ].map((field) => (
            <div className="grid gap-1.5" key={field.name}>
              <Label htmlFor={field.name}>{field.label}</Label>
              <Input
                id={field.name}
                name={field.name}
                defaultValue={(getFieldValue(settings, field.name) as string) ?? ""}
                maxLength={field.maxLength}
              />
            </div>
          ))}

          {/* Textarea fields */}
          {[
            { name: "companyDescriptionEn", label: "Description (EN)" },
            { name: "companyDescriptionAr", label: "Description (AR)" },
          ].map(({ name, label }) => (
            <div className="grid gap-1.5" key={name}>
              <Label htmlFor={name}>{label}</Label>
              <Textarea
                id={name}
                name={name}
                defaultValue={(getFieldValue(settings, name) as string) ?? ""}
                rows={3}
              />
            </div>
          ))}

          {/* Numeric fields */}
          {[
            { name: "companyHourlyRate", label: "Hourly rate", step: "0.01" },
            { name: "companyBonusCommission", label: "Bonus commission", step: "0.01" },
            {
              name: "companyFollowupIntervalWeeks",
              label: "Followup interval (weeks)",
              min: 1,
              max: 52,
            },
          ].map((field) => (
            <div className="grid gap-1.5" key={field.name}>
              <Label htmlFor={field.name}>{field.label}</Label>
              <Input
                id={field.name}
                name={field.name}
                type="number"
                step={(field as any).step}
                min={(field as any).min}
                max={(field as any).max}
                defaultValue={String(getFieldValue(settings, field.name) ?? "")}
              />
            </div>
          ))}

          {/* Boolean selects */}
          {[
            { name: "companyFollowup", label: "Followup" },
            { name: "companyApprovedToHire", label: "Approved to hire" },
          ].map((field) => {
            const val = getFieldValue(settings, field.name);
            return (
              <div className="grid gap-1.5" key={field.name}>
                <Label htmlFor={field.name}>{field.label}</Label>
                <Select
                  name={field.name}
                  defaultValue={val == null ? "" : String(val)}
                >
                  <SelectTrigger id={field.name}>
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">—</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            );
          })}

          {/* Currency */}
          <div className="grid gap-1.5">
            <Label htmlFor="currencyCode">Currency code</Label>
            <Input
              id="currencyCode"
              name="currencyCode"
              defaultValue={settings.currency_code || ""}
              maxLength={3}
              placeholder="KWD"
            />
          </div>

          <div className="col-span-full flex items-center gap-3 pt-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save changes"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setExpanded(false)}
            >
              Cancel
            </Button>
            {state?.error ? (
              <p className="text-xs text-destructive">{state.error}</p>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
