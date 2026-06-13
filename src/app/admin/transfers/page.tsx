import type { Route } from "next";
import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { requireRoleCapability } from "@/modules/auth/session";
import { listTransfers } from "./actions";
import { AdminTransfersTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminTransfersPage() {
  const session = await requireRoleCapability("admin", "finance.read");
  const result = await listTransfers({});
  const rows = result.items;
  const latest = rows[0];

  return (
    <ErrorBoundary>
      <AdminTransfersTable session={session} rows={rows} latest={latest} />
    </ErrorBoundary>
  );
}
