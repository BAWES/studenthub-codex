import { requireRoleCapability } from "@/modules/auth/session";
import { getCandidateProfileDetail } from "./actions";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { CandidateProfile } from "@/modules/candidates/CandidateProfile";

export const dynamic = "force-dynamic";

export default async function CandidateProfilePage() {
  const session = await requireRoleCapability("candidate", "candidate.read.own");
  const { detail, metrics } = await getCandidateProfileDetail();

  const metricCards = [
    { label: "Experience", value: metrics.experienceCount, note: "Positions" },
    { label: "Education", value: metrics.educationCount, note: "Entries" },
    { label: "Skills", value: metrics.skillCount, note: "Skills" },
    { label: "Certifications", value: metrics.certificationCount, note: "Certifications" },
    { label: "Languages", value: metrics.languageCount, note: "Languages" },
    { label: "Applications", value: metrics.applicationCount, note: "Job applications" },
  ];

  return (
    <WorkspaceShell
      session={session}
      eyebrow="Candidate Profile"
      title={`Welcome, ${detail.candidate?.candidate_name ?? session.name}.`}
      metrics={metricCards}
    >
      <CandidateProfile
        detail={detail}
        actions={[
          { label: "Edit profile", href: "/candidate/edit" },
          { label: "Notifications", href: "/candidate/notifications" },
          { label: "Invitations", href: "/candidate/invitations" },
          { label: "Skills", href: "/candidate/skills" },
          { label: "Certifications", href: "/candidate/certifications" },
          { label: "References", href: "/candidate/references" },
          { label: "Schedule", href: "/candidate/schedule" },
          { label: "Documents", href: "/candidate/documents" },
          { label: "Work logs", href: "/candidate/work-logs" },
          { label: "Payments", href: "/candidate/payments" },
          { label: "My applications", href: "/candidate/applications" },
          { label: "Jobs", href: "/candidate/jobs" },
          detail.candidate?.candidate_email ? { label: "Email support", href: `mailto:${detail.candidate.candidate_email}` } : null,
        ].filter((action): action is { label: string; href: string } => Boolean(action))}
      />
    </WorkspaceShell>
  );
}
