"use server";

// ---------------------------------------------------------------------------
// Candidate Invitations — server actions for /candidate/invitations
// ---------------------------------------------------------------------------
// Route-level wrappers that delegate to modules/invitations for listing and
// viewing candidate invitations.
// ---------------------------------------------------------------------------

import { requireCapability } from "@/modules/auth/session";
import {
  listInvitations as moduleListInvitations,
  getInvitationDetail as moduleGetInvitationDetail,
} from "@/modules/invitations/actions";
import {
  listInvitationsSchema,
  getInvitationDetailSchema,
  listInvitationsResultOutputSchema,
  getInvitationDetailResultOutputSchema,
  type ListInvitationsParams,
  type GetInvitationDetailParams,
  type ListInvitationsResult,
  type GetInvitationDetailResult,
} from "./schemas";

// Re-export types for client components
export type { InvitationRow, ListInvitationsResult, GetInvitationDetailResult } from "./schemas";

// ---------------------------------------------------------------------------
// Server actions — delegate to module-level implementations
// ---------------------------------------------------------------------------

/**
 * List invitations for the current candidate.
 * Delegates to modules/invitations with the session's candidate ID.
 */
export async function listCandidateInvitations(
  params: ListInvitationsParams = {},
): Promise<ListInvitationsResult> {
  await requireCapability("candidate.read.own");

  const parsed = listInvitationsSchema.safeParse(params);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  const { page, limit } = parsed.data;

  const moduleResult = await moduleListInvitations({});

  // Module returns InvitationListItem[] | number — we don't set onlyCount so it's always an array
  if (!Array.isArray(moduleResult)) {
    return { items: [], total: 0, page, limit, totalPages: 0 };
  }

  // Map module InvitationListItem[] → app router InvitationRow[]
  const allItems = moduleResult.map((inv) => ({
    invitation_uuid: inv.invitation_uuid,
    invitation_status: inv.invitation_status,
    invitation_app_seen_at: inv.invitation_app_seen_at,
    invitation_email_seen_at: inv.invitation_email_seen_at,
    invitation_created_at: inv.invitation_created_at,
    position_title: inv.request?.request_position_title ?? null,
    compensation: null,
    company_name: inv.request?.company?.company_name ?? null,
  }));

  // Apply pagination at the app layer (module doesn't support it)
  const offset = (page - 1) * limit;
  const items = allItems.slice(offset, offset + limit);

  const result = {
    items,
    total: allItems.length,
    page,
    limit,
    totalPages: Math.ceil(allItems.length / limit),
  };

  // Validate output shape
  const outputParsed = listInvitationsResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/invitations] listCandidateInvitations output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

/**
 * Get a single invitation by UUID for the current candidate.
 * Inline implementation — module doesn't have a getDetail equivalent.
 */
export async function getCandidateInvitationDetail(
  params: GetInvitationDetailParams,
): Promise<GetInvitationDetailResult> {
  const session = await requireCapability("candidate.read.own");

  const parsed = getInvitationDetailSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { invitationUuid } = parsed.data;
  const candidateId = Number(session.id);

  // Delegate to module-level implementation
  const result = await moduleGetInvitationDetail(invitationUuid, candidateId);

  // Validate output shape
  const outputParsed = getInvitationDetailResultOutputSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/invitations] getCandidateInvitationDetail output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
