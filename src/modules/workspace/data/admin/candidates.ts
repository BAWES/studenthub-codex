import { prisma } from "@/lib/prisma";
import { formatDate, formatMoney } from "@/modules/workspace/format";

export async function getAdminCandidateRows() {
  const rows = await prisma.candidate.findMany({
    where: { deleted: 0 },
    orderBy: { candidate_updated_at: "desc" },
    take: 60,
    select: {
      candidate_id: true,
      candidate_name: true,
      candidate_email: true,
      candidate_status: true,
      approved: true,
      candidate_hourly_rate: true,
      currency_code: true,
      candidate_updated_at: true,
      country: { select: { country_name_en: true } }
    }
  });

  return rows.map((row) => ({
    id: row.candidate_id,
    name: row.candidate_name,
    email: row.candidate_email,
    country: row.country?.country_name_en ?? "No country",
    status: row.approved === 0 ? "Needs review" : row.candidate_status === 10 ? "Active" : `Status ${row.candidate_status}`,
    rate: formatMoney(row.candidate_hourly_rate, row.currency_code ?? "KWD"),
    updated: formatDate(row.candidate_updated_at)
  }));
}
