import { prisma } from "@/lib/prisma";
import { formatDate } from "@/modules/workspace/format";

export async function getAdminRequestRows() {
  const rows = await prisma.request.findMany({
    orderBy: { request_updated_datetime: "desc" },
    take: 60,
    select: {
      request_uuid: true,
      request_position_title: true,
      request_status: true,
      request_number_of_employees: true,
      request_updated_datetime: true,
      company: { select: { company_name: true } },
      staff: { select: { staff_name: true } }
    }
  });

  return rows.map((row) => ({
    id: row.request_uuid,
    title: row.request_position_title ?? "Untitled request",
    company: row.company?.company_name ?? "No company",
    owner: row.staff?.staff_name ?? "Unassigned",
    seats: row.request_number_of_employees ?? 0,
    status: row.request_status ?? "No status",
    updated: formatDate(row.request_updated_datetime)
  }));
}
