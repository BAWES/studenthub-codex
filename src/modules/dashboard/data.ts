import { prisma } from "@/lib/prisma";

const moneyFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 3,
  minimumFractionDigits: 0
});

function formatMoney(value: unknown, currency = "KWD") {
  if (value === null || value === undefined) return "0";
  const normalized = typeof value === "object" && "toString" in value ? value.toString() : String(value);
  return `${moneyFormatter.format(Number(normalized))} ${currency}`;
}

function formatDate(value: Date | null | undefined) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(value);
}

function candidateStatus(status: number, approved: number, deleted: number) {
  if (deleted) return "Archived";
  if (approved === 0) return "Needs review";
  if (status === 10) return "Active";
  return `Status ${status}`;
}

function requestStatus(status: string | null | undefined) {
  if (!status) return "Unspecified";
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function getDashboardData() {
  const [
    candidateCount,
    companyCount,
    requestCount,
    transferCount,
    openCandidateCount,
    activeCompanyCount,
    recentCandidates,
    recentCompanies,
    recentRequests,
    recentTransfers,
    requestStatusGroups
  ] = await prisma.$transaction([
    prisma.candidate.count({ where: { deleted: 0 } }),
    prisma.company.count({ where: { deleted: 0 } }),
    prisma.request.count(),
    prisma.transfer.count({ where: { deleted: 0 } }),
    prisma.candidate.count({ where: { deleted: 0, approved: 0 } }),
    prisma.company.count({ where: { deleted: 0, company_approved_to_hire: true } }),
    prisma.candidate.findMany({
      where: { deleted: 0 },
      orderBy: { candidate_created_at: "desc" },
      take: 6,
      select: {
        candidate_id: true,
        candidate_name: true,
        candidate_email: true,
        candidate_status: true,
        approved: true,
        deleted: true,
        candidate_created_at: true,
        currency_code: true,
        candidate_hourly_rate: true
      }
    }),
    prisma.company.findMany({
      where: { deleted: 0 },
      orderBy: { company_created_at: "desc" },
      take: 6,
      select: {
        company_id: true,
        company_name: true,
        company_email: true,
        no_of_active_requests: true,
        company_approved_to_hire: true,
        company_created_at: true,
        currency_code: true,
        company_hourly_rate: true
      }
    }),
    prisma.request.findMany({
      orderBy: { request_created_datetime: "desc" },
      take: 6,
      select: {
        request_uuid: true,
        request_position_title: true,
        request_status: true,
        request_number_of_employees: true,
        request_created_datetime: true,
        company: {
          select: {
            company_name: true
          }
        }
      }
    }),
    prisma.transfer.findMany({
      where: { deleted: 0 },
      orderBy: { transfer_created_at: "desc" },
      take: 6,
      select: {
        transfer_id: true,
        total: true,
        company_total: true,
        transfer_status: true,
        start_date: true,
        end_date: true,
        currency_code: true,
        company: {
          select: {
            company_name: true
          }
        }
      }
    }),
    prisma.request.groupBy({
      by: ["request_status"],
      _count: {
        _all: true
      },
      orderBy: {
        request_status: "asc"
      }
    })
  ]);

  return {
    metrics: [
      { label: "Candidates", value: candidateCount, note: `${openCandidateCount} need review` },
      { label: "Companies", value: companyCount, note: `${activeCompanyCount} approved to hire` },
      { label: "Requests", value: requestCount, note: "Hiring demand pipeline" },
      { label: "Transfers", value: transferCount, note: "Payroll and invoice runs" }
    ],
    statusMix: requestStatusGroups
      .map((group) => {
        const count = typeof group._count === "object" && group._count ? group._count._all ?? 0 : 0;
        return {
          label: requestStatus(group.request_status),
          value: count
        };
      })
      .sort((a, b) => b.value - a.value),
    recentCandidates: recentCandidates.map((candidate) => ({
      id: candidate.candidate_id,
      title: candidate.candidate_name,
      subtitle: candidate.candidate_email,
      meta: candidateStatus(candidate.candidate_status, candidate.approved, candidate.deleted),
      amount: formatMoney(candidate.candidate_hourly_rate, candidate.currency_code ?? "KWD"),
      date: formatDate(candidate.candidate_created_at)
    })),
    recentCompanies: recentCompanies.map((company) => ({
      id: company.company_id,
      title: company.company_name,
      subtitle: company.company_email ?? "No email",
      meta: company.company_approved_to_hire ? "Approved" : "Not approved",
      amount: formatMoney(company.company_hourly_rate, company.currency_code ?? "KWD"),
      date: formatDate(company.company_created_at),
      count: company.no_of_active_requests ?? 0
    })),
    recentRequests: recentRequests.map((request) => ({
      id: request.request_uuid,
      title: request.request_position_title ?? "Untitled request",
      subtitle: request.company?.company_name ?? "No company",
      meta: requestStatus(request.request_status),
      count: request.request_number_of_employees ?? 0,
      date: formatDate(request.request_created_datetime)
    })),
    recentTransfers: recentTransfers.map((transfer) => ({
      id: transfer.transfer_id,
      title: transfer.company?.company_name ?? `Transfer #${transfer.transfer_id}`,
      subtitle: `${formatDate(transfer.start_date)} to ${formatDate(transfer.end_date)}`,
      meta: `Status ${transfer.transfer_status}`,
      amount: formatMoney(transfer.total ?? transfer.company_total, transfer.currency_code ?? "KWD")
    }))
  };
}
