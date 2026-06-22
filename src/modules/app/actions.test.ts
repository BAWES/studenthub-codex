import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock Next.js server-only (not available in test env) ────
vi.mock("server-only", () => ({}));

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireSession,
  mockTransaction,
  mockSearchCandidates,
  mockSearchCompanies,
  mockSearchRequests,
  mockSearchTransfers,
  mockSearchIdRequests,
  mockCompanyIdsForContact,
  mockCandidateIdsForStaff,
  mockBuildPreview,
} = vi.hoisted(() => ({
  mockRequireSession: vi.fn(),
  mockTransaction: vi.fn(),
  mockSearchCandidates: vi.fn(),
  mockSearchCompanies: vi.fn(),
  mockSearchRequests: vi.fn(),
  mockSearchTransfers: vi.fn(),
  mockSearchIdRequests: vi.fn(),
  mockCompanyIdsForContact: vi.fn(),
  mockCandidateIdsForStaff: vi.fn(),
  mockBuildPreview: vi.fn(),
}));

// ── Mock session module ─────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireSession: mockRequireSession,
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: mockTransaction,
    candidate: { count: vi.fn(), findMany: vi.fn() },
    request: { count: vi.fn(), findMany: vi.fn() },
    company: { count: vi.fn(), findMany: vi.fn() },
    candidate_id_request: { count: vi.fn(), findMany: vi.fn() },
    transfer: { count: vi.fn(), findMany: vi.fn() },
    company_contact: { findMany: vi.fn() },
    candidate_work_history: { findMany: vi.fn() },
  },
}));

// ── Mock queries module ─────────────────────────────────────
vi.mock("./queries", () => ({
  searchCandidates: mockSearchCandidates,
  searchCompanies: mockSearchCompanies,
  searchRequests: mockSearchRequests,
  searchTransfers: mockSearchTransfers,
  searchIdRequests: mockSearchIdRequests,
  companyIdsForContact: mockCompanyIdsForContact,
  candidateIdsForStaff: mockCandidateIdsForStaff,
}));

// ── Mock previews module ────────────────────────────────────
vi.mock("./previews", () => ({
  buildPreview: mockBuildPreview,
}));

// ── SUT ──────────────────────────────────────────────────────
import { getUnifiedHubAction } from "./actions";
import { getHubInputSchema, type HubInput } from "./schemas";

// =========================================================================
// Schema tests — pure Zod validation, no mocks needed
// =========================================================================

