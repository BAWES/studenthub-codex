"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { updateSalary, deleteSalary } from "@/modules/admin/salary/actions";
import type { SalaryItem, SalaryActionResponse } from "@/modules/admin/salary/schemas";

type SalaryDetail = SalaryItem & {
  staff_email?: string;
};

export function SalaryDetailForm({
  salary,
}: {
  salary: SalaryDetail;
}) {
  const router = useRouter();
  const [salaryValue, setSalaryValue] = useState(String(salary.salary ?? "0"));
  const [currency, setCurrency] = useState(salary.salary_currency ?? "KWD");
  const [comment, setComment] = useState(salary.comment ?? "");
  const dateStr =
    typeof salary.salary_date === "string"
      ? salary.salary_date
      : salary.salary_date instanceof Date
        ? salary.salary_date.toISOString().split("T")[0]
        : "";
  const [salaryDate, setSalaryDate] = useState(dateStr);

  const updateAction = async (_prevState: unknown, formData: FormData) => {
    formData.set("salaryUuid", salary.staff_salary_uuid);
    formData.set("salary", salaryValue);
    formData.set("salaryCurrency", currency);
    formData.set("salaryDate", salaryDate);
    formData.set("comment", comment);

    return await updateSalary(_prevState as Parameters<typeof updateSalary>[0], formData);
  };

  const [state, formAction, pending] = useActionState(updateAction, null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Salary Record</CardTitle>
          <CardDescription>
            Update the salary amount, currency, comment, or date.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            {salary.staff_email && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <span className="font-medium">Staff:</span> {salary.staff_name}{" "}
                <span className="text-muted-foreground">
                  ({salary.staff_email})
                </span>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="salary">Salary Amount</Label>
                <Input
                  id="salary"
                  name="salary"
                  type="number"
                  step="0.001"
                  value={salaryValue}
                  onChange={(e) => setSalaryValue(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary_currency">Currency</Label>
                <Input
                  id="salary_currency"
                  name="salary_currency"
                  maxLength={3}
                  placeholder="KWD"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="salary_date">Salary Date</Label>
                <Input
                  id="salary_date"
                  name="salary_date"
                  type="date"
                  value={salaryDate}
                  onChange={(e) => setSalaryDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comment</Label>
              <Input
                id="comment"
                name="comment"
                maxLength={255}
                placeholder="Optional notes about this salary record"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save Changes"}
              </Button>
              {(state as SalaryActionResponse | null)?.operation === "success" && (
                <span className="text-sm text-green-700 font-medium">
                  Saved successfully
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Deleting this salary record is permanent and cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              await deleteSalary(salary.staff_salary_uuid);
              router.push("/admin/salary");
            }}
          >
            <Button type="submit" variant="destructive">
              Delete Salary Record
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
