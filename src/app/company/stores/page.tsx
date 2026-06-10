import { requireRoleCapability } from "@/modules/auth/session";
import { listStoresRows, listMallsAndBrands, listCompanySelectOptions } from "./actions";
import { CompanyStoresTable } from "./company-stores-table";

export const dynamic = "force-dynamic";

export default async function CompanyStoresPage() {
  const session = await requireRoleCapability("company", "company.read.linked");
  const [rows, { malls, brands }, companies] = await Promise.all([
    listStoresRows(session.id),
    listMallsAndBrands(session.id),
    listCompanySelectOptions(session.id)
  ]);

  return (
    <CompanyStoresTable session={session} rows={rows} malls={malls} brands={brands} companies={companies} />
  );
}
