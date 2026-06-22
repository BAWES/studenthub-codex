"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Route } from "next";

import type { SessionUser } from "@/modules/auth/types";
import type { CountryItem } from "../schemas";
import { createCountry, updateCountry, deleteCountry } from "../actions";

type Props = {
  session: SessionUser;
  countries: CountryItem[];
};

export function AdminCountryTable({ session, countries }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage countries — regions and nationalities used across the platform."
      metrics={[
        { label: "Total countries", value: countries.length, note: "Countries in the system" },
      ]}
    >
      <section className="mb-6">
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Add country</h3>
          <CreateCountryForm onSuccess={() => router.refresh()} />
        </div>
      </section>

      <DataTable
        title="Countries"
        description="All countries. Click a row to edit or delete."
        rows={countries.map((c) => ({ ...c, id: c.country_id }))}
        rowHref={undefined}
        columns={[
          {
            key: "name",
            label: "Name (EN)",
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
                  className="text-sm hover:underline text-blue-zendesk"
                  onClick={() => setEditingId(row.country_id)}
                >
                  {row.country_name_en}
                </button>
              ),
          },
          {
            key: "name_ar",
            label: "Name (AR)",
            render: (row) =>
              editingId === row.country_id ? null : (
                <span className="text-sm text-foreground">
                  {row.country_name_ar ?? "—"}
                </span>
              ),
          },
          {
            key: "iso",
            label: "ISO",
            render: (row) =>
              editingId === row.country_id ? null : (
                <code className="text-xs text-muted-foreground">
                  {row.iso ?? "—"}
                </code>
              ),
          },
          {
            key: "emoji",
            label: "Flag",
            render: (row) =>
              editingId === row.country_id ? null : (
                <span className="text-lg">{row.emoji ?? "—"}</span>
              ),
          },
          {
            key: "country_code",
            label: "Code",
            render: (row) =>
              editingId === row.country_id ? null : (
                <span className="text-sm text-foreground">
                  {row.country_code != null ? `+${row.country_code}` : "—"}
                </span>
              ),
          },
          {
            key: "currency_code",
            label: "Currency",
            render: (row) =>
              editingId === row.country_id ? null : (
                <span className="text-sm text-foreground">
                  {row.currency_code ?? "—"}
                </span>
              ),
          },
          {
            key: "actions",
            label: "",
            render: (row) =>
              editingId !== row.country_id ? (
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded hover:bg-red-500/10 text-destructive"
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
      const nameEn = formData.get("countryNameEn") as string;
      const nationalityEn = formData.get("nationalityNameEn") as string;
      const nameAr = formData.get("countryNameAr") as string;
      const nationalityAr = formData.get("nationalityNameAr") as string;
      const iso = formData.get("iso") as string;
      const emoji = formData.get("emoji") as string;
      const countryCode = formData.get("countryCode") as string;
      const currencyCode = formData.get("currencyCode") as string;

      const result = await createCountry(
        nameEn, nationalityEn,
        nameAr || undefined, nationalityAr || undefined,
        iso || undefined, emoji || undefined,
        countryCode ? Number(countryCode) : undefined,
        currencyCode || undefined,
      );
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
<<<<<<< HEAD
        <label className="text-xs font-medium text-muted-foreground">Name (EN) *</label>
        <Input name="countryNameEn" required maxLength={100} placeholder="e.g. Kuwait" className="w-36" />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted-foreground">Name (AR)</label>
        <Input name="countryNameAr" maxLength={100} placeholder="الكويت" className="w-36" />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted-foreground">Nationality (EN) *</label>
        <Input name="nationalityNameEn" required maxLength={100} placeholder="e.g. Kuwaiti" className="w-36" />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted-foreground">ISO</label>
        <Input name="iso" maxLength={3} placeholder="KWT" className="w-16" />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted-foreground">Code</label>
        <Input name="countryCode" type="number" placeholder="965" className="w-20" />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted-foreground">Currency</label>
        <Input name="currencyCode" maxLength={3} placeholder="KWD" className="w-16" />
=======
        <Label className="text-xs font-medium text-muted-foreground">Name (English)</Label>
        <Input name="country_name_en" maxLength={100} placeholder="e.g. Kuwait" />
      </div>
      <div className="grid gap-1">
        <Label className="text-xs font-medium text-muted-foreground">Name (Arabic)</Label>
        <Input name="country_name_ar" maxLength={100} placeholder="مثال: الكويت" />
      </div>
      <div className="grid gap-1">
        <Label className="text-xs font-medium text-muted-foreground">Nationality (English)</Label>
        <Input name="country_nationality_name_en" maxLength={100} placeholder="e.g. Kuwaiti" />
      </div>
      <div className="grid gap-1">
        <Label className="text-xs font-medium text-muted-foreground">Nationality (Arabic)</Label>
        <Input name="country_nationality_name_ar" maxLength={100} placeholder="مثال: كويتي" />
      </div>
      <div className="grid gap-1">
        <Label className="text-xs font-medium text-muted-foreground">ISO</Label>
        <Input name="iso" maxLength={3} placeholder="KWT" />
      </div>
      <div className="grid gap-1">
        <Label className="text-xs font-medium text-muted-foreground">Emoji</Label>
        <Input name="emoji" maxLength={255} placeholder="🇰🇼" />
      </div>
      <div className="grid gap-1">
        <Label className="text-xs font-medium text-muted-foreground">Phone Code</Label>
        <Input name="country_code" type="number" placeholder="965" />
      </div>
      <div className="grid gap-1">
        <Label className="text-xs font-medium text-muted-foreground">Currency</Label>
        <Input name="currency_code" maxLength={3} placeholder="KWD" />
>>>>>>> origin/main
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-medium text-muted-foreground">Emoji</label>
        <Input name="emoji" maxLength={255} placeholder="🇰🇼" className="w-16" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add"}
      </Button>
      {state?.error ? (
        <p className="text-xs w-full text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}

function EditCountryForm({
  row, onDone, onCancel,
}: {
  row: CountryItem;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const nameEn = formData.get("countryNameEn") as string;
      const nationalityEn = formData.get("nationalityNameEn") as string;
      const nameAr = formData.get("countryNameAr") as string;
      const nationalityAr = formData.get("nationalityNameAr") as string;
      const iso = formData.get("iso") as string;
      const emoji = formData.get("emoji") as string;
      const countryCode = formData.get("countryCode") as string;
      const currencyCode = formData.get("currencyCode") as string;

      const result = await updateCountry(
        row.country_id, nameEn, nationalityEn,
        nameAr || undefined, nationalityAr || undefined,
        iso || undefined, emoji || undefined,
        countryCode ? Number(countryCode) : undefined,
        currencyCode || undefined,
      );
      if (result.operation === "success") {
        onDone();
        return { error: undefined };
      }
      return { error: result.message };
    },
    null,
  );

  return (
    <form action={action} className="flex items-center gap-2 flex-wrap">
      <Input name="countryNameEn" defaultValue={row.country_name_en} required maxLength={100} className="w-32" />
      <Input name="countryNameAr" defaultValue={row.country_name_ar ?? ""} maxLength={100} className="w-32" />
      <Input name="nationalityNameEn" defaultValue={row.country_nationality_name_en} required maxLength={100} className="w-32" />
      <Input name="iso" defaultValue={row.iso ?? ""} maxLength={3} className="w-14" />
      <Input name="emoji" defaultValue={row.emoji ?? ""} maxLength={255} className="w-14" />
      <Input name="countryCode" type="number" defaultValue={row.country_code ?? ""} className="w-16" />
      <Input name="currencyCode" defaultValue={row.currency_code ?? ""} maxLength={3} className="w-14" />
      <Button type="submit" disabled={pending} size="sm">
        {pending ? "..." : "Save"}
      </Button>
      <Button type="button" onClick={onCancel} variant="ghost" size="sm">
        Cancel
      </Button>
      {state?.error ? (
        <p className="text-xs w-full text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
