"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { updateSalary, deleteSalary } from "@/modules/admin/salary/actions";
import type { SalaryItem } from "@/modules/admin/salary/schemas";
import { formatDate } from "@/modules/workspace/format";

export function SalaryDetailForm({
  salary,
}: {
  salary: SalaryItem;
}) {
  const router = useRouter();

  const [state, formAction, pending] = useActionState(updateSalary, null);

  const handleDelete = async () => {
    const result = await deleteSalary(salary.staff_salary_uuid);
    if (result.operation === "success") {
      router.push("/admin/salary");
    }
  };

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
            <input type="hidden" name="salaryUuid" value={salary.staff_salary_uuid} />

            {salary.staff_name && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <span className="font-medium">Staff:</span> {salary.staff_name}
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
                  defaultValue={salary.salary ?? 0}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaryCurrency">Currency</Label>
                <Input
                  id="salaryCurrency"
                  name="salaryCurrency"
                  maxLength={3}
                  placeholder="KWD"
                  defaultValue={salary.salary_currency ?? "KWD"}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="salaryDate">Salary Date</Label>
                <Input
                  id="salaryDate"
                  name="salaryDate"
                  type="date"
                  defaultValue={
                    salary.salary_date
                      ? formatDate(new Date(salary.salary_date))
                      : ""
                  }
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
                defaultValue={salary.comment ?? ""}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save Changes"}
              </Button>
              {state?.operation === "success" && (
                <span className="text-sm text-green-700 font-medium">
                  Saved successfully
                </span>
              )}
              {state?.operation === "error" && (
                <span className="text-sm text-destructive font-medium">
                  {state.message}
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
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Delete Salary Record
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
