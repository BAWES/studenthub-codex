import { requireRoleCapability } from "@/modules/auth/session";
import { listStories } from "./actions";
import { AdminStoriesTable } from "./admin-stories-table";

export const dynamic = "force-dynamic";

export default async function AdminStoryPage() {
  const session = await requireRoleCapability("admin", "admin.system");
  const result = await listStories({ limit: 100 });

  return <AdminStoriesTable session={session} records={result.records} />;
}
