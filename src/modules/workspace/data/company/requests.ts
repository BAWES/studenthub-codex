import { prisma } from "@/lib/prisma";
import { formatDate } from "@/modules/workspace/format";
import { getRequestDetail } from "@/modules/workspace/request-detail-core";

async function companyIdsForContact(contactUuid: string) {
  const links = await prisma.company_contact.findMany({
    where: { contact_uuid: contactUuid, allow_access: true },
    select: { company_id: true }
  });
  return links.map((link) => link.company_id).filter((id): id is number => Boolean(id));
}

export async function getCompanyRequestRows(contactUuid: string) {
  const companyIds = await companyIdsForContact(contactUuid);
  const rows = await prisma.request.findMany({
    where: { company_id: { in: companyIds } },
    orderBy: { request_updated_datetime: "desc" },
    take: 80,
    select: {
      request_uuid: true,
      request_position_title: true,
      request_status: true,
      request_number_of_employees: true,
      request_compensation: true,
      request_location: true,
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
    compensation: row.request_compensation || "Not set",
    location: row.request_location ?? "No location",
    status: row.request_status ?? "No status",
    updated: formatDate(row.request_updated_datetime)
  }));
}

export async function getCompanyRequestDetail(contactUuid: string, requestUuid: string) {
  const companyIds = await companyIdsForContact(contactUuid);
  const request = await prisma.request.findFirst({
    where: { request_uuid: requestUuid, company_id: { in: companyIds } },
    select: { request_uuid: true }
  });

  if (!request) {
    return null;
  }

  return getRequestDetail(requestUuid, undefined, { candidateHref: (candidateId) => `/app/requests/${requestUuid}?candidate=${candidateId}` });
}
