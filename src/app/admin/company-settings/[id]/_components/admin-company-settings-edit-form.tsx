"use client";

import { useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateAdminCompanySettings } from "../../actions";
import type { AdminCompanySettingsItem } from "../../schemas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  settings: AdminCompanySettingsItem;
};

function camelToSnake(name: string): string {
  return name.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
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

  return (
    <section className="mt-6">
      {!expanded ? (
        <Button onClick={() => setExpanded(true)} className="mt-2">
          Edit settings
        </Button>
      ) : (
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Edit {settings.company_name || `Company #${settings.company_id}`}
          </h3>
          <form
            ref={formRef}
            action={action}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
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
                  defaultValue={(settings as any)[camelToSnake(field.name)] ?? ""}
                  maxLength={field.maxLength}
                />
              </div>
            ))}

            {/* Textarea fields */}
            {["Description (EN)", "Description (AR)"].map((label) => {
              const name = label === "Description (EN)" ? "companyDescriptionEn" : "companyDescriptionAr";
              return (
                <div className="grid gap-1.5 sm:col-span-2" key={name}>
                  <Label htmlFor={name}>{label}</Label>
                  <Textarea
                    id={name}
                    name={name}
                    defaultValue={(settings as any)[camelToSnake(name)] ?? ""}
                    rows={3}
                  />
                </div>
              );
            })}

            {/* Numeric fields */}
            {[
              { name: "companyHourlyRate", label: "Hourly rate", step: "0.01" },
              { name: "companyBonusCommission", label: "Bonus commission", step: "0.01" },
              { name: "companyFollowupIntervalWeeks", label: "Followup interval (weeks)", min: 1, max: 52 },
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
                  defaultValue={(settings as any)[camelToSnake(field.name)] ?? ""}
                />
              </div>
            ))}

            {/* Boolean selects using shadcn Select */}
            {[
              { name: "companyFollowup", label: "Followup" },
              { name: "companyApprovedToHire", label: "Approved to hire" },
            ].map((field) => {
              const currentVal = (settings as any)[camelToSnake(field.name)];
              return (
                <div className="grid gap-1.5" key={field.name}>
                  <Label>{field.label}</Label>
                  <Select
                    name={field.name}
                    defaultValue={currentVal == null ? "" : String(currentVal)}
                  >
                    <SelectTrigger>
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
              <Button type="button" variant="outline" onClick={() => setExpanded(false)}>
                Cancel
              </Button>
              {state?.error ? (
                <p className="text-xs text-destructive">{state.error}</p>
              ) : null}
            </div>
          </form>
        </Card>
      )}
    </section>
  );
}
