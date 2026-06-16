import { requireRoleCapability } from "@/modules/auth/session";
import { listNotes } from "./actions";
import { AdminNotesTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminNotesPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const result = await listNotes({ limit: 100 });

  return (
    <AdminNotesTable session={session} notes={result.notes} />
  );
}
