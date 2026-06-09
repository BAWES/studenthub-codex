import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: contract list schema validation
// ---------------------------------------------------------------------------

const listContractsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  type: z.string().optional(),
  status: z.number().int().optional(),
});

describe("listContractsSchema", () => {
  it("accepts empty params (no pagination)", () => {
    const result = listContractsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts pagination params", () => {
    const result = listContractsSchema.safeParse({ page: 1, limit: 20 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts type filter", () => {
    const result = listContractsSchema.safeParse({ type: "fixed_price" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("fixed_price");
    }
  });

  it("accepts status filter", () => {
    const result = listContractsSchema.safeParse({ status: 1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(1);
    }
  });

  it("rejects limit over 100", () => {
    const result = listContractsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listContractsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer limit", () => {
    const result = listContractsSchema.safeParse({ limit: "abc" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Return type shape
// ---------------------------------------------------------------------------

type ContractListItem = {
  contract_uuid: string;
  type: string;
  detail: string | null;
  start_date: Date | null;
  end_date: Date | null;
  transfer_cost: number | null;
  currency_code: string | null;
  status: number;
  created_at: Date | null;
};

type ListContractsResult = {
  contracts: ContractListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

describe("ContractListItem shape", () => {
  it("defines the expected fields", () => {
    const mock: ContractListItem = {
      contract_uuid: "abc-123",
      type: "fixed_price",
      detail: "Software development contract",
      start_date: new Date("2026-01-01"),
      end_date: new Date("2026-12-31"),
      transfer_cost: 5000,
      currency_code: "KWD",
      status: 1,
      created_at: new Date(),
    };
    expect(mock.contract_uuid).toBe("abc-123");
    expect(mock.type).toBe("fixed_price");
    expect(mock.detail).toBe("Software development contract");
    expect(mock.status).toBe(1);
  });
});

describe("ListContractsResult shape", () => {
  it("accepts a valid result set", () => {
    const result: ListContractsResult = {
      contracts: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.contracts).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Pure function: build query filter
// ---------------------------------------------------------------------------

type ContractWhereInput = {
  type?: string;
  status?: number;
  deleted?: boolean;
};

function buildContractListFilter(type?: string, status?: number): ContractWhereInput {
  const where: ContractWhereInput = { deleted: false };
  if (type !== undefined) where.type = type;
  if (status !== undefined) where.status = status;
  return where;
}

describe("buildContractListFilter", () => {
  it("defaults to non-deleted", () => {
    const result = buildContractListFilter();
    expect(result).toEqual({ deleted: false });
  });

  it("filters by type", () => {
    const result = buildContractListFilter("fixed_price");
    expect(result).toEqual({ deleted: false, type: "fixed_price" });
  });

  it("filters by status", () => {
    const result = buildContractListFilter(undefined, 1);
    expect(result).toEqual({ deleted: false, status: 1 });
  });

  it("filters by both type and status", () => {
    const result = buildContractListFilter("hourly", 2);
    expect(result).toEqual({ deleted: false, type: "hourly", status: 2 });
  });
});
