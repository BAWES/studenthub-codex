import { describe, it, expect } from "vitest";
import {
  listContractsSchema,
  getContractSchema,
  updateContractStatusSchema,
  contractRowOutputSchema,
  contractListOutputSchema,
  contractDetailObjectOutputSchema,
  contractDetailOutputSchema,
  contractStatusUpdateOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listContractsSchema
// ---------------------------------------------------------------------------
describe("listContractsSchema", () => {
  it("accepts empty input with defaults", () => {
    const r = listContractsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts with filters", () => {
    const r = listContractsSchema.safeParse({
      page: 2,
      limit: 10,
      status: 1,
      type: "hourly",
      candidateId: 5,
      companyId: 10,
      q: "search",
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative page", () => {
    expect(listContractsSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listContractsSchema.safeParse({ limit: 200 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getContractSchema
// ---------------------------------------------------------------------------
describe("getContractSchema", () => {
  it("accepts valid UUID", () => {
    expect(getContractSchema.safeParse({ uuid: "abc-123" }).success).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(getContractSchema.safeParse({ uuid: "" }).success).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(getContractSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateContractStatusSchema
// ---------------------------------------------------------------------------
describe("updateContractStatusSchema", () => {
  it("accepts status 0", () => {
    expect(
      updateContractStatusSchema.safeParse({ uuid: "abc-123", status: 0 }).success
    ).toBe(true);
  });

  it("accepts status 1", () => {
    expect(
      updateContractStatusSchema.safeParse({ uuid: "abc-123", status: 1 }).success
    ).toBe(true);
  });

  it("accepts status 2", () => {
    expect(
      updateContractStatusSchema.safeParse({ uuid: "abc-123", status: 2 }).success
    ).toBe(true);
  });

  it("rejects status 3", () => {
    expect(
      updateContractStatusSchema.safeParse({ uuid: "abc-123", status: 3 }).success
    ).toBe(false);
  });

  it("rejects missing uuid", () => {
    expect(updateContractStatusSchema.safeParse({ status: 1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// contractRowOutputSchema
// ---------------------------------------------------------------------------
describe("contractRowOutputSchema", () => {
  const valid = {
    contract_uuid: "abc-123",
    candidate_name: "John Doe",
    company_name: "Acme Corp",
    type: "hourly",
    status: 1,
    status_label: "Active",
    start_date: "2026-01-01",
    end_date: "2026-12-31",
    transfer_cost: "500.00",
    currency_code: "KWD",
    created_at: "2026-01-01T00:00:00Z",
  };

  it("accepts valid row", () => {
    expect(contractRowOutputSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable fields", () => {
    const r = contractRowOutputSchema.safeParse({
      ...valid,
      candidate_name: null,
      company_name: null,
      start_date: null,
      end_date: null,
      transfer_cost: null,
      currency_code: null,
      created_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing contract_uuid", () => {
    const { contract_uuid: _, ...rest } = valid;
    expect(contractRowOutputSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// contractListOutputSchema
// ---------------------------------------------------------------------------
describe("contractListOutputSchema", () => {
  const valid = {
    items: [
      {
        contract_uuid: "abc-123",
        candidate_name: "John Doe",
        company_name: "Acme Corp",
        type: "hourly",
        status: 1,
        status_label: "Active",
        start_date: null,
        end_date: null,
        transfer_cost: "500.00",
        currency_code: "KWD",
        created_at: "2026-01-01T00:00:00Z",
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts valid response", () => {
    expect(contractListOutputSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty items", () => {
    const r = contractListOutputSchema.safeParse({
      ...valid,
      items: [],
      total: 0,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// contractDetailObjectOutputSchema
// ---------------------------------------------------------------------------
describe("contractDetailObjectOutputSchema", () => {
  const valid = {
    contract_uuid: "abc-123",
    type: "hourly",
    detail: "Full stack developer",
    status: 1,
    status_label: "Active",
    start_date: "2026-01-01",
    end_date: "2026-12-31",
    transfer_cost: "500.00",
    currency_code: "KWD",
    auto_generate: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-15T00:00:00Z",
    candidate: { candidate_name: "John Doe" },
    company: { company_name: "Acme Corp" },
  };

  it("accepts valid detail", () => {
    expect(contractDetailObjectOutputSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable relations", () => {
    const r = contractDetailObjectOutputSchema.safeParse({
      ...valid,
      candidate: null,
      company: null,
    });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// contractDetailOutputSchema
// ---------------------------------------------------------------------------
describe("contractDetailOutputSchema", () => {
  it("accepts valid detail response", () => {
    const r = contractDetailOutputSchema.safeParse({
      contract: {
        contract_uuid: "abc-123",
        type: "hourly",
        detail: null,
        status: 1,
        status_label: "Active",
        start_date: null,
        end_date: null,
        transfer_cost: null,
        currency_code: null,
        auto_generate: false,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: null,
        candidate: null,
        company: null,
      },
    });
    expect(r.success).toBe(true);
  });

  it("accepts null contract", () => {
    expect(contractDetailOutputSchema.safeParse({ contract: null }).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// contractStatusUpdateOutputSchema
// ---------------------------------------------------------------------------
describe("contractStatusUpdateOutputSchema", () => {
  it("accepts success", () => {
    expect(contractStatusUpdateOutputSchema.safeParse({ success: true }).success).toBe(
      true
    );
  });

  it("accepts failure", () => {
    expect(contractStatusUpdateOutputSchema.safeParse({ success: false }).success).toBe(
      true
    );
  });

  it("rejects missing success", () => {
    expect(contractStatusUpdateOutputSchema.safeParse({}).success).toBe(false);
  });
});