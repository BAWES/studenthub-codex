import { requireRoleCapability } from "@/modules/auth/session";
import { listCompanyContactsRows } from "./actions";
import { listCompanySelectOptions } from "@/app/company/stores/actions";
import { CompanyContactsTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function CompanyContactsPage() {
  const session = await requireRoleCapability("company", "company.read.linked");
  const [rows, companies] = await Promise.all([
    listCompanyContactsRows(session.id),
    listCompanySelectOptions(session.id)
  ]);

  return <CompanyContactsTable session={session} rows={rows} companies={companies} />;
}
