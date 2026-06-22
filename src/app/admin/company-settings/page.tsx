import { requireRoleCapability } from "@/modules/auth/session";
import { listAdminCompanySettings } from "@/modules/admin/company-settings/actions";
import { AdminCompanySettingsTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminCompanySettingsPage() {
  const session = await requireRoleCapability("admin", "company.read.any");
  const { items } = await listAdminCompanySettings();

  return <AdminCompanySettingsTable session={session} items={items} />;
}
