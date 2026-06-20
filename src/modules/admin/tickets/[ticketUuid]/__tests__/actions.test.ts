import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const mockGetTicket = vi.hoisted(() => vi.fn());

vi.mock("../../actions", () => ({
  getTicket: mockGetTicket,
}));

import { getTicket } from "../actions";

// ---------------------------------------------------------------------------
// getTicket — thin wrapper delegation
// ---------------------------------------------------------------------------

describe("getTicket (wrapper)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls parent getTicket with the ticket UUID", async () => {
    mockGetTicket.mockResolvedValue(undefined as any);

    await getTicket("tkt-uuid-1");

    expect(mockGetTicket).toHaveBeenCalledWith("tkt-uuid-1");
  });

  it("returns the result from parent getTicket", async () => {
    const expected = { ticket: { ticket_uuid: "tkt-uuid-1" } };
    mockGetTicket.mockResolvedValue(expected);

    const result = await getTicket("tkt-uuid-1");

    expect(result).toBe(expected);
  });

  it("propagates errors from parent getTicket", async () => {
    mockGetTicket.mockRejectedValue(new Error("Parent error"));

    await expect(getTicket("invalid-uuid")).rejects.toThrow("Parent error");
  });

  it("propagates null ticket from parent", async () => {
    mockGetTicket.mockResolvedValue({ ticket: null });

    const result = await getTicket("nonexistent-uuid");

    expect(result.ticket).toBeNull();
  });
});
