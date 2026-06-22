import { requireRoleCapability } from "@/modules/auth/session";
import { listConversations } from "./actions";
import { CandidateChatClient } from "./_components";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";

export const dynamic = "force-dynamic";

export default async function CandidateChatPage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const result = await listConversations({ limit: 50 });

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Candidate"
        title="Messages"
        metrics={[]}
      >
        <CandidateChatClient
          session={session}
          conversations={result.conversations}
        />
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
