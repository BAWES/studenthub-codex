import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const { mockRequireCapability, mockGetCompanyWorkspace, mockUpdateContactProfile, mockRevalidatePath } =
  vi.hoisted(() => ({
    mockRequireCapability: vi.fn(),
    mockGetCompanyWorkspace: vi.fn(),
    mockUpdateContactProfile: vi.fn(),
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

// ── Mock module-level actions ────────────────────────────────
vi.mock("@/modules/company/actions", () => ({
  getCompanyWorkspace: mockGetCompanyWorkspace,
  updateContactProfile: mockUpdateContactProfile,
}));

// ── Imports (after mocks) ────────────────────────────────────

import { getWorkspace, updateWorkspace } from "./actions";

// ===========================================================================
// getWorkspace
// ===========================================================================

describe("getWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // A minimal valid result shape matching workspaceOverviewOutputSchema
  const validWorkspaceResult = {
    contact: { contact_name: "Ahmed", contact_email: "ahmed@test.com" },
    metrics: [
      { label: "Companies", value: 3, note: "Linked" },
      { label: "Requests", value: 5, note: "Hiring" },
      { label: "Stores", value: 2, note: "Active" },
      { label: "Notes", value: 1, note: "Internal" },
    ],
    companies: [
      { id: "c-001", title: "GCC Energies", subtitle: "Manager", meta: "Access allowed" },
    ],
    requests: [
      { id: "r-001", title: "Software Engineer", subtitle: "GCC Energies", meta: "Open · 2 seats" },
    ],
  };

  it("requires company.read capability", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockGetCompanyWorkspace.mockResolvedValue(validWorkspaceResult);

    await getWorkspace("valid-uuid");

    expect(mockRequireCapability).toHaveBeenCalledWith("company.read");
  });

  it("throws on empty contact UUID", async () => {
    await expect(getWorkspace("")).rejects.toThrow();
    expect(mockGetCompanyWorkspace).not.toHaveBeenCalled();
  });

  it("delegates to getCompanyWorkspace and returns result", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockGetCompanyWorkspace.mockResolvedValue(validWorkspaceResult);

    const result = await getWorkspace("test-uuid-123");

    expect(mockGetCompanyWorkspace).toHaveBeenCalledWith("test-uuid-123");
    expect(result).toEqual(validWorkspaceResult);
  });

  it("returns result even when output validation logs error", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockGetCompanyWorkspace.mockResolvedValue({
      ...validWorkspaceResult,
      metrics: validWorkspaceResult.metrics.slice(0, 2), // wrong length — 2 instead of 4
    });

    const result = await getWorkspace("test-uuid-123");

    // Should not throw — output validation only logs
    expect(result.metrics).toHaveLength(2);
    expect(mockGetCompanyWorkspace).toHaveBeenCalledTimes(1);
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
    mockUpdateContactProfile.mockResolvedValue(undefined);

    await updateWorkspace({
      contactUuid: "test-uuid-123",
      contact_name: "Updated Name",
    });

    expect(mockRequireCapability).toHaveBeenCalledWith("company.write.linked");
  });

  it("delegates to updateContactProfile with parsed data", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockUpdateContactProfile.mockResolvedValue(undefined);

    const result = await updateWorkspace({
      contactUuid: "test-uuid-123",
      contact_name: "Updated Name",
      contact_email: "updated@test.com",
    });

    expect(mockUpdateContactProfile).toHaveBeenCalledWith({
      contactUuid: "test-uuid-123",
      contact_name: "Updated Name",
      contact_email: "updated@test.com",
    });
    expect(result).toEqual({ contactUuid: "test-uuid-123" });
  });

  it("revalidates the page cache", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockUpdateContactProfile.mockResolvedValue(undefined);

    await updateWorkspace({
      contactUuid: "test-uuid-123",
    });

    expect(mockRevalidatePath).toHaveBeenCalledWith("/company/workspace/[id]", "page");
  });

  it("throws on empty contact UUID", async () => {
    await expect(
      updateWorkspace({ contactUuid: "" }),
    ).rejects.toThrow();
    expect(mockUpdateContactProfile).not.toHaveBeenCalled();
  });

  it("throws on invalid email", async () => {
    await expect(
      updateWorkspace({
        contactUuid: "test-uuid-123",
        contact_email: "not-an-email",
      }),
    ).rejects.toThrow();
    expect(mockUpdateContactProfile).not.toHaveBeenCalled();
  });

  it("accepts partial update with only contact_name", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockUpdateContactProfile.mockResolvedValue(undefined);

    const result = await updateWorkspace({
      contactUuid: "test-uuid-123",
      contact_name: "New Name Only",
    });

    expect(mockUpdateContactProfile).toHaveBeenCalledWith({
      contactUuid: "test-uuid-123",
      contact_name: "New Name Only",
    });
    expect(result.contactUuid).toBe("test-uuid-123");
  });

  it("accepts partial update with only contact_email", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockUpdateContactProfile.mockResolvedValue(undefined);

    const result = await updateWorkspace({
      contactUuid: "test-uuid-123",
      contact_email: "email-only@test.com",
    });

    expect(mockUpdateContactProfile).toHaveBeenCalledWith({
      contactUuid: "test-uuid-123",
      contact_email: "email-only@test.com",
    });
    expect(result.contactUuid).toBe("test-uuid-123");
  });

  it("returns result even when output validation logs error", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockUpdateContactProfile.mockResolvedValue(undefined);

    // The output schema expects { contactUuid: string } which is always valid
    // for the minimum input. This test ensures the function doesn't throw.
    const result = await updateWorkspace({
      contactUuid: "test-uuid-123",
    });

    expect(result).toEqual({ contactUuid: "test-uuid-123" });
  });
});
