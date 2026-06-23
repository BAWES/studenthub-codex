import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const mockGetCandidateEducation = vi.hoisted(() => vi.fn());

vi.mock("../../actions", () => ({
  getCandidateEducation: mockGetCandidateEducation,
}));

import { getCandidateEducation } from "../actions";

// ---------------------------------------------------------------------------
// getCandidateEducation — thin wrapper delegation
// ---------------------------------------------------------------------------

describe("getCandidateEducation (wrapper)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls parent getCandidateEducation with the input params", async () => {
    const input = { education_uuid: "edu-uuid-1" };
    mockGetCandidateEducation.mockResolvedValue(undefined as any);

    await getCandidateEducation(input);

    expect(mockGetCandidateEducation).toHaveBeenCalledWith(input);
  });

  it("returns the result from parent getCandidateEducation", async () => {
    const expected = { education: { education_uuid: "edu-uuid-1" } };
    mockGetCandidateEducation.mockResolvedValue(expected);

    const result = await getCandidateEducation({ education_uuid: "edu-uuid-1" });

    expect(result).toBe(expected);
  });

  it("propagates errors from parent getCandidateEducation", async () => {
    mockGetCandidateEducation.mockRejectedValue(new Error("Parent error"));

    await expect(getCandidateEducation({ education_uuid: "edu-uuid-1" })).rejects.toThrow("Parent error");
  });

  it("propagates null result from parent", async () => {
    mockGetCandidateEducation.mockResolvedValue(null);

    const result = await getCandidateEducation({ education_uuid: "nonexistent" });

    expect(result).toBeNull();
  });
});
