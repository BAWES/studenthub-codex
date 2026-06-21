import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: store assignment request schema validation
// ---------------------------------------------------------------------------

const listStoreAssignmentRequestsSchema = z.object({
  candidateId: z.coerce.number().int().positive().optional(),
  storeId: z.coerce.number().int().positive().optional(),
  status: z.coerce.number().int().min(0).max(255).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getStoreAssignmentRequestSchema = z.object({
  sarUuid: z.string().min(1, "SAR UUID is required"),
});

const createStoreAssignmentRequestSchema = z.object({
  candidateId: z.coerce.number().int().positive("Candidate ID is required"),
  storeId: z.coerce.number().int().positive("Store ID is required"),
  currencyCode: z.string().length(3).optional().default("KWD"),
  status: z.coerce.number().int().min(0).max(255).optional().default(0),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StoreAssignmentRequestItem = {
  sar_uuid: string;
  candidate_id: number | null;
  store_id: number | null;
  currency_code: string | null;
  status: number | null;
  created_at: string | null;
  updated_at: string | null;
};

type ListStoreAssignmentRequestsResult = {
  items: StoreAssignmentRequestItem[];
  total: number;
  page: number;
  pageSize: number;
};

type CreateStoreAssignmentRequestResult = {
  sar_uuid: string;
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("listStoreAssignmentRequestsSchema", () => {
  it("accepts empty params with defaults", () => {
    const result = listStoreAssignmentRequestsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts candidateId filter", () => {
    const result = listStoreAssignmentRequestsSchema.safeParse({
      candidateId: 5,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(5);
    }
  });

  it("accepts storeId filter", () => {
    const result = listStoreAssignmentRequestsSchema.safeParse({
      storeId: 10,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.storeId).toBe(10);
    }
  });

  it("accepts status filter", () => {
    const result = listStoreAssignmentRequestsSchema.safeParse({
      status: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(1);
    }
  });

  it("rejects limit over 100", () => {
    const result = listStoreAssignmentRequestsSchema.safeParse({
      limit: 150,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listStoreAssignmentRequestsSchema.safeParse({
      page: -1,
    });
    expect(result.success).toBe(false);
  });

  it("coerces string values", () => {
    const result = listStoreAssignmentRequestsSchema.safeParse({
      page: "3",
      limit: "25",
      candidateId: "2",
      status: "1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.candidateId).toBe(2);
      expect(result.data.status).toBe(1);
    }
  });
});

describe("getStoreAssignmentRequestSchema", () => {
  it("accepts a valid UUID string", () => {
    const result = getStoreAssignmentRequestSchema.safeParse({
      sarUuid: "abc-123-def",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty string", () => {
    const result = getStoreAssignmentRequestSchema.safeParse({ sarUuid: "" });
    expect(result.success).toBe(false);
  });
});

describe("createStoreAssignmentRequestSchema", () => {
  it("accepts valid params with defaults", () => {
    const result = createStoreAssignmentRequestSchema.safeParse({
      candidateId: 1,
      storeId: 2,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currencyCode).toBe("KWD");
      expect(result.data.status).toBe(0);
    }
  });

  it("accepts explicit currency code", () => {
    const result = createStoreAssignmentRequestSchema.safeParse({
      candidateId: 1,
      storeId: 2,
      currencyCode: "USD",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currencyCode).toBe("USD");
    }
  });

  it("rejects missing candidateId", () => {
    const result = createStoreAssignmentRequestSchema.safeParse({
      storeId: 2,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing storeId", () => {
    const result = createStoreAssignmentRequestSchema.safeParse({
      candidateId: 1,
    });
    expect(result.success).toBe(false);
  });
});

describe("StoreAssignmentRequestItem shape", () => {
  it("defines the expected fields", () => {
    const mock: StoreAssignmentRequestItem = {
      sar_uuid: "uuid-1",
      candidate_id: 1,
      store_id: 2,
      currency_code: "KWD",
      status: 0,
      created_at: "2025-01-01T00:00:00.000Z",
      updated_at: "2025-06-01T00:00:00.000Z",
    };
    expect(mock.sar_uuid).toBe("uuid-1");
    expect(mock.candidate_id).toBe(1);
    expect(mock.store_id).toBe(2);
    expect(mock.currency_code).toBe("KWD");
    expect(mock.status).toBe(0);
  });
});

describe("ListStoreAssignmentRequestsResult shape", () => {
  it("accepts an empty result set", () => {
    const result: ListStoreAssignmentRequestsResult = {
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    };
    expect(result.total).toBe(0);
    expect(result.items).toHaveLength(0);
  });
});

describe("CreateStoreAssignmentRequestResult shape", () => {
  it("holds a sar_uuid", () => {
    const result: CreateStoreAssignmentRequestResult = {
      sar_uuid: "new-uuid-here",
    };
    expect(result.sar_uuid).toBeTruthy();
  });
});
