import { requireRoleCapability } from "@/modules/auth/session";
import { listCompanyAccountRows } from "./actions";
import { CompanyCompaniesTable } from "./company-companies-table";

export const dynamic = "force-dynamic";

export default async function CompanyCompaniesPage() {
  const session = await requireRoleCapability("company", "company.read.linked");
  const rows = await listCompanyAccountRows(session.id);

  return <CompanyCompaniesTable session={session} rows={rows} />;
}
