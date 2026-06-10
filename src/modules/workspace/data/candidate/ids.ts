import { prisma } from "@/lib/prisma";

export async function getCandidateIdsForStaff(staffId: number) {
  const rows = await prisma.candidate_work_history.findMany({
    where: { staff_id: staffId, candidate_id: { not: null } },
    distinct: ["candidate_id"],
    orderBy: { end_date: "desc" },
    take: 500,
    select: { candidate_id: true }
  });
  return rows.map((row) => row.candidate_id).filter((id): id is number => Boolean(id));
}
