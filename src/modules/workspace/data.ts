import { prisma } from "@/lib/prisma";
import { formatDate, formatMoney } from "./format";

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

export async function getAdminTransferRows() {
  const rows = await prisma.transfer.findMany({
    where: { deleted: 0 },
    orderBy: { transfer_updated_at: "desc" },
    take: 60,
    select: {
      transfer_id: true,
      total: true,
      company_total: true,
      transfer_status: true,
      start_date: true,
      end_date: true,
      currency_code: true,
      company: { select: { company_name: true } }
    }
  });

  return rows.map((row) => ({
    id: row.transfer_id,
    company: row.company?.company_name ?? "No company",
    period: `${formatDate(row.start_date)} to ${formatDate(row.end_date)}`,
    status: `Status ${row.transfer_status}`,
    total: formatMoney(row.total ?? row.company_total, row.currency_code ?? "KWD")
  }));
}

export async function getAdminTransferDetail(transferId: number) {
  const [transfer, candidates, invoices, fileEntries] = await prisma.$transaction([
    prisma.transfer.findUnique({
      where: { transfer_id: transferId },
      select: {
        transfer_id: true,
        total: true,
        company_total: true,
        transfer_cost: true,
        transfer_status: true,
        start_date: true,
        end_date: true,
        payment_received_on: true,
        transfer_created_at: true,
        transfer_updated_at: true,
        currency_code: true,
        company: { select: { company_name: true, company_email: true } },
        staff_transfer_transfer_created_byTostaff: { select: { staff_name: true } },
        staff_transfer_transfer_updated_byTostaff: { select: { staff_name: true } }
      }
    }),
    prisma.transfer_candidate.findMany({
      where: { transfer_id: transferId, deleted: 0 },
      orderBy: { tc_updated_at: "desc" },
      take: 80,
      select: {
        tc_id: true,
        candidate_total: true,
        company_total: true,
        transfer_cost: true,
        hours: true,
        minutes: true,
        paid: true,
        currency_code: true,
        candidate: { select: { candidate_name: true, candidate_email: true } },
        store: { select: { store_name: true } }
      }
    }),
    prisma.invoice.findMany({
      where: { transfer_id: transferId, deleted: 0 },
      orderBy: { invoice_date: "desc" },
      take: 20,
      select: { invoice_id: true, invoice_date: true, invoice_status: true }
    }),
    prisma.transfer_file_entry.findMany({
      where: { transfer: { transfer_id: transferId } },
      take: 20,
      select: {
        tfe_uuid: true,
        status: true,
        status_description: true,
        credit_amount: true,
        credit_currency: true,
        beneficiary_name: true
      }
    })
  ]);

  return {
    transfer,
    metrics: [
      { label: "Status", value: `Status ${transfer?.transfer_status ?? 0}`, note: "Legacy transfer status" },
      { label: "Total", value: formatMoney(transfer?.total ?? transfer?.company_total, transfer?.currency_code ?? "KWD"), note: "Transfer total" },
      { label: "Cost", value: formatMoney(transfer?.transfer_cost, transfer?.currency_code ?? "KWD"), note: "Transfer cost" },
      { label: "Candidates", value: candidates.length, note: "Candidate payout rows shown" }
    ],
    candidates: candidates.map((row) => ({
      id: row.tc_id,
      title: row.candidate?.candidate_name ?? "Unknown candidate",
      subtitle: row.store?.store_name ?? row.candidate?.candidate_email ?? "No store",
      meta: `${row.hours ?? 0}h ${row.minutes ?? 0}m · ${row.paid ? "Paid" : "Unpaid"} · ${formatMoney(row.candidate_total, row.currency_code ?? transfer?.currency_code ?? "KWD")}`
    })),
    invoices: invoices.map((invoice) => ({
      id: invoice.invoice_id,
      title: `Invoice #${invoice.invoice_id}`,
      subtitle: `${invoice.invoice_status ?? "No status"}`,
      meta: formatDate(invoice.invoice_date)
    })),
    fileEntries: fileEntries.map((entry) => ({
      id: entry.tfe_uuid,
      title: entry.beneficiary_name ?? "Transfer file entry",
      subtitle: entry.status_description ?? entry.status ?? "No status",
      meta: formatMoney(entry.credit_amount, entry.credit_currency ?? transfer?.currency_code ?? "KWD")
    }))
  };
}

