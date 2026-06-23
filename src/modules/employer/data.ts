"use server";

import { prisma } from "@/lib/prisma";

export type EmployerApplicationRow = {
  id: string;
  jobTitle: string;
  candidateName: string | null;
  status: string;
  createdAt: Date;
};

export type EmployerApplicationsData = {
  applications: EmployerApplicationRow[];
  total: number;
  metrics: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
};

const APPLICATION_STATUS_MAP: Record<number, string> = {
  0: "Pending",
  1: "Accepted",
  2: "Rejected",
};

async function getCompanyIds(contactUuid: string): Promise<number[]> {
  const links = await prisma.company_contact.findMany({
    where: { contact_uuid: contactUuid, allow_access: true },
    select: { company_id: true },
  });
  return links
    .filter((l) => l.company_id !== null)
    .map((l) => l.company_id as number);
}

export async function getEmployerApplicationsData(
  contactUuid: string
): Promise<EmployerApplicationsData> {
  const companyIds = await getCompanyIds(contactUuid);

  if (companyIds.length === 0) {
    return {
      applications: [],
      total: 0,
      metrics: { total: 0, pending: 0, accepted: 0, rejected: 0 },
    };
  }

  // Get all request UUIDs for this company
  const requests = await prisma.request.findMany({
    where: { company_id: { in: companyIds } },
    select: { request_uuid: true, request_position_title: true },
  });

  const requestUuids = requests.map((r) => r.request_uuid);
  const requestTitleMap = new Map(
    requests.map((r) => [r.request_uuid, r.request_position_title])
  );

  if (requestUuids.length === 0) {
    return {
      applications: [],
      total: 0,
      metrics: { total: 0, pending: 0, accepted: 0, rejected: 0 },
    };
  }

  // Fetch all applications for those requests
  const apps = await prisma.request_application.findMany({
    where: { request_uuid: { in: requestUuids } },
    orderBy: { created_at: "desc" },
    take: 100,
    select: {
      application_uuid: true,
      request_uuid: true,
      candidate_id: true,
      status: true,
      created_at: true,
      candidate: {
        select: { candidate_name: true },
      },
    },
  });

  const applications: EmployerApplicationRow[] = apps.map((app) => {
    const statusNum = app.status ?? 0;
    return {
      id: app.application_uuid,
      jobTitle: requestTitleMap.get(app.request_uuid) ?? "Unknown Position",
      candidateName: app.candidate?.candidate_name ?? null,
      status: APPLICATION_STATUS_MAP[statusNum] ?? `Status ${statusNum}`,
      createdAt: app.created_at ?? new Date(),
    };
  });

  const pending = apps.filter((a) => (a.status ?? 0) === 0).length;
  const accepted = apps.filter((a) => a.status === 1).length;
  const rejected = apps.filter((a) => a.status === 2).length;

  return {
    applications,
    total: applications.length,
    metrics: {
      total: applications.length,
      pending,
      accepted,
      rejected,
    },
  };
}
