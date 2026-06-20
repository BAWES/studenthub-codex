import { requireRoleCapability } from "@/modules/auth/session";
import { listSettings } from "./actions";
import { AdminSettingsTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminSettingPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const result = await listSettings({ limit: 100 });

  return (
    <AdminSettingsTable session={session} settings={result.settings} />
  );
}
