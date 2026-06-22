import { requireRoleCapability } from "@/modules/auth/session";
import { listCandidateEducation } from "./actions";
import { AdminCandidateEducationTable } from "./_components";

export const dynamic = "force-dynamic";

export default async function AdminCandidateEducationPage() {
  const session = await requireRoleCapability("admin", "admin.read");
  const result = await listCandidateEducation({ limit: 100 });

  return (
    <AdminCandidateEducationTable
      session={session}
      education={result.items}
    />
  );
}
