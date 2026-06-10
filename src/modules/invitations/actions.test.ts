import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  INVITATION_STATUS_INVITED,
  INVITATION_STATUS_ACCEPTED,
  INVITATION_STATUS_REJECTED,
} from "@/modules/status-labels";

// ---------------------------------------------------------------------------
// Schema definitions (extracted from the server action for unit testing)
// ---------------------------------------------------------------------------

const listInvitationsSchema = z.object({
  status: z.number().int().min(0).max(2).optional(),
  onlyCount: z.boolean().optional(),
});

const respondInvitationSchema = z.object({
  invitationUuid: z.string().min(1, "Invitation UUID is required"),
  action: z.enum(["accept", "reject"], {
    errorMap: () => ({ message: 'Action must be "accept" or "reject"' }),
  }),
});

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export type InvitationListItem = {
  invitation_uuid: string;
  invitation_status: number;
  invitation_created_at: Date | null;
  invitation_app_seen_at: Date | null;
  invitation_email_seen_at: Date | null;
  request: {
    request_uuid: string;
    request_position_title: string | null;
    company: {
      company_name: string | null;
    } | null;
  } | null;
};

// ---------------------------------------------------------------------------
// listInvitationsSchema
// ---------------------------------------------------------------------------

describe("listInvitationsSchema", () => {
  it("accepts empty params", () => {
    const result = listInvitationsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBeUndefined();
      expect(result.data.onlyCount).toBeUndefined();
    }
  });

  it("accepts valid status filter", () => {
    const result = listInvitationsSchema.safeParse({ status: 0 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(0);
    }
  });

  it("accepts onlyCount flag", () => {
    const result = listInvitationsSchema.safeParse({ onlyCount: true });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.onlyCount).toBe(true);
    }
  });

  it("rejects negative status", () => {
    const result = listInvitationsSchema.safeParse({ status: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects out-of-range status (>2)", () => {
    const result = listInvitationsSchema.safeParse({ status: 3 });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric status", () => {
    const result = listInvitationsSchema.safeParse({ status: "abc" });
    expect(result.success).toBe(false);
  });

  it("accepts status INVITED (0)", () => {
    const result = listInvitationsSchema.safeParse({ status: INVITATION_STATUS_INVITED });
    expect(result.success).toBe(true);
  });

  it("accepts status ACCEPTED (1)", () => {
    const result = listInvitationsSchema.safeParse({ status: INVITATION_STATUS_ACCEPTED });
    expect(result.success).toBe(true);
  });

  it("accepts status REJECTED (2)", () => {
    const result = listInvitationsSchema.safeParse({ status: INVITATION_STATUS_REJECTED });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// respondInvitationSchema
// ---------------------------------------------------------------------------

describe("respondInvitationSchema", () => {
  it("accepts valid accept action", () => {
    const result = respondInvitationSchema.safeParse({
      invitationUuid: "invitation_abc123",
      action: "accept",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid reject action", () => {
    const result = respondInvitationSchema.safeParse({
      invitationUuid: "invitation_abc123",
      action: "reject",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing invitationUuid", () => {
    const result = respondInvitationSchema.safeParse({ action: "accept" });
    expect(result.success).toBe(false);
  });

  it("rejects empty invitationUuid", () => {
    const result = respondInvitationSchema.safeParse({
      invitationUuid: "",
      action: "accept",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid action", () => {
    const result = respondInvitationSchema.safeParse({
      invitationUuid: "invitation_abc123",
      action: "maybe",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing action", () => {
    const result = respondInvitationSchema.safeParse({
      invitationUuid: "invitation_abc123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects null action", () => {
    const result = respondInvitationSchema.safeParse({
      invitationUuid: "invitation_abc123",
      action: null,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// InvitationListItem type shape
// ---------------------------------------------------------------------------

describe("InvitationListItem shape", () => {
  it("defines the expected fields", () => {
    const mock: InvitationListItem = {
      invitation_uuid: "invitation_abc123",
      invitation_status: 0,
      invitation_created_at: new Date("2024-01-15"),
      invitation_app_seen_at: null,
      invitation_email_seen_at: null,
      request: {
        request_uuid: "request_xyz",
        request_position_title: "Software Engineer Position",
        company: {
          company_name: "Tech Corp",
        },
      },
    };
    expect(mock.invitation_uuid).toBe("invitation_abc123");
    expect(mock.invitation_status).toBe(0);
    expect(mock.request?.request_position_title).toBe("Software Engineer Position");
    expect(mock.request?.company?.company_name).toBe("Tech Corp");
  });

  it("allows null request (deleted request)", () => {
    const mock: InvitationListItem = {
      invitation_uuid: "invitation_def456",
      invitation_status: 1,
      invitation_created_at: null,
      invitation_app_seen_at: null,
      invitation_email_seen_at: new Date("2024-01-16"),
      request: null,
    };
    expect(mock.request).toBeNull();
    expect(mock.invitation_status).toBe(1);
  });
});
