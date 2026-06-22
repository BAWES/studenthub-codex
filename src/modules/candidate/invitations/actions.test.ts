import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const { mockRequireCapability, mockModuleListInvitations, mockModuleGetInvitationDetail } =
  vi.hoisted(() => ({
    mockRequireCapability: vi.fn(),
    mockModuleListInvitations: vi.fn(),
    mockModuleGetInvitationDetail: vi.fn(),
  }));

// ── Mock session module ─────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

// ── Mock modules/invitations actions ─────────────────────────
vi.mock("@/modules/invitations/actions", () => ({
  listInvitations: mockModuleListInvitations,
  getInvitationDetail: mockModuleGetInvitationDetail,
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import {
  listInvitationsSchema,
  getInvitationDetailSchema,
  listInvitationsResultOutputSchema,
  getInvitationDetailResultOutputSchema,
  type InvitationRow,
  type ListInvitationsResult,
  type GetInvitationDetailResult,
} from "@/app/candidate/invitations/schemas";
import {
  listCandidateInvitations,
  getCandidateInvitationDetail,
} from "./actions";

// ===========================================================================
// Input schema validation
// ===========================================================================

describe("listInvitationsSchema", () => {
  it("accepts empty params (defaults)", () => {
    const r = listInvitationsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const r = listInvitationsSchema.safeParse({ page: 2, limit: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });

  it("coerces string values for page and limit", () => {
    const r = listInvitationsSchema.safeParse({ page: "3", limit: "25" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(3);
      expect(r.data.limit).toBe(25);
    }
  });

  it("rejects negative page", () => {
    const r = listInvitationsSchema.safeParse({ page: -1 });
    expect(r.success).toBe(false);
  });

  it("rejects page of 0", () => {
    const r = listInvitationsSchema.safeParse({ page: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const r = listInvitationsSchema.safeParse({ limit: 999 });
    expect(r.success).toBe(false);
  });

  it("rejects limit below 1", () => {
    const r = listInvitationsSchema.safeParse({ limit: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects non-numeric page string", () => {
    const r = listInvitationsSchema.safeParse({ page: "abc" });
    expect(r.success).toBe(false);
  });
});

describe("getInvitationDetailSchema", () => {
  it("requires invitationUuid", () => {
    const r = getInvitationDetailSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("accepts valid invitationUuid", () => {
    const r = getInvitationDetailSchema.safeParse({
      invitationUuid: "inv-abc-123",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.invitationUuid).toBe("inv-abc-123");
    }
  });

  it("rejects empty invitationUuid", () => {
    const r = getInvitationDetailSchema.safeParse({ invitationUuid: "" });
    expect(r.success).toBe(false);
  });
});

// ===========================================================================
// Output schema validation — type shapes
// ===========================================================================

describe("listInvitationsResultOutputSchema", () => {
  const validRow: InvitationRow = {
    invitation_uuid: "inv-1",
    invitation_status: 1,
    invitation_app_seen_at: new Date("2026-01-15"),
    invitation_email_seen_at: null,
    invitation_created_at: new Date("2026-01-10"),
    position_title: "Software Engineer",
    compensation: null,
    company_name: "Acme Corp",
  };

  it("accepts valid result with items", () => {
    const r = listInvitationsResultOutputSchema.safeParse({
      items: [validRow],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty items array", () => {
    const r = listInvitationsResultOutputSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("accepts all-null fields", () => {
    const r = listInvitationsResultOutputSchema.safeParse({
      items: [{
        invitation_uuid: "inv-2",
        invitation_status: null,
        invitation_app_seen_at: null,
        invitation_email_seen_at: null,
        invitation_created_at: null,
        position_title: null,
        compensation: null,
        company_name: null,
      }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing items field", () => {
    const r = listInvitationsResultOutputSchema.safeParse({
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(false);
  });
});

describe("getInvitationDetailResultOutputSchema", () => {
  const validDetail: GetInvitationDetailResult = {
    invitation: {
      invitation_uuid: "inv-1",
      invitation_status: 1,
      invitation_app_seen_at: new Date("2026-01-15"),
      invitation_email_seen_at: null,
      invitation_seen_via: "email",
      invitation_created_at: new Date("2026-01-10"),
      invitation_updated_at: new Date("2026-01-16"),
      request: {
        request_uuid: "req-1",
        request_position_title: "Software Engineer",
        request_job_description: "Build amazing things",
        request_compensation: "Competitive",
        request_location: "Remote",
        request_number_of_employees: 5,
        request_status: "open",
        company_name: "Acme Corp",
        company_email: "hr@acme.com",
        staff_name: "John Doe",
        staff_email: "john@acme.com",
      },
      story_uuid: null,
      story_status: null,
      story_last_updated_at: null,
    },
    metrics: [{ label: "Days Open", value: 5, note: "Since creation" }],
    notes: [{ id: "note-1", title: "Follow up", subtitle: "Candidate", meta: "2026-01-16" }],
  };

  it("accepts valid detail result", () => {
    const r = getInvitationDetailResultOutputSchema.safeParse(validDetail);
    expect(r.success).toBe(true);
  });

  it("accepts null invitation (not found)", () => {
    const r = getInvitationDetailResultOutputSchema.safeParse({
      invitation: null,
      metrics: [],
      notes: [],
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty metrics and notes", () => {
    const r = getInvitationDetailResultOutputSchema.safeParse({
      ...validDetail,
      metrics: [],
      notes: [],
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing invitation field", () => {
    const { invitation, ...rest } = validDetail;
    const r = getInvitationDetailResultOutputSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });
});

// ===========================================================================
// Action functions
// ===========================================================================

describe("listCandidateInvitations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue({ id: "42", role: "candidate" });

    // Default module result: one invitation from a request at Acme Corp
    mockModuleListInvitations.mockResolvedValue([
      {
        invitation_uuid: "inv-1",
        invitation_status: 1,
        invitation_app_seen_at: new Date("2026-01-15"),
        invitation_email_seen_at: null,
        invitation_created_at: new Date("2026-01-10"),
        request: {
          request_uuid: "req-1",
          request_position_title: "Software Engineer",
          company: { company_name: "Acme Corp" },
        },
      },
    ]);
  });

  it("checks candidate.read.own capability", async () => {
    await listCandidateInvitations();
    expect(mockRequireCapability).toHaveBeenCalledWith("candidate.read.own");
  });

  it("delegates to modules/invitations listInvitations with empty params", async () => {
    await listCandidateInvitations();
    expect(mockModuleListInvitations).toHaveBeenCalledWith({});
  });

  it("maps module InvitationListItem to InvitationRow shape", async () => {
    const result = await listCandidateInvitations();
    expect(result.items).toHaveLength(1);
    expect(result.items[0].invitation_uuid).toBe("inv-1");
    expect(result.items[0].invitation_status).toBe(1);
    expect(result.items[0].position_title).toBe("Software Engineer");
    expect(result.items[0].company_name).toBe("Acme Corp");
    expect(result.items[0].compensation).toBeNull();
  });

  it("applies pagination via item slice (module doesn't paginate)", async () => {
    // Module returns 25 items; page=1, limit=10 → items 0-9
    const twentyFiveItems = Array.from({ length: 25 }, (_, i) => ({
      invitation_uuid: `inv-${i + 1}`,
      invitation_status: 1,
      invitation_app_seen_at: null,
      invitation_email_seen_at: null,
      invitation_created_at: null,
      request: {
        request_uuid: `req-${i + 1}`,
        request_position_title: `Position ${i + 1}`,
        company: { company_name: `Company ${i + 1}` },
      },
    }));
    mockModuleListInvitations.mockResolvedValue(twentyFiveItems);

    const result = await listCandidateInvitations({ page: 1, limit: 10 });
    expect(result.items).toHaveLength(10);
    expect(result.total).toBe(25);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(3);
    expect(result.items[0].invitation_uuid).toBe("inv-1");
    expect(result.items[9].invitation_uuid).toBe("inv-10");
  });

  it("handles page 2 pagination correctly", async () => {
    const twentyFiveItems = Array.from({ length: 25 }, (_, i) => ({
      invitation_uuid: `inv-${i + 1}`,
      invitation_status: 1,
      invitation_app_seen_at: null,
      invitation_email_seen_at: null,
      invitation_created_at: null,
      request: {
        request_uuid: `req-${i + 1}`,
        request_position_title: `Position ${i + 1}`,
        company: { company_name: `Company ${i + 1}` },
      },
    }));
    mockModuleListInvitations.mockResolvedValue(twentyFiveItems);

    const result = await listCandidateInvitations({ page: 2, limit: 10 });
    expect(result.items).toHaveLength(10);
    expect(result.items[0].invitation_uuid).toBe("inv-11");
    expect(result.items[9].invitation_uuid).toBe("inv-20");
    expect(result.totalPages).toBe(3);
  });

  it("handles last page with fewer items", async () => {
    const twentyFiveItems = Array.from({ length: 25 }, (_, i) => ({
      invitation_uuid: `inv-${i + 1}`,
      invitation_status: 1,
      invitation_app_seen_at: null,
      invitation_email_seen_at: null,
      invitation_created_at: null,
      request: {
        request_uuid: `req-${i + 1}`,
        request_position_title: `Position ${i + 1}`,
        company: { company_name: `Company ${i + 1}` },
      },
    }));
    mockModuleListInvitations.mockResolvedValue(twentyFiveItems);

    const result = await listCandidateInvitations({ page: 3, limit: 10 });
    expect(result.items).toHaveLength(5);
    expect(result.items[0].invitation_uuid).toBe("inv-21");
    expect(result.items[4].invitation_uuid).toBe("inv-25");
  });

  it("returns empty result on invalid input (zod failure)", async () => {
    mockModuleListInvitations.mockClear();
    const result = await listCandidateInvitations({ page: -1 });
    expect(result).toEqual({ items: [], total: 0, page: 1, limit: 20, totalPages: 0 });
    expect(mockModuleListInvitations).not.toHaveBeenCalled();
  });

  it("handles empty response from module", async () => {
    mockModuleListInvitations.mockResolvedValue([]);
    const result = await listCandidateInvitations();
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("returns empty result when module returns a number (onlyCount mode)", async () => {
    mockModuleListInvitations.mockResolvedValue(5 as any);
    const result = await listCandidateInvitations();
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("handles null request gracefully", async () => {
    mockModuleListInvitations.mockResolvedValue([
      {
        invitation_uuid: "inv-no-request",
        invitation_status: null,
        invitation_app_seen_at: null,
        invitation_email_seen_at: null,
        invitation_created_at: null,
        request: null,
      },
    ]);
    const result = await listCandidateInvitations();
    expect(result.items[0].position_title).toBeNull();
    expect(result.items[0].company_name).toBeNull();
  });
});

describe("getCandidateInvitationDetail", () => {
  const validDetail: GetInvitationDetailResult = {
    invitation: {
      invitation_uuid: "inv-1",
      invitation_status: 1,
      invitation_app_seen_at: new Date("2026-01-15"),
      invitation_email_seen_at: null,
      invitation_seen_via: "email",
      invitation_created_at: new Date("2026-01-10"),
      invitation_updated_at: new Date("2026-01-16"),
      request: {
        request_uuid: "req-1",
        request_position_title: "Software Engineer",
        request_job_description: "Build amazing things",
        request_compensation: "Competitive",
        request_location: "Remote",
        request_number_of_employees: 5,
        request_status: "open",
        company_name: "Acme Corp",
        company_email: "hr@acme.com",
        staff_name: "John Doe",
        staff_email: "john@acme.com",
      },
      story_uuid: null,
      story_status: null,
      story_last_updated_at: null,
    },
    metrics: [{ label: "Days Open", value: 5, note: "Since creation" }],
    notes: [{ id: "note-1", title: "Follow up", subtitle: "Candidate", meta: "2026-01-16" }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue({ id: "42", role: "candidate" });
    mockModuleGetInvitationDetail.mockResolvedValue(validDetail);
  });

  it("checks candidate.read.own capability", async () => {
    await getCandidateInvitationDetail({ invitationUuid: "inv-1" });
    expect(mockRequireCapability).toHaveBeenCalledWith("candidate.read.own");
  });

  it("delegates to module with parsed params and session candidate ID", async () => {
    await getCandidateInvitationDetail({ invitationUuid: "inv-1" });
    expect(mockModuleGetInvitationDetail).toHaveBeenCalledWith("inv-1", 42);
  });

  it("returns the detail result from the module", async () => {
    const result = await getCandidateInvitationDetail({ invitationUuid: "inv-1" });
    expect(result.invitation?.invitation_uuid).toBe("inv-1");
    expect(result.metrics).toHaveLength(1);
    expect(result.notes).toHaveLength(1);
  });

  it("throws on invalid input (missing invitationUuid)", async () => {
    await expect(
      getCandidateInvitationDetail({} as any),
    ).rejects.toThrow();
    expect(mockModuleGetInvitationDetail).not.toHaveBeenCalled();
  });

  it("propagates null invitation from module (not found)", async () => {
    mockModuleGetInvitationDetail.mockResolvedValue({
      invitation: null,
      metrics: [],
      notes: [],
    });
    const result = await getCandidateInvitationDetail({ invitationUuid: "inv-nonexistent" });
    expect(result.invitation).toBeNull();
  });

  it("uses session id for candidateId", async () => {
    mockRequireCapability.mockResolvedValue({ id: "99", role: "candidate" });
    await getCandidateInvitationDetail({ invitationUuid: "inv-1" });
    expect(mockModuleGetInvitationDetail).toHaveBeenCalledWith("inv-1", 99);
  });
});
