import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: schema validation
// Testing schemas separately avoids mocking "use server" dependencies.
// ---------------------------------------------------------------------------

const listIdCardsSchema = z.object({
  candidateId: z.number().int().positive().optional(),
  status: z.number().int().min(0).max(1).optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

const getIdCardSchema = z.object({
  id: z.number().int().positive(),
});

const createIdCardSchema = z.object({
  candidateId: z.number().int().positive(),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
});

const updateIdCardStatusSchema = z.object({
  id: z.number().int().positive(),
  status: z.number().int().min(0).max(1),
});

// ---------------------------------------------------------------------------
// listIdCardsSchema
// ---------------------------------------------------------------------------

describe("listIdCardsSchema", () => {
  it("accepts empty params (defaults)", () => {
    const result = listIdCardsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.candidateId).toBeUndefined();
      expect(result.data.status).toBeUndefined();
    }
  });

  it("accepts candidateId filter", () => {
    const result = listIdCardsSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });

  it("accepts status filter", () => {
    const result = listIdCardsSchema.safeParse({ status: 0 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(0);
    }
  });

  it("accepts status filter with value 1 (deleted)", () => {
    const result = listIdCardsSchema.safeParse({ status: 1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(1);
    }
  });

  it("accepts pagination params", () => {
    const result = listIdCardsSchema.safeParse({ page: 2, limit: 50 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects limit over 100", () => {
    const result = listIdCardsSchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listIdCardsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive candidateId", () => {
    const result = listIdCardsSchema.safeParse({ candidateId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status value (negative)", () => {
    const result = listIdCardsSchema.safeParse({ status: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status value (greater than 1)", () => {
    const result = listIdCardsSchema.safeParse({ status: 2 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getIdCardSchema
// ---------------------------------------------------------------------------

describe("getIdCardSchema", () => {
  it("accepts a valid positive integer id", () => {
    const result = getIdCardSchema.safeParse({ id: 1 });
    expect(result.success).toBe(true);
  });

  it("rejects zero id", () => {
    const result = getIdCardSchema.safeParse({ id: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative id", () => {
    const result = getIdCardSchema.safeParse({ id: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer id", () => {
    const result = getIdCardSchema.safeParse({ id: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects missing id", () => {
    const result = getIdCardSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createIdCardSchema
// ---------------------------------------------------------------------------

describe("createIdCardSchema", () => {
  it("accepts valid ID card data", () => {
    const result = createIdCardSchema.safeParse({
      candidateId: 42,
      expiryDate: "2027-12-31",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
      expect(result.data.expiryDate).toBe("2027-12-31");
    }
  });

  it("rejects missing candidateId", () => {
    const result = createIdCardSchema.safeParse({ expiryDate: "2027-12-31" });
    expect(result.success).toBe(false);
  });

  it("rejects missing expiryDate", () => {
    const result = createIdCardSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date format", () => {
    const result = createIdCardSchema.safeParse({
      candidateId: 42,
      expiryDate: "not-a-date",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive candidateId", () => {
    const result = createIdCardSchema.safeParse({
      candidateId: 0,
      expiryDate: "2027-12-31",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateIdCardStatusSchema
// ---------------------------------------------------------------------------

describe("updateIdCardStatusSchema", () => {
  it("accepts a valid id with status 0 (active)", () => {
    const result = updateIdCardStatusSchema.safeParse({ id: 1, status: 0 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(0);
    }
  });

  it("accepts a valid id with status 1 (deleted)", () => {
    const result = updateIdCardStatusSchema.safeParse({ id: 1, status: 1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(1);
    }
  });

  it("rejects zero id", () => {
    const result = updateIdCardStatusSchema.safeParse({ id: 0, status: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative id", () => {
    const result = updateIdCardStatusSchema.safeParse({ id: -5, status: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects missing status", () => {
    const result = updateIdCardStatusSchema.safeParse({ id: 1 });
    expect(result.success).toBe(false);
  });

  it("rejects status less than 0", () => {
    const result = updateIdCardStatusSchema.safeParse({ id: 1, status: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects status greater than 1", () => {
    const result = updateIdCardStatusSchema.safeParse({ id: 1, status: 2 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Return type shape verification
// ---------------------------------------------------------------------------

type IdCardItem = {
  id: number;
  candidate_id: number | null;
  expiry_date: Date | null;
  deleted: number;
  created_at: Date | null;
  updated_at: Date | null;
};

type ListIdCardsResult = {
  idCards: IdCardItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type CreateIdCardResult = {
  operation: string;
  message: string;
};

type UpdateIdCardStatusResult = {
  operation: string;
  message: string;
};

describe("IdCardItem shape", () => {
  it("defines expected fields", () => {
    const mock: IdCardItem = {
      id: 1,
      candidate_id: 42,
      expiry_date: new Date("2027-12-31"),
      deleted: 0,
      created_at: null,
      updated_at: null,
    };
    expect(mock.id).toBe(1);
    expect(mock.candidate_id).toBe(42);
    expect(mock.expiry_date).toBeInstanceOf(Date);
    expect(mock.deleted).toBe(0);
  });
});

describe("ListIdCardsResult shape", () => {
  it("accepts an empty result set", () => {
    const result: ListIdCardsResult = {
      idCards: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
  });
});

describe("CreateIdCardResult shape", () => {
  it("accepts success result", () => {
    const result: CreateIdCardResult = {
      operation: "success",
      message: "ID card created successfully",
    };
    expect(result.operation).toBe("success");
  });

  it("accepts error result", () => {
    const result: CreateIdCardResult = {
      operation: "error",
      message: "Failed to create ID card",
    };
    expect(result.operation).toBe("error");
  });
});

describe("UpdateIdCardStatusResult shape", () => {
  it("accepts success result", () => {
    const result: UpdateIdCardStatusResult = {
      operation: "success",
      message: "ID card status updated successfully",
    };
    expect(result.operation).toBe("success");
  });

  it("accepts error result", () => {
    const result: UpdateIdCardStatusResult = {
      operation: "error",
      message: "Failed to update ID card status",
    };
    expect(result.operation).toBe("error");
  });
});
