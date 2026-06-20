"use client";

import { useActionState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DataTable } from "@/modules/workspace/DataTable";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import type { SessionUser } from "@/modules/auth/types";
import type { SalaryItem } from "@/modules/admin/salary/schemas";
import { createSalary, deleteSalary } from "../actions";

export function AdminSalaryTable({
  session,
  salaries,
  total,
}: {
  session: SessionUser;
  salaries: SalaryItem[];
  total: number;
}) {
  const router = useRouter();

  const columns = [
    {
      key: "staff_name",
      label: "Staff",
      render: (row: SalaryItem) => (
        <span className="text-sm font-medium">{row.staff_name ?? "\u2014"}</span>
      ),
    },
    {
      key: "salary",
      label: "Salary",
      render: (row: SalaryItem) =>
        row.salary != null
          ? `${Number(row.salary).toLocaleString()} ${row.salary_currency ?? ""}`
          : "\u2014",
    },
    {
      key: "comment",
      label: "Comment",
      render: (row: SalaryItem) => (
        <span className="text-sm truncate block max-w-[250px]">
          {row.comment ?? "\u2014"}
        </span>
      ),
    },
    {
      key: "salary_date",
      label: "Date",
      render: (row: SalaryItem) =>
        row.salary_date
          ? new Date(row.salary_date).toLocaleDateString()
          : "\u2014",
    },
    {
      key: "actions",
      label: "",
      render: (row: SalaryItem) => (
        <form
          action={async () => {
            await deleteSalary({ salaryUuid: row.staff_salary_uuid });
            router.refresh();
          }}
        >
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive h-auto px-2 py-1 text-xs"
          >
            Delete
          </Button>
        </form>
      ),
    },
  ];

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Salaries"
      metrics={[{ label: "Total salaries", value: total, note: "All records" }]}
    >
      <Card className="mb-6">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-3 text-foreground">
            Add salary record
          </h3>
          <CreateSalaryForm onSuccess={() => router.refresh()} />
        </CardContent>
      </Card>

      <DataTable
        title="Salary Records"
        description={`${total} total salary records`}
        columns={columns}
        rows={salaries.map((s) => ({ ...s, id: s.staff_salary_uuid }))}
      />
    </WorkspaceShell>
  );
}

function CreateSalaryForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const staffId = parseInt(formData.get("staffId") as string, 10);
      const salary = parseFloat(formData.get("salary") as string);
      const salaryCurrency = formData.get("salaryCurrency") as string;
      const comment = (formData.get("comment") as string) || undefined;
      const salaryDate = formData.get("salaryDate") as string;

      if (isNaN(staffId)) {
        return { error: "Staff ID is required" };
      }
      if (isNaN(salary) || salary <= 0) {
        return { error: "Salary must be a positive number" };
      }
      if (!salaryCurrency) {
        return { error: "Currency is required" };
      }
      if (!salaryDate) {
        return { error: "Date is required" };
      }

      const result = await createSalary({
        staffId,
        salary,
        salaryCurrency,
        comment,
        salaryDate,
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
      onSubmit={() =>
        setTimeout(() => {
          formRef.current?.reset();
        }, 100)
      }
    >
      <div className="grid gap-1.5">
        <Label htmlFor="salaryStaffId">Staff ID *</Label>
        <Input
          id="salaryStaffId"
          name="staffId"
          type="number"
          required
          min={1}
          placeholder="e.g. 1"
          className="w-24"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="salaryAmount">Salary *</Label>
        <Input
          id="salaryAmount"
          name="salary"
          type="number"
          step="0.001"
          required
          min={0.001}
          placeholder="0.000"
          className="w-28"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="salaryCurrency">Currency *</Label>
        <Input
          id="salaryCurrency"
          name="salaryCurrency"
          required
          maxLength={3}
          placeholder="KWD"
          className="w-20"
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
        <Label htmlFor="salaryComment">Comment</Label>
        <Input
          id="salaryComment"
          name="comment"
          maxLength={255}
          placeholder="Optional..."
          className="w-40"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add"}
      </Button>
      {state?.error ? (
        <Alert variant="destructive" className="w-full mt-2">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
    </form>
  );
}
