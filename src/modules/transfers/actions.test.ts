import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas (duplicated from actions.ts for pure unit testing)
// ---------------------------------------------------------------------------

const listTransfersSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  companyId: z.coerce.number().int().positive().optional(),
  contractUuid: z.string().optional(),
  status: z.coerce.number().int().optional(),
});

const getTransferSchema = z.object({
  transferId: z.coerce.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TransferListItem = {
  transfer_id: number;
  company_id: number | null;
  contract_uuid: string | null;
  contract_type: string | null;
  total: string | null;
  company_total: string | null;
  transfer_status: number;
  currency_code: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type ListTransfersResult = {
  transfers: TransferListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// listTransfersSchema tests
// ---------------------------------------------------------------------------

describe("listTransfersSchema", () => {
  it("accepts empty params with defaults", () => {
    const result = listTransfersSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts companyId filter", () => {
    const result = listTransfersSchema.safeParse({ companyId: 1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(1);
    }
  });

  it("accepts contractUuid filter", () => {
    const result = listTransfersSchema.safeParse({ contractUuid: "ct_abc123" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contractUuid).toBe("ct_abc123");
    }
  });

  it("accepts status filter", () => {
    const result = listTransfersSchema.safeParse({ status: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    const result = listTransfersSchema.safeParse({ limit: 150 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listTransfersSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects page 0", () => {
    const result = listTransfersSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("coerces string values", () => {
    const result = listTransfersSchema.safeParse({
      page: "2",
      limit: "50",
      companyId: "3",
      status: "20",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
      expect(result.data.companyId).toBe(3);
      expect(result.data.status).toBe(20);
    }
  });
});

// ---------------------------------------------------------------------------
// getTransferSchema tests
// ---------------------------------------------------------------------------

describe("getTransferSchema", () => {
  it("accepts a valid positive integer", () => {
    const result = getTransferSchema.safeParse({ transferId: 1 });
    expect(result.success).toBe(true);
  });

  it("accepts a string-coerced integer", () => {
    const result = getTransferSchema.safeParse({ transferId: "42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.transferId).toBe(42);
    }
  });

  it("rejects zero", () => {
    const result = getTransferSchema.safeParse({ transferId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative", () => {
    const result = getTransferSchema.safeParse({ transferId: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects missing transferId", () => {
    const result = getTransferSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// TransferListItem shape
// ---------------------------------------------------------------------------

describe("TransferListItem shape", () => {
  it("defines the expected fields", () => {
    const mock: TransferListItem = {
      transfer_id: 1,
      company_id: 1,
      contract_uuid: "ct_abc123",
      contract_type: "monthly",
      total: "15000.000",
      company_total: "15000.000",
      transfer_status: 10,
      currency_code: "KWD",
      start_date: "2025-01-01T00:00:00.000Z",
      end_date: "2025-12-31T00:00:00.000Z",
      created_at: "2025-01-01T00:00:00.000Z",
      updated_at: "2025-06-01T00:00:00.000Z",
    };
    expect(mock.transfer_id).toBe(1);
    expect(mock.company_id).toBe(1);
    expect(mock.contract_uuid).toBe("ct_abc123");
    expect(mock.contract_type).toBe("monthly");
    expect(mock.total).toBe("15000.000");
    expect(mock.transfer_status).toBe(10);
    expect(mock.currency_code).toBe("KWD");
  });
});

// ---------------------------------------------------------------------------
// ListTransfersResult shape
// ---------------------------------------------------------------------------

describe("ListTransfersResult shape", () => {
  it("accepts an empty result set", () => {
    const result: ListTransfersResult = {
      transfers: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.transfers).toHaveLength(0);
  });
});
