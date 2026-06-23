import { describe, it, expect } from "vitest";
import {
  fixedPriceDetailSchema,
  hourlyDetailSchema,
  monthlySalaryDetailSchema,
  contractRelatedDetailSchema,
  contractListItemSchema,
  contractDetailSchema,
  listContractsResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// fixedPriceDetailSchema
// ---------------------------------------------------------------------------
describe("fixedPriceDetailSchema", () => {
  const valid = {
    type: "Fixed Price" as const,
    fp_contract_uuid: "uuid-fp-1",
    candidate_total: 5000,
    company_total: 6000,
    completion_percentage: 75,
  };

  it("accepts a valid fixed price detail", () => {
    expect(fixedPriceDetailSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable completion_percentage", () => {
    expect(
      fixedPriceDetailSchema.safeParse({ ...valid, completion_percentage: null }).success,
    ).toBe(true);
  });

  it("rejects wrong type literal", () => {
    expect(
      fixedPriceDetailSchema.safeParse({ ...valid, type: "Hourly" }).success,
    ).toBe(false);
  });

  it("rejects missing fp_contract_uuid", () => {
    const { fp_contract_uuid: _, ...rest } = valid;
    expect(fixedPriceDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing candidate_total", () => {
    const { candidate_total: _, ...rest } = valid;
    expect(fixedPriceDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company_total", () => {
    const { company_total: _, ...rest } = valid;
    expect(fixedPriceDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for candidate_total", () => {
    expect(
      fixedPriceDetailSchema.safeParse({ ...valid, candidate_total: "5000" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for completion_percentage", () => {
    expect(
      fixedPriceDetailSchema.safeParse({ ...valid, completion_percentage: "75" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// hourlyDetailSchema
// ---------------------------------------------------------------------------
describe("hourlyDetailSchema", () => {
  const valid = {
    type: "Hourly" as const,
    h_contract_uuid: "uuid-h-1",
    candidate_hourly_rate: 15,
    company_hourly_rate: 25,
  };

  it("accepts a valid hourly detail", () => {
    expect(hourlyDetailSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects wrong type literal", () => {
    expect(
      hourlyDetailSchema.safeParse({ ...valid, type: "Fixed Price" }).success,
    ).toBe(false);
  });

  it("rejects missing h_contract_uuid", () => {
    const { h_contract_uuid: _, ...rest } = valid;
    expect(hourlyDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing candidate_hourly_rate", () => {
    const { candidate_hourly_rate: _, ...rest } = valid;
    expect(hourlyDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company_hourly_rate", () => {
    const { company_hourly_rate: _, ...rest } = valid;
    expect(hourlyDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for candidate_hourly_rate", () => {
    expect(
      hourlyDetailSchema.safeParse({ ...valid, candidate_hourly_rate: "15" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// monthlySalaryDetailSchema
// ---------------------------------------------------------------------------
describe("monthlySalaryDetailSchema", () => {
  const valid = {
    type: "Monthly Salary" as const,
    ms_contract_uuid: "uuid-ms-1",
    candidate_total: 3000,
    company_total: 3500,
    salary_day: 15,
  };

  it("accepts a valid monthly salary detail", () => {
    expect(monthlySalaryDetailSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable salary_day", () => {
    expect(
      monthlySalaryDetailSchema.safeParse({ ...valid, salary_day: null }).success,
    ).toBe(true);
  });

  it("rejects wrong type literal", () => {
    expect(
      monthlySalaryDetailSchema.safeParse({ ...valid, type: "Hourly" }).success,
    ).toBe(false);
  });

  it("rejects missing ms_contract_uuid", () => {
    const { ms_contract_uuid: _, ...rest } = valid;
    expect(monthlySalaryDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing candidate_total", () => {
    const { candidate_total: _, ...rest } = valid;
    expect(monthlySalaryDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company_total", () => {
    const { company_total: _, ...rest } = valid;
    expect(monthlySalaryDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for candidate_total", () => {
    expect(
      monthlySalaryDetailSchema.safeParse({ ...valid, candidate_total: "3000" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for salary_day", () => {
    expect(
      monthlySalaryDetailSchema.safeParse({ ...valid, salary_day: "15" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// contractRelatedDetailSchema  (discriminated union)
// ---------------------------------------------------------------------------
describe("contractRelatedDetailSchema", () => {
  it("accepts Fixed Price detail", () => {
    expect(
      contractRelatedDetailSchema.safeParse({
        type: "Fixed Price",
        fp_contract_uuid: "uuid-fp-1",
        candidate_total: 5000,
        company_total: 6000,
        completion_percentage: null,
      }).success,
    ).toBe(true);
  });

  it("accepts Hourly detail", () => {
    expect(
      contractRelatedDetailSchema.safeParse({
        type: "Hourly",
        h_contract_uuid: "uuid-h-1",
        candidate_hourly_rate: 15,
        company_hourly_rate: 25,
      }).success,
    ).toBe(true);
  });

  it("accepts Monthly Salary detail", () => {
    expect(
      contractRelatedDetailSchema.safeParse({
        type: "Monthly Salary",
        ms_contract_uuid: "uuid-ms-1",
        candidate_total: 3000,
        company_total: 3500,
        salary_day: null,
      }).success,
    ).toBe(true);
  });

  it("rejects unknown type", () => {
    expect(
      contractRelatedDetailSchema.safeParse({ type: "Unknown" }).success,
    ).toBe(false);
  });

  it("rejects empty object", () => {
    expect(contractRelatedDetailSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// contractListItemSchema
// ---------------------------------------------------------------------------
describe("contractListItemSchema", () => {
  const valid = {
    contract_uuid: "uuid-contract-1",
    candidate_id: 42,
    company_id: 10,
    type: "Hourly",
    detail: "Standard hourly contract",
    start_date: "2026-01-01",
    end_date: "2026-12-31",
    transfer_cost: 100,
    currency_code: "KWD",
    status: 1,
    created_at: "2026-01-01T00:00:00Z",
    detailModel: {
      type: "Hourly" as const,
      h_contract_uuid: "uuid-h-1",
      candidate_hourly_rate: 15,
      company_hourly_rate: 25,
    },
  };

  it("accepts a valid contract list item", () => {
    expect(contractListItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable candidate_id", () => {
    expect(
      contractListItemSchema.safeParse({ ...valid, candidate_id: null }).success,
    ).toBe(true);
  });

  it("accepts nullable detail", () => {
    expect(
      contractListItemSchema.safeParse({ ...valid, detail: null }).success,
    ).toBe(true);
  });

  it("accepts nullable start_date", () => {
    expect(
      contractListItemSchema.safeParse({ ...valid, start_date: null }).success,
    ).toBe(true);
  });

  it("accepts nullable end_date", () => {
    expect(
      contractListItemSchema.safeParse({ ...valid, end_date: null }).success,
    ).toBe(true);
  });

  it("accepts nullable transfer_cost", () => {
    expect(
      contractListItemSchema.safeParse({ ...valid, transfer_cost: null }).success,
    ).toBe(true);
  });

  it("accepts nullable currency_code", () => {
    expect(
      contractListItemSchema.safeParse({ ...valid, currency_code: null }).success,
    ).toBe(true);
  });

  it("accepts nullable created_at", () => {
    expect(
      contractListItemSchema.safeParse({ ...valid, created_at: null }).success,
    ).toBe(true);
  });

  it("accepts nullable detailModel", () => {
    expect(
      contractListItemSchema.safeParse({ ...valid, detailModel: null }).success,
    ).toBe(true);
  });

  it("rejects missing contract_uuid", () => {
    const { contract_uuid: _, ...rest } = valid;
    expect(contractListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company_id", () => {
    const { company_id: _, ...rest } = valid;
    expect(contractListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing type", () => {
    const { type: _, ...rest } = valid;
    expect(contractListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing status", () => {
    const { status: _, ...rest } = valid;
    expect(contractListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for company_id", () => {
    expect(
      contractListItemSchema.safeParse({ ...valid, company_id: "10" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for status", () => {
    expect(
      contractListItemSchema.safeParse({ ...valid, status: "active" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for detailModel", () => {
    expect(
      contractListItemSchema.safeParse({ ...valid, detailModel: "not-a-model" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// contractDetailSchema  (nullable)
// ---------------------------------------------------------------------------
describe("contractDetailSchema", () => {
  it("accepts a valid Fixed Price detail", () => {
    expect(
      contractDetailSchema.safeParse({
        type: "Fixed Price",
        fp_contract_uuid: "uuid-fp-1",
        candidate_total: 5000,
        company_total: 6000,
        completion_percentage: null,
      }).success,
    ).toBe(true);
  });

  it("accepts a valid Hourly detail", () => {
    expect(
      contractDetailSchema.safeParse({
        type: "Hourly",
        h_contract_uuid: "uuid-h-1",
        candidate_hourly_rate: 15,
        company_hourly_rate: 25,
      }).success,
    ).toBe(true);
  });

  it("accepts null (no contract detail)", () => {
    expect(contractDetailSchema.safeParse(null).success).toBe(true);
  });

  it("rejects invalid detail", () => {
    expect(
      contractDetailSchema.safeParse({ type: "Bogus" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listContractsResultSchema
// ---------------------------------------------------------------------------
describe("listContractsResultSchema", () => {
  const valid = {
    contracts: [
      {
        contract_uuid: "uuid-c-1",
        candidate_id: null,
        company_id: 10,
        type: "Hourly",
        detail: null,
        start_date: null,
        end_date: null,
        transfer_cost: null,
        currency_code: null,
        status: 1,
        created_at: null,
        detailModel: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid result", () => {
    expect(listContractsResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty contracts array", () => {
    expect(
      listContractsResultSchema.safeParse({ ...valid, contracts: [], total: 0, totalPages: 0 })
        .success,
    ).toBe(true);
  });

  it("rejects missing contracts", () => {
    const { contracts: _, ...rest } = valid;
    expect(listContractsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = valid;
    expect(listContractsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing page", () => {
    const { page: _, ...rest } = valid;
    expect(listContractsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing limit", () => {
    const { limit: _, ...rest } = valid;
    expect(listContractsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listContractsResultSchema.safeParse({ ...valid, total: -1 }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      listContractsResultSchema.safeParse({ ...valid, page: 0 }).success,
    ).toBe(false);
  });

  it("rejects non-integer limit", () => {
    expect(
      listContractsResultSchema.safeParse({ ...valid, limit: 20.5 }).success,
    ).toBe(false);
  });

  it("rejects non-array contracts", () => {
    expect(
      listContractsResultSchema.safeParse({ ...valid, contracts: "not-an-array" }).success,
    ).toBe(false);
  });
});
