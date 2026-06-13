import { requireRoleCapability } from "@/modules/auth/session";
import { listConversations } from "./actions";
import { CandidateChatTable } from "./candidate-chat-table";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

export default async function CandidateChatPage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const result = await listConversations({ limit: 100 });

  const rows = result.conversations.map((c) => ({
    id: c.chat_uuid,
    company_id: c.company_id,
    store_id: c.store_id,
    staff_id: c.staff_id,
    created_at: c.created_at ? formatDate(new Date(c.created_at)) : "—",
  }));

  return <CandidateChatTable session={session} rows={rows} />;
}
