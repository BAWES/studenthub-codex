import { requireRoleCapability } from "@/modules/auth/session";
import { listEvaluations } from "./actions";
import { AdminEvaluationsTable } from "./_components";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ page?: string; search?: string }>;
};

export default async function AdminEvaluationsPage({ searchParams }: Props) {
  const session = await requireRoleCapability("admin", "admin.read");
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";

  const result = await listEvaluations({
    page,
    limit: 20,
    search: search || undefined,
  });

  return (
    <AdminEvaluationsTable
      session={session}
      initialEvaluations={result.items}
      initialTotal={result.total}
      initialPage={result.page}
      initialTotalPages={result.totalPages}
      initialSearch={search}
    />
  );
}
