import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const { mockRequireCapability, mockGetStoreDetailImpl, mockConsoleError } =
  vi.hoisted(() => ({
    mockRequireCapability: vi.fn(),
    mockGetStoreDetailImpl: vi.fn(),
    mockConsoleError: vi.fn(),
  }));

// ── Mock session ─────────────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

// ── Mock module-level store actions ──────────────────────────
vi.mock("@/modules/company/stores/actions", () => ({
  getStoreDetail: mockGetStoreDetailImpl,
}));

// ── Mock console.error for output validation logging ─────────
vi.stubGlobal("console", { ...console, error: mockConsoleError });

// ── Imports (after mocks) ────────────────────────────────────

import { getStoreDetail } from "./actions";

// ===========================================================================
// Helpers
// ===========================================================================

const validStoreDetail = {
  store_id: 42,
  store_name: "Test Store",
  store_location: "Kuwait City",
  store_status: "active" as const,
  company_id: 1,
  company_name: "Test Company",
  mall_name: "The Avenues",
  brand_name: "Nike",
  manager_name: "John Doe",
  manager_email: "john@test.com",
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-06-01T00:00:00.000Z",
};

// ===========================================================================
// getStoreDetail
// ===========================================================================

describe("getStoreDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires company.read.linked capability", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockGetStoreDetailImpl.mockResolvedValue(validStoreDetail);

    await getStoreDetail(42);

    expect(mockRequireCapability).toHaveBeenCalledWith("company.read.linked");
  });

  it("throws on invalid store ID (negative)", async () => {
    await expect(getStoreDetail(-1)).rejects.toThrow();
    expect(mockGetStoreDetailImpl).not.toHaveBeenCalled();
  });

  it("throws on invalid store ID (zero)", async () => {
    await expect(getStoreDetail(0)).rejects.toThrow();
    expect(mockGetStoreDetailImpl).not.toHaveBeenCalled();
  });

  it("throws on invalid store ID (float)", async () => {
    await expect(getStoreDetail(3.14)).rejects.toThrow();
    expect(mockGetStoreDetailImpl).not.toHaveBeenCalled();
  });

  it("throws on NaN store ID", async () => {
    await expect(getStoreDetail(NaN)).rejects.toThrow();
    expect(mockGetStoreDetailImpl).not.toHaveBeenCalled();
  });

  it("calls module-level getStoreDetail with the parsed store ID", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockGetStoreDetailImpl.mockResolvedValue(validStoreDetail);

    const result = await getStoreDetail(42);

    expect(mockGetStoreDetailImpl).toHaveBeenCalledWith(42);
    expect(result).toEqual(validStoreDetail);
  });

  it("returns null when store not found", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockGetStoreDetailImpl.mockResolvedValue(null);

    const result = await getStoreDetail(999);

    expect(mockGetStoreDetailImpl).toHaveBeenCalledWith(999);
    expect(result).toBeNull();
  });

  it("logs output validation errors without throwing", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    // Return data that mismatches output schema — e.g. missing store_id
    mockGetStoreDetailImpl.mockResolvedValue({
      ...validStoreDetail,
      store_id: "not-a-number" as any,
    });

    const result = await getStoreDetail(42);

    expect(mockConsoleError).toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(result?.store_id).toBe("not-a-number");
  });
});
