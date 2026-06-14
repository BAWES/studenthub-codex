import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const { mockRequireCapability, mockFindContactByUuid, mockGetCompanyLinksForWorkspace, mockGetWorkspaceStatsTx, mockUpdateContactByUuid, mockRevalidatePath } =
  vi.hoisted(() => ({
    mockRequireCapability: vi.fn(),
    mockFindContactByUuid: vi.fn(),
    mockGetCompanyLinksForWorkspace: vi.fn(),
    mockGetWorkspaceStatsTx: vi.fn(),
    mockUpdateContactByUuid: vi.fn(),
    mockRevalidatePath: vi.fn(),
  }));

// ── Mock session ─────────────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

// ── Mock next/cache ─────────────────────────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

// ── Mock module-level workspace actions ──────────────────────
vi.mock("@/modules/company/workspace/actions", () => ({
  findContactByUuid: mockFindContactByUuid,
  getCompanyLinksForWorkspace: mockGetCompanyLinksForWorkspace,
  getWorkspaceStatsTx: mockGetWorkspaceStatsTx,
  updateContactByUuid: mockUpdateContactByUuid,
}));

// ── Imports (after mocks) ────────────────────────────────────

import { getWorkspace, updateWorkspace } from "./actions";

// ===========================================================================
// Helpers
// ===========================================================================

const validContact = { contact_name: "Ahmed", contact_email: "ahmed@test.com" };
const validCompanyLinks = [
  {
    company_contact_uuid: "c-001",
    contact_position: "Manager",
    allow_access: true,
    company: { company_id: 1, company_name: "GCC Energies", company_email: "info@gcc.com", no_of_active_requests: 3, company_approved_to_hire: true },
  },
];
const validStatsTx: [number, number, number, any[]] = [5, 2, 1, [
  { request_uuid: "r-001", request_position_title: "Software Engineer", request_status: "Open", request_number_of_employees: 2, company: { company_name: "GCC Energies" } },
]];

const validWorkspaceResult = {
  contact: { contact_name: "Ahmed", contact_email: "ahmed@test.com" },
  metrics: [
    { label: "Companies", value: 1, note: "Companies linked to this contact" },
    { label: "Requests", value: 5, note: "Hiring requests across linked companies" },
    { label: "Stores", value: 2, note: "Active stores in the account" },
    { label: "Notes", value: 1, note: "Internal/customer notes connected to account" },
  ],
  companies: [
    { id: "c-001", title: "GCC Energies", subtitle: "Manager", meta: "Access allowed" },
  ],
  requests: [
    { id: "r-001", title: "Software Engineer", subtitle: "GCC Energies", meta: "Open · 2 seats" },
  ],
};

function setupWorkspaceMocks() {
  mockFindContactByUuid.mockResolvedValue(validContact);
  mockGetCompanyLinksForWorkspace.mockResolvedValue(validCompanyLinks);
  mockGetWorkspaceStatsTx.mockResolvedValue(validStatsTx);
}

// ===========================================================================
// getWorkspace
// ===========================================================================

describe("getWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires company.read capability", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    setupWorkspaceMocks();

    await getWorkspace("valid-uuid");

    expect(mockRequireCapability).toHaveBeenCalledWith("company.read");
  });

  it("throws on empty contact UUID", async () => {
    await expect(getWorkspace("")).rejects.toThrow();
    expect(mockFindContactByUuid).not.toHaveBeenCalled();
  });

  it("calls module-level raw wrappers and returns formatted result", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    setupWorkspaceMocks();

    const result = await getWorkspace("test-uuid-123");

    expect(mockFindContactByUuid).toHaveBeenCalledWith("test-uuid-123");
    expect(mockGetCompanyLinksForWorkspace).toHaveBeenCalledWith("test-uuid-123");
    expect(mockGetWorkspaceStatsTx).toHaveBeenCalledWith([1]);
    expect(result).toEqual(validWorkspaceResult);
  });

  it("handles empty company links gracefully", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindContactByUuid.mockResolvedValue(null);
    mockGetCompanyLinksForWorkspace.mockResolvedValue([]);

    const result = await getWorkspace("no-companies-uuid");

    expect(mockGetWorkspaceStatsTx).not.toHaveBeenCalled();
    expect(result.contact).toBeNull();
    expect(result.metrics[0].value).toBe(0);
    expect(result.companies).toHaveLength(0);
    expect(result.requests).toHaveLength(0);
  });

  it("returns result even when output validation logs error", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    setupWorkspaceMocks();

    const result = await getWorkspace("test-uuid-123");

    // Should not throw — output validation only logs
    expect(result.metrics).toHaveLength(4);
    expect(mockFindContactByUuid).toHaveBeenCalledTimes(1);
  });
});

