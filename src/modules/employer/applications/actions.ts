"use server";

import { requireCapability } from "@/modules/auth/session";
import { listJobApplicationsByEmployer } from "@/modules/employer/jobs/[id]/applications/actions";
import { listEmployerApplicationsSchema } from "./schemas";
import type { ListEmployerApplicationsInput, EmployerApplicationRow } from "./schemas";

// ---------------------------------------------------------------------------
// Output type from the module-level action
// ---------------------------------------------------------------------------

type EmployerApplicationsResult = {
  success: true;
  applications: EmployerApplicationRow[];
  total: number;
  metrics: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
};

/**
 * List all applications across all jobs for the current employer.
 * Wraps listJobApplicationsByEmployer with metric calculations.
 */
export async function listEmployerApplications(
  input: ListEmployerApplicationsInput,
): Promise<EmployerApplicationsResult> {
  await requireCapability("company.read.linked");

  const parsed = listEmployerApplicationsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: true,
      applications: [],
      total: 0,
      metrics: { total: 0, pending: 0, accepted: 0, rejected: 0 },
    };
  }

  const { page, limit, status } = parsed.data;

  const result = await listJobApplicationsByEmployer({ page, limit, status });

  return {
    success: true,
    applications: result.applications.map((app) => ({
      id: app.applicationId,
      jobTitle: app.jobTitle,
      candidateName: app.candidateName,
      status: app.status,
      createdAt: app.createdAt,
    })),
    total: result.total,
    metrics: computeMetrics(result.applications),
  };
}

// ---------------------------------------------------------------------------
// Metric computation helper
// ---------------------------------------------------------------------------

function computeMetrics(
  applications: { status: string }[],
): EmployerApplicationsResult["metrics"] {
  const total = applications.length;
  const pending = applications.filter((a) =>
    ["applied", "pending_review", "shortlisted"].includes(a.status),
  ).length;
  const accepted = applications.filter((a) => a.status === "accepted").length;
  const rejected = applications.filter((a) =>
    ["rejected", "declined"].includes(a.status),
  ).length;

  return { total, pending, accepted, rejected };
}
