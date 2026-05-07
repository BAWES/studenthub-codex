import { redirect } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";

export const dynamic = "force-dynamic";

export default async function StaffCandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRoleCapability("staff", "candidate.search");
  const { id } = await params;
  const candidateId = Number(id);

  if (!Number.isInteger(candidateId) || candidateId <= 0) {
    redirect("/staff/candidates");
  }

  redirect(`/staff/candidates?candidate=${candidateId}&tabs=${candidateId}`);
}
