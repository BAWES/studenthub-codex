import { redirect } from "next/navigation";
import { requireRoleCapability } from "@/modules/auth/session";

interface CandidateDetailRedirectProps {
  role: string;
  capability: string;
  basePath: string;
  params: Promise<{ id: string }>;
}

export async function CandidateDetailRedirect({
  role,
  capability,
  basePath,
  params,
}: CandidateDetailRedirectProps) {
  await requireRoleCapability(role as any, capability as any);
  const { id } = await params;
  const candidateId = Number(id);

  if (!Number.isInteger(candidateId) || candidateId <= 0) {
    redirect(basePath as any);
  }

  redirect(
    `${basePath}?candidate=${candidateId}&tabs=${candidateId}` as any,
  );

  return null;
}
