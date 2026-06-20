import { requireRoleCapability } from "@/modules/auth/session";
import { getAllAgentsHealth } from "./actions";
import { AdminAgentsTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminAgentsPage() {
  const session = await requireRoleCapability("admin", "admin.system");

  let agents: Awaited<ReturnType<typeof getAllAgentsHealth>>["agents"] = [];
  let error: string | null = null;

  try {
    const data = await getAllAgentsHealth();
    agents = data.agents;
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error loading agent data";
  }

  return (
    <AdminAgentsTable
      session={session}
      agents={agents}
      loading={false}
      error={error}
    />
  );
}
