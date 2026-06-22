"use client";

import { DataTablePage } from "@/modules/workspace/DataTablePage";
import { MatchScoreBadge } from "@/components/matching";
import type { MatchedCandidateRow } from "@/modules/matching/schemas";

type Props = {
  candidates: MatchedCandidateRow[];
  total: number;
  jobTitle: string;
};

export function MatchingCandidatesTable({ candidates, total, jobTitle }: Props) {
  const rows = candidates.map((c) => ({
    ...c,
    id: `cand-${c.candidateId}`,
    skillsStr: c.candidateSkills.slice(0, 5).join(", ") + (c.candidateSkills.length > 5 ? "..." : ""),
    universityStr: c.universityName ?? "—",
  }));

  return (
    <DataTablePage
      title={`Matching Candidates for ${jobTitle}`}
      description={`${total} candidate${total === 1 ? "" : "s"} scored by match`}
      rows={rows}
      searchable
      searchPlaceholder="Search by candidate name..."
      columns={[
        { key: "candidateName", label: "Candidate", render: (row) => String(row.candidateName) },
        { key: "universityStr", label: "University", render: (row) => String(row.universityStr) },
        { key: "skillsStr", label: "Skills", render: (row) => String(row.skillsStr) },
        { key: "score", label: "Match", render: (row) => {
          const s = (row as typeof rows[number]).score;
          return <MatchScoreBadge score={s.overall} showBar={false} />;
        }},
        { key: "skillScore", label: "Skills", render: (row) => {
          const s = (row as typeof rows[number]).score;
          return <span className="text-sm">{s.skillMatch}%</span>;
        }},
        { key: "educationScore", label: "Education", render: (row) => {
          const s = (row as typeof rows[number]).score;
          return <span className="text-sm">{s.educationMatch}%</span>;
        }},
      ]}
    />
  );
}
