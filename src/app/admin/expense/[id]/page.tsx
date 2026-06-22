import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound, redirect } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { getExpense, deleteExpense } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function AdminExpenseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { id } = await params;

  const expense = await getExpense({ id });

  if (!expense) {
    notFound();
  }

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Expenses"
        title={`Expense ${expense.expense_uuid.slice(0, 8)}...`}
        metrics={[]}
      >
        <DetailSection
          title="Expense Details"
          facts={[
            { label: "UUID", value: expense.expense_uuid },
            { label: "Title", value: expense.title },
            { label: "Type", value: expense.type || "—" },
            {
              label: "Amount",
              value: expense.amount != null ? parseFloat(expense.amount).toFixed(3) : "—",
            },
            { label: "Detail", value: expense.detail || "—" },
            {
              label: "Transaction Date",
              value: expense.transaction_datetime
                ? formatDate(new Date(expense.transaction_datetime))
                : "—",
            },
            {
              label: "Created by",
              value: expense.created_by?.toString() ?? "—",
            },
            {
              label: "Created",
              value: expense.created_at
                ? formatDate(new Date(expense.created_at))
                : "—",
            },
            {
              label: "Updated",
              value: expense.updated_at
                ? formatDate(new Date(expense.updated_at))
                : "—",
            },
          ]}
        />

        {/* Actions */}
        <div className="mt-6 flex items-center gap-3">
          <form
            action={async () => {
              "use server";
              await requireRoleCapability("admin", "admin.write");
              await deleteExpense({ id: expense.expense_uuid });
              redirect("/admin/expense");
            }}
          >
            <Button type="submit" variant="destructive">
              Delete expense
            </Button>
          </form>
        </div>
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
