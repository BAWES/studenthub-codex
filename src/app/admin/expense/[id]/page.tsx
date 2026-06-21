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

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin / Expense"
      title={expense.title}
      metrics={[
        { label: "Amount", value: `${Number(expense.amount ?? 0).toFixed(3)} KWD`, note: "Expense amount" },
        { label: "Transaction", value: formatDate(expense.transaction_datetime), note: "Transaction date" },
        { label: "Created", value: formatDate(expense.created_at), note: "Record created" }
      ]}
    >
      <ExpenseDetailForm expense={expense} />
    </WorkspaceShell>
  );
}
