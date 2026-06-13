"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { getWorkspaceDataSchema } from "@/app/company/workspace/schemas";
import type {
  GetWorkspaceDataInput,
  WorkspaceOverviewData,
} from "@/app/company/workspace/schemas";

import {
  workspaceOverviewOutputSchema,
} from "@/app/company/schemas";

// ---------------------------------------------------------------------------
// Get Company Workspace Overview
// ---------------------------------------------------------------------------

/**
 * Fetch the company workspace overview for a given contact UUID.
 * Returns contact info, aggregate metrics, linked companies, and recent requests.
 * Called from company/workspace page.
 */
export async function getCompanyWorkspace(
  input: GetWorkspaceDataInput,
): Promise<WorkspaceOverviewData> {
  await requireCapability("company.read");

  const parsed = getWorkspaceDataSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid contact UUID");
  }

  const { contactUuid } = parsed.data;

  const contact = await prisma.contact.findUnique({
    where: { contact_uuid: contactUuid },
    select: { contact_name: true, contact_email: true },
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
          company_approved_to_hire: true,
        },
      },
    },
  });

  const companyIds = companyLinks
    .map((link) => link.company?.company_id)
    .filter((id): id is number => Boolean(id));

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
        company: { select: { company_name: true } },
      },
    }),
  ]);

  const result: WorkspaceOverviewData = {
    contact: contact
      ? { contact_name: contact.contact_name, contact_email: contact.contact_email ?? "" }
      : null,
    metrics: [
      { label: "Companies", value: companyIds.length, note: "Companies linked to this contact" },
      { label: "Requests", value: requests, note: "Hiring requests across linked companies" },
      { label: "Stores", value: stores, note: "Active stores in the account" },
      { label: "Notes", value: notes, note: "Internal/customer notes connected to account" },
    ],
    companies: companyLinks.map((link) => ({
      id: link.company_contact_uuid,
      title: link.company?.company_name ?? "Unknown company",
      subtitle: link.contact_position ?? "Contact",
      meta: link.allow_access ? "Access allowed" : "Access disabled",
    })),
    requests: recentRequests.map((request) => ({
      id: request.request_uuid,
      title: request.request_position_title ?? "Untitled request",
      subtitle: request.company?.company_name ?? "No company",
      meta: `${request.request_status ?? "No status"} · ${request.request_number_of_employees ?? 0} seats`,
    })),
  };

  // Validate output shape
  const validated = workspaceOverviewOutputSchema.safeParse(result);
  if (!validated.success) {
    console.error(
      "[company/workspace] getCompanyWorkspace output validation failed:",
      validated.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// Refresh Workspace Cache
// ---------------------------------------------------------------------------

/**
 * Revalidate the company workspace page cache.
 * Called after mutations that affect workspace data.
 */
export async function revalidateWorkspace() {
  revalidatePath("/company/workspace", "page");
}
