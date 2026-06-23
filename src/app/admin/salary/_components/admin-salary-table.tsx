"use client";

import { useActionState, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { SessionUser } from "@/modules/auth/types";
import type { SalaryItem } from "@/modules/admin/salary/schemas";
import {
  createSalary,
  updateSalary,
  deleteSalary,
  listStaff,
} from "@/modules/admin/salary/actions";

type StaffOption = { staff_id: number; staff_name: string };

type Props = {
  session: SessionUser;
  salaries: SalaryItem[];
};

function staffName(
  salary: SalaryItem,
  staffList: StaffOption[],
): string {
  if (!salary.staff_id) return "—";
  return staffList.find((s) => s.staff_id === salary.staff_id)
    ?.staff_name ?? "—";
}

export function AdminSalaryTable({ session, salaries }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [staffList, setStaffList] = useState<StaffOption[]>([]);
  const [staffLoaded, setStaffLoaded] = useState(false);

  // Lazy-load staff list for inline edit form
  if (!staffLoaded && salaries.length > 0) {
    listStaff()
      .then((s) => {
        setStaffList(s);
        setStaffLoaded(true);
      })
      .catch(() => {
        setStaffList([]);
        setStaffLoaded(true);
      });
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Manage salary records — track staff salary payments across the system."
      metrics={[
        {
          label: "Total records",
          value: salaries.length,
          note: "Salary records in the system",
        },
      ]}
    >
      <Card className="mb-6">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">
            Add salary record
          </h3>
          <CreateSalaryForm
            staffList={staffList}
            onSuccess={() => router.refresh()}
          />
        </CardContent>
      </Card>

      <DataTable
        title="Salary Records"
        description="All salary records. Click a row to edit or delete."
        rows={salaries.map((s) => ({ ...s, id: s.staff_salary_uuid }))}
        rowHref={undefined}
        columns={[
          {
            key: "staff",
            label: "Staff",
            render: (row) =>
              editingId === row.staff_salary_uuid ? (
                <EditSalaryForm
                  row={row as unknown as SalaryItem}
                  staffList={staffList}
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
                  onClick={() => setEditingId(row.staff_salary_uuid)}
                >
                  {row.staff_name || "—"}
                </button>
              ),
          },
          {
            key: "salary",
            label: "Amount",
            render: (row) =>
              editingId === row.staff_salary_uuid
                ? null
                : row.salary != null
                  ? `${row.salary.toFixed(3)} ${row.salary_currency ?? "KWD"}`
                  : "—",
          },
          {
            key: "salary_date",
            label: "Date",
            render: (row) => {
              if (!row.salary_date) return "—";
              const d =
                typeof row.salary_date === "string"
                  ? row.salary_date
                  : row.salary_date instanceof Date
                    ? row.salary_date.toISOString().split("T")[0]
                    : "—";
              return d;
            },
          },
          {
            key: "comment",
            label: "Comment",
            render: (row) =>
              editingId === row.staff_salary_uuid
                ? null
                : row.comment || "—",
          },
          {
            key: "actions",
            label: "Actions",
            render: (row) =>
              editingId !== row.staff_salary_uuid ? (
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded hover:bg-red-500/10 text-destructive"
                  onClick={async () => {
                    if (
                      confirm(
                        `Delete salary record for "${row.staff_name || "Unknown staff"}"?`,
                      )
                    ) {
                      await deleteSalary(row.staff_salary_uuid);
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

function CreateSalaryForm({
  staffList,
  onSuccess,
}: {
  staffList: StaffOption[];
  onSuccess: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      try {
        const result = await createSalary(null, formData);
        if (result.operation === "error") {
          return { error: result.message };
        }
        onSuccess();
        return { error: undefined };
      } catch (e: unknown) {
        return {
          error: e instanceof Error ? e.message : "Failed to create salary record",
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
        <Label htmlFor="staffId">Staff *</Label>
        {staffList.length > 0 ? (
          <Select name="staffId" required>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Select staff..." />
            </SelectTrigger>
            <SelectContent>
              {staffList.map((s) => (
                <SelectItem key={s.staff_id} value={String(s.staff_id)}>
                  {s.staff_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id="staffId"
            name="staffId"
            type="number"
            required
            placeholder="Staff ID"
            className="w-44"
          />
        )}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="salary">Amount *</Label>
        <Input
          id="salary"
          name="salary"
          type="number"
          step="0.001"
          required
          placeholder="0.000"
          className="w-28"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="salaryCurrency">Currency</Label>
        <Input
          id="salaryCurrency"
          name="salaryCurrency"
          maxLength={3}
          placeholder="KWD"
          className="w-16"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="salaryDate">Date *</Label>
        <Input
          id="salaryDate"
          name="salaryDate"
          type="date"
          required
          className="w-36"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="comment">Comment</Label>
        <Input
          id="comment"
          name="comment"
          maxLength={255}
          placeholder="Note"
          className="w-36"
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

function EditSalaryForm({
  row,
  staffList,
  onDone,
  onCancel,
}: {
  row: SalaryItem;
  staffList: StaffOption[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      formData.set("salaryUuid", row.staff_salary_uuid);
      try {
        const result = await updateSalary(null, formData);
        if (result.operation === "error") {
          return { error: result.message };
        }
        onDone();
        return { error: undefined };
      } catch (e: unknown) {
        return {
          error: e instanceof Error ? e.message : "Failed to update salary record",
        };
      }
    },
    null,
  );

  const defaultDate =
    row.salary_date instanceof Date
      ? row.salary_date.toISOString().split("T")[0]
      : typeof row.salary_date === "string"
        ? row.salary_date
        : "";

  return (
    <form action={action} className="flex items-center gap-2 flex-wrap">
      {staffList.length > 0 ? (
        <Select
          name="staffId"
          defaultValue={row.staff_id != null ? String(row.staff_id) : ""}
        >
          <SelectTrigger className="w-28 h-8">
            <SelectValue placeholder="Staff" />
          </SelectTrigger>
          <SelectContent>
            {staffList.map((s) => (
              <SelectItem key={s.staff_id} value={String(s.staff_id)}>
                {s.staff_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          name="staffId"
          defaultValue={row.staff_id ?? ""}
          type="number"
          className="w-16 h-8"
        />
      )}
      <Input
        name="salary"
        defaultValue={row.salary ?? ""}
        type="number"
        step="0.001"
        className="w-20 h-8"
      />
      <Input
        name="salaryCurrency"
        defaultValue={row.salary_currency ?? "KWD"}
        maxLength={3}
        className="w-12 h-8"
      />
      <Input
        name="salaryDate"
        defaultValue={defaultDate}
        type="date"
        className="w-32 h-8"
      />
      <Input
        name="comment"
        defaultValue={row.comment ?? ""}
        maxLength={255}
        placeholder="Comment"
        className="w-28 h-8"
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
