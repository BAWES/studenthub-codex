import { requireRoleCapability } from "@/modules/auth/session";
import { getCandidateNotificationRows } from "./actions";
import { CandidateNotificationsTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function CandidateNotificationsPage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const rows = await getCandidateNotificationRows(Number(session.id));

  return <CandidateNotificationsTable session={session} rows={rows} />;
}
