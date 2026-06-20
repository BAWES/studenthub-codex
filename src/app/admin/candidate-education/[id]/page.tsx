import { ErrorBoundary } from "@/modules/workspace/ErrorBoundary";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireRoleCapability } from "@/modules/auth/session";
import { DetailSection } from "@/modules/workspace/DetailPanels";
import { WorkspaceShell } from "@/modules/workspace/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { getCandidateEducation } from "./actions";
import { formatDate } from "@/modules/workspace/format";

export const dynamic = "force-dynamic";

const BOOLEAN_LABELS: Record<string, string> = {
  true: "Yes",
  false: "No",
};

export default async function AdminCandidateEducationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRoleCapability("admin", "admin.read");
  const { id } = await params;

  const data = await getCandidateEducation({ education_uuid: id });

  if (!data.education) {
    notFound();
  }

  const e = data.education;

  return (
    <ErrorBoundary>
      <WorkspaceShell
        session={session}
        eyebrow="Admin / Candidate Education"
        title={`Education — ${e.candidate_name ?? `Candidate #${e.candidate_id}`}`}
        metrics={[
          {
            label: "Candidate",
            value: e.candidate_name ?? "—",
            note: "",
          },
          {
            label: "University",
            value: e.university_name || "—",
            note: "",
          },
          {
            label: "Degree",
            value: e.degree_name ?? "—",
            note: "",
          },
        ]}
      >
        <DetailSection
          title="Education Details"
          facts={[
            { label: "UUID", value: e.education_uuid },
            { label: "Candidate ID", value: String(e.candidate_id) },
            { label: "Candidate Name", value: e.candidate_name ?? "—" },
            { label: "University", value: e.university_name || "—" },
            { label: "University ID", value: String(e.university_id) },
            { label: "Degree", value: e.degree_name ?? "—" },
            { label: "Degree UUID", value: e.degree_uuid ?? "—" },
            { label: "Major", value: e.major_name ?? "—" },
            { label: "Major UUID", value: e.major_uuid ?? "—" },
            {
              label: "Graduation Year",
              value: e.graduation_year != null ? String(e.graduation_year) : "—",
            },
            {
              label: "Currently Studying",
              value: BOOLEAN_LABELS[String(e.is_currently_studying)] ?? "—",
            },
            {
              label: "Created",
              value: e.created_at ? formatDate(new Date(e.created_at)) : "—",
            },
            {
              label: "Updated",
              value: e.updated_at ? formatDate(new Date(e.updated_at)) : "—",
            },
          ]}
        />

        <section className="flex gap-2 p-4">
          <Link href={"/admin/candidate-education" as Route}>
            <Button variant="outline">Back to Candidate Education</Button>
          </Link>
        </section>
      </WorkspaceShell>
    </ErrorBoundary>
  );
}
