import { requireRoleCapability } from "@/modules/auth/session";
import { listCountries } from "./actions";
import { AdminCountryTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminCountryPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const result = await listCountries({ limit: 100 });

  return (
    <AdminCountryTable session={session} countries={result.countries} />
  );
}
