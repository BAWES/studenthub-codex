import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  idRequestListItemSchema,
  idRequestDetailSchema,
  listIdRequestsResultSchema,
  createIdRequestResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schemas (duplicated from actions.ts for isolated unit testing)
// ---------------------------------------------------------------------------

const listIdRequestsSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getIdRequestSchema = z.object({
  cirUuid: z.string().min(1, "ID Request UUID is required"),
});

const createIdRequestSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  candidateIds: z.string().min(1, "At least one candidate ID is required"),
});

describe("listIdRequestsSchema", () => {
  it("requires candidateId", () => {
    const result = listIdRequestsSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts candidateId with defaults", () => {
    const result = listIdRequestsSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts custom pagination params", () => {
    const result = listIdRequestsSchema.safeParse({
      candidateId: 10,
      page: 2,
      limit: 50,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects limit over 100", () => {
    const result = listIdRequestsSchema.safeParse({
      candidateId: 1,
      limit: 999,
    });
    expect(result.success).toBe(false);
  });

  it("coerces string candidateId to number", () => {
    const result = listIdRequestsSchema.safeParse({
      candidateId: "15",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(15);
    }
  });
});

describe("getIdRequestSchema", () => {
  it("accepts valid UUID", () => {
    const result = getIdRequestSchema.safeParse({
      cirUuid: "abc-123-def",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cirUuid).toBe("abc-123-def");
    }
  });

  it("rejects empty UUID", () => {
    const result = getIdRequestSchema.safeParse({ cirUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getIdRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("createIdRequestSchema", () => {
  it("requires candidateId and candidateIds", () => {
    const result = createIdRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts valid input", () => {
    const result = createIdRequestSchema.safeParse({
      candidateId: 42,
      candidateIds: "42,43,44",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
      expect(result.data.candidateIds).toBe("42,43,44");
    }
  });

  it("rejects empty candidateIds", () => {
    const result = createIdRequestSchema.safeParse({
      candidateId: 1,
      candidateIds: "",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("idRequestListItemSchema", () => {
  it("parses a valid list item", () => {
    const result = idRequestListItemSchema.safeParse({
      cir_uuid: "req_001",
      candidate_count: 3,
      status: "pending",
      rejection_reason: null,
      created_at: new Date("2026-01-01"),
      updated_at: new Date("2026-01-02"),
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cir_uuid).toBe("req_001");
      expect(result.data.candidate_count).toBe(3);
    }
  });

  it("accepts nullable fields", () => {
    const result = idRequestListItemSchema.safeParse({
      cir_uuid: "req_001",
      candidate_count: 0,
      status: null,
      rejection_reason: null,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing cir_uuid", () => {
    const result = idRequestListItemSchema.safeParse({ candidate_count: 1 });
    expect(result.success).toBe(false);
  });
});

describe("idRequestDetailSchema", () => {
  it("parses a valid detail object with creator names", () => {
    const result = idRequestDetailSchema.safeParse({
      cir_uuid: "req_002",
      candidate_ids: "1,2,3",
      status: "verified",
      rejection_reason: null,
      created_at: new Date("2026-02-01"),
      updated_at: new Date("2026-02-02"),
      created_by_name: "John Staff",
      updated_by_name: "Jane Staff",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.created_by_name).toBe("John Staff");
    }
  });

  it("accepts null creator names", () => {
    const result = idRequestDetailSchema.safeParse({
      cir_uuid: "req_002",
      candidate_ids: "1,2,3",
      status: "pending",
      rejection_reason: null,
      created_at: null,
      updated_at: null,
      created_by_name: null,
      updated_by_name: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("listIdRequestsResultSchema", () => {
  it("parses empty result", () => {
    const result = listIdRequestsResultSchema.safeParse({
      requests: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
    expect(result.data?.total).toBe(0);
  });

  it("parses populated result", () => {
    const result = listIdRequestsResultSchema.safeParse({
      requests: [
        {
          cir_uuid: "req_003",
          candidate_count: 1,
          status: "approved",
          rejection_reason: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.requests).toHaveLength(1);
    }
  });

  it("rejects missing total", () => {
    const result = listIdRequestsResultSchema.safeParse({
      requests: [],
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("createIdRequestResultSchema", () => {
  it("parses success result", () => {
    const result = createIdRequestResultSchema.safeParse({
      cir_uuid: "req_new_001",
      status: "pending",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cir_uuid).toBe("req_new_001");
    }
  });

  it("rejects missing status", () => {
    const result = createIdRequestResultSchema.safeParse({ cir_uuid: "abc" });
    expect(result.success).toBe(false);
  });
});
