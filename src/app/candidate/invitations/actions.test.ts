import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — delegate to module actions (these now contain the real logic)
// ---------------------------------------------------------------------------

const mockModuleListInvitations = vi.fn();

vi.mock("@/modules/invitations/actions", () => ({
  listInvitations: mockModuleListInvitations,
}));

vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn(),
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: vi.fn((d: Date) => d.toISOString()),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
    invitation: {
      findFirst: vi.fn(),
    },
    note: {
      findMany: vi.fn(),
    },
  },
}));

// Must import after mocks are set up
const { requireCapability } = await import("@/modules/auth/session");
const { prisma } = await import("@/lib/prisma");
const { listCandidateInvitations, getCandidateInvitationDetail } = await import("./actions");

// Import schemas directly (no mock dependency)
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
// Candidate Invitations server actions
// ---------------------------------------------------------------------------

const mockListItem = {
  invitation_uuid: "inv-123",
  invitation_status: 1,
  invitation_app_seen_at: new Date("2026-06-01"),
  invitation_email_seen_at: null,
  invitation_created_at: new Date("2026-06-01"),
  request: {
    request_uuid: "req-123",
    request_position_title: "Software Engineer",
    company: {
      company_name: "Acme Corp",
    },
  },
};

describe("Candidate Invitations actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listCandidateInvitations", () => {
    it("delegates to module listInvitations and checks auth", async () => {
      vi.mocked(requireCapability).mockResolvedValue({ id: "1" } as any);
      mockModuleListInvitations.mockResolvedValue([mockListItem]);

      const result = await listCandidateInvitations({});

      expect(requireCapability).toHaveBeenCalledWith("candidate.read.own");
      expect(mockModuleListInvitations).toHaveBeenCalledWith({});
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
    });

    it("maps InvitationListItem shape to InvitationRow shape", async () => {
      vi.mocked(requireCapability).mockResolvedValue({ id: "1" } as any);
      mockModuleListInvitations.mockResolvedValue([mockListItem]);

      const result = await listCandidateInvitations({});

      const row = result.items[0];
      expect(row.invitation_uuid).toBe("inv-123");
      expect(row.invitation_status).toBe(1);
      expect(row.invitation_app_seen_at).toEqual(new Date("2026-06-01"));
      expect(row.invitation_email_seen_at).toBeNull();
      expect(row.invitation_created_at).toEqual(new Date("2026-06-01"));
      expect(row.position_title).toBe("Software Engineer");
      expect(row.compensation).toBeNull();
      expect(row.company_name).toBe("Acme Corp");
    });

    it("handles null request and company gracefully", async () => {
      vi.mocked(requireCapability).mockResolvedValue({ id: "1" } as any);
      mockModuleListInvitations.mockResolvedValue([
        {
          invitation_uuid: "inv-456",
          invitation_status: null,
          invitation_app_seen_at: null,
          invitation_email_seen_at: null,
          invitation_created_at: null,
          request: null,
        },
      ]);

      const result = await listCandidateInvitations({});

      const row = result.items[0];
      expect(row.position_title).toBeNull();
      expect(row.company_name).toBeNull();
      expect(row.compensation).toBeNull();
    });

    it("returns paginated results from full list", async () => {
      vi.mocked(requireCapability).mockResolvedValue({ id: "1" } as any);
      const manyItems = Array.from({ length: 25 }, (_, i) => ({
        ...mockListItem,
        invitation_uuid: `inv-${i + 1}`,
      }));
      mockModuleListInvitations.mockResolvedValue(manyItems);

      // Page 1 (first 10 of 25)
      const page1 = await listCandidateInvitations({ page: 1, limit: 10 });
      expect(page1.items).toHaveLength(10);
      expect(page1.total).toBe(25);
      expect(page1.page).toBe(1);
      expect(page1.limit).toBe(10);
      expect(page1.totalPages).toBe(3);
      expect(page1.items[0].invitation_uuid).toBe("inv-1");
      expect(page1.items[9].invitation_uuid).toBe("inv-10");

      // Page 3 (last 5 of 25)
      const page3 = await listCandidateInvitations({ page: 3, limit: 10 });
      expect(page3.items).toHaveLength(5);
      expect(page3.items[0].invitation_uuid).toBe("inv-21");
    });

    it("returns empty result when module returns empty array", async () => {
      vi.mocked(requireCapability).mockResolvedValue({ id: "1" } as any);
      mockModuleListInvitations.mockResolvedValue([]);

      const result = await listCandidateInvitations({});

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it("returns empty result when module returns number (onlyCount)", async () => {
      vi.mocked(requireCapability).mockResolvedValue({ id: "1" } as any);
      mockModuleListInvitations.mockResolvedValue(5);

      const result = await listCandidateInvitations({});

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it("supports pagination defaults (page=1, limit=20)", async () => {
      vi.mocked(requireCapability).mockResolvedValue({ id: "1" } as any);
      mockModuleListInvitations.mockResolvedValue([mockListItem]);

      const result = await listCandidateInvitations({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });
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
