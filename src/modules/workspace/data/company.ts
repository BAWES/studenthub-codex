import { prisma } from "@/lib/prisma";
import { formatDate, formatMoney } from "@/modules/workspace/format";
import { getRequestDetail } from "@/modules/workspace/data/shared";

export async function getCompanyDetail(companyId: number) {
  const [company, requests, contacts, stores, notes] = await prisma.$transaction([
    prisma.company.findUnique({
      where: { company_id: companyId },
      select: {
        company_id: true,
        company_name: true,
        company_common_name_en: true,
        company_email: true,
        company_website: true,
        company_approved_to_hire: true,
        company_hourly_rate: true,
        currency_code: true,
        no_of_active_requests: true,
        company_created_at: true,
        company_updated_at: true,
        staff: { select: { staff_name: true, staff_email: true } },
        country: { select: { country_name_en: true } }
      }
    }),
    prisma.request.findMany({
      where: { company_id: companyId },
      orderBy: { request_updated_datetime: "desc" },
      take: 8,
      select: {
        request_uuid: true,
        request_position_title: true,
        request_status: true,
        request_number_of_employees: true,
        request_updated_datetime: true
      }
    }),
    prisma.company_contact.findMany({
      where: { company_id: companyId },
      take: 8,
      select: {
        company_contact_uuid: true,
        contact_position: true,
        allow_access: true,
        contact: { select: { contact_name: true, contact_email: true } }
      }
    }),
    prisma.store.findMany({
      where: { company_id: companyId, deleted: 0 },
      take: 8,
      select: { store_id: true, store_name: true, store_status: true }
    }),
    prisma.note.findMany({
      where: { company_id: companyId },
      orderBy: { note_created_datetime: "desc" },
      take: 6,
      select: { note_uuid: true, note_type: true, note_text: true, note_created_datetime: true }
    })
  ]);

  return {
    company,
    metrics: [
      { label: "Active Requests", value: company?.no_of_active_requests ?? requests.length, note: "Legacy active request count" },
      { label: "Approved", value: company?.company_approved_to_hire ? "Yes" : "No", note: "Approved to hire" },
      { label: "Rate", value: formatMoney(company?.company_hourly_rate, company?.currency_code ?? "KWD"), note: "Company hourly rate" },
      { label: "Owner", value: company?.staff?.staff_name ?? "Unassigned", note: company?.staff?.staff_email ?? "No staff email" }
    ],
    requests: requests.map((request) => ({
      id: request.request_uuid,
      title: request.request_position_title ?? "Untitled request",
      subtitle: `${request.request_number_of_employees ?? 0} seats`,
      meta: `${request.request_status ?? "No status"} · ${formatDate(request.request_updated_datetime)}`
    })),
    contacts: contacts.map((contact) => ({
      id: contact.company_contact_uuid,
      title: contact.contact?.contact_name ?? "Contact",
      subtitle: contact.contact?.contact_email ?? "No email",
      meta: `${contact.contact_position ?? "No position"} · ${contact.allow_access ? "Access allowed" : "Access disabled"}`
    })),
    stores: stores.map((store) => ({
      id: store.store_id,
      title: store.store_name,
      subtitle: `Status ${store.store_status ?? 0}`,
      meta: "Active store"
    })),
    notes: notes.map((note) => ({
      id: note.note_uuid,
      title: note.note_type ?? "Note",
      subtitle: note.note_text?.slice(0, 180) ?? "Empty note",
      meta: formatDate(note.note_created_datetime)
    }))
  };
}

async function companyIdsForContact(contactUuid: string) {
  const links = await prisma.company_contact.findMany({
    where: { contact_uuid: contactUuid, allow_access: true },
    select: { company_id: true }
  });
  return links.map((link) => link.company_id).filter((id): id is number => Boolean(id));
}

export async function getCompanyWorkspace(contactUuid: string) {
  const contact = await prisma.contact.findUnique({
    where: { contact_uuid: contactUuid },
    select: { contact_name: true, contact_email: true }
  });

  const companyLinks = await prisma.company_contact.findMany({
    where: { contact_uuid: contactUuid },
    take: 20,
    select: {
      company_contact_uuid: true,
      contact_position: true,
      allow_access: true,
      company: {
        select: {
          company_id: true,
          company_name: true,
          company_email: true,
          no_of_active_requests: true,
          company_approved_to_hire: true
        }
      }
    }
  });

  const companyIds = companyLinks.map((link) => link.company?.company_id).filter((id): id is number => Boolean(id));
  const [requests, stores, notes, recentRequests] = await prisma.$transaction([
    prisma.request.count({ where: { company_id: { in: companyIds } } }),
    prisma.store.count({ where: { company_id: { in: companyIds }, deleted: 0 } }),
    prisma.note.count({ where: { company_id: { in: companyIds } } }),
    prisma.request.findMany({
      where: { company_id: { in: companyIds } },
      orderBy: { request_created_datetime: "desc" },
      take: 6,
      select: {
        request_uuid: true,
        request_position_title: true,
        request_status: true,
        request_number_of_employees: true,
        request_created_datetime: true,
        company: { select: { company_name: true } }
      }
    })
  ]);

  return {
    contact,
    metrics: [
      { label: "Companies", value: companyIds.length, note: "Companies linked to this contact" },
      { label: "Requests", value: requests, note: "Hiring requests across linked companies" },
      { label: "Stores", value: stores, note: "Active stores in the account" },
      { label: "Notes", value: notes, note: "Internal/customer notes connected to account" }
    ],
    companies: companyLinks.map((link) => ({
      id: link.company_contact_uuid,
      title: link.company?.company_name ?? "Unknown company",
      subtitle: link.contact_position ?? "Contact",
      meta: link.allow_access ? "Access allowed" : "Access disabled"
    })),
    requests: recentRequests.map((request) => ({
      id: request.request_uuid,
      title: request.request_position_title ?? "Untitled request",
      subtitle: request.company?.company_name ?? "No company",
      meta: `${request.request_status ?? "No status"} · ${request.request_number_of_employees ?? 0} seats`
    }))
  };
}

export async function getCompanyAccountRows(contactUuid: string) {
  const companyIds = await companyIdsForContact(contactUuid);
  const rows = await prisma.company.findMany({
    where: { company_id: { in: companyIds }, deleted: 0 },
    orderBy: { company_updated_at: "desc" },
    take: 80,
    select: {
      company_id: true,
      company_name: true,
      company_email: true,
      no_of_active_requests: true,
      company_approved_to_hire: true,
      company_hourly_rate: true,
      currency_code: true,
      company_updated_at: true,
      country: { select: { country_name_en: true } }
    }
  });

  return rows.map((row) => ({
    id: row.company_id,
    name: row.company_name,
    email: row.company_email ?? "No email",
    country: row.country?.country_name_en ?? "No country",
    requests: row.no_of_active_requests ?? 0,
    status: row.company_approved_to_hire ? "Approved" : "Not approved",
    rate: formatMoney(row.company_hourly_rate, row.currency_code ?? "KWD"),
    updated: formatDate(row.company_updated_at)
  }));
}

export async function getCompanyAccountDetail(contactUuid: string, companyId: number) {
  const companyIds = await companyIdsForContact(contactUuid);
  if (!companyIds.includes(companyId)) {
    return null;
  }

  return getCompanyDetail(companyId);
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
