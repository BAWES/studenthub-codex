import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  INVITATION_STATUS_INVITED,
  INVITATION_STATUS_ACCEPTED,
  INVITATION_STATUS_REJECTED,
} from "@/modules/status-labels";
import {
  invitationListItemSchema,
  invitationActionResultSchema,
  listInvitationsResultSchema,
  invitationRequestSchema,
  invitationCompanySchema,
  type InvitationListItem,
} from "./schemas";

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
// Output schema: invitationRequestSchema
// ---------------------------------------------------------------------------

describe("invitationRequestSchema", () => {
  it("accepts valid request with company", () => {
    const request = {
      request_uuid: "request_xyz",
      request_position_title: "Software Engineer",
      company: { company_name: "Tech Corp" },
    };
    const result = invitationRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
  });

  it("accepts request with null company", () => {
    const request = {
      request_uuid: "request_xyz",
      request_position_title: null,
      company: null,
    };
    const result = invitationRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
  });

  it("accepts null request", () => {
    const result = invitationRequestSchema.safeParse(null);
    expect(result.success).toBe(true);
  });

  it("rejects request with missing request_uuid", () => {
    const request = {
      request_position_title: "Software Engineer",
      company: null,
    };
    const result = invitationRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: invitationListItemSchema
// ---------------------------------------------------------------------------

describe("invitationListItemSchema", () => {
  it("accepts valid item with full request", () => {
    const item = {
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
    const result = invitationListItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("accepts item with null request (deleted request)", () => {
    const item = {
      invitation_uuid: "invitation_def456",
      invitation_status: 1,
      invitation_created_at: null,
      invitation_app_seen_at: null,
      invitation_email_seen_at: new Date("2024-01-16"),
      request: null,
    };
    const result = invitationListItemSchema.safeParse(item);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.request).toBeNull();
    }
  });

  it("accepts item with null status", () => {
    const item = {
      invitation_uuid: "invitation_ghi789",
      invitation_status: null,
      invitation_created_at: new Date("2024-01-15"),
      invitation_app_seen_at: null,
      invitation_email_seen_at: null,
      request: null,
    };
    const result = invitationListItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("rejects item with missing uuid", () => {
    const item = {
      invitation_status: 0,
      invitation_created_at: null,
      invitation_app_seen_at: null,
      invitation_email_seen_at: null,
      request: null,
    };
    const result = invitationListItemSchema.safeParse(item);
    expect(result.success).toBe(false);
  });

  it("rejects item with non-number status", () => {
    const item = {
      invitation_uuid: "invitation_abc123",
      invitation_status: "pending",
      invitation_created_at: null,
      invitation_app_seen_at: null,
      invitation_email_seen_at: null,
      request: null,
    };
    const result = invitationListItemSchema.safeParse(item);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: invitationActionResultSchema
// ---------------------------------------------------------------------------

describe("invitationActionResultSchema", () => {
  it("accepts success result", () => {
    const result = invitationActionResultSchema.safeParse({
      success: true,
      message: "Invitation accepted successfully.",
    });
    expect(result.success).toBe(true);
  });

  it("accepts failure result", () => {
    const result = invitationActionResultSchema.safeParse({
      success: false,
      message: "Invitation not found.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects result with missing message", () => {
    const result = invitationActionResultSchema.safeParse({
      success: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects result with non-boolean success", () => {
    const result = invitationActionResultSchema.safeParse({
      success: "yes",
      message: "Something happened.",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: listInvitationsResultSchema (union)
// ---------------------------------------------------------------------------

describe("listInvitationsResultSchema", () => {
  it("accepts an array of items", () => {
    const data = [
      {
        invitation_uuid: "invitation_abc123",
        invitation_status: 0,
        invitation_created_at: new Date("2024-01-15"),
        invitation_app_seen_at: null,
        invitation_email_seen_at: null,
        request: null,
      },
    ];
    const result = listInvitationsResultSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("accepts a count number", () => {
    const result = listInvitationsResultSchema.safeParse(5);
    expect(result.success).toBe(true);
  });

  it("accepts zero count", () => {
    const result = listInvitationsResultSchema.safeParse(0);
    expect(result.success).toBe(true);
  });

  it("rejects empty array", () => {
    // Empty array is valid (no invitations found)
    const result = listInvitationsResultSchema.safeParse([]);
    expect(result.success).toBe(true);
  });

  it("rejects negative count", () => {
    const result = listInvitationsResultSchema.safeParse(-1);
    expect(result.success).toBe(false);
  });

  it("rejects invalid data type", () => {
    const result = listInvitationsResultSchema.safeParse("invalid");
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// InvitationListItem shape (via Zod output schema)
// ---------------------------------------------------------------------------

describe("InvitationListItem shape (via Zod)", () => {
  it("validates the expected fields with full request", () => {
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
    const parsed = invitationListItemSchema.safeParse(mock);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.invitation_uuid).toBe("invitation_abc123");
      expect(parsed.data.request?.request_position_title).toBe("Software Engineer Position");
      expect(parsed.data.request?.company?.company_name).toBe("Tech Corp");
    }
  });

  it("validates null request", () => {
    const mock: InvitationListItem = {
      invitation_uuid: "invitation_def456",
      invitation_status: 1,
      invitation_created_at: null,
      invitation_app_seen_at: null,
      invitation_email_seen_at: new Date("2024-01-16"),
      request: null,
    };
    const parsed = invitationListItemSchema.safeParse(mock);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.request).toBeNull();
    expect(parsed.data?.invitation_status).toBe(1);
  });
});
