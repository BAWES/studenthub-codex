import { requireRoleCapability } from "@/modules/auth/session";
import { listStories } from "./actions";
import { AdminStoryTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminStoriesPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const result = await listStories({ limit: 100 });

  return <AdminStoryTable session={session} stories={result.stories} />;
}