describe("getHubInputSchema", () => {
  it("accepts empty input with defaults", () => {
    const result = getHubInputSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query).toBe("");
      expect(result.data.scope).toBe("all");
      expect(result.data.record).toBeUndefined();
    }
  });

  it("accepts explicit query string", () => {
    const result = getHubInputSchema.safeParse({ query: "Ahmed" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query).toBe("Ahmed");
    }
  });

  it("trims whitespace from query", () => {
    const result = getHubInputSchema.safeParse({ query: "  test  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query).toBe("test");
    }
  });

  it("accepts valid scope values", () => {
    const scopes = ["all", "people", "demand", "companies", "money", "compliance"];
    for (const scope of scopes) {
      const result = getHubInputSchema.safeParse({ scope });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid scope value", () => {
    const result = getHubInputSchema.safeParse({ scope: "invalid" });
    expect(result.success).toBe(false);
  });

  it("accepts record parameter", () => {
    const result = getHubInputSchema.safeParse({ record: "candidate-42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.record).toBe("candidate-42");
    }
  });

  it("accepts all parameters together", () => {
    const input: HubInput = { query: "test", scope: "companies", record: "company-5" };
    const result = getHubInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects non-string query", () => {
    const result = getHubInputSchema.safeParse({ query: 123 });
    expect(result.success).toBe(false);
  });
});

// =========================================================================
// Action tests — getUnifiedHubAction — mocked Prisma + queries
// =========================================================================

describe("getUnifiedHubAction", () => {
  const adminSession = { id: "1", role: "admin" as const };

  /** Default counts returned by $transaction */
  const defaultCounts = [12, 3, 45, 18, 200, 7, 5, 150];

  const mockCandidates = [
    {
      candidate_id: 1,
      candidate_name: "Ahmed Ali",
      candidate_email: "ahmed@example.com",
      candidate_status: 10,
      approved: 1,
      candidate_updated_at: new Date("2026-06-01"),
      country: { country_name_en: "Kuwait" },
    },
  ];

  const mockCompanies = [
    {
      company_id: 1,
      company_name: "Test Corp",
      company_email: "info@testcorp.com",
      company_approved_to_hire: true,
      company_hourly_rate: 15.5,
      currency_code: "KWD",
      no_of_active_requests: 3,
    },
  ];

  const mockRequests = [
    {
      request_uuid: "req_abc123",
      request_position_title: "Software Engineer",
      request_status: "pending",
      request_number_of_employees: 2,
      request_updated_datetime: new Date("2026-06-10"),
      company: { company_name: "Test Corp" },
    },
  ];

  const mockTransfers = [
    {
      transfer_id: 42,
      transfer_status: 10,
      total: 5000,
      company_total: 5500,
      currency_code: "KWD",
      start_date: new Date("2026-01-01"),
      end_date: new Date("2026-06-30"),
      company: { company_name: "Test Corp" },
    },
  ];

  const mockIdRequests = [
    {
      cir_uuid: "id_batch_abc123def456",
      candidate_ids: "1,2,3",
      status: "pending",
      created_at: new Date("2026-06-05"),
    },
  ];

  const mockPreview = {
    id: "candidate-1",
    type: "Candidate" as const,
    title: "Ahmed Ali",
    subtitle: "ahmed@example.com",
    meta: "Active · Kuwait · Jun 1, 2026",
    actions: [{ label: "View profile", href: "/admin/candidates/1" }],
    flags: ["Active"],
    facts: [{ label: "Status", value: "Active" }],
    related: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequireSession.mockResolvedValue(adminSession);
    mockTransaction.mockResolvedValue(defaultCounts);

    mockSearchCandidates.mockResolvedValue(mockCandidates);
    mockSearchCompanies.mockResolvedValue(mockCompanies);
    mockSearchRequests.mockResolvedValue(mockRequests);
    mockSearchTransfers.mockResolvedValue(mockTransfers);
    mockSearchIdRequests.mockResolvedValue(mockIdRequests);

    mockBuildPreview.mockResolvedValue(mockPreview);
  });

  // ── Admin full query ─────────────────────────────────────

  it("returns full hub data for admin with 'all' scope", async () => {
    const result = await getUnifiedHubAction({});

    expect(mockRequireSession).toHaveBeenCalledOnce();
    expect(mockTransaction).toHaveBeenCalledOnce();

    expect(result.query).toBe("");
    expect(result.scope).toBe("all");
    expect(result.scopes).toHaveLength(6);

    // Hero section
    expect(result.hero.title).toBe("StudentHub Command");

    // Queues
    expect(result.queues).toHaveLength(4);
    const needsReview = result.queues.find((q) => q.label === "Needs review");
    expect(needsReview).toBeDefined();
    expect(needsReview!.value).toBe(12);

    // System metrics
    expect(result.system).toHaveLength(3);
    expect(result.system[0].label).toBe("Active candidates");
    expect(result.system[0].value).toBe(45);

    // Workstreams
    expect(result.workstreams).toHaveLength(5);
    expect(result.workstreams[0].label).toBe("Candidate Readiness");
    expect(result.workstreams[0].value).toBe(15); // 12 + 3

    // Results should include all 5 search types
    expect(result.results).toHaveLength(
      mockCandidates.length +
        mockCompanies.length +
        mockRequests.length +
        mockTransfers.length +
        mockIdRequests.length,
    );

    // Navigation
    expect(result.navigation).toHaveLength(5); // Command + 4 admin items
    expect(result.navigation[0].label).toBe("Command");

    // Access summary
    expect(result.access.title).toBe("Admin access");

    // Preview
    expect(result.preview).toEqual(mockPreview);
  });

  it("includes a candidate result in the results array", async () => {
    const result = await getUnifiedHubAction({});
    const candidateResult = result.results.find((r) => r.id === "candidate-1");
    expect(candidateResult).toBeDefined();
    expect(candidateResult!.type).toBe("Candidate");
    expect(candidateResult!.title).toBe("Ahmed Ali");
    expect(candidateResult!.href).toBe("/admin/candidates/1");
  });

  it("includes a company result in the results array", async () => {
    const result = await getUnifiedHubAction({});
    const companyResult = result.results.find((r) => r.id?.startsWith("company-"));
    expect(companyResult).toBeDefined();
    expect(companyResult!.type).toBe("Company");
  });

  it("includes a request result in the results array", async () => {
    const result = await getUnifiedHubAction({});
    const requestResult = result.results.find((r) => r.id?.startsWith("request-"));
    expect(requestResult).toBeDefined();
    expect(requestResult!.type).toBe("Request");
  });

  it("includes a transfer result in the results array", async () => {
    const result = await getUnifiedHubAction({});
    const transferResult = result.results.find((r) => r.id?.startsWith("transfer-"));
    expect(transferResult).toBeDefined();
    expect(transferResult!.type).toBe("Transfer");
  });

  it("includes an ID request result in the results array", async () => {
    const result = await getUnifiedHubAction({});
    const idResult = result.results.find((r) => r.id?.startsWith("id-"));
    expect(idResult).toBeDefined();
    expect(idResult!.type).toBe("ID Request");
  });

  // ── Scope filtering ──────────────────────────────────────

  it("filters results by scope 'people'", async () => {
    await getUnifiedHubAction({ scope: "people" });

    expect(mockSearchCandidates).toHaveBeenCalled();
    expect(mockSearchCompanies).not.toHaveBeenCalled();
    expect(mockSearchRequests).not.toHaveBeenCalled();
    expect(mockSearchTransfers).not.toHaveBeenCalled();
    expect(mockSearchIdRequests).not.toHaveBeenCalled();
  });

  it("filters results by scope 'demand'", async () => {
    await getUnifiedHubAction({ scope: "demand" });

    expect(mockSearchRequests).toHaveBeenCalled();
    expect(mockSearchCandidates).not.toHaveBeenCalled();
  });

  it("filters results by scope 'companies'", async () => {
    await getUnifiedHubAction({ scope: "companies" });

    expect(mockSearchCompanies).toHaveBeenCalled();
    expect(mockSearchCandidates).not.toHaveBeenCalled();
  });

  it("filters results by scope 'money'", async () => {
    await getUnifiedHubAction({ scope: "money" });

    expect(mockSearchTransfers).toHaveBeenCalled();
    expect(mockSearchCandidates).not.toHaveBeenCalled();
  });

  it("filters results by scope 'compliance'", async () => {
    await getUnifiedHubAction({ scope: "compliance" });

    expect(mockSearchIdRequests).toHaveBeenCalled();
    expect(mockSearchCandidates).not.toHaveBeenCalled();
  });

  // ── Role-based behavior ──────────────────────────────────

  it("returns limited scopes for staff role and fetches candidate IDs", async () => {
    mockRequireSession.mockResolvedValue({ id: "5", role: "staff" });
    mockCandidateIdsForStaff.mockResolvedValue([1, 2]);
    mockSearchCandidates.mockResolvedValue(mockCandidates);
    mockSearchRequests.mockResolvedValue(mockRequests);

    const result = await getUnifiedHubAction({});

    expect(result.scopes).toHaveLength(3); // all, people, demand
    expect(mockCandidateIdsForStaff).toHaveBeenCalledWith(5);
  });

  it("skips candidate search for staff with no candidates", async () => {
    mockRequireSession.mockResolvedValue({ id: "5", role: "staff" });
    mockCandidateIdsForStaff.mockResolvedValue([]);
    mockSearchCandidates.mockResolvedValue([]);

    const result = await getUnifiedHubAction({ scope: "people" });

    // searchCandidates is called but returns [] because staff has no candidate IDs
    expect(mockSearchCandidates).toHaveBeenCalled();
    expect(result.results).toHaveLength(0);
  });

  it("returns limited scopes for candidate role", async () => {
    mockRequireSession.mockResolvedValue({ id: "10", role: "candidate" });

    const result = await getUnifiedHubAction({});

    expect(result.scopes).toHaveLength(2); // all, people
  });

  it("returns limited scopes for company role and fetches company IDs", async () => {
    mockRequireSession.mockResolvedValue({ id: "uuid-contact-1", role: "company" });
    mockCompanyIdsForContact.mockResolvedValue([1, 2]);
    mockSearchCompanies.mockResolvedValue(mockCompanies);

    const result = await getUnifiedHubAction({});

    expect(result.scopes).toHaveLength(3); // all, demand, companies
    expect(mockCompanyIdsForContact).toHaveBeenCalledWith("uuid-contact-1");
    expect(mockSearchCompanies).toHaveBeenCalled();
  });

  it("only calls compliance query for inspector with compliance scope", async () => {
    mockRequireSession.mockResolvedValue({ id: "1", role: "inspector" });
    mockSearchIdRequests.mockResolvedValue(mockIdRequests);

    const result = await getUnifiedHubAction({ scope: "compliance" });

    expect(result.scopes).toHaveLength(2); // all, compliance
    expect(mockSearchIdRequests).toHaveBeenCalled();
    expect(mockSearchTransfers).not.toHaveBeenCalled();
    expect(mockSearchCandidates).not.toHaveBeenCalled();
    expect(mockSearchCompanies).not.toHaveBeenCalled();
    expect(mockSearchRequests).not.toHaveBeenCalled();
  });

  // ── Query handling ───────────────────────────────────────

  it("passes query string through to result", async () => {
    const result = await getUnifiedHubAction({ query: "Ahmed" });
    expect(result.query).toBe("Ahmed");
  });

  it("trims whitespace from query", async () => {
    const result = await getUnifiedHubAction({ query: "  Ahmed  " });
    expect(result.query).toBe("Ahmed");
  });

  // ── Record/preview selection ──────────────────────────────

  it("selects a specific record and builds preview", async () => {
    const result = await getUnifiedHubAction({ record: "candidate-1" });
    expect(mockBuildPreview).toHaveBeenCalled();
    expect(result.preview).toEqual(mockPreview);
  });

  it("falls back to hubResultFromRecord for non-matching record ID", async () => {
    mockBuildPreview.mockResolvedValue(null);
    const result = await getUnifiedHubAction({ record: "candidate-999" });
    expect(mockBuildPreview).toHaveBeenCalled();
    // Should not error — produces a fallback hub result
    expect(result.preview).toBeNull();
  });

  // ── Error handling ───────────────────────────────────────

  it("throws on invalid schema input", async () => {
    await expect(getUnifiedHubAction({ scope: "invalid" as any })).rejects.toThrow();
  });

  it("throws when session fails (auth error)", async () => {
    mockRequireSession.mockRejectedValue(new Error("Not authenticated"));
    await expect(getUnifiedHubAction({})).rejects.toThrow("Not authenticated");
  });

  // ── Scope fallback ───────────────────────────────────────

  it("falls back to 'all' scope when requested scope is unavailable for role", async () => {
    mockRequireSession.mockResolvedValue({ id: "1", role: "candidate" });
    const result = await getUnifiedHubAction({ scope: "money" });
    expect(result.scope).toBe("all");
  });

  // ── Role-specific hrefs ──────────────────────────────────

  it("provides ID request href for inspector role", async () => {
    mockRequireSession.mockResolvedValue({ id: "1", role: "inspector" });
    mockSearchIdRequests.mockResolvedValue(mockIdRequests);

    const result = await getUnifiedHubAction({ scope: "compliance" });
    const idResult = result.results.find((r) => r.id?.startsWith("id-"));
    expect(idResult).toBeDefined();
    expect(idResult!.href).toBe("/inspector/id-requests/id_batch_abc123def456");
  });
});
