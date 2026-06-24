import { requireRoleCapability } from "@/modules/auth/session";
import { getInspectorIdRequestRows } from "@/modules/workspace/data";
import { InspectorIdRequestsTable } from "./inspector-id-requests-table";

export const dynamic = "force-dynamic";

export default async function InspectorIdRequestsPage() {
  const session = await requireRoleCapability("inspector", "id_review.read");
  const rows = await getInspectorIdRequestRows();

  return <InspectorIdRequestsTable session={session} rows={rows} />;
}
