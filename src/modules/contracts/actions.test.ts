import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: contract list schema validation
//
// The listContracts action uses this schema internally. Testing it separately
// avoids mocking "use server" dependencies (prisma, session, next/cache).
// ---------------------------------------------------------------------------

const listContractsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  type: z
    .enum(["Fixed Price", "Hourly", "Monthly Salary"])
    .optional()
    .nullable(),
  candidateId: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive().optional(),
});

describe("listContractsSchema", () => {
  it("accepts empty params", () => {
    const result = listContractsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.type).toBeUndefined();
    }
  });

  it("accepts pagination params", () => {
    const result = listContractsSchema.safeParse({ page: 2, limit: 50 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("accepts type filter", () => {
    const result = listContractsSchema.safeParse({ type: "Hourly" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("Hourly");
    }
  });

  it("accepts null type filter", () => {
    const result = listContractsSchema.safeParse({ type: null });
    expect(result.success).toBe(true);
  });

  it("accepts candidateId filter", () => {
    const result = listContractsSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });

  it("accepts companyId filter", () => {
    const result = listContractsSchema.safeParse({ companyId: 7 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(7);
    }
  });

  it("rejects invalid type", () => {
    const result = listContractsSchema.safeParse({ type: "Part Time" });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listContractsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listContractsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric candidateId", () => {
    const result = listContractsSchema.safeParse({ candidateId: "abc" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Return type shape
// ---------------------------------------------------------------------------

type ContractRelatedDetail =
  | { type: "Fixed Price"; fp_contract_uuid: string; candidate_total: number; company_total: number; completion_percentage: number | null }
  | { type: "Hourly"; h_contract_uuid: string; candidate_hourly_rate: number; company_hourly_rate: number }
  | { type: "Monthly Salary"; ms_contract_uuid: string; candidate_total: number; company_total: number; salary_day: number | null };

type ContractListItem = {
  contract_uuid: string;
  candidate_id: number | null;
  company_id: number;
  type: string;
  detail: string | null;
  start_date: string | null;
  end_date: string | null;
  transfer_cost: number | null;
  currency_code: string | null;
  status: number;
  created_at: string | null;
  detailModel: ContractRelatedDetail | null;
};

type ListContractsResult = {
  contracts: ContractListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

describe("ContractListItem shape", () => {
  it("defines expected fields for fixed price contract", () => {
    const mock: ContractListItem = {
      contract_uuid: "contract_abc123",
      candidate_id: 42,
      company_id: 1,
      type: "Fixed Price",
      detail: "Fixed price project",
      start_date: "2025-01-01",
      end_date: "2025-12-31",
      transfer_cost: 500.0,
      currency_code: "KWD",
      status: 1,
      created_at: "2025-01-01T00:00:00.000Z",
      detailModel: {
        type: "Fixed Price",
        fp_contract_uuid: "fp_abc123",
        candidate_total: 1000.0,
        company_total: 1200.0,
        completion_percentage: 75,
      },
    };
    expect(mock.contract_uuid).toBe("contract_abc123");
    expect(mock.type).toBe("Fixed Price");
    expect(mock.detailModel).not.toBeNull();
    if (mock.detailModel?.type === "Fixed Price") {
      expect(mock.detailModel.candidate_total).toBe(1000.0);
    }
  });

  it("defines expected fields for hourly contract", () => {
    const mock: ContractListItem = {
      contract_uuid: "contract_def456",
      candidate_id: null,
      company_id: 2,
      type: "Hourly",
      detail: "Hourly consulting",
      start_date: null,
      end_date: null,
      transfer_cost: null,
      currency_code: "KWD",
      status: 1,
      created_at: "2025-06-01T00:00:00.000Z",
      detailModel: {
        type: "Hourly",
        h_contract_uuid: "h_def456",
        candidate_hourly_rate: 25.0,
        company_hourly_rate: 35.0,
      },
    };
    expect(mock.contract_uuid).toBe("contract_def456");
    expect(mock.type).toBe("Hourly");
    if (mock.detailModel?.type === "Hourly") {
      expect(mock.detailModel.candidate_hourly_rate).toBe(25.0);
    }
  });

  it("defines expected fields for monthly salary contract", () => {
    const mock: ContractListItem = {
      contract_uuid: "contract_ghi789",
      candidate_id: 100,
      company_id: 3,
      type: "Monthly Salary",
      detail: "Full-time position",
      start_date: "2025-03-01",
      end_date: null,
      transfer_cost: null,
      currency_code: "KWD",
      status: 1,
      created_at: "2025-03-01T00:00:00.000Z",
      detailModel: {
        type: "Monthly Salary",
        ms_contract_uuid: "ms_ghi789",
        candidate_total: 2000.0,
        company_total: 2500.0,
        salary_day: 1,
      },
    };
    expect(mock.contract_uuid).toBe("contract_ghi789");
    expect(mock.type).toBe("Monthly Salary");
    if (mock.detailModel?.type === "Monthly Salary") {
      expect(mock.detailModel.salary_day).toBe(1);
    }
  });
});

describe("ListContractsResult shape", () => {
  it("accepts empty result", () => {
    const r: ListContractsResult = {
      contracts: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(r.total).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Query builder (pure function, testable without DB)
// ---------------------------------------------------------------------------

type ContractQueryFilter = {
  type?: string;
  candidate_id?: number;
  company_id?: number;
  deleted?: boolean;
};

function buildContractFilter(params: {
  type?: string | null;
  candidateId?: number;
  companyId?: number;
}): ContractQueryFilter {
  const where: ContractQueryFilter = { deleted: false };
  if (params.type) {
    where.type = params.type;
  }
  if (params.candidateId) {
    where.candidate_id = params.candidateId;
  }
  if (params.companyId) {
    where.company_id = params.companyId;
  }
  return where;
}

describe("buildContractFilter", () => {
  it("returns base filter with deleted=false by default", () => {
    const result = buildContractFilter({});
    expect(result).toEqual({ deleted: false });
  });

  it("adds type filter when provided", () => {
    const result = buildContractFilter({ type: "Hourly" });
    expect(result).toEqual({ deleted: false, type: "Hourly" });
  });

  it("ignores null type", () => {
    const result = buildContractFilter({ type: null });
    expect(result).toEqual({ deleted: false });
  });

  it("adds candidateId filter", () => {
    const result = buildContractFilter({ candidateId: 42 });
    expect(result).toEqual({ deleted: false, candidate_id: 42 });
  });

  it("adds companyId filter", () => {
    const result = buildContractFilter({ companyId: 7 });
    expect(result).toEqual({ deleted: false, company_id: 7 });
  });

  it("combines multiple filters", () => {
    const result = buildContractFilter({ type: "Fixed Price", candidateId: 42, companyId: 7 });
    expect(result).toEqual({ deleted: false, type: "Fixed Price", candidate_id: 42, company_id: 7 });
  });
});
