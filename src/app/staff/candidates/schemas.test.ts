import { describe, it, expect } from "vitest";
import {
  candidateRowOutputSchema,
  candidateListOutputSchema,
  candidateDetailOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Output schema validation tests
// ---------------------------------------------------------------------------

describe("candidateRowOutputSchema", () => {
  const validRow = {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+965 5555 0000",
    status: 1,
    createdAt: "2026-06-12T10:00:00.000Z",
  };

  it("accepts a valid candidate row with all fields", () => {
    expect(candidateRowOutputSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts null phone", () => {
    expect(
      candidateRowOutputSchema.safeParse({
        ...validRow,
        phone: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validRow;
    expect(candidateRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing name", () => {
    const { name: _, ...rest } = validRow;
    expect(candidateRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing email", () => {
    const { email: _, ...rest } = validRow;
    expect(candidateRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing status", () => {
    const { status: _, ...rest } = validRow;
    expect(candidateRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing createdAt", () => {
    const { createdAt: _, ...rest } = validRow;
    expect(candidateRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for id", () => {
    expect(
      candidateRowOutputSchema.safeParse({
        ...validRow,
        id: "abc",
      }).success,
    ).toBe(false);
  });

  it("rejects wrong type for status", () => {
    expect(
      candidateRowOutputSchema.safeParse({
        ...validRow,
        status: "active",
      }).success,
    ).toBe(false);
  });

  it("rejects wrong type for name", () => {
    expect(
      candidateRowOutputSchema.safeParse({
        ...validRow,
        name: 123,
      }).success,
    ).toBe(false);
  });
});

describe("candidateListOutputSchema", () => {
  const validList = {
    items: [
      {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
        phone: null,
        status: 1,
        createdAt: "2026-06-12T10:00:00.000Z",
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid paginated candidate list", () => {
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

  it("rejects missing items field", () => {
    const { items: _, ...rest } = validList;
    expect(candidateListOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = validList;
    expect(candidateListOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing page", () => {
    const { page: _, ...rest } = validList;
    expect(candidateListOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing limit", () => {
    const { limit: _, ...rest } = validList;
    expect(candidateListOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing totalPages", () => {
    const { totalPages: _, ...rest } = validList;
    expect(candidateListOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      candidateListOutputSchema.safeParse({
        ...validList,
        total: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects negative totalPages", () => {
    expect(
      candidateListOutputSchema.safeParse({
        ...validList,
        totalPages: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects page <= 0", () => {
    expect(
      candidateListOutputSchema.safeParse({
        ...validList,
        page: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects wrong type in items array", () => {
    expect(
      candidateListOutputSchema.safeParse({
        ...validList,
        items: [{ id: "abc", name: "Test", email: "t@t.com", status: 1, createdAt: "2026-01-01" }],
      }).success,
    ).toBe(false);
  });
});

describe("candidateDetailOutputSchema", () => {
  const validDetail = {
    id: 1,
    name: "John Doe",
    nameAr: "جون دو",
    email: "john.doe@example.com",
    phone: "+965 5555 0000",
    gender: 1,
    objective: "Seeking a challenging position.",
    status: 1,
    createdAt: "2026-06-12T10:00:00.000Z",
    updatedAt: "2026-06-12T10:00:00.000Z",
  };

  it("accepts a valid candidate detail with all fields", () => {
    expect(candidateDetailOutputSchema.safeParse(validDetail).success).toBe(
      true,
    );
  });

  it("accepts null phone", () => {
    expect(
      candidateDetailOutputSchema.safeParse({
        ...validDetail,
        phone: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null gender", () => {
    expect(
      candidateDetailOutputSchema.safeParse({
        ...validDetail,
        gender: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null objective", () => {
    expect(
      candidateDetailOutputSchema.safeParse({
        ...validDetail,
        objective: null,
      }).success,
    ).toBe(true);
  });

  it("accepts empty nameAr", () => {
    expect(
      candidateDetailOutputSchema.safeParse({
        ...validDetail,
        nameAr: "",
      }).success,
    ).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validDetail;
    expect(candidateDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing name", () => {
    const { name: _, ...rest } = validDetail;
    expect(candidateDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing nameAr", () => {
    const { nameAr: _, ...rest } = validDetail;
    expect(candidateDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing email", () => {
    const { email: _, ...rest } = validDetail;
    expect(candidateDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing status", () => {
    const { status: _, ...rest } = validDetail;
    expect(candidateDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing createdAt", () => {
    const { createdAt: _, ...rest } = validDetail;
    expect(candidateDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing updatedAt", () => {
    const { updatedAt: _, ...rest } = validDetail;
    expect(candidateDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for id", () => {
    expect(
      candidateDetailOutputSchema.safeParse({
        ...validDetail,
        id: "abc",
      }).success,
    ).toBe(false);
  });

  it("rejects wrong type for status", () => {
    expect(
      candidateDetailOutputSchema.safeParse({
        ...validDetail,
        status: "active",
      }).success,
    ).toBe(false);
  });

  it("rejects wrong type for gender", () => {
    expect(
      candidateDetailOutputSchema.safeParse({
        ...validDetail,
        gender: "male",
      }).success,
    ).toBe(false);
  });
});
