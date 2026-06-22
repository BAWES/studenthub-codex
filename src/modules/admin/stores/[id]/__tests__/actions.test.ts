import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const mockGetStore = vi.hoisted(() => vi.fn());

vi.mock("../../actions", () => ({
  getStore: mockGetStore,
}));

import { getStore } from "../actions";

// ---------------------------------------------------------------------------
// getStore — thin wrapper delegation
// ---------------------------------------------------------------------------

describe("getStore (wrapper)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls parent getStore with the store ID", async () => {
    mockGetStore.mockResolvedValue(undefined as any);

    await getStore(1);

    expect(mockGetStore).toHaveBeenCalledWith(1);
  });

  it("returns the result from parent getStore", async () => {
    const expected = { store_id: 1, store_name: "Test Store" };
    mockGetStore.mockResolvedValue(expected);

    const result = await getStore(1);

    expect(result).toBe(expected);
  });

  it("propagates errors from parent getStore", async () => {
    mockGetStore.mockRejectedValue(new Error("Parent error"));

    await expect(getStore(999)).rejects.toThrow("Parent error");
  });

  it("propagates null result from parent", async () => {
    mockGetStore.mockResolvedValue(null);

    const result = await getStore(999);

    expect(result).toBeNull();
  });
});
