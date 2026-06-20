"use client";

import { useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateAdminCompanySettings } from "../actions";
import type { AdminCompanySettingsItem } from "../schemas";

type Props = {
  settings: AdminCompanySettingsItem;
};

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
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="rounded-lg px-4 py-2 text-sm font-semibold"
          style={{ background: "var(--sh-primary)", color: "#fff" }}
        >
          Edit settings
        </button>
      ) : (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--ink)" }}>
            Edit {settings.company_name || `Company #${settings.company_id}`}
          </h3>
          <form
            ref={formRef}
            action={action}
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
          >
            <div className="grid gap-1">
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Company name</label>
              <input
                name="companyName"
                defaultValue={settings.company_name || ""}
                maxLength={255}
                className="h-9 rounded-lg px-3 text-sm border"
                style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Common name (EN)</label>
              <input
                name="companyCommonNameEn"
                defaultValue={settings.company_common_name_en || ""}
                maxLength={255}
                className="h-9 rounded-lg px-3 text-sm border"
                style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Common name (AR)</label>
              <input
                name="companyCommonNameAr"
                defaultValue={settings.company_common_name_ar || ""}
                maxLength={255}
                className="h-9 rounded-lg px-3 text-sm border"
                style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Description (EN)</label>
              <textarea
                name="companyDescriptionEn"
                defaultValue={settings.company_description_en || ""}
                rows={3}
                className="rounded-lg px-3 py-2 text-sm border resize-y"
                style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Description (AR)</label>
              <textarea
                name="companyDescriptionAr"
                defaultValue={settings.company_description_ar || ""}
                rows={3}
                className="rounded-lg px-3 py-2 text-sm border resize-y"
                style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Website</label>
              <input
                name="companyWebsite"
                defaultValue={settings.company_website || ""}
                className="h-9 rounded-lg px-3 text-sm border"
                style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Email</label>
              <input
                name="companyEmail"
                defaultValue={settings.company_email || ""}
                maxLength={225}
                className="h-9 rounded-lg px-3 text-sm border"
                style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Hourly rate</label>
              <input
                name="companyHourlyRate"
                type="number"
                step="0.01"
                defaultValue={settings.company_hourly_rate ?? ""}
                className="h-9 rounded-lg px-3 text-sm border"
                style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Bonus commission</label>
              <input
                name="companyBonusCommission"
                type="number"
                step="0.01"
                defaultValue={settings.company_bonus_commission ?? ""}
                className="h-9 rounded-lg px-3 text-sm border"
                style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Followup</label>
              <select
                name="companyFollowup"
                defaultValue={settings.company_followup == null ? "" : String(settings.company_followup)}
                className="h-9 rounded-lg px-3 text-sm border"
                style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
              >
                <option value="">—</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Followup interval (weeks)</label>
              <input
                name="companyFollowupIntervalWeeks"
                type="number"
                min={1}
                max={52}
                defaultValue={settings.company_followup_interval_weeks ?? ""}
                className="h-9 rounded-lg px-3 text-sm border"
                style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Approved to hire</label>
              <select
                name="companyApprovedToHire"
                defaultValue={settings.company_approved_to_hire == null ? "" : String(settings.company_approved_to_hire)}
                className="h-9 rounded-lg px-3 text-sm border"
                style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
              >
                <option value="">—</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Currency code</label>
              <input
                name="currencyCode"
                defaultValue={settings.currency_code || ""}
                maxLength={3}
                placeholder="KWD"
                className="h-9 rounded-lg px-3 text-sm border"
                style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }}
              />
            </div>

            <div className="col-span-full flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={pending}
                className="h-9 rounded-lg px-4 text-sm font-semibold"
                style={{ background: "var(--sh-primary)", color: "#fff" }}
              >
                {pending ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="h-9 rounded-lg px-4 text-sm"
                style={{ color: "var(--muted)" }}
              >
                Cancel
              </button>
              {state?.error ? (
                <p className="text-xs" style={{ color: "var(--sh-error)" }}>{state.error}</p>
              ) : null}
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
