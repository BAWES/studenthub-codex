import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema definitions matching actions.ts
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

type ListIdRequestsInput = z.input<typeof listIdRequestsSchema>;
type GetIdRequestInput = z.input<typeof getIdRequestSchema>;
type CreateIdRequestInput = z.input<typeof createIdRequestSchema>;

export type IdRequestListItem = {
  cir_uuid: string;
  candidate_count: number;
  status: string | null;
  rejection_reason: string | null;
  created_at: Date | null;
  updated_at: Date | null;
};

export type IdRequestDetail = {
  cir_uuid: string;
  candidate_ids: string | null;
  status: string | null;
  rejection_reason: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  created_by_name: string | null;
  updated_by_name: string | null;
};

type ListIdRequestsResult = {
  requests: IdRequestListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type CreateIdRequestResult = {
  cir_uuid: string;
  status: string;
};

// ---------------------------------------------------------------------------
// Schema tests — listIdRequestsSchema
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Schema tests — getIdRequestSchema
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Schema tests — createIdRequestSchema
// ---------------------------------------------------------------------------

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
// Type shape tests
// ---------------------------------------------------------------------------

describe("IdRequestListItem shape", () => {
  it("defines expected fields", () => {
    const mock: IdRequestListItem = {
      cir_uuid: "req_001",
      candidate_count: 3,
      status: "pending",
      rejection_reason: null,
      created_at: new Date("2026-01-01"),
      updated_at: new Date("2026-01-02"),
    };
    expect(mock.cir_uuid).toBe("req_001");
    expect(mock.candidate_count).toBe(3);
    expect(mock.status).toBe("pending");
    expect(mock.rejection_reason).toBeNull();
  });
});

describe("IdRequestDetail shape", () => {
  it("defines expected fields", () => {
    const mock: IdRequestDetail = {
      cir_uuid: "req_002",
      candidate_ids: "1,2,3",
      status: "verified",
      rejection_reason: null,
      created_at: new Date("2026-02-01"),
      updated_at: new Date("2026-02-02"),
      created_by_name: "John Staff",
      updated_by_name: "Jane Staff",
    };
    expect(mock.cir_uuid).toBe("req_002");
    expect(mock.status).toBe("verified");
    expect(mock.created_by_name).toBe("John Staff");
  });
});

describe("ListIdRequestsResult shape", () => {
  it("accepts empty result", () => {
    const r: ListIdRequestsResult = {
      requests: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(r.total).toBe(0);
    expect(r.requests).toHaveLength(0);
  });

  it("accepts populated result", () => {
    const r: ListIdRequestsResult = {
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
    };
    expect(r.requests).toHaveLength(1);
    expect(r.total).toBe(1);
  });
});

describe("CreateIdRequestResult shape", () => {
  it("accepts success result", () => {
    const r: CreateIdRequestResult = {
      cir_uuid: "req_new_001",
      status: "pending",
    };
    expect(r.cir_uuid).toBe("req_new_001");
    expect(r.status).toBe("pending");
  });
});