export async function getStaffRequestRows(staffId: number) {
  const rows = await prisma.request.findMany({
    where: { staff_id: staffId },
    orderBy: { request_updated_datetime: "desc" },
    take: 60,
    select: {
      request_uuid: true,
      request_position_title: true,
      request_status: true,
      request_number_of_employees: true,
      request_updated_datetime: true,
      company: { select: { company_name: true } }
    }
  });

  return rows.map((row) => ({
    id: row.request_uuid,
    title: row.request_position_title ?? "Untitled request",
    company: row.company?.company_name ?? "No company",
    seats: row.request_number_of_employees ?? 0,
    status: row.request_status ?? "No status",
    updated: formatDate(row.request_updated_datetime)
  }));
}

export async function getStaffCandidateRows(staffId: number) {
  const histories = await prisma.candidate_work_history.findMany({
    where: { staff_id: staffId },
    orderBy: { end_date: "desc" },
    take: 60,
    select: {
      id: true,
      candidate_id: true,
      start_date: true,
      end_date: true,
      company_candidate_work_history_company_idTocompany: { select: { company_name: true } }
    }
  });

  const candidateIds = histories.map((row) => row.candidate_id).filter((id): id is number => Boolean(id));
  const candidates = await prisma.candidate.findMany({
    where: { candidate_id: { in: candidateIds } },
    select: { candidate_id: true, candidate_name: true, candidate_email: true, approved: true }
  });
  const candidateById = new Map(candidates.map((candidate) => [candidate.candidate_id, candidate]));

  return histories.map((row) => {
    const candidate = row.candidate_id ? candidateById.get(row.candidate_id) : null;
    return {
      id: row.id,
      candidateId: candidate?.candidate_id ?? row.candidate_id ?? 0,
      name: candidate?.candidate_name ?? "Unknown candidate",
      email: candidate?.candidate_email ?? "No email",
      company: row.company_candidate_work_history_company_idTocompany?.company_name ?? "No company",
      status: candidate?.approved === 0 ? "Needs review" : "Assigned",
      period: `${formatDate(row.start_date)} to ${formatDate(row.end_date)}`
    };
  });
}

export type StaffCandidateFilter = "all" | "active" | "needs-review" | "incomplete" | "civil-id";

export async function getStaffCandidateDirectoryRows({
  search,
  filter
}: {
  search?: string;
  filter?: StaffCandidateFilter;
}) {
  const normalizedSearch = search?.trim();
  const where = {
    deleted: 0,
    ...(filter === "active" ? { candidate_status: 10, approved: { not: 0 } } : {}),
    ...(filter === "needs-review" ? { approved: 0 } : {}),
    ...(filter === "incomplete" ? { is_incomplete_profile: true } : {}),
    ...(filter === "civil-id" ? { candidate_civil_need_verification: true } : {}),
    ...(normalizedSearch
      ? {
          OR: [
            { candidate_name: { contains: normalizedSearch } },
            { candidate_email: { contains: normalizedSearch } },
            ...(Number.isInteger(Number(normalizedSearch)) ? [{ candidate_id: Number(normalizedSearch) }] : [])
          ]
        }
      : {})
  };

  const [rows, active, needsReview, incomplete, civilId] = await prisma.$transaction([
    prisma.candidate.findMany({
      where,
      orderBy: { candidate_updated_at: "desc" },
      take: 80,
      select: {
        candidate_id: true,
        candidate_uid: true,
        candidate_name: true,
        candidate_email: true,
        candidate_phone: true,
        candidate_status: true,
        approved: true,
        is_incomplete_profile: true,
        candidate_civil_need_verification: true,
        candidate_hourly_rate: true,
        currency_code: true,
        candidate_updated_at: true,
        country: { select: { country_name_en: true } },
        store: { select: { store_name: true, company: { select: { company_name: true } } } }
      }
    }),
    prisma.candidate.count({ where: { deleted: 0, candidate_status: 10, approved: { not: 0 } } }),
    prisma.candidate.count({ where: { deleted: 0, approved: 0 } }),
    prisma.candidate.count({ where: { deleted: 0, is_incomplete_profile: true } }),
    prisma.candidate.count({ where: { deleted: 0, candidate_civil_need_verification: true } })
  ]);

  return {
    rows: rows.map((row) => ({
      id: row.candidate_id,
      uid: row.candidate_uid ?? `#${row.candidate_id}`,
      name: row.candidate_name,
      email: row.candidate_email,
      phone: row.candidate_phone ?? "No phone",
      country: row.country?.country_name_en ?? "No country",
      company: row.store?.company?.company_name ?? "No company",
      store: row.store?.store_name ?? "No store",
      status: row.approved === 0 ? "Needs review" : row.candidate_status === 10 ? "Active" : `Status ${row.candidate_status}`,
      flags: [
        row.is_incomplete_profile ? "Incomplete" : null,
        row.candidate_civil_need_verification ? "Civil ID" : null
      ].filter((flag): flag is string => Boolean(flag)),
      rate: formatMoney(row.candidate_hourly_rate, row.currency_code ?? "KWD"),
      updated: formatDate(row.candidate_updated_at)
    })),
    metrics: [
      { label: "Active", value: active, note: "Approved active candidates" },
      { label: "Needs Review", value: needsReview, note: "Candidates waiting on approval" },
      { label: "Incomplete", value: incomplete, note: "Profiles flagged incomplete" },
      { label: "Civil ID", value: civilId, note: "Candidates needing civil ID review" }
    ]
  };
}

