import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  contractRelatedDetailSchema,
  contractListItemSchema,
  contractDetailSchema,
  listContractsResultSchema,
  type ContractRelatedDetail,
  type ContractListItem,
  type ListContractsResult,
} from "./schemas";

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
// Output schema: contractRelatedDetailSchema
// ---------------------------------------------------------------------------

describe("contractRelatedDetailSchema", () => {
  it("accepts fixed price detail", () => {
    const detail = {
      type: "Fixed Price" as const,
      fp_contract_uuid: "fp_abc123",
      candidate_total: 1000.0,
      company_total: 1200.0,
      completion_percentage: 75,
    };
    const result = contractRelatedDetailSchema.safeParse(detail);
    expect(result.success).toBe(true);
  });

  it("accepts fixed price detail with null completion_percentage", () => {
    const detail = {
      type: "Fixed Price" as const,
      fp_contract_uuid: "fp_abc123",
      candidate_total: 1000.0,
      company_total: 1200.0,
      completion_percentage: null,
    };
    const result = contractRelatedDetailSchema.safeParse(detail);
    expect(result.success).toBe(true);
  });

  it("accepts hourly detail", () => {
    const detail = {
      type: "Hourly" as const,
      h_contract_uuid: "h_def456",
      candidate_hourly_rate: 25.0,
      company_hourly_rate: 35.0,
    };
    const result = contractRelatedDetailSchema.safeParse(detail);
    expect(result.success).toBe(true);
  });

  it("accepts monthly salary detail", () => {
    const detail = {
      type: "Monthly Salary" as const,
      ms_contract_uuid: "ms_ghi789",
      candidate_total: 2000.0,
      company_total: 2500.0,
      salary_day: 1,
    };
    const result = contractRelatedDetailSchema.safeParse(detail);
    expect(result.success).toBe(true);
  });

  it("accepts monthly salary detail with null salary_day", () => {
    const detail = {
      type: "Monthly Salary" as const,
      ms_contract_uuid: "ms_ghi789",
      candidate_total: 2000.0,
      company_total: 2500.0,
      salary_day: null,
    };
    const result = contractRelatedDetailSchema.safeParse(detail);
    expect(result.success).toBe(true);
  });

  it("rejects invalid discriminated union type", () => {
    const detail = {
      type: "Part Time",
      fp_contract_uuid: "fp_abc123",
    };
    const result = contractRelatedDetailSchema.safeParse(detail);
    expect(result.success).toBe(false);
  });

  it("rejects detail with missing required fields", () => {
    const detail = {
      type: "Fixed Price" as const,
      // missing fp_contract_uuid
    };
    const result = contractRelatedDetailSchema.safeParse(detail);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: contractDetailSchema (nullable)
// ---------------------------------------------------------------------------

describe("contractDetailSchema", () => {
  it("accepts null", () => {
    const result = contractDetailSchema.safeParse(null);
    expect(result.success).toBe(true);
  });

  it("accepts a valid detail object", () => {
    const detail = {
      type: "Fixed Price" as const,
      fp_contract_uuid: "fp_abc123",
      candidate_total: 1000.0,
      company_total: 1200.0,
      completion_percentage: 75,
    };
    const result = contractDetailSchema.safeParse(detail);
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Output schema: contractListItemSchema
// ---------------------------------------------------------------------------

describe("contractListItemSchema", () => {
  it("accepts fixed price contract list item", () => {
    const item = {
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
        type: "Fixed Price" as const,
        fp_contract_uuid: "fp_abc123",
        candidate_total: 1000.0,
        company_total: 1200.0,
        completion_percentage: 75,
      },
    };
    const result = contractListItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("accepts hourly contract list item with null fields", () => {
    const item: ContractListItem = {
      contract_uuid: "contract_def456",
      candidate_id: null,
      company_id: 2,
      type: "Hourly",
      detail: null,
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
    const result = contractListItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("accepts monthly salary contract list item", () => {
    const item: ContractListItem = {
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
    const result = contractListItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("accepts item with null detailModel", () => {
    const item: ContractListItem = {
      contract_uuid: "contract_jkl012",
      candidate_id: null,
      company_id: 4,
      type: "Fixed Price",
      detail: null,
      start_date: null,
      end_date: null,
      transfer_cost: null,
      currency_code: "KWD",
      status: 1,
      created_at: "2025-01-01T00:00:00.000Z",
      detailModel: null,
    };
    const result = contractListItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("rejects item with invalid type", () => {
    const item = {
      contract_uuid: "contract_abc123",
      candidate_id: null,
      company_id: 1,
      type: 123, // should be string
      detail: null,
      start_date: null,
      end_date: null,
      transfer_cost: null,
      currency_code: null,
      status: 1,
      created_at: null,
      detailModel: null,
    };
    const result = contractListItemSchema.safeParse(item);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: listContractsResultSchema
// ---------------------------------------------------------------------------

describe("listContractsResultSchema", () => {
  it("accepts empty result", () => {
    const result = listContractsResultSchema.safeParse({
      contracts: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("accepts result with items", () => {
    const data = {
      contracts: [
        {
          contract_uuid: "contract_abc123",
          candidate_id: 42,
          company_id: 1,
          type: "Fixed Price",
          detail: "Project A",
          start_date: "2025-01-01",
          end_date: "2025-12-31",
          transfer_cost: 500.0,
          currency_code: "KWD",
          status: 1,
          created_at: "2025-01-01T00:00:00.000Z",
          detailModel: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    const result = listContractsResultSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("rejects result with negative total", () => {
    const result = listContractsResultSchema.safeParse({
      contracts: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects result with invalid page", () => {
    const result = listContractsResultSchema.safeParse({
      contracts: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(false);
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

// ---------------------------------------------------------------------------
// getContract schema (input validation)
// ---------------------------------------------------------------------------

const getContractSchema = z.object({
  contract_uuid: z.string().min(1, "contract_uuid is required"),
});

describe("getContractSchema", () => {
  it("accepts valid contract_uuid", () => {
    const result = getContractSchema.safeParse({
      contract_uuid: "contract_abc123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contract_uuid).toBe("contract_abc123");
    }
  });

  it("rejects empty string", () => {
    const result = getContractSchema.safeParse({ contract_uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing contract_uuid", () => {
    const result = getContractSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-string uuid", () => {
    const result = getContractSchema.safeParse({ contract_uuid: 123 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ContractRelatedDetail type shape (using Zod output validation)
// ---------------------------------------------------------------------------

describe("ContractRelatedDetail shape (via Zod)", () => {
  it("validates fixed price contract detail structure", () => {
    const detail: ContractRelatedDetail = {
      type: "Fixed Price",
      fp_contract_uuid: "fp_abc123",
      candidate_total: 1000.0,
      company_total: 1200.0,
      completion_percentage: 75,
    };
    const result = contractRelatedDetailSchema.safeParse(detail);
    expect(result.success).toBe(true);
  });

  it("validates hourly contract detail structure", () => {
    const detail: ContractRelatedDetail = {
      type: "Hourly",
      h_contract_uuid: "h_def456",
      candidate_hourly_rate: 25.0,
      company_hourly_rate: 35.0,
    };
    const result = contractRelatedDetailSchema.safeParse(detail);
    expect(result.success).toBe(true);
  });

  it("validates monthly salary contract detail structure", () => {
    const detail: ContractRelatedDetail = {
      type: "Monthly Salary",
      ms_contract_uuid: "ms_ghi789",
      candidate_total: 2000.0,
      company_total: 2500.0,
      salary_day: 1,
    };
    const result = contractRelatedDetailSchema.safeParse(detail);
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// ContractListItem shape (via Zod output schema)
// ---------------------------------------------------------------------------

describe("ContractListItem shape — fixed price", () => {
  it("validates expected fields for fixed price contract", () => {
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
    const parsed = contractListItemSchema.safeParse(mock);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.contract_uuid).toBe("contract_abc123");
      expect(parsed.data.type).toBe("Fixed Price");
      expect(parsed.data.detailModel).not.toBeNull();
    }
  });
});

describe("ContractListItem shape — hourly", () => {
  it("validates expected fields for hourly contract", () => {
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
    const parsed = contractListItemSchema.safeParse(mock);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.contract_uuid).toBe("contract_def456");
      expect(parsed.data.type).toBe("Hourly");
    }
  });
});

describe("ContractListItem shape — monthly salary", () => {
  it("validates expected fields for monthly salary contract", () => {
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
    const parsed = contractListItemSchema.safeParse(mock);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.contract_uuid).toBe("contract_ghi789");
      expect(parsed.data.type).toBe("Monthly Salary");
    }
  });
});

// ---------------------------------------------------------------------------
// ListContractsResult shape (via Zod output schema)
// ---------------------------------------------------------------------------

describe("ListContractsResult shape (via Zod)", () => {
  it("accepts empty result", () => {
    const r: ListContractsResult = {
      contracts: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    const parsed = listContractsResultSchema.safeParse(r);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.total).toBe(0);
  });
});
