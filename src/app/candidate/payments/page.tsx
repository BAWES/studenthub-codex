import { requireRoleCapability } from "@/modules/auth/session";
import { listCandidatePayments } from "./actions";
import { CandidatePaymentsTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function CandidatePaymentsPage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const { items: rows } = await listCandidatePayments();

  return <CandidatePaymentsTable session={session} rows={rows} />;
}
