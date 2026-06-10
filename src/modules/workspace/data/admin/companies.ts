import { prisma } from "@/lib/prisma";
import { formatDate, formatMoney } from "@/modules/workspace/format";

export async function getAdminCompanyRows() {
  const rows = await prisma.company.findMany({
    where: { deleted: 0 },
    orderBy: { company_updated_at: "desc" },
    take: 60,
    select: {
      company_id: true,
      company_name: true,
      company_email: true,
      no_of_active_requests: true,
      company_approved_to_hire: true,
      company_hourly_rate: true,
      currency_code: true,
      company_updated_at: true,
      staff: { select: { staff_name: true } }
    }
  });

  return rows.map((row) => ({
    id: row.company_id,
    name: row.company_name,
    email: row.company_email ?? "No email",
    owner: row.staff?.staff_name ?? "Unassigned",
    requests: row.no_of_active_requests ?? 0,
    status: row.company_approved_to_hire ? "Approved" : "Not approved",
    rate: formatMoney(row.company_hourly_rate, row.currency_code ?? "KWD"),
    updated: formatDate(row.company_updated_at)
  }));
}
