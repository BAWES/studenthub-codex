import { describe, it, expect } from "vitest";
import {
  listInvitationsSchema,
  getInvitationDetailSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listInvitationsSchema
// ---------------------------------------------------------------------------

describe("listInvitationsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listInvitationsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const result = listInvitationsSchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    const result = listInvitationsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listInvitationsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero page (must be positive)", () => {
    const result = listInvitationsSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getInvitationDetailSchema
// ---------------------------------------------------------------------------

describe("getInvitationDetailSchema", () => {
  it("accepts a valid UUID", () => {
    const result = getInvitationDetailSchema.safeParse({
      invitationUuid: "abc-123-def-456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.invitationUuid).toBe("abc-123-def-456");
    }
  });

  it("rejects empty UUID", () => {
    const result = getInvitationDetailSchema.safeParse({ invitationUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getInvitationDetailSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shape tests (compile-time documentation)
// ---------------------------------------------------------------------------

type InvitationRow = {
  invitation_uuid: string;
  invitation_status: number | null;
  invitation_app_seen_at: Date | null;
  invitation_email_seen_at: Date | null;
  invitation_created_at: Date | null;
  position_title: string | null;
  compensation: string | null;
  company_name: string | null;
};

type ListInvitationsResult = {
  items: InvitationRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type GetInvitationDetailResult = {
  invitation: {
    invitation_uuid: string;
    invitation_status: number | null;
    invitation_app_seen_at: Date | null;
    invitation_email_seen_at: Date | null;
    invitation_seen_via: string | null;
    invitation_created_at: Date | null;
    invitation_updated_at: Date | null;
    request: {
      request_uuid: string;
      request_position_title: string | null;
      request_job_description: string | null;
      request_compensation: string | null;
      request_location: string | null;
      request_number_of_employees: number | null;
      request_status: string | null;
      company_name: string | null;
      company_email: string | null;
      staff_name: string | null;
      staff_email: string | null;
    };
    story_uuid: string | null;
    story_status: number | null;
    story_last_updated_at: Date | null;
  } | null;
  metrics: { label: string; value: string | number; note: string }[];
  notes: { id: string; title: string; subtitle: string; meta: string }[];
};

describe("InvitationRow shape", () => {
  it("defines the expected fields", () => {
    const mock: InvitationRow = {
      invitation_uuid: "abc-123-def-456",
      invitation_status: 1,
      invitation_app_seen_at: new Date("2026-06-01"),
      invitation_email_seen_at: null,
      invitation_created_at: new Date("2026-06-01"),
      position_title: "Software Engineer",
      compensation: "$100k",
      company_name: "Acme Corp",
    };
    expect(mock.invitation_uuid).toBe("abc-123-def-456");
    expect(mock.position_title).toBe("Software Engineer");
    expect(mock.company_name).toBe("Acme Corp");
  });
});

describe("ListInvitationsResult shape", () => {
  it("accepts a valid result set", () => {
    const result: ListInvitationsResult = {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.items).toHaveLength(0);
  });
});

describe("GetInvitationDetailResult shape", () => {
  it("accepts a valid detail result", () => {
    const now = new Date();
    const result: GetInvitationDetailResult = {
      invitation: {
        invitation_uuid: "abc-123",
        invitation_status: 1,
        invitation_app_seen_at: now,
        invitation_email_seen_at: null,
        invitation_seen_via: "app",
        invitation_created_at: now,
        invitation_updated_at: now,
        request: {
          request_uuid: "req-123",
          request_position_title: "Engineer",
          request_job_description: "Build things",
          request_compensation: "$100k",
          request_location: "Remote",
          request_number_of_employees: 5,
          request_status: "started",
          company_name: "Acme Corp",
          company_email: "hr@acme.com",
          staff_name: "John Doe",
          staff_email: "john@acme.com",
        },
        story_uuid: "story-123",
        story_status: 1,
        story_last_updated_at: now,
      },
      metrics: [
        { label: "Status", value: "Status 1", note: "Legacy status" },
      ],
      notes: [
        {
          id: "note-123",
          title: "Note",
          subtitle: "Some text",
          meta: "2026-06-01",
        },
      ],
    };
    expect(result.invitation?.invitation_uuid).toBe("abc-123");
    expect(result.metrics).toHaveLength(1);
    expect(result.notes).toHaveLength(1);
  });

  it("accepts null invitation (not found)", () => {
    const result: GetInvitationDetailResult = {
      invitation: null,
      metrics: [
        { label: "Status", value: "Missing", note: "Legacy invitation status" },
        { label: "Seats", value: 0, note: "Requested headcount" },
        { label: "Seen", value: "No", note: "No seen source" },
        { label: "Request", value: "No status", note: "Linked request status" },
      ],
      notes: [],
    };
    expect(result.invitation).toBeNull();
    expect(result.notes).toHaveLength(0);
  });
});
