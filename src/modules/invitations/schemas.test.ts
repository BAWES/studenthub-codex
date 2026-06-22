import { describe, it, expect } from "vitest";
import {
  invitationCompanySchema,
  invitationRequestSchema,
  invitationListItemSchema,
  invitationDetailRequestSchema,
  invitationDetailNoteSchema,
  invitationDetailMetricSchema,
  invitationDetailSchema,
  invitationActionResultSchema,
  listInvitationsResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validInvitationCompany = () => ({
  company_name: "Acme Corp",
});

const validInvitationRequest = () => ({
  request_uuid: "550e8400-e29b-41d4-a716-446655440000",
  request_position_title: "Software Engineer",
  company: validInvitationCompany(),
});

const validInvitationListItem = () => ({
  invitation_uuid: "550e8400-e29b-41d4-a716-446655440000",
  invitation_status: 1,
  invitation_created_at: new Date("2026-06-14"),
  invitation_app_seen_at: new Date("2026-06-14"),
  invitation_email_seen_at: null,
  request: validInvitationRequest(),
});

const validInvitationListItemMinimal = () => ({
  invitation_uuid: "550e8400-e29b-41d4-a716-446655440000",
  invitation_status: null,
  invitation_created_at: null,
  invitation_app_seen_at: null,
  invitation_email_seen_at: null,
  request: null,
});

const validInvitationDetailRequest = () => ({
  request_uuid: "550e8400-e29b-41d4-a716-446655440000",
  request_position_title: "Software Engineer",
  request_job_description: "Full-stack role",
  request_compensation: "1500 KWD",
  request_location: "Kuwait City",
  request_number_of_employees: 5,
  request_status: "active",
  company_name: "Acme Corp",
  company_email: "hr@acme.com",
  staff_name: "Ali",
  staff_email: "ali@acme.com",
});

const validInvitationDetailRequestMinimal = () => ({
  request_uuid: "550e8400-e29b-41d4-a716-446655440000",
  request_position_title: null,
  request_job_description: null,
  request_compensation: null,
  request_location: null,
  request_number_of_employees: null,
  request_status: null,
  company_name: null,
  company_email: null,
  staff_name: null,
  staff_email: null,
});

const validInvitationDetailNote = () => ({
  id: "note-1",
  title: "Interview Scheduled",
  subtitle: "2026-06-15 at 10:00",
  meta: "Status: Pending",
});

const validInvitationDetailMetric = () => ({
  label: "Days Open",
  value: 5,
  note: "Since posting",
});

const validInvitationDetail = () => ({
  invitation: {
    invitation_uuid: "550e8400-e29b-41d4-a716-446655440000",
    invitation_status: 1,
    invitation_app_seen_at: new Date("2026-06-14"),
    invitation_email_seen_at: new Date("2026-06-14"),
    invitation_seen_via: "app",
    invitation_created_at: new Date("2026-06-10"),
    invitation_updated_at: new Date("2026-06-14"),
    request: validInvitationDetailRequest(),
    story_uuid: "660e8400-e29b-41d4-a716-446655440001",
    story_status: 2,
    story_last_updated_at: new Date("2026-06-14"),
  },
  metrics: [validInvitationDetailMetric()],
  notes: [validInvitationDetailNote()],
});

const validInvitationDetailMinimal = () => ({
  invitation: null,
  metrics: [],
  notes: [],
});

// ---------------------------------------------------------------------------
// invitationCompanySchema
// ---------------------------------------------------------------------------

describe("invitationCompanySchema", () => {
  it("accepts a company with a name", () => {
    const r = invitationCompanySchema.safeParse(validInvitationCompany());
    expect(r.success).toBe(true);
  });

  it("accepts null", () => {
    const r = invitationCompanySchema.safeParse(null);
    expect(r.success).toBe(true);
  });

  it("accepts a company with null name", () => {
    const r = invitationCompanySchema.safeParse({ company_name: null });
    expect(r.success).toBe(true);
  });

  it("rejects wrong type", () => {
    const r = invitationCompanySchema.safeParse({ company_name: 123 });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// invitationRequestSchema
// ---------------------------------------------------------------------------

describe("invitationRequestSchema", () => {
  it("accepts a full request", () => {
    const r = invitationRequestSchema.safeParse(validInvitationRequest());
    expect(r.success).toBe(true);
  });

  it("accepts null", () => {
    const r = invitationRequestSchema.safeParse(null);
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = invitationRequestSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects non-string request_uuid", () => {
    const r = invitationRequestSchema.safeParse({
      ...validInvitationRequest(),
      request_uuid: 123,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// invitationListItemSchema
// ---------------------------------------------------------------------------

describe("invitationListItemSchema", () => {
  it("accepts a full invitation list item", () => {
    const r = invitationListItemSchema.safeParse(validInvitationListItem());
    expect(r.success).toBe(true);
  });

  it("accepts a minimal item (nullable fields set to null)", () => {
    const r = invitationListItemSchema.safeParse(
      validInvitationListItemMinimal()
    );
    expect(r.success).toBe(true);
  });

  it("accepts a Date object for invitation_created_at", () => {
    const r = invitationListItemSchema.safeParse({
      ...validInvitationListItem(),
      invitation_created_at: new Date("2026-06-14"),
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = invitationListItemSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong types", () => {
    const r = invitationListItemSchema.safeParse({
      ...validInvitationListItem(),
      invitation_uuid: 123,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing invitation_uuid", () => {
    const r = invitationListItemSchema.safeParse({
      ...validInvitationListItem(),
      invitation_uuid: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-number invitation_status when provided", () => {
    const r = invitationListItemSchema.safeParse({
      ...validInvitationListItem(),
      invitation_status: "one",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// invitationDetailRequestSchema
// ---------------------------------------------------------------------------

describe("invitationDetailRequestSchema", () => {
  it("accepts a full detail request", () => {
    const r = invitationDetailRequestSchema.safeParse(
      validInvitationDetailRequest()
    );
    expect(r.success).toBe(true);
  });

  it("accepts a minimal detail request (nullable fields set to null)", () => {
    const r = invitationDetailRequestSchema.safeParse(
      validInvitationDetailRequestMinimal()
    );
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = invitationDetailRequestSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects non-string request_uuid", () => {
    const r = invitationDetailRequestSchema.safeParse({
      ...validInvitationDetailRequest(),
      request_uuid: 123,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-number request_number_of_employees when provided", () => {
    const r = invitationDetailRequestSchema.safeParse({
      ...validInvitationDetailRequest(),
      request_number_of_employees: "five",
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// invitationDetailNoteSchema
// ---------------------------------------------------------------------------

describe("invitationDetailNoteSchema", () => {
  it("accepts a full note", () => {
    const r = invitationDetailNoteSchema.safeParse(
      validInvitationDetailNote()
    );
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = invitationDetailNoteSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects non-string id", () => {
    const r = invitationDetailNoteSchema.safeParse({
      ...validInvitationDetailNote(),
      id: 123,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-string title", () => {
    const r = invitationDetailNoteSchema.safeParse({
      ...validInvitationDetailNote(),
      title: 123,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// invitationDetailMetricSchema
// ---------------------------------------------------------------------------

describe("invitationDetailMetricSchema", () => {
  it("accepts a metric with number value", () => {
    const r = invitationDetailMetricSchema.safeParse(validInvitationDetailMetric());
    expect(r.success).toBe(true);
  });

  it("accepts a metric with string value", () => {
    const r = invitationDetailMetricSchema.safeParse({
      ...validInvitationDetailMetric(),
      value: "High",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = invitationDetailMetricSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects non-string-or-number value", () => {
    const r = invitationDetailMetricSchema.safeParse({
      ...validInvitationDetailMetric(),
      value: true,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// invitationDetailSchema
// ---------------------------------------------------------------------------

describe("invitationDetailSchema", () => {
  it("accepts a full invitation detail", () => {
    const r = invitationDetailSchema.safeParse(validInvitationDetail());
    expect(r.success).toBe(true);
  });

  it("accepts a minimal invitation detail (null invitation, empty arrays)", () => {
    const r = invitationDetailSchema.safeParse(
      validInvitationDetailMinimal()
    );
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = invitationDetailSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects non-null invitation with wrong types", () => {
    const r = invitationDetailSchema.safeParse({
      ...validInvitationDetail(),
      invitation: { invitation_uuid: 123 },
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// invitationActionResultSchema
// ---------------------------------------------------------------------------

describe("invitationActionResultSchema", () => {
  it("accepts a successful result", () => {
    const r = invitationActionResultSchema.safeParse({
      success: true,
      message: "Invitation accepted",
    });
    expect(r.success).toBe(true);
  });

  it("accepts a failed result", () => {
    const r = invitationActionResultSchema.safeParse({
      success: false,
      message: "Invitation expired",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const r = invitationActionResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects non-boolean success", () => {
    const r = invitationActionResultSchema.safeParse({
      success: "yes",
      message: "test",
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-string message", () => {
    const r = invitationActionResultSchema.safeParse({
      success: true,
      message: 123,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listInvitationsResultSchema
// ---------------------------------------------------------------------------

describe("listInvitationsResultSchema", () => {
  it("accepts an array of invitation list items", () => {
    const r = listInvitationsResultSchema.safeParse([
      validInvitationListItem(),
      validInvitationListItemMinimal(),
    ]);
    expect(r.success).toBe(true);
  });

  it("accepts a count number", () => {
    const r = listInvitationsResultSchema.safeParse(42);
    expect(r.success).toBe(true);
  });

  it("accepts zero", () => {
    const r = listInvitationsResultSchema.safeParse(0);
    expect(r.success).toBe(true);
  });

  it("accepts an empty array", () => {
    const r = listInvitationsResultSchema.safeParse([]);
    expect(r.success).toBe(true);
  });

  it("rejects a negative number", () => {
    const r = listInvitationsResultSchema.safeParse(-1);
    expect(r.success).toBe(false);
  });

  it("rejects invalid items in the array", () => {
    const r = listInvitationsResultSchema.safeParse([
      { invitation_uuid: 123 },
    ]);
    expect(r.success).toBe(false);
  });

  it("rejects non-array non-number", () => {
    const r = listInvitationsResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});
