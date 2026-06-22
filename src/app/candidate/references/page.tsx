import { requireRoleCapability } from "@/modules/auth/session";
import { formatDate } from "@/modules/workspace/format";
import { listCandidateReferences } from "./actions";
import { CandidateReferencesTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function CandidateReferencesPage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const result = await listCandidateReferences({});

  const rows = result.items.map((r) => ({
    id: r.reference_uuid,
    name: r.name,
    company: r.company ?? "—",
    position: r.position ?? "—",
    created_at: r.created_at ? formatDate(r.created_at) : "N/A",
  }));

  return <CandidateReferencesTable session={session} rows={rows} />;
}