export async function getCandidateDetail(candidateId: number) {
  const [candidate, invitations, workHours, histories, notes] = await prisma.$transaction([
    prisma.candidate.findUnique({
      where: { candidate_id: candidateId },
      select: {
        candidate_id: true,
        candidate_uid: true,
        candidate_name: true,
        candidate_name_ar: true,
        candidate_email: true,
        candidate_phone: true,
        candidate_status: true,
        approved: true,
        candidate_hourly_rate: true,
        currency_code: true,
        candidate_job_search_status: true,
        candidate_civil_need_verification: true,
        is_incomplete_profile: true,
        candidate_created_at: true,
        candidate_updated_at: true,
        country: { select: { country_name_en: true } },
        university: { select: { university_name_en: true } }
      }
    }),
    prisma.invitation.findMany({
      where: { candidate_id: candidateId },
      orderBy: { invitation_created_at: "desc" },
      take: 8,
      select: {
        invitation_uuid: true,
        invitation_status: true,
        invitation_created_at: true,
        request: {
          select: {
            request_position_title: true,
            company: { select: { company_name: true } }
          }
        }
      }
    }),
    prisma.candidate_working_hour.findMany({
      where: { candidate_id: candidateId },
      orderBy: { date: "desc" },
      take: 8,
      select: {
        candidate_working_hour_uuid: true,
        date: true,
        total_time: true,
        status: true,
        store: { select: { store_name: true } }
      }
    }),
    prisma.candidate_work_history.findMany({
      where: { candidate_id: candidateId },
      orderBy: { end_date: "desc" },
      take: 8,
      select: {
        id: true,
        start_date: true,
        end_date: true,
        candidate_hourly_rate: true,
        company_candidate_work_history_company_idTocompany: { select: { company_name: true } },
        staff: { select: { staff_name: true } }
      }
    }),
    prisma.note.findMany({
      where: { candidate_id: candidateId },
      orderBy: { note_created_datetime: "desc" },
      take: 6,
      select: {
        note_uuid: true,
        note_type: true,
        note_text: true,
        note_created_datetime: true
      }
    })
  ]);

  return {
    candidate,
    metrics: [
      { label: "Status", value: candidate?.approved === 0 ? "Needs review" : `Active ${candidate?.candidate_status ?? ""}`, note: "Approval and legacy status" },
      { label: "Rate", value: formatMoney(candidate?.candidate_hourly_rate, candidate?.currency_code ?? "KWD"), note: "Candidate hourly rate" },
      { label: "Invitations", value: invitations.length, note: "Most recent invitations shown below" },
      { label: "Work Logs", value: workHours.length, note: "Recent imported work-hour records" }
    ],
    invitations: invitations.map((invitation) => ({
      id: invitation.invitation_uuid,
      title: invitation.request.request_position_title ?? "Invitation",
      subtitle: invitation.request.company?.company_name ?? "No company",
      meta: `Status ${invitation.invitation_status ?? 0} · ${formatDate(invitation.invitation_created_at)}`
    })),
    workHours: workHours.map((hour) => ({
      id: hour.candidate_working_hour_uuid,
      title: hour.store?.store_name ?? "Work log",
      subtitle: `${hour.total_time ?? 0} minutes`,
      meta: `Status ${hour.status ?? 0} · ${formatDate(hour.date)}`
    })),
    histories: histories.map((history) => ({
      id: history.id,
      title: history.company_candidate_work_history_company_idTocompany?.company_name ?? "Assignment",
      subtitle: history.staff?.staff_name ?? "No staff owner",
      meta: `${formatDate(history.start_date)} to ${formatDate(history.end_date)} · ${formatMoney(history.candidate_hourly_rate, candidate?.currency_code ?? "KWD")}`
    })),
    notes: notes.map((note) => ({
      id: note.note_uuid,
      title: note.note_type ?? "Note",
      subtitle: note.note_text?.slice(0, 180) ?? "Empty note",
      meta: formatDate(note.note_created_datetime)
    }))
  };
}

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

