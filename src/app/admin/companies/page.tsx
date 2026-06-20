import { requireRoleCapability } from "@/modules/auth/session";
import { listAdminCompaniesTypesense } from "@/modules/admin/companies/search-typesense";
import { AdminCompaniesTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminCompaniesPage() {
  const session = await requireRoleCapability("admin", "company.read.any");
  const { items: rows } = await listAdminCompaniesTypesense({ limit: 60 });

  return <AdminCompaniesTable session={session} rows={rows} />;
}
