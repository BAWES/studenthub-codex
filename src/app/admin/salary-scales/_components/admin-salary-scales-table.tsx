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
import {
  createSalaryScale,
  updateSalaryScale,
  deleteSalaryScale,
} from "@/modules/admin/salary-scales/actions";

function formatSalary(val: number | null | undefined): string {
  if (val == null) return "—";
  return val.toLocaleString("en-KW", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
}

type Props = {
  session: SessionUser;
  items: SalaryScaleItem[];
};

export function AdminSalaryScalesTable({ session, items }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage salary scales — configure pay bands used across the system."
      metrics={[
        {
          label: "Total scales",
          value: items.length,
          note: "Salary scales in the system",
        },
      ]}
    >
      <Card className="mb-6">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">
            Add salary scale
          </h3>
          <CreateSalaryScaleForm onSuccess={() => router.refresh()} />
        </CardContent>
      </Card>

      <DataTable
        title="Salary scales"
        description="All salary scales. Click a name to edit in-line or delete."
        rows={items.map((d) => ({ ...d, id: d.salary_scale_uuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "name_en",
            label: "Name (English)",
            render: (row) =>
              editingId === row.salary_scale_uuid ? (
                <EditSalaryScaleForm
                  row={row as unknown as SalaryScaleItem}
                  onDone={() => {
                    setEditingId(null);
                    router.refresh();
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <button
                  type="button"
                  className="text-sm hover:underline text-primary"
                  onClick={() => setEditingId(row.salary_scale_uuid)}
                >
                  {row.salary_scale_name_en}
                </button>
              ),
          },
          {
            key: "name_ar",
            label: "Name (Arabic)",
            render: (row) =>
              row.salary_scale_name_ar ? (
                <span className="text-sm" dir="rtl">
                  {row.salary_scale_name_ar}
                </span>
              ) : (
                "—"
              ),
          },
          {
            key: "min_salary",
            label: "Min salary",
            render: (row) => formatSalary(row.salary_scale_min_salary),
          },
          {
            key: "mid_salary",
            label: "Mid salary",
            render: (row) => formatSalary(row.salary_scale_mid_salary),
          },
          {
            key: "max_salary",
            label: "Max salary",
            render: (row) => formatSalary(row.salary_scale_max_salary),
          },
          {
            key: "currency",
            label: "Currency",
            render: (row) => row.salary_scale_currency || "—",
          },
          {
            key: "sort_order",
            label: "Sort",
            render: (row) => row.salary_scale_sort_order ?? "—",
          },
          {
            key: "actions",
            label: "Actions",
            render: (row) =>
              editingId !== row.salary_scale_uuid ? (
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded hover:bg-red-500/10 text-destructive"
                  onClick={async () => {
                    if (
                      confirm(
                        `Delete salary scale "${row.salary_scale_name_en}"?`,
                      )
                    ) {
                      await deleteSalaryScale(row.salary_scale_uuid);
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
      const nameEn = formData.get("nameEn") as string;
      const nameAr = formData.get("nameAr") as string;
      const minSalary = formData.get("minSalary") as string;
      const midSalary = formData.get("midSalary") as string;
      const maxSalary = formData.get("maxSalary") as string;
      const currency = formData.get("currency") as string;
      const sortOrder = formData.get("sortOrder") as string;
      try {
        await createSalaryScale({
          salary_scale_name_en: nameEn,
          salary_scale_name_ar: nameAr || undefined,
          salary_scale_min_salary: minSalary ? Number(minSalary) : undefined,
          salary_scale_mid_salary: midSalary ? Number(midSalary) : undefined,
          salary_scale_max_salary: maxSalary ? Number(maxSalary) : undefined,
          salary_scale_currency: currency || undefined,
          salary_scale_sort_order: sortOrder ? Number(sortOrder) : undefined,
        });
        onSuccess();
        return { error: undefined };
      } catch (e: unknown) {
        return {
          error: e instanceof Error ? e.message : "Failed to create salary scale",
        };
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
      onSubmit={() =>
        setTimeout(() => {
          formRef.current?.reset();
        }, 100)
      }
    >
      <div className="grid gap-1.5">
        <Label htmlFor="nameEn">Name (EN) *</Label>
        <Input
          id="nameEn"
          name="nameEn"
          required
          maxLength={255}
          placeholder="e.g. Grade 1, Executive"
          className="w-36"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="nameAr">Name (AR)</Label>
        <Input
          id="nameAr"
          name="nameAr"
          maxLength={255}
          placeholder="الاسم بالعربية"
          className="w-36"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="minSalary">Min</Label>
        <Input
          id="minSalary"
          name="minSalary"
          type="number"
          step="0.001"
          placeholder="0"
          className="w-20"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="midSalary">Mid</Label>
        <Input
          id="midSalary"
          name="midSalary"
          type="number"
          step="0.001"
          placeholder="0"
          className="w-20"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="maxSalary">Max</Label>
        <Input
          id="maxSalary"
          name="maxSalary"
          type="number"
          step="0.001"
          placeholder="0"
          className="w-20"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="currency">Ccy</Label>
        <Input
          id="currency"
          name="currency"
          maxLength={3}
          placeholder="KWD"
          className="w-16"
          defaultValue="KWD"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="sortOrder">Sort</Label>
        <Input
          id="sortOrder"
          name="sortOrder"
          type="number"
          placeholder="0"
          className="w-16"
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
      const minSalary = formData.get("minSalary") as string;
      const midSalary = formData.get("midSalary") as string;
      const maxSalary = formData.get("maxSalary") as string;
      const currency = formData.get("currency") as string;
      const sortOrder = formData.get("sortOrder") as string;
      try {
        await updateSalaryScale(row.salary_scale_uuid, {
          salary_scale_name_en: nameEn,
          salary_scale_name_ar: nameAr || undefined,
          salary_scale_min_salary: minSalary ? Number(minSalary) : null,
          salary_scale_mid_salary: midSalary ? Number(midSalary) : null,
          salary_scale_max_salary: maxSalary ? Number(maxSalary) : null,
          salary_scale_currency: currency || null,
          salary_scale_sort_order: sortOrder ? Number(sortOrder) : null,
        });
        onDone();
        return { error: undefined };
      } catch (e: unknown) {
        return {
          error: e instanceof Error ? e.message : "Failed to update salary scale",
        };
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
        className="w-24 h-8"
      />
      <Input
        name="nameAr"
        defaultValue={row.salary_scale_name_ar ?? ""}
        maxLength={255}
        placeholder="Name (AR)"
        className="w-20 h-8"
      />
      <Input
        name="minSalary"
        defaultValue={row.salary_scale_min_salary ?? ""}
        type="number"
        step="0.001"
        className="w-16 h-8"
      />
      <Input
        name="midSalary"
        defaultValue={row.salary_scale_mid_salary ?? ""}
        type="number"
        step="0.001"
        className="w-16 h-8"
      />
      <Input
        name="maxSalary"
        defaultValue={row.salary_scale_max_salary ?? ""}
        type="number"
        step="0.001"
        className="w-16 h-8"
      />
      <Input
        name="currency"
        defaultValue={row.salary_scale_currency ?? "KWD"}
        maxLength={3}
        className="w-12 h-8"
      />
      <Input
        name="sortOrder"
        defaultValue={row.salary_scale_sort_order ?? ""}
        type="number"
        className="w-12 h-8"
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