export async function getRequestDetail(requestUuid: string, staffId?: number) {
  const where = staffId ? { request_uuid: requestUuid, staff_id: staffId } : { request_uuid: requestUuid };
  const [request, applications, interviews, invitations, activities, notes, stories] = await prisma.$transaction([
    prisma.request.findFirst({
      where,
      select: {
        request_uuid: true,
        request_position_title: true,
        request_job_description: true,
        request_compensation: true,
        request_number_of_employees: true,
        request_location: true,
        request_additional_info: true,
        request_status: true,
        request_priority: true,
        request_created_datetime: true,
        request_updated_datetime: true,
        request_started_at: true,
        request_finished_at: true,
        company: { select: { company_id: true, company_name: true, company_email: true } },
        contact: { select: { contact_name: true, contact_email: true } },
        staff: { select: { staff_name: true, staff_email: true } }
      }
    }),
    prisma.request_application.findMany({
      where: { request_uuid: requestUuid },
      orderBy: { created_at: "desc" },
      take: 10,
      select: {
        application_uuid: true,
        status: true,
        created_at: true,
        candidate: { select: { candidate_id: true, candidate_name: true, candidate_email: true } }
      }
    }),
    prisma.request_interview.findMany({
      where: { request_uuid: requestUuid },
      orderBy: { interview_at: "desc" },
      take: 10,
      select: {
        request_interview_uuid: true,
        interview_at: true,
        status: true,
        candidate: { select: { candidate_name: true, candidate_email: true } }
      }
    }),
    prisma.invitation.findMany({
      where: { request_uuid: requestUuid },
      orderBy: { invitation_created_at: "desc" },
      take: 10,
      select: {
        invitation_uuid: true,
        invitation_status: true,
        invitation_created_at: true,
        candidate: { select: { candidate_name: true, candidate_email: true } }
      }
    }),
    prisma.request_activity.findMany({
      where: { request_uuid: requestUuid },
      orderBy: { activity_created_datetime: "desc" },
      take: 8,
      select: {
        activity_uuid: true,
        activity_detail: true,
        activity_created_datetime: true,
        staff: { select: { staff_name: true } }
      }
    }),
    prisma.note.findMany({
      where: { request_uuid: requestUuid },
      orderBy: { note_created_datetime: "desc" },
      take: 8,
      select: { note_uuid: true, note_type: true, note_text: true, note_created_datetime: true }
    }),
    prisma.story.findMany({
      where: { request_uuid: requestUuid },
      orderBy: { story_last_updated_at: "desc" },
      take: 8,
      select: {
        story_uuid: true,
        story_status: true,
        story_last_updated_at: true
      }
    })
  ]);

  return {
    request,
    metrics: [
      { label: "Seats", value: request?.request_number_of_employees ?? 0, note: "Requested employees" },
      { label: "Status", value: request?.request_status ?? "No status", note: `Priority ${request?.request_priority ?? 0}` },
      { label: "Applications", value: applications.length, note: "Recent applications shown" },
      { label: "Invitations", value: invitations.length, note: "Recent invitations shown" }
    ],
    applications: applications.map((application) => ({
      id: application.application_uuid,
      title: application.candidate?.candidate_name ?? "Unknown candidate",
      subtitle: application.candidate?.candidate_email ?? "No email",
      meta: `Status ${application.status ?? 0} · ${formatDate(application.created_at)}`
    })),
    interviews: interviews.map((interview) => ({
      id: interview.request_interview_uuid,
      title: interview.candidate?.candidate_name ?? "Interview",
      subtitle: interview.candidate?.candidate_email ?? "No email",
      meta: `Status ${interview.status ?? 0} · ${formatDate(interview.interview_at)}`
    })),
    invitations: invitations.map((invitation) => ({
      id: invitation.invitation_uuid,
      title: invitation.candidate?.candidate_name ?? "Invitation",
      subtitle: invitation.candidate?.candidate_email ?? "No email",
      meta: `Status ${invitation.invitation_status ?? 0} · ${formatDate(invitation.invitation_created_at)}`
    })),
    activities: activities.map((activity) => ({
      id: activity.activity_uuid,
      title: activity.staff?.staff_name ?? "Activity",
      subtitle: activity.activity_detail.slice(0, 180),
      meta: formatDate(activity.activity_created_datetime)
    })),
    notes: notes.map((note) => ({
      id: note.note_uuid,
      title: note.note_type ?? "Note",
      subtitle: note.note_text?.slice(0, 180) ?? "Empty note",
      meta: formatDate(note.note_created_datetime)
    })),
    stories: stories.map((story) => ({
      id: story.story_uuid,
      title: `Story ${story.story_uuid.slice(0, 12)}`,
      subtitle: `Status ${story.story_status}`,
      meta: formatDate(story.story_last_updated_at)
    }))
  };
}

