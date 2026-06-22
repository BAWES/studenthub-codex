import { requireRoleCapability } from "@/modules/auth/session";
import { listWebhooks } from "./actions";
import { AdminWebhooksTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminWebhooksPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const result = await listWebhooks({ limit: 100 });

  return (
    <AdminWebhooksTable session={session} webhooks={result.webhooks} />
  );
}
