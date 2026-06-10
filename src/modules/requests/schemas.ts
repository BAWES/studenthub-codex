import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas for src/modules/requests invitation-actions
// ---------------------------------------------------------------------------

export const getInvitationSchema = z.object({
  invitationId: z.string().min(1, "Invitation UUID is required"),
});

export const getInvitationLogSchema = z.object({
  invitationId: z.string().min(1, "Invitation UUID is required"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const markInvitationLogViewedSchema = z.object({
  invitationId: z.string().min(1, "Invitation UUID is required"),
});

export const listInvitationsSchema = z.object({
  candidateId: z.coerce.number().int().positive().optional(),
  requestUuid: z.string().optional(),
  storyUuid: z.string().optional(),
  invitationStatus: z.coerce.number().int().optional(),
  staffId: z.coerce.number().int().optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format").optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format").optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type InvitationDetail = {
  invitationUuid: string;
  candidateId: number | null;
  requestUuid: string;
  storyUuid: string | null;
  invitationStatus: number | null;
  invitationAppSeenAt: string | null;
  invitationEmailSeenAt: string | null;
  invitationSeenIn: number | null;
  invitationSeenVia: string | null;
  invitationCreatedByStaff: number | null;
  invitationUpdatedByStaff: number | null;
  invitationCreatedByCompany: number | null;
  invitationUpdatedByCompany: number | null;
  invitationCreatedAt: string | null;
  invitationUpdatedAt: string | null;
  jobInterestUuid: string | null;
  candidateName: string | null;
  candidateEmail: string | null;
  requestTitle: string | null;
  storyTitle: string | null;
};

export type InvitationLogEntry = {
  noteUuid: string;
  noteType: string | null;
  noteText: string | null;
  createdBy: number | null;
  createdAt: string;
};

export type InvitationLogResult = {
  logs: InvitationLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ListInvitationsParams = z.input<typeof listInvitationsSchema>;

export type InvitationRow = {
  invitationUuid: string;
  candidateId: number | null;
  requestUuid: string;
  storyUuid: string | null;
  invitationStatus: number | null;
  invitationCreatedAt: string | null;
  candidateName: string | null;
  requestTitle: string | null;
};

export type ListInvitationsResult = {
  invitations: InvitationRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
