import { redirect } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminCandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRoleCapability("admin", "candidate.search");
  const { id } = await params;
  const candidateId = Number(id);

  if (!Number.isInteger(candidateId) || candidateId <= 0) {
    redirect("/admin/candidates");
  }

  redirect(`/admin/candidates?candidate=${candidateId}&tabs=${candidateId}`);
}
