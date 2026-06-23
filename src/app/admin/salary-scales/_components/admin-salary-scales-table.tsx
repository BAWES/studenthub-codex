"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

import type { SessionUser } from "@/modules/auth/types";
import type { SalaryScaleItem } from "@/modules/admin/salary-scales/schemas";
import { createSalaryScale, updateSalaryScale, deleteSalaryScale } from "@/modules/admin/salary-scales/actions";

type Props = {
  session: SessionUser;
  records: SalaryScaleItem[];
};

function formatAmount(val: number | null): string {
  if (val === null || val === undefined) return "—";
  return Number(val).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
}

export function AdminSalaryScalesTable({ session, records }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Salary Scales — manage salary ranges."
      metrics={[
        { label: "Salary Scales", value: records.length, note: "Active salary scales" },
      ]}
    >
      <Card className="mb-6">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Add salary scale</h3>
          <CreateSalaryScaleForm onSuccess={() => router.refresh()} />
        </CardContent>
      </Card>

      <DataTable
        title="Salary Scales"
        description="All salary scales. Click a name to edit in-line."
        rows={records.map((r) => ({ ...r, id: String(r.salary_scale_id) }))}
        columns={[
          {
            key: "salary_scale_name_en",
            label: "Name (English)",
            render: (row) =>
              editingId === row.salary_scale_id ? (
                <EditSalaryScaleForm
                  row={row as unknown as SalaryScaleItem}
                  onDone={() => { setEditingId(null); router.refresh(); }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <button
                  type="button"
                  className="text-sm hover:underline text-primary"
                  onClick={() => setEditingId(row.salary_scale_id)}
                >
                  {row.salary_scale_name_en}
                </button>
              ),
          },
          {
            key: "salary_scale_name_ar",
            label: "Name (Arabic)",
            render: (row) => (
              <span className="text-sm text-muted-foreground" dir="rtl">
                {row.salary_scale_name_ar ?? "—"}
              </span>
            ),
          },
          {
            key: "salary_scale_min_amount",
            label: "Min (KWD)",
            render: (row) => (
              <span className="text-sm text-muted-foreground">
                {formatAmount(row.salary_scale_min_amount)}
              </span>
            ),
          },
          {
            key: "salary_scale_max_amount",
            label: "Max (KWD)",
            render: (row) => (
              <span className="text-sm text-muted-foreground">
                {formatAmount(row.salary_scale_max_amount)}
              </span>
            ),
          },
          {
            key: "candidate_count",
            label: "Candidates",
            render: (row) => (
              <span className="text-sm text-muted-foreground">
                {row.candidate_count ?? 0}
              </span>
            ),
          },
          {
            key: "actions",
            label: "Delete",
            render: (row) =>
              editingId !== row.salary_scale_id ? (
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded hover:bg-red-500/10 text-destructive"
                  onClick={async () => {
                    if (confirm(`Delete salary scale "${row.salary_scale_name_en}"?`)) {
                      await deleteSalaryScale(row.salary_scale_id);
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

function CreateSalaryScaleForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const nameEn = formData.get("salary_scale_name_en") as string;
      const nameAr = formData.get("salary_scale_name_ar") as string;
      const minAmt = formData.get("salary_scale_min_amount") as string;
      const maxAmt = formData.get("salary_scale_max_amount") as string;

      try {
        await createSalaryScale({
          salary_scale_name_en: nameEn || "",
          salary_scale_name_ar: nameAr || "",
          salary_scale_min_amount: minAmt ? Number(minAmt) : undefined,
          salary_scale_max_amount: maxAmt ? Number(maxAmt) : undefined,
        });
        onSuccess();
        return { error: undefined };
      } catch (e) {
        return { error: e instanceof Error ? e.message : "Failed to create salary scale" };
      }
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
      <div className="grid gap-1.5">
        <Label htmlFor="salary_scale_name_en">Name (English) *</Label>
        <Input
          id="salary_scale_name_en"
          name="salary_scale_name_en"
          required
          maxLength={255}
          placeholder="e.g. Entry Level"
          className="w-48"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="salary_scale_name_ar">Name (Arabic)</Label>
        <Input
          id="salary_scale_name_ar"
          name="salary_scale_name_ar"
          maxLength={255}
          placeholder="مثال: مبتدئ"
          className="w-48"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="salary_scale_min_amount">Min (KWD)</Label>
        <Input
          id="salary_scale_min_amount"
          name="salary_scale_min_amount"
          type="number"
          step="0.001"
          placeholder="0"
          className="w-24"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="salary_scale_max_amount">Max (KWD)</Label>
        <Input
          id="salary_scale_max_amount"
          name="salary_scale_max_amount"
          type="number"
          step="0.001"
          placeholder="0"
          className="w-24"
        />
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

function EditSalaryScaleForm({
  row,
  onDone,
  onCancel,
}: {
  row: SalaryScaleItem;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const nameEn = formData.get("nameEn") as string;
      const nameAr = formData.get("nameAr") as string;
      const minAmt = formData.get("minAmt") as string;
      const maxAmt = formData.get("maxAmt") as string;
      try {
        await updateSalaryScale({
          salary_scale_id: row.salary_scale_id,
          salary_scale_name_en: nameEn,
          salary_scale_name_ar: nameAr || null,
          salary_scale_min_amount: minAmt ? Number(minAmt) : null,
          salary_scale_max_amount: maxAmt ? Number(maxAmt) : null,
        });
        onDone();
        return { error: undefined };
      } catch (e: unknown) {
        return { error: e instanceof Error ? e.message : "Failed to update salary scale" };
      }
    },
    null,
  );

  return (
    <form action={action} className="flex items-center gap-2 flex-wrap">
      <Input
        name="nameEn"
        defaultValue={row.salary_scale_name_en}
        required
        maxLength={255}
        className="w-28 h-8"
      />
      <Input
        name="nameAr"
        defaultValue={row.salary_scale_name_ar ?? ""}
        maxLength={255}
        placeholder="Name (AR)"
        className="w-24 h-8"
      />
      <Input
        name="minAmt"
        defaultValue={row.salary_scale_min_amount != null ? String(row.salary_scale_min_amount) : ""}
        type="number"
        step="0.001"
        placeholder="Min"
        className="w-20 h-8"
      />
      <Input
        name="maxAmt"
        defaultValue={row.salary_scale_max_amount != null ? String(row.salary_scale_max_amount) : ""}
        type="number"
        step="0.001"
        placeholder="Max"
        className="w-20 h-8"
      />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "..." : "Save"}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
        Cancel
      </Button>
      {state?.error ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
