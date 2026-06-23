import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const mockGetInvoice = vi.hoisted(() => vi.fn());

vi.mock("../../../invoices/actions", () => ({
  getInvoice: mockGetInvoice,
}));

import { getInvoice } from "../actions";

// ---------------------------------------------------------------------------
// getInvoice — thin wrapper delegation
// ---------------------------------------------------------------------------

describe("getInvoice (wrapper)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls parent getInvoice with the invoice ID", async () => {
    mockGetInvoice.mockResolvedValue(undefined as any);

    await getInvoice(1);

    expect(mockGetInvoice).toHaveBeenCalledWith(1);
  });

  it("returns the result from parent getInvoice", async () => {
    const expected = { invoice: { invoice_id: 1 } };
    mockGetInvoice.mockResolvedValue(expected);

    const result = await getInvoice(1);

    expect(result).toBe(expected);
  });

  it("propagates errors from parent getInvoice", async () => {
    mockGetInvoice.mockRejectedValue(new Error("Parent error"));

    await expect(getInvoice(999)).rejects.toThrow("Parent error");
  });

  it("propagates null result from parent", async () => {
    mockGetInvoice.mockResolvedValue(null);

    const result = await getInvoice(999);

    expect(result).toBeNull();
  });
});