export async function getStaffWorkspace(staffId: number) {
  const [staff, assignedRequests, workHistories, stories, notes, recentRequests, recentStories] =
    await prisma.$transaction([
      prisma.staff.findUnique({
        where: { staff_id: staffId },
        select: {
          staff_name: true,
          staff_email: true,
          staff_job_title: true,
          staff_salary: true,
          staff_salary_currency: true
        }
      }),
      prisma.request.count({ where: { staff_id: staffId } }),
      prisma.candidate_work_history.count({ where: { staff_id: staffId } }),
      prisma.story.count({ where: { staff_id: staffId } }),
      prisma.note.count({ where: { created_by: staffId } }),
      prisma.request.findMany({
        where: { staff_id: staffId },
        orderBy: { request_created_datetime: "desc" },
        take: 6,
        select: {
          request_uuid: true,
          request_position_title: true,
          request_status: true,
          request_created_datetime: true,
          company: { select: { company_name: true } }
        }
      }),
      prisma.story.findMany({
        where: { staff_id: staffId },
        orderBy: { story_last_updated_at: "desc" },
        take: 6,
        select: {
          story_uuid: true,
          story_status: true,
          story_last_updated_at: true,
          request: { select: { request_position_title: true } }
        }
      })
    ]);

  return {
    staff,
    metrics: [
      { label: "Assigned Requests", value: assignedRequests, note: "Requests owned by this staff member" },
      { label: "Work Histories", value: workHistories, note: "Candidate assignments connected to this staff member" },
      { label: "Stories", value: stories, note: "Operational stories in progress or history" },
      { label: "Notes", value: notes, note: `Salary ${formatMoney(staff?.staff_salary, staff?.staff_salary_currency ?? "KWD")}` }
    ],
    requests: recentRequests.map((request) => ({
      id: request.request_uuid,
      title: request.request_position_title ?? "Untitled request",
      subtitle: request.company?.company_name ?? "No company",
      meta: `${request.request_status ?? "No status"} · ${formatDate(request.request_created_datetime)}`
    })),
    stories: recentStories.map((story) => ({
      id: story.story_uuid,
      title: story.request.request_position_title ?? "Story",
      subtitle: `Status ${story.story_status}`,
      meta: formatDate(story.story_last_updated_at)
    }))
  };
}

