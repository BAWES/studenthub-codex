import { describe, it, expect } from "vitest";
import {
  candidateRowOutputSchema,
  candidateListOutputSchema,
  candidateDetailOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// candidateRowOutputSchema
// ---------------------------------------------------------------------------

describe("candidateRowOutputSchema", () => {
  const validRow = () => ({
    id: 123,
    name: "John Doe",
    email: "john@example.com",
    phone: "+965 5555 1234",
    status: 1,
    createdAt: "2026-06-01T10:00:00.000Z",
  });

  it("accepts a valid candidate row", () => {
    const r = candidateRowOutputSchema.safeParse(validRow());
    expect(r.success).toBe(true);
  });

  it("accepts nullable phone", () => {
    const r = candidateRowOutputSchema.safeParse({ ...validRow(), phone: null });
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validRow();
    expect(candidateRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-integer id", () => {
    expect(
      candidateRowOutputSchema.safeParse({ ...validRow(), id: 12.5 }).success,
    ).toBe(false);
  });

  it("rejects non-string email", () => {
    expect(
      candidateRowOutputSchema.safeParse({ ...validRow(), email: null }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateListOutputSchema
// ---------------------------------------------------------------------------

describe("candidateListOutputSchema", () => {
  const validRow = () => ({
    id: 1,
    name: "Jane",
    email: "j@example.com",
    phone: null,
    status: 2,
    createdAt: "2026-06-01T00:00:00.000Z",
  });

  it("accepts a valid paginated result", () => {
    const r = candidateListOutputSchema.safeParse({
      items: [validRow()],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty items array", () => {
    const r = candidateListOutputSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    const r = candidateListOutputSchema.safeParse({
      items: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing page", () => {
    const payload = {
      items: [validRow()],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    const { page: _, ...rest } = payload;
    expect(candidateListOutputSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateDetailOutputSchema
// ---------------------------------------------------------------------------

describe("candidateDetailOutputSchema", () => {
  const validDetail = () => ({
    id: 456,
    name: "Alice Smith",
    nameAr: "أليس سميث",
    email: "alice@example.com",
    phone: "+965 5555 6789",
    gender: 1,
    objective: "Looking for opportunities",
    status: 2,
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-10T00:00:00.000Z",
  });

  it("accepts a valid candidate detail", () => {
    const r = candidateDetailOutputSchema.safeParse(validDetail());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = candidateDetailOutputSchema.safeParse({
      ...validDetail(),
      phone: null,
      gender: null,
      objective: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing nameAr", () => {
    const { nameAr: _, ...rest } = validDetail();
    expect(candidateDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-integer gender", () => {
    expect(
      candidateDetailOutputSchema.safeParse({ ...validDetail(), gender: "male" }).success,
    ).toBe(false);
  });
});
