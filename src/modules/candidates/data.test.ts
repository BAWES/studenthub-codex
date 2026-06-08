import { describe, it, expect } from "vitest";
import { toCandidateRow } from "./data";

describe("toCandidateRow", () => {
  const baseRow = {
    candidate_id: 42,
    candidate_name: "Ahmed Al-Sayed",
    candidate_email: "ahmed@example.com",
    candidate_status: 10,
    approved: 1,
    candidate_hourly_rate: "15.5",
    currency_code: "KWD",
    candidate_updated_at: new Date("2025-06-01T12:00:00Z"),
    country: { country_name_en: "Kuwait" }
  };

  it("maps a candidate row with all fields", () => {
    const result = toCandidateRow(baseRow);

    expect(result.id).toBe(42);
    expect(result.name).toBe("Ahmed Al-Sayed");
    expect(result.email).toBe("ahmed@example.com");
    expect(result.country).toBe("Kuwait");
    expect(result.status).toBe("Active");
    expect(result.rate).toContain("KWD");
    expect(result.updated).not.toBe("Not set");
  });

  it('returns "Needs review" when approved is 0', () => {
    const result = toCandidateRow({ ...baseRow, approved: 0 });

    expect(result.status).toBe("Needs review");
  });

  it("returns status label for non-10 candidate_status", () => {
    const result = toCandidateRow({ ...baseRow, candidate_status: 5 });

    expect(result.status).toBe("Status 5");
  });

  it('returns "No country" when country is null', () => {
    const result = toCandidateRow({ ...baseRow, country: null });

    expect(result.country).toBe("No country");
  });

  it("handles null rate gracefully", () => {
    const result = toCandidateRow({ ...baseRow, candidate_hourly_rate: null, currency_code: null });

    expect(result.rate).toBe("0");
  });

  it("handles null updated_at", () => {
    const result = toCandidateRow({ ...baseRow, candidate_updated_at: null });

    expect(result.updated).toBe("Not set");
  });
});
