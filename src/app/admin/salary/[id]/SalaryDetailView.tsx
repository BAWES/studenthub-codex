"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import type { SalaryListItem } from "@/modules/salaries/schemas";

type Props = {
  record: SalaryListItem;
};

export function SalaryDetailView({ record }: Props) {
  const router = useRouter();

  const Field = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <p className="text-sm font-medium">{value ?? "—"}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{record.staff_name ?? "Salary Record"}</CardTitle>
          <CardDescription>
            Staff salary details — {record.staff_salary_uuid}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Staff Name" value={record.staff_name} />
            <Field label="Salary" value={record.salary != null ? String(record.salary) : null} />
            <Field label="Currency" value={record.salary_currency} />
            <Field label="Comment" value={record.comment} />
            <Field label="Salary Date" value={record.salary_date ? new Date(record.salary_date).toLocaleDateString() : null} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timestamps</CardTitle>
          <CardDescription>Record creation and update history.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Created" value={record.created_at ? new Date(record.created_at).toLocaleString() : null} />
            <Field label="Updated" value={record.updated_at ? new Date(record.updated_at).toLocaleString() : null} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => router.push("/admin/salary")}>
          Back to list
        </Button>
      </div>
    </div>
  );
}
