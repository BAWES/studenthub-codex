import { requireRoleCapability } from "@/modules/auth/session";
import { AdminDocumentsPanel } from "./_components/admin-documents-panel";

export const dynamic = "force-dynamic";

export default async function AdminDocumentsPage() {
  await requireRoleCapability("admin", "document.export");

  return <AdminDocumentsPanel />;
}