export async function getCandidateWorkspace(candidateId: number) {
  const [candidate, education, experience, skills, invitations, workingHours, recentInvitations, recentHours] =
    await prisma.$transaction([
      prisma.candidate.findUnique({
        where: { candidate_id: candidateId },
        select: {
          candidate_name: true,
          candidate_email: true,
          candidate_status: true,
          approved: true,
          candidate_hourly_rate: true,
          currency_code: true,
          candidate_created_at: true
        }
      }),
      prisma.candidate_education.count({ where: { candidate_id: candidateId } }),
      prisma.candidate_experience.count({ where: { candidate_id: candidateId } }),
      prisma.candidate_skill.count({ where: { candidate_id: candidateId } }),
      prisma.invitation.count({ where: { candidate_id: candidateId } }),
      prisma.candidate_working_hour.count({ where: { candidate_id: candidateId } }),
      prisma.invitation.findMany({
        where: { candidate_id: candidateId },
        orderBy: { invitation_created_at: "desc" },
        take: 6,
        select: {
          invitation_uuid: true,
          invitation_status: true,
          invitation_created_at: true,
          request: { select: { request_position_title: true, company: { select: { company_name: true } } } }
        }
      }),
      prisma.candidate_working_hour.findMany({
        where: { candidate_id: candidateId },
        orderBy: { date: "desc" },
        take: 6,
        select: {
          candidate_working_hour_uuid: true,
          date: true,
          total_time: true,
          status: true,
          store: { select: { store_name: true } }
        }
      })
    ]);

  return {
    candidate,
    metrics: [
      { label: "Education", value: education, note: "Profile education entries" },
      { label: "Experience", value: experience, note: "Profile experience entries" },
      { label: "Skills", value: skills, note: "Skill tags from the old system" },
      {
        label: "Rate",
        value: formatMoney(candidate?.candidate_hourly_rate, candidate?.currency_code ?? "KWD"),
        note: `${invitations} invitations · ${workingHours} work logs`
      }
    ],
    invitations: recentInvitations.map((invitation) => ({
      id: invitation.invitation_uuid,
      title: invitation.request.request_position_title ?? "Invitation",
      subtitle: invitation.request.company?.company_name ?? "No company",
      meta: `Status ${invitation.invitation_status ?? 0} · ${formatDate(invitation.invitation_created_at)}`
    })),
    hours: recentHours.map((hour) => ({
      id: hour.candidate_working_hour_uuid,
      title: hour.store?.store_name ?? "Work log",
      subtitle: `${hour.total_time ?? 0} minutes`,
      meta: `Status ${hour.status ?? 0} · ${formatDate(hour.date)}`
    }))
  };
}

export async function getCandidateInvitationRows(candidateId: number) {
  const rows = await prisma.invitation.findMany({
    where: { candidate_id: candidateId },
    orderBy: { invitation_created_at: "desc" },
    take: 80,
    select: {
      invitation_uuid: true,
      invitation_status: true,
      invitation_app_seen_at: true,
      invitation_email_seen_at: true,
      invitation_created_at: true,
      request: {
        select: {
          request_position_title: true,
          request_compensation: true,
          company: { select: { company_name: true } }
        }
      }
    }
  });

  return rows.map((row) => ({
    id: row.invitation_uuid,
    role: row.request.request_position_title ?? "Invitation",
    company: row.request.company?.company_name ?? "No company",
    compensation: row.request.request_compensation || "Not set",
    status: `Status ${row.invitation_status ?? 0}`,
    seen: row.invitation_app_seen_at || row.invitation_email_seen_at ? "Seen" : "Unseen",
    created: formatDate(row.invitation_created_at)
  }));
}

export async function getCandidateInvitationDetail(candidateId: number, invitationUuid: string) {
  const [invitation, notes] = await prisma.$transaction([
    prisma.invitation.findFirst({
      where: { invitation_uuid: invitationUuid, candidate_id: candidateId },
      select: {
        invitation_uuid: true,
        invitation_status: true,
        invitation_app_seen_at: true,
        invitation_email_seen_at: true,
        invitation_seen_via: true,
        invitation_created_at: true,
        invitation_updated_at: true,
        request: {
          select: {
            request_uuid: true,
            request_position_title: true,
            request_job_description: true,
            request_compensation: true,
            request_location: true,
            request_number_of_employees: true,
            request_status: true,
            company: { select: { company_name: true, company_email: true } },
            staff: { select: { staff_name: true, staff_email: true } }
          }
        },
        story: {
          select: {
            story_uuid: true,
            story_status: true,
            story_last_updated_at: true
          }
        }
      }
    }),
    prisma.note.findMany({
      where: { invitation_uuid: invitationUuid },
      orderBy: { note_created_datetime: "desc" },
      take: 8,
      select: { note_uuid: true, note_type: true, note_text: true, note_created_datetime: true }
    })
  ]);

  return {
    invitation,
    metrics: [
      { label: "Status", value: invitation ? `Status ${invitation.invitation_status ?? 0}` : "Missing", note: "Legacy invitation status" },
      { label: "Seats", value: invitation?.request.request_number_of_employees ?? 0, note: "Requested headcount" },
      { label: "Seen", value: invitation?.invitation_app_seen_at || invitation?.invitation_email_seen_at ? "Yes" : "No", note: invitation?.invitation_seen_via ?? "No seen source" },
      { label: "Request", value: invitation?.request.request_status ?? "No status", note: "Linked request status" }
    ],
    notes: notes.map((note) => ({
      id: note.note_uuid,
      title: note.note_type ?? "Note",
      subtitle: note.note_text?.slice(0, 180) ?? "Empty note",
      meta: formatDate(note.note_created_datetime)
    }))
  };
}

