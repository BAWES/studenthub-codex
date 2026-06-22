"use server";

// ---------------------------------------------------------------------------
// Candidate Invitation [id] — server actions for the detail page
// ---------------------------------------------------------------------------
// Convenience wrappers that delegate to module-level actions.
//
// Actions:
//   - getInvitation          — single invitation detail (delegates to parent)
//   - acceptInvitation       — accept an invitation (delegates to module)
//   - declineInvitation      — decline an invitation with optional reason
// ---------------------------------------------------------------------------

import { z } from "zod";
import {
  getCandidateInvitationDetail as parentGetInvitationDetail,
} from "../actions";
import type {
  GetInvitationDetailResult,
} from "../schemas";
import {
  getInvitationSchema,
  acceptInvitationSchema,
  declineInvitationSchema,
  invitationActionResultSchema,
} from "./schemas";
import type {
  AcceptInvitationInput,
  DeclineInvitationInput,
  InvitationActionResponse,
} from "./schemas";

// Module-level implementations (handles Prisma queries, status checks, notes)
import {
  acceptInvitation as moduleAcceptInvitation,
  rejectInvitation as moduleRejectInvitation,
} from "@/modules/invitations/actions";

// ---------------------------------------------------------------------------
// Re-export schemas types so consumers have a single import path
// ---------------------------------------------------------------------------
export type {
  GetInvitationDetailResult,
} from "../schemas";
export type {
  AcceptInvitationInput,
  DeclineInvitationInput,
  InvitationActionResponse,
} from "./schemas";

// ---------------------------------------------------------------------------
// getInvitation
// ---------------------------------------------------------------------------

/**
 * Get a single invitation with full detail (request, company, staff, story,
 * notes). Delegates to the parent `getCandidateInvitationDetail` action.
 */
export async function getInvitation(
  invitationUuid: string,
): Promise<GetInvitationDetailResult> {
  const parsed = getInvitationSchema.safeParse({ invitationUuid });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid invitation UUID");
  }

  return parentGetInvitationDetail(parsed.data);
}

// ---------------------------------------------------------------------------
// acceptInvitation
// ---------------------------------------------------------------------------

/**
 * Accept an invitation. Delegates to the module-level acceptInvitation which
 * handles Prisma queries, status checks, and note creation.
 *
 * Returns `{ success: boolean, error?: string }`.
 */
export async function acceptInvitation(
  input: AcceptInvitationInput,
): Promise<InvitationActionResponse> {
  const parsed = acceptInvitationSchema.safeParse(input);
  if (!parsed.success) {
    return invitationActionResultSchema.parse({
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    });
  }

  const moduleResult = await moduleAcceptInvitation({
    invitationUuid: parsed.data.invitationUuid,
    action: "accept",
  });

  // Map the module's { success, message } shape to this route's { success, error } shape
  const result: InvitationActionResponse = moduleResult.success
    ? { success: true }
    : { success: false, error: moduleResult.message ?? "Failed to accept invitation" };

  // Validate output shape
  const outputParsed = invitationActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/invitations/[id]] acceptInvitation output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// declineInvitation
// ---------------------------------------------------------------------------

/**
 * Decline an invitation with an optional reason. Delegates to the module-level
 * rejectInvitation which handles Prisma queries, status checks, and note creation.
 *
 * Returns `{ success: boolean, error?: string }`.
 */
export async function declineInvitation(
  input: DeclineInvitationInput,
): Promise<InvitationActionResponse> {
  const parsed = declineInvitationSchema.safeParse(input);
  if (!parsed.success) {
    return invitationActionResultSchema.parse({
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    });
  }

  const moduleResult = await moduleRejectInvitation({
    invitationUuid: parsed.data.invitationUuid,
    action: "reject",
    reason: parsed.data.reason,
  });

  // Map the module's { success, message } shape to this route's { success, error } shape
  const result: InvitationActionResponse = moduleResult.success
    ? { success: true }
    : { success: false, error: moduleResult.message ?? "Failed to decline invitation" };

  // Validate output shape
  const outputParsed = invitationActionResultSchema.safeParse(result);
  if (!outputParsed.success) {
    console.error(
      "[candidate/invitations/[id]] declineInvitation output validation failed:",
      outputParsed.error.issues,
    );
  }

  return result;
}
