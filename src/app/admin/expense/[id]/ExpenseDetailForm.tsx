"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { updateExpense, deleteExpense } from "../actions";

interface ExpenseDetail {
  expense_uuid: string;
  title: string;
  type: string;
  detail: string | null;
  amount: number | null;
  transaction_datetime: Date | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export function ExpenseDetailForm({
  expense,
}: {
  expense: ExpenseDetail;
}) {
  const [title, setTitle] = useState(expense.title);
  const [type, setType] = useState(expense.type);
  const [detail, setDetail] = useState(expense.detail ?? "");
  const [amount, setAmount] = useState(expense.amount != null ? String(expense.amount) : "");
  const [transactionDate, setTransactionDate] = useState(
    expense.transaction_datetime
      ? new Date(expense.transaction_datetime).toISOString().slice(0, 16)
      : ""
  );

  const updateAction = async (_prevState: unknown, formData: FormData) => {
    formData.set("title", title);
    formData.set("type", type);
    formData.set("detail", detail);
    formData.set("amount", amount);
    formData.set("transaction_datetime", transactionDate);

    await updateExpense(expense.expense_uuid, {
      title,
      type,
      detail: detail || undefined,
      amount: amount ? Number(amount) : null,
      transaction_datetime: transactionDate || null,
    });
    return { success: true };
  };

  const [state, formAction, pending] = useActionState(updateAction, null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Expense</CardTitle>
          <CardDescription>
            Update the expense title, type, amount, and transaction details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  name="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (KWD)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transaction_datetime">Transaction Date</Label>
                <Input
                  id="transaction_datetime"
                  name="transaction_datetime"
                  type="datetime-local"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="detail">Detail</Label>
              <Input
                id="detail"
                name="detail"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="Optional description"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save Changes"}
              </Button>
              {state?.success && (
                <span className="text-sm text-[var(--sh-success)] font-medium">
                  Saved successfully
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-[var(--sh-error)]/20">
        <CardHeader>
          <CardTitle className="text-[var(--sh-error)]">Danger Zone</CardTitle>
          <CardDescription>
            Deleting this expense record cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              await deleteExpense(expense.expense_uuid);
            }}
          >
            <Button type="submit" variant="destructive">
              Delete Expense
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
