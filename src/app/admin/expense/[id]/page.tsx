import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { formatDate } from "@/modules/workspace/format";
import { getExpenseDetail } from "../actions";
import { ExpenseDetailForm } from "./ExpenseDetailForm";

export const dynamic = "force-dynamic";

export default async function AdminExpenseDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { id } = await params;

  const expense = await getExpenseDetail(id);
  if (!expense) {
    notFound();
  }

  const formattedExpense = {
    ...expense,
    amount: expense.amount != null ? Number(expense.amount) : null,
  };

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Expense"
      title={formattedExpense.title}
      metrics={[
        { label: "Created", value: formatDate(formattedExpense.created_at), note: "Record created" },
        { label: "Updated", value: formatDate(formattedExpense.updated_at), note: "Last modified" }
      ]}
    >
      <ExpenseDetailForm expense={formattedExpense} />
    </WorkspaceShell>
  );
}
