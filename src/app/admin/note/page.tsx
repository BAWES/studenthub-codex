import { requireRoleCapability } from "@/modules/auth/session";
import { listNotes } from "./actions";
import { AdminNotesPage } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminNotesListPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const result = await listNotes({ limit: 100 });

  return (
    <AdminNotesPage session={session} notes={result.notes} total={result.total} />
  );
}
