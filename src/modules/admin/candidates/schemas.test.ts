import { describe, it, expect } from "vitest";
import {
  candidateRowOutputSchema,
  candidateListOutputSchema,
  candidateDetailObjectOutputSchema,
  candidateDetailOutputSchema,
  candidateActionResultOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Output schema validation tests
// ---------------------------------------------------------------------------

describe("candidateRowOutputSchema", () => {
  const validRow = {
    candidate_id: 1,
    name: "John Doe",
    name_ar: "جون دو",
    email: "john@example.com",
    phone: "+96512345678",
    status: 1,
    store_name: "Main Store",
    created_at: "2026-06-15T10:00:00",
    updated_at: "2026-06-15T10:00:00",
  };

  it("accepts a valid candidate row", () => {
    expect(candidateRowOutputSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts null optional fields", () => {
    expect(
      candidateRowOutputSchema.safeParse({
        ...validRow,
        phone: null,
        store_name: null,
        created_at: null,
        updated_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing candidate_id", () => {
    const { candidate_id: _, ...rest } = validRow;
    expect(candidateRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for status", () => {
    expect(
      candidateRowOutputSchema.safeParse({ ...validRow, status: "active" })
        .success,
    ).toBe(false);
  });
});

describe("candidateListOutputSchema", () => {
  const validList = {
    items: [
      {
        candidate_id: 1,
        name: "John Doe",
        name_ar: "",
        email: "john@example.com",
        phone: null,
        status: 1,
        store_name: null,
        created_at: null,
        updated_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid paginated result", () => {
    expect(candidateListOutputSchema.safeParse(validList).success).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      candidateListOutputSchema.safeParse({
        ...validList,
        items: [],
        total: 0,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validList;
    expect(candidateListOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      candidateListOutputSchema.safeParse({ ...validList, total: -1 }).success,
    ).toBe(false);
  });
});

describe("candidateDetailObjectOutputSchema", () => {
  const validDetail = {
    candidate_id: 1,
    candidate_name: "John Doe",
    candidate_name_ar: "جون دو",
    candidate_email: "john@example.com",
    candidate_phone: "+96512345678",
    candidate_status: 1,
    candidate_gender: 1,
    candidate_birth_date: "1990-01-01",
    candidate_hourly_rate: 15.5,
    currency_code: "KWD",
    candidate_created_at: "2026-06-15T10:00:00",
    candidate_updated_at: "2026-06-15T10:00:00",
    store: { store_name: "Main Store" },
    country: { country_name_en: "Kuwait" },
  };

  it("accepts a valid candidate detail object", () => {
    expect(
      candidateDetailObjectOutputSchema.safeParse(validDetail).success,
    ).toBe(true);
  });

  it("accepts null nullable fields", () => {
    expect(
      candidateDetailObjectOutputSchema.safeParse({
        ...validDetail,
        candidate_phone: null,
        candidate_gender: null,
        candidate_birth_date: null,
        candidate_hourly_rate: null,
        currency_code: null,
        candidate_created_at: null,
        candidate_updated_at: null,
        store: null,
        country: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing candidate_name", () => {
    const { candidate_name: _, ...rest } = validDetail;
    expect(candidateDetailObjectOutputSchema.safeParse(rest).success).toBe(
      false,
    );
  });
});

describe("candidateDetailOutputSchema", () => {
  const validOutput = {
    candidate: {
      candidate_id: 1,
      candidate_name: "John Doe",
      candidate_name_ar: "جون دو",
      candidate_email: "john@example.com",
      candidate_phone: null,
      candidate_status: 1,
      candidate_gender: null,
      candidate_birth_date: null,
      candidate_hourly_rate: null,
      currency_code: null,
      candidate_created_at: null,
      candidate_updated_at: null,
      store: null,
      country: null,
    },
    metrics: [
      { label: "Applications", value: 5, note: "Total applications" },
    ],
  };

  it("accepts a valid candidate detail output", () => {
    expect(candidateDetailOutputSchema.safeParse(validOutput).success).toBe(
      true,
    );
  });

  it("accepts null candidate", () => {
    expect(
      candidateDetailOutputSchema.safeParse({
        ...validOutput,
        candidate: null,
      }).success,
    ).toBe(true);
  });

  it("accepts string metric values", () => {
    expect(
      candidateDetailOutputSchema.safeParse({
        ...validOutput,
        metrics: [{ label: "Status", value: "Active", note: "Current status" }],
      }).success,
    ).toBe(true);
  });

  it("rejects missing metrics", () => {
    const { metrics: _, ...rest } = validOutput;
    expect(candidateDetailOutputSchema.safeParse(rest).success).toBe(false);
  });
});

describe("candidateActionResultOutputSchema", () => {
  it("accepts success result", () => {
    const r = candidateActionResultOutputSchema.safeParse({
      success: true,
      candidateId: 42,
    });
    expect(r.success).toBe(true);
  });

  it("accepts error result", () => {
    const r = candidateActionResultOutputSchema.safeParse({
      success: false,
      error: "Candidate not found",
    });
    expect(r.success).toBe(true);
  });

  it("rejects success without candidateId", () => {
    expect(
      candidateActionResultOutputSchema.safeParse({
        success: true,
      }).success,
    ).toBe(false);
  });

  it("rejects invalid success key", () => {
    expect(
      candidateActionResultOutputSchema.safeParse({
        success: "yes",
        candidateId: 42,
      }).success,
    ).toBe(false);
  });

  it("rejects error without error message", () => {
    expect(
      candidateActionResultOutputSchema.safeParse({
        success: false,
      }).success,
    ).toBe(false);
  });
});
