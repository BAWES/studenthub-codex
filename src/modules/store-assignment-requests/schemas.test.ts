import { describe, it, expect } from "vitest";
import {
  storeAssignmentRequestItemSchema,
  listStoreAssignmentRequestsResultSchema,
  createStoreAssignmentRequestResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// storeAssignmentRequestItemSchema
// ---------------------------------------------------------------------------

describe("storeAssignmentRequestItemSchema", () => {
  it("accepts a valid store assignment request item", () => {
    const input = {
      sar_uuid: "abc-123-def",
      candidate_id: 42,
      store_id: 7,
      currency_code: "KWD",
      status: 10,
      created_at: "2026-01-15T10:00:00Z",
      updated_at: "2026-01-15T12:00:00Z",
    };
    const result = storeAssignmentRequestItemSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("accepts all-nullable fields as null", () => {
    const input = {
      sar_uuid: "abc-456-def",
      candidate_id: null,
      store_id: null,
      currency_code: null,
      status: null,
      created_at: null,
      updated_at: null,
    };
    const result = storeAssignmentRequestItemSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects missing sar_uuid", () => {
    const input = {
      candidate_id: 42,
      store_id: 7,
    };
    const result = storeAssignmentRequestItemSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects non-string sar_uuid", () => {
    const input = {
      sar_uuid: 12345,
      candidate_id: null,
      store_id: null,
      currency_code: null,
      status: null,
      created_at: null,
      updated_at: null,
    };
    const result = storeAssignmentRequestItemSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects non-number candidate_id", () => {
    const input = {
      sar_uuid: "abc-789-def",
      candidate_id: "not-a-number",
      store_id: null,
      currency_code: null,
      status: null,
      created_at: null,
      updated_at: null,
    };
    const result = storeAssignmentRequestItemSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listStoreAssignmentRequestsResultSchema
// ---------------------------------------------------------------------------

describe("listStoreAssignmentRequestsResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const input = {
      items: [
        {
          sar_uuid: "abc-111",
          candidate_id: 1,
          store_id: 2,
          currency_code: "KWD",
          status: 10,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
        {
          sar_uuid: "abc-222",
          candidate_id: null,
          store_id: null,
          currency_code: null,
          status: null,
          created_at: null,
          updated_at: null,
        },
      ],
      total: 2,
      page: 1,
      pageSize: 20,
    };
    const result = listStoreAssignmentRequestsResultSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toHaveLength(2);
    }
  });

  it("accepts an empty items array", () => {
    const input = {
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    };
    const result = listStoreAssignmentRequestsResultSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toHaveLength(0);
    }
  });

  it("rejects negative total", () => {
    const input = {
      items: [],
      total: -1,
      page: 1,
      pageSize: 20,
    };
    const result = listStoreAssignmentRequestsResultSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects non-positive page", () => {
    const input = {
      items: [],
      total: 0,
      page: -1,
      pageSize: 20,
    };
    const result = listStoreAssignmentRequestsResultSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects pageSize exceeding 100", () => {
    const input = {
      items: [],
      total: 0,
      page: 1,
      pageSize: 200,
    };
    const result = listStoreAssignmentRequestsResultSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects non-array items", () => {
    const input = {
      items: "not-an-array",
      total: 0,
      page: 1,
      pageSize: 20,
    };
    const result = listStoreAssignmentRequestsResultSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects an item with invalid sar_uuid in the array", () => {
    const input = {
      items: [
        {
          sar_uuid: 999,
          candidate_id: null,
          store_id: null,
          currency_code: null,
          status: null,
          created_at: null,
          updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    };
    const result = listStoreAssignmentRequestsResultSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createStoreAssignmentRequestResultSchema
// ---------------------------------------------------------------------------

describe("createStoreAssignmentRequestResultSchema", () => {
  it("accepts a valid creation result with optional sar_uuid", () => {
    const result = createStoreAssignmentRequestResultSchema.safeParse({
      operation: "create",
      message: "Store assignment request created",
      sar_uuid: "abc-123-def",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a creation result without sar_uuid", () => {
    const result = createStoreAssignmentRequestResultSchema.safeParse({
      operation: "create",
      message: "Store assignment request created",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing operation", () => {
    const result = createStoreAssignmentRequestResultSchema.safeParse({
      message: "Created",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing message", () => {
    const result = createStoreAssignmentRequestResultSchema.safeParse({
      operation: "create",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-string operation", () => {
    const result = createStoreAssignmentRequestResultSchema.safeParse({
      operation: 42,
      message: "Created",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-string sar_uuid when provided", () => {
    const result = createStoreAssignmentRequestResultSchema.safeParse({
      operation: "create",
      message: "Created",
      sar_uuid: 12345,
    });
    expect(result.success).toBe(false);
  });

  it("strips unknown extra fields", () => {
    const result = createStoreAssignmentRequestResultSchema.safeParse({
      operation: "create",
      message: "Created",
      extraField: "should be stripped",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as any).extraField).toBeUndefined();
    }
  });
});
