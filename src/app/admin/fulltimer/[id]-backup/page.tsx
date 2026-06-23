import { notFound } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { getFulltimer } from "../actions";
import { FulltimerDetailView } from "./FulltimerDetailView";

export const dynamic = "force-dynamic";

export default async function AdminFulltimerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.system");
  const { id } = await params;
  const fulltimer = await getFulltimer(id);

  if (!fulltimer) {
    notFound();
  }

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Admin settings"
      title="Fulltimer details"
      metrics={[]}
    >
      <FulltimerDetailView fulltimer={fulltimer} />
    </WorkspaceShell>
  );
}
