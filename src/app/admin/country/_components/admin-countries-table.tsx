"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

import type { SessionUser } from "@/modules/auth/types";
import type { CountryItem } from "@/modules/admin/country/schemas";
import { createCountry, updateCountry, deleteCountry } from "@/modules/admin/country/actions";

type Props = {
  session: SessionUser;
  countries: CountryItem[];
};

export function AdminCountriesTable({ session, countries }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage countries"
      metrics={[
        { label: "Total countries", value: countries.length, note: "Countries in the system" },
      ]}
    >
      <section className="mb-6">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--ink)" }}>Add country</h3>
          <CreateCountryForm onSuccess={() => router.refresh()} />
        </div>
      </section>

      <DataTable
        title="Countries"
        description="All countries. Click a name to edit or delete."
        rows={countries.map((c) => ({ ...c, id: c.country_id }))}
        rowHref={undefined}
        columns={[
          {
            key: "country_name_en",
            label: "English name",
            render: (row) =>
              editingId === row.country_id ? (
                <EditCountryForm
                  row={row}
                  onDone={() => { setEditingId(null); router.refresh(); }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <button
                  type="button"
                  className="text-sm hover:underline"
                  style={{ color: "var(--sh-primary)" }}
                  onClick={() => setEditingId(row.country_id)}
                >
                  {row.country_name_en}
                </button>
              ),
          },
          {
            key: "iso",
            label: "ISO",
            render: (row) => <span className="text-sm">{row.iso || "—"}</span>,
          },
          {
            key: "country_code",
            label: "Code",
            render: (row) => <span className="text-sm">{row.country_code != null ? `+${row.country_code}` : "—"}</span>,
          },
          {
            key: "currency_code",
            label: "Currency",
            render: (row) => <span className="text-sm">{row.currency_code || "—"}</span>,
          },
          {
            key: "emoji",
            label: "Flag",
            render: (row) => <span className="text-lg">{row.emoji || "—"}</span>,
          },
          {
            key: "actions",
            label: "Actions",
            render: (row) =>
              editingId !== row.country_id ? (
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded hover:bg-red-500/10"
                  style={{ color: "var(--sh-error)" }}
                  onClick={async () => {
                    if (confirm(`Delete country "${row.country_name_en}"?`)) {
                      const result = await deleteCountry(row.country_id);
                      if (result.operation === "error") {
                        alert(result.message);
                      }
                      router.refresh();
                    }
                  }}
                >
                  Delete
                </button>
              ) : null,
          },
        ]}
      />
    </WorkspaceShell>
  );
}

function CreateCountryForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const result = await createCountry({
        country_name_en: formData.get("country_name_en") as string,
        country_name_ar: (formData.get("country_name_ar") as string) || null,
        country_nationality_name_en: formData.get("country_nationality_name_en") as string,
        country_nationality_name_ar: (formData.get("country_nationality_name_ar") as string) || null,
        iso: (formData.get("iso") as string) || null,
        emoji: (formData.get("emoji") as string) || null,
        country_code: (formData.get("country_code") as string) ? Number(formData.get("country_code")) : null,
        currency_code: (formData.get("currency_code") as string) || null,
      });
      if (result.operation === "success") {
        onSuccess();
        return { error: undefined };
      }
      return { error: result.message };
    },
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-wrap items-end gap-3"
      onSubmit={() => setTimeout(() => { formRef.current?.reset(); }, 100)}
    >
      <div className="grid gap-1">
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>English name *</label>
        <input name="country_name_en" required maxLength={100} placeholder="e.g. Kuwait" className="h-9 rounded-lg px-3 text-sm border" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }} />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Arabic name</label>
        <input name="country_name_ar" maxLength={100} placeholder="الكويت" className="h-9 rounded-lg px-3 text-sm border" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }} />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Nationality (EN) *</label>
        <input name="country_nationality_name_en" required maxLength={100} placeholder="Kuwaiti" className="h-9 rounded-lg px-3 text-sm border" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }} />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Nationality (AR)</label>
        <input name="country_nationality_name_ar" maxLength={100} placeholder="كويتي" className="h-9 rounded-lg px-3 text-sm border" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }} />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>ISO</label>
        <input name="iso" maxLength={3} placeholder="KWT" className="h-9 rounded-lg px-3 text-sm border w-16" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }} />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Code</label>
        <input name="country_code" type="number" placeholder="965" className="h-9 rounded-lg px-3 text-sm border w-20" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }} />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Currency</label>
        <input name="currency_code" maxLength={3} placeholder="KWD" className="h-9 rounded-lg px-3 text-sm border w-16" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }} />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Emoji</label>
        <input name="emoji" maxLength={255} placeholder="🇰🇼" className="h-9 rounded-lg px-3 text-sm border w-16" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-9 rounded-lg px-4 text-sm font-semibold"
        style={{ background: "var(--sh-primary)", color: "#fff" }}
      >
        {pending ? "Adding..." : "Add"}
      </button>
      {state?.error ? (
        <p className="text-xs w-full" style={{ color: "var(--sh-error)" }}>{state.error}</p>
      ) : null}
    </form>
  );
}

function EditCountryForm({
  row,
  onDone,
  onCancel,
}: {
  row: CountryItem;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const result = await updateCountry({
        country_id: row.country_id,
        country_name_en: formData.get("country_name_en") as string,
        country_name_ar: (formData.get("country_name_ar") as string) || null,
        country_nationality_name_en: formData.get("country_nationality_name_en") as string,
        country_nationality_name_ar: (formData.get("country_nationality_name_ar") as string) || null,
        iso: (formData.get("iso") as string) || null,
        emoji: (formData.get("emoji") as string) || null,
        country_code: (formData.get("country_code") as string) ? Number(formData.get("country_code")) : null,
        currency_code: (formData.get("currency_code") as string) || null,
      });
      if (result.operation === "success") {
        onDone();
        return { error: undefined };
      }
      return { error: result.message };
    },
    null,
  );

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input name="country_name_en" defaultValue={row.country_name_en} required maxLength={100} className="h-8 rounded px-2 text-sm border w-36" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }} />
      <input name="iso" defaultValue={row.iso || ""} maxLength={3} placeholder="ISO" className="h-8 rounded px-2 text-sm border w-14" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }} />
      <input name="currency_code" defaultValue={row.currency_code || ""} maxLength={3} placeholder="Curr" className="h-8 rounded px-2 text-sm border w-14" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)" }} />
      <button type="submit" disabled={pending} className="h-8 rounded px-3 text-xs font-semibold" style={{ background: "var(--sh-primary)", color: "#fff" }}>{pending ? "..." : "Save"}</button>
      <button type="button" onClick={onCancel} className="h-8 rounded px-3 text-xs" style={{ color: "var(--muted)" }}>Cancel</button>
      {state?.error ? <p className="text-xs" style={{ color: "var(--sh-error)" }}>{state.error}</p> : null}
    </form>
  );
}
