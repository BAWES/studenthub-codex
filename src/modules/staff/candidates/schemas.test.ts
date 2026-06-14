import { describe, it, expect } from "vitest";
import {
  listCandidatesSchema,
  getCandidateByIdSchema,
  candidateRowOutputSchema,
  candidateListOutputSchema,
  candidateDetailOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listCandidatesSchema
// ---------------------------------------------------------------------------
describe("listCandidatesSchema", () => {
  it("accepts empty input with defaults", () => {
    const r = listCandidatesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts with filters", () => {
    const r = listCandidatesSchema.safeParse({
      page: 2,
      limit: 10,
      q: "john",
      status: "active",
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative page", () => {
    expect(listCandidatesSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listCandidatesSchema.safeParse({ limit: 200 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getCandidateByIdSchema
// ---------------------------------------------------------------------------
describe("getCandidateByIdSchema", () => {
  it("accepts valid ID", () => {
    const r = getCandidateByIdSchema.safeParse({ candidateId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(42);
    }
  });

  it("coerces string ID", () => {
    const r = getCandidateByIdSchema.safeParse({ candidateId: "42" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(42);
    }
  });

  it("rejects non-positive ID", () => {
    expect(getCandidateByIdSchema.safeParse({ candidateId: 0 }).success).toBe(false);
    expect(getCandidateByIdSchema.safeParse({ candidateId: -1 }).success).toBe(false);
  });

  it("rejects missing ID", () => {
    expect(getCandidateByIdSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateRowOutputSchema
// ---------------------------------------------------------------------------
describe("candidateRowOutputSchema", () => {
  const valid = {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: null,
    status: 1,
    createdAt: "2026-01-01T00:00:00Z",
  };

  it("accepts valid row", () => {
    expect(candidateRowOutputSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable phone", () => {
    const r = candidateRowOutputSchema.safeParse({
      ...valid,
      phone: "+965 12345678",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = valid;
    expect(candidateRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing name", () => {
    const { name: _, ...rest } = valid;
    expect(candidateRowOutputSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateListOutputSchema
// ---------------------------------------------------------------------------
describe("candidateListOutputSchema", () => {
  const valid = {
    items: [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        phone: null,
        status: 1,
        createdAt: "2026-01-01T00:00:00Z",
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts valid response", () => {
    expect(candidateListOutputSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty items", () => {
    const r = candidateListOutputSchema.safeParse({
      ...valid,
      items: [],
      total: 0,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      candidateListOutputSchema.safeParse({ ...valid, total: -1 }).success
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateDetailOutputSchema
// ---------------------------------------------------------------------------
describe("candidateDetailOutputSchema", () => {
  const valid = {
    id: 1,
    name: "John Doe",
    nameAr: "جون دو",
    email: "john@example.com",
    phone: null,
    gender: null,
    objective: null,
    status: 1,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-15T00:00:00Z",
  };

  it("accepts valid detail", () => {
    expect(candidateDetailOutputSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts with all fields", () => {
    const r = candidateDetailOutputSchema.safeParse({
      ...valid,
      phone: "+965 12345678",
      gender: 1,
      objective: "Looking for a software engineering role",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = valid;
    expect(candidateDetailOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing email", () => {
    const { email: _, ...rest } = valid;
    expect(candidateDetailOutputSchema.safeParse(rest).success).toBe(false);
  });
});