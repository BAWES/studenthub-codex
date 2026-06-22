import { describe, it, expect } from "vitest";
import {
  listInvitationsSchema,
  getInvitationDetailSchema,
  invitationRowOutputSchema,
  listInvitationsResultOutputSchema,
  getInvitationDetailResultOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listInvitationsSchema
// ---------------------------------------------------------------------------
describe("listInvitationsSchema", () => {
  it("accepts empty input with defaults", () => {
    expect(listInvitationsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit values", () => {
    expect(listInvitationsSchema.safeParse({ page: 2, limit: 50 }).success).toBe(true);
  });

  it("rejects limit below 1", () => {
    expect(listInvitationsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listInvitationsSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects page below 1", () => {
    expect(listInvitationsSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects non-numeric limit", () => {
    expect(listInvitationsSchema.safeParse({ limit: "abc" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getInvitationDetailSchema
// ---------------------------------------------------------------------------
describe("getInvitationDetailSchema", () => {
  it("accepts valid input", () => {
    expect(
      getInvitationDetailSchema.safeParse({ invitationUuid: "uuid-12345" }).success,
    ).toBe(true);
  });

  it("rejects missing invitationUuid", () => {
    expect(getInvitationDetailSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty invitationUuid", () => {
    expect(getInvitationDetailSchema.safeParse({ invitationUuid: "" }).success).toBe(false);
  });

  it("rejects non-string invitationUuid", () => {
    expect(getInvitationDetailSchema.safeParse({ invitationUuid: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// invitationRowOutputSchema (output)
// ---------------------------------------------------------------------------
describe("invitationRowOutputSchema", () => {
  const validRow = {
    invitation_uuid: "uuid-12345",
    invitation_status: 1,
    invitation_app_seen_at: new Date("2024-01-01"),
    invitation_email_seen_at: new Date("2024-01-02"),
    invitation_created_at: new Date("2024-01-03"),
    position_title: "Engineer",
    compensation: "$100k",
    company_name: "ACME Corp",
  };

  it("accepts a valid row", () => {
    expect(invitationRowOutputSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    expect(
      invitationRowOutputSchema.safeParse({
        ...validRow,
        invitation_status: null,
        invitation_app_seen_at: null,
        invitation_email_seen_at: null,
        invitation_created_at: null,
        position_title: null,
        compensation: null,
        company_name: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing invitation_uuid", () => {
    const { invitation_uuid: _, ...rest } = validRow;
    expect(invitationRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-date invitation_app_seen_at", () => {
    expect(
      invitationRowOutputSchema.safeParse({ ...validRow, invitation_app_seen_at: "2024-01-01" }).success,
    ).toBe(false);
  });

  it("rejects non-integer invitation_status", () => {
    expect(
      invitationRowOutputSchema.safeParse({ ...validRow, invitation_status: 1.5 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listInvitationsResultOutputSchema (output)
// ---------------------------------------------------------------------------
describe("listInvitationsResultOutputSchema", () => {
  const validResult = {
    items: [
      {
        invitation_uuid: "uuid-1",
        invitation_status: 1,
        invitation_app_seen_at: new Date("2024-01-01"),
        invitation_email_seen_at: null,
        invitation_created_at: null,
        position_title: "Engineer",
        compensation: null,
        company_name: "ACME",
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid result", () => {
    expect(listInvitationsResultOutputSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      listInvitationsResultOutputSchema.safeParse({ ...validResult, items: [], total: 0, totalPages: 0 }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validResult;
    expect(listInvitationsResultOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = validResult;
    expect(listInvitationsResultOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing page", () => {
    const { page: _, ...rest } = validResult;
    expect(listInvitationsResultOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-integer total", () => {
    expect(
      listInvitationsResultOutputSchema.safeParse({ ...validResult, total: 1.5 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getInvitationDetailResultOutputSchema (output)
// ---------------------------------------------------------------------------
describe("getInvitationDetailResultOutputSchema", () => {
  const validDetail = {
    invitation: {
      invitation_uuid: "uuid-1",
      invitation_status: 1,
      invitation_app_seen_at: new Date("2024-01-01"),
      invitation_email_seen_at: null,
      invitation_seen_via: "email",
      invitation_created_at: null,
      invitation_updated_at: null,
      request: {
        request_uuid: "req-uuid-1",
        request_position_title: "Engineer",
        request_job_description: "Build things",
        request_compensation: "$100k",
        request_location: "Remote",
        request_number_of_employees: 50,
        request_status: "active",
        company_name: "ACME",
        company_email: "hr@acme.com",
        staff_name: "John",
        staff_email: "john@acme.com",
      },
      story_uuid: null,
      story_status: null,
      story_last_updated_at: null,
    },
    metrics: [{ label: "Total", value: "$100k", note: "Compensation" }],
    notes: [{ id: "1", title: "Note", subtitle: "Sub", meta: "Meta" }],
  };

  it("accepts a valid detail", () => {
    expect(getInvitationDetailResultOutputSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts null invitation", () => {
    expect(
      getInvitationDetailResultOutputSchema.safeParse({
        ...validDetail,
        invitation: null,
      }).success,
    ).toBe(true);
  });

  it("accepts empty arrays", () => {
    expect(
      getInvitationDetailResultOutputSchema.safeParse({
        ...validDetail,
        metrics: [],
        notes: [],
      }).success,
    ).toBe(true);
  });

  it("accepts number value in metrics", () => {
    expect(
      getInvitationDetailResultOutputSchema.safeParse({
        ...validDetail,
        metrics: [{ label: "Count", value: 42, note: "Number" }],
      }).success,
    ).toBe(true);
  });

  it("rejects missing invitation", () => {
    const { invitation: _, ...rest } = validDetail;
    expect(getInvitationDetailResultOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing metrics", () => {
    const { metrics: _, ...rest } = validDetail;
    expect(getInvitationDetailResultOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing notes", () => {
    const { notes: _, ...rest } = validDetail;
    expect(getInvitationDetailResultOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects boolean value in metrics", () => {
    expect(
      getInvitationDetailResultOutputSchema.safeParse({
        ...validDetail,
        metrics: [{ label: "X", value: true, note: "" }],
      }).success,
    ).toBe(false);
  });

  it("rejects non-integer request_number_of_employees", () => {
    expect(
      getInvitationDetailResultOutputSchema.safeParse({
        ...validDetail,
        invitation: {
          ...validDetail.invitation!,
          request: { ...validDetail.invitation!.request, request_number_of_employees: 50.5 },
        },
      }).success,
    ).toBe(false);
  });
});
