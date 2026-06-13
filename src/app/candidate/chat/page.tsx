import { requireRoleCapability } from "@/modules/auth/session";
import { listConversations } from "./actions";
import { CandidateChatClient } from "./_components";

export const dynamic = "force-dynamic";

export default async function CandidateChatPage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const result = await listConversations({ limit: 50 });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground text-sm mt-1">
            View your conversations with employers and staff
          </p>
        </div>
      </div>
      <CandidateChatClient
        session={session}
        conversations={result.conversations}
      />
    </div>
  );
}
