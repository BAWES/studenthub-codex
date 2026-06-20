import { requireRoleCapability } from "@/modules/auth/session";
import { listIdRequests } from "./actions";
import { InspectorIdRequestsTable } from "./inspector-id-requests-table";

export const dynamic = "force-dynamic";

export default async function InspectorIdRequestsPage() {
  const session = await requireRoleCapability("inspector", "id_review.read");
  const { items: rows } = await listIdRequests({});

  return <InspectorIdRequestsTable session={session} rows={rows} />;
}