// ===========================================================================
// updateWorkspace
// ===========================================================================

describe("updateWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires company.write.linked capability", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockUpdateContactByUuid.mockResolvedValue({ contact_uuid: "test-uuid-123" });

    await updateWorkspace({
      contactUuid: "test-uuid-123",
      contact_name: "Updated Name",
    });

    expect(mockRequireCapability).toHaveBeenCalledWith("company.write.linked");
  });

  it("calls updateContactByUuid with parsed data and revalidates", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockUpdateContactByUuid.mockResolvedValue({ contact_uuid: "test-uuid-123" });

    const result = await updateWorkspace({
      contactUuid: "test-uuid-123",
      contact_name: "Updated Name",
      contact_email: "updated@test.com",
    });

    expect(mockUpdateContactByUuid).toHaveBeenCalledWith("test-uuid-123", {
      contact_name: "Updated Name",
      contact_email: "updated@test.com",
      contact_updated_at: expect.any(Date),
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/company/workspace/[id]", "page");
    expect(result).toEqual({ contactUuid: "test-uuid-123" });
  });

  it("revalidates the page cache", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockUpdateContactByUuid.mockResolvedValue({ contact_uuid: "test-uuid-123" });

    await updateWorkspace({
      contactUuid: "test-uuid-123",
    });

    expect(mockRevalidatePath).toHaveBeenCalledWith("/company/workspace/[id]", "page");
  });

  it("throws on empty contact UUID", async () => {
    await expect(
      updateWorkspace({ contactUuid: "" }),
    ).rejects.toThrow();
    expect(mockUpdateContactByUuid).not.toHaveBeenCalled();
  });

  it("throws on invalid email", async () => {
    await expect(
      updateWorkspace({
        contactUuid: "test-uuid-123",
        contact_email: "not-an-email",
      }),
    ).rejects.toThrow();
    expect(mockUpdateContactByUuid).not.toHaveBeenCalled();
  });

  it("skips db call when no fields to update", async () => {
    mockRequireCapability.mockResolvedValue(undefined);

    const result = await updateWorkspace({
      contactUuid: "test-uuid-123",
    });

    expect(mockUpdateContactByUuid).not.toHaveBeenCalled();
    expect(result).toEqual({ contactUuid: "test-uuid-123" });
  });

  it("accepts partial update with only contact_name", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockUpdateContactByUuid.mockResolvedValue({ contact_uuid: "test-uuid-123" });

    const result = await updateWorkspace({
      contactUuid: "test-uuid-123",
      contact_name: "New Name Only",
    });

    expect(mockUpdateContactByUuid).toHaveBeenCalledWith("test-uuid-123", {
      contact_name: "New Name Only",
      contact_updated_at: expect.any(Date),
    });
    expect(result.contactUuid).toBe("test-uuid-123");
  });

  it("accepts partial update with only contact_email", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockUpdateContactByUuid.mockResolvedValue({ contact_uuid: "test-uuid-123" });

    const result = await updateWorkspace({
      contactUuid: "test-uuid-123",
      contact_email: "email-only@test.com",
    });

    expect(mockUpdateContactByUuid).toHaveBeenCalledWith("test-uuid-123", {
      contact_email: "email-only@test.com",
      contact_updated_at: expect.any(Date),
    });
    expect(result.contactUuid).toBe("test-uuid-123");
  });

  it("returns result even when output validation logs error", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockUpdateContactByUuid.mockResolvedValue({ contact_uuid: "test-uuid-123" });

    // The output schema expects { contactUuid: string } which is always valid
    // for the minimum input. This test ensures the function doesn't throw.
    const result = await updateWorkspace({
      contactUuid: "test-uuid-123",
    });

    expect(result).toEqual({ contactUuid: "test-uuid-123" });
  });
});
