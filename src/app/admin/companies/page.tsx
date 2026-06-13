import { requireRoleCapability } from "@/modules/auth/session";
import { listAdminCompanies } from "./actions";
import { AdminCompaniesTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminCompaniesPage() {
  const session = await requireRoleCapability("admin", "company.read.any");
  const { items: rows } = await listAdminCompanies({ limit: 60 });

  return <AdminCompaniesTable session={session} rows={rows} />;
}
