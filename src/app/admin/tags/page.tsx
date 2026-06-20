import { requireRoleCapability } from "@/modules/auth/session";
import { listTags } from "./actions";
import { AdminTagsTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminTagsPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const result = await listTags({ limit: 100 });

  return (
    <AdminTagsTable session={session} tags={result.tags} />
  );
}
