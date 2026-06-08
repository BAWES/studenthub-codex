import { requireSession } from "@/modules/auth/session";
import { CandidateProfile } from "@/modules/candidates/CandidateProfile";
import { getCandidateDetail } from "@/modules/workspace/data";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireSession();

  if (session.role !== "candidate") {
    return (
      <WorkspaceShell
        session={session}
        eyebrow="Profile"
        title="Your StudentHub profile"
        metrics={[]}
      >
        <section className="candidateProfile empty">
          <strong>Profile</strong>
          <span>Your account is signed in as {session.role}. Profile management for this role is not yet available.</span>
        </section>
      </WorkspaceShell>
    );
  }

  const data = await getCandidateDetail(Number(session.id), "/app/profile/invitations");

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Profile"
      title={`Your StudentHub profile, ${data.candidate?.candidate_name ?? session.name}.`}
      metrics={data.metrics}
    >
      <CandidateProfile
        detail={data}
        actions={[
          { label: "Edit profile", href: "/app/profile/edit" },
          { label: "Invitations", href: "/app/profile/invitations" },
          { label: "Work logs", href: "/app/profile/work-logs" },
          { label: "Payments", href: "/app/profile/payments" },
          data.candidate?.candidate_email ? { label: "Email support", href: `mailto:${data.candidate.candidate_email}` } : null
        ].filter((action): action is { label: string; href: string } => Boolean(action))}
      />
    </WorkspaceShell>
  );
}