export async function getCandidateWorkLogRows(candidateId: number) {
  const rows = await prisma.candidate_working_hour.findMany({
    where: { candidate_id: candidateId },
    orderBy: { date: "desc" },
    take: 80,
    select: {
      candidate_working_hour_uuid: true,
      date: true,
      start_time: true,
      end_time: true,
      total_time: true,
      status: true,
      via: true,
      note: true,
      store: { select: { store_name: true, company: { select: { company_name: true } } } }
    }
  });

  return rows.map((row) => ({
    id: row.candidate_working_hour_uuid,
    date: formatDate(row.date),
    store: row.store?.store_name ?? "No store",
    company: row.store?.company?.company_name ?? "No company",
    total: `${row.total_time ?? 0} minutes`,
    status: `Status ${row.status ?? 0}`,
    via: row.via ?? "Not set",
    note: row.note?.slice(0, 120) ?? ""
  }));
}

export async function getCandidateWorkLogDetail(candidateId: number, workLogUuid: string) {
  const [workLog, appeals, feedback] = await prisma.$transaction([
    prisma.candidate_working_hour.findFirst({
      where: { candidate_working_hour_uuid: workLogUuid, candidate_id: candidateId },
      select: {
        candidate_working_hour_uuid: true,
        date: true,
        start_time: true,
        end_time: true,
        total_time: true,
        status: true,
        via: true,
        note: true,
        start_location_lat: true,
        start_location_long: true,
        end_location_lat: true,
        end_location_long: true,
        created_at: true,
        updated_at: true,
        store: { select: { store_name: true, store_location: true, company: { select: { company_name: true } } } }
      }
    }),
    prisma.candidate_working_hour_appeal.findMany({
      where: { candidate_working_hour_uuid: workLogUuid, candidate_id: candidateId },
      orderBy: { created_at: "desc" },
      take: 8,
      select: { appeal_uuid: true, reason: true, status: true, created_at: true }
    }),
    prisma.candidate_work_log_feedback.findMany({
      where: { candidate_working_hour_uuid: workLogUuid, candidate_id: candidateId },
      orderBy: { created_at: "desc" },
      take: 8,
      select: { cwlf_uuid: true, note: true, reason: true, status: true, rating: true, created_at: true }
    })
  ]);

  return {
    workLog,
    metrics: [
      { label: "Total", value: `${workLog?.total_time ?? 0} minutes`, note: "Imported total time" },
      { label: "Status", value: `Status ${workLog?.status ?? 0}`, note: workLog?.via ?? "No source" },
      { label: "Appeals", value: appeals.length, note: "Appeal records linked to this log" },
      { label: "Feedback", value: feedback.length, note: "Feedback records linked to this log" }
    ],
    appeals: appeals.map((appeal) => ({
      id: appeal.appeal_uuid,
      title: `Status ${appeal.status}`,
      subtitle: appeal.reason?.slice(0, 180) ?? "No reason",
      meta: formatDate(appeal.created_at)
    })),
    feedback: feedback.map((item) => ({
      id: item.cwlf_uuid,
      title: item.reason ?? `Status ${item.status ?? 0}`,
      subtitle: item.note?.slice(0, 180) ?? "No note",
      meta: `${item.rating === true ? "Positive" : item.rating === false ? "Negative" : "No rating"} · ${formatDate(item.created_at)}`
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

  return getRequestDetail(requestUuid);
}

export async function getInspectorWorkspace(inspectorUuid: string) {
  const [inspector, idRequests, idCards, needsVerification, recentIdRequests] = await prisma.$transaction([
    prisma.inspector.findUnique({
      where: { inspector_uuid: inspectorUuid },
      select: { inspector_name: true, inspector_email: true }
    }),
    prisma.candidate_id_request.count(),
    prisma.candidate_id_card.count({ where: { deleted: 0 } }),
    prisma.candidate.count({ where: { deleted: 0, candidate_civil_need_verification: true } }),
    prisma.candidate_id_request.findMany({
      orderBy: { created_at: "desc" },
      take: 6,
      select: {
        cir_uuid: true,
        status: true,
        candidate_ids: true,
        created_at: true
      }
    })
  ]);

  return {
    inspector,
    metrics: [
      { label: "ID Requests", value: idRequests, note: "Verification request batches" },
      { label: "ID Cards", value: idCards, note: "Stored ID card records" },
      { label: "Needs Verification", value: needsVerification, note: "Candidates flagged for civil ID review" },
      { label: "Mode", value: "Review", note: "Inspector workspace" }
    ],
    requests: recentIdRequests.map((request) => ({
      id: request.cir_uuid,
      title: `Request ${request.cir_uuid.slice(0, 12)}`,
      subtitle: request.candidate_ids ? `${request.candidate_ids.length} chars of candidate ids` : "No candidates",
      meta: `${request.status ?? "pending"} · ${formatDate(request.created_at)}`
    }))
  };
}

export async function getInspectorIdRequestRows() {
  const rows = await prisma.candidate_id_request.findMany({
    orderBy: { created_at: "desc" },
    take: 80,
    select: {
      cir_uuid: true,
      candidate_ids: true,
      status: true,
      created_at: true,
      updated_at: true,
      staff_candidate_id_request_created_byTostaff: { select: { staff_name: true } },
      staff_candidate_id_request_updated_byTostaff: { select: { staff_name: true } }
    }
  });

  return rows.map((row) => ({
    id: row.cir_uuid,
    request: row.cir_uuid.slice(0, 18),
    candidates: row.candidate_ids ? row.candidate_ids.split(",").filter(Boolean).length : 0,
    status: row.status ?? "pending",
    createdBy: row.staff_candidate_id_request_created_byTostaff?.staff_name ?? "System",
    updatedBy: row.staff_candidate_id_request_updated_byTostaff?.staff_name ?? "System",
    created: formatDate(row.created_at),
    updated: formatDate(row.updated_at)
  }));
}

function parseCandidateIds(value: string | null | undefined) {
  if (!value) return [];
  return value
    .split(/[^0-9]+/)
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0);
}

export async function getInspectorIdRequestDetail(requestUuid: string) {
  const request = await prisma.candidate_id_request.findUnique({
    where: { cir_uuid: requestUuid },
    select: {
      cir_uuid: true,
      candidate_ids: true,
      status: true,
      created_at: true,
      updated_at: true,
      staff_candidate_id_request_created_byTostaff: { select: { staff_name: true, staff_email: true } },
      staff_candidate_id_request_updated_byTostaff: { select: { staff_name: true, staff_email: true } }
    }
  });

  const candidateIds = parseCandidateIds(request?.candidate_ids);
  const candidates = candidateIds.length
    ? await prisma.candidate.findMany({
        where: { candidate_id: { in: candidateIds } },
        select: {
          candidate_id: true,
          candidate_name: true,
          candidate_email: true,
          candidate_civil_need_verification: true,
          candidate_civil_expiry_date: true,
          candidate_status: true,
          approved: true
        }
      })
    : [];

  return {
    request,
    metrics: [
      { label: "Status", value: request?.status ?? "Missing", note: "Legacy ID request status" },
      { label: "Candidates", value: candidateIds.length, note: "IDs included in this batch" },
      { label: "Matched", value: candidates.length, note: "Candidate rows found in prod clone" },
      { label: "Updated", value: formatDate(request?.updated_at), note: request?.staff_candidate_id_request_updated_byTostaff?.staff_name ?? "System" }
    ],
    candidates: candidates.map((candidate) => ({
      id: candidate.candidate_id,
      title: candidate.candidate_name,
      subtitle: candidate.candidate_email,
      meta: `${candidate.candidate_civil_need_verification ? "Needs verification" : "No flag"} · expires ${formatDate(candidate.candidate_civil_expiry_date)}`
    }))
  };
}
