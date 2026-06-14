import { describe, it, expect } from "vitest";
import {
  invitationRowOutputSchema,
  listInvitationsResultOutputSchema,
  getInvitationDetailResultOutputSchema,
} from "./schemas";

describe("candidate invitations page — data contract", () => {
  it("invitationRowOutputSchema validates a valid row", () => {
    const r = invitationRowOutputSchema.safeParse({
      invitation_uuid: "inv-123",
      invitation_status: 1,
      invitation_app_seen_at: null,
      invitation_email_seen_at: new Date("2024-06-01"),
      invitation_created_at: new Date("2024-05-01"),
      position_title: "Software Engineer",
      compensation: "2000 KWD",
      company_name: "Tech Corp",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.invitation_uuid).toBe("inv-123");
  });

  it("invitationRowOutputSchema rejects missing invitation_uuid", () => {
    const r = invitationRowOutputSchema.safeParse({ position_title: "Engineer" });
    expect(r.success).toBe(false);
  });

  it("listInvitationsResultOutputSchema validates paginated list", () => {
    const r = listInvitationsResultOutputSchema.safeParse({
      items: [{
        invitation_uuid: "i1", invitation_status: 1, invitation_app_seen_at: null,
        invitation_email_seen_at: null, invitation_created_at: null,
        position_title: null, compensation: null, company_name: null,
      }],
      total: 1, page: 1, limit: 20, totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("getInvitationDetailResultOutputSchema validates detail result", () => {
    const r = getInvitationDetailResultOutputSchema.safeParse({
      invitation: {
        invitation_uuid: "i1",
        invitation_status: 0,
        invitation_app_seen_at: null,
        invitation_email_seen_at: null,
        invitation_seen_via: null,
        invitation_created_at: null,
        invitation_updated_at: null,
        request: {
          request_uuid: "req-1",
          request_position_title: "Engineer",
          request_job_description: null,
          request_compensation: "2000",
          request_location: "Kuwait",
          request_number_of_employees: null,
          request_status: null,
          company_name: "Tech Corp",
          company_email: null,
          staff_name: null,
          staff_email: null,
        },
        story_uuid: null,
        story_status: null,
        story_last_updated_at: null,
      },
      metrics: [{ label: "Score", value: "85", note: "Good match" }],
      notes: [{ id: "n1", title: "Note 1", subtitle: "Sub", meta: "meta" }],
    });
    expect(r.success).toBe(true);
  });
});
