import { describe, it, expect } from "vitest";
import {
  contractRowOutputSchema,
  contractListOutputSchema,
  contractDetailObjectOutputSchema,
  contractDetailOutputSchema,
  contractStatusUpdateOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// contractRowOutputSchema
// ---------------------------------------------------------------------------
const validContractRow = {
  contract_uuid: "ctr-001",
  candidate_name: "Alice Smith",
  company_name: "Acme Corp",
  type: "full-time",
  status: 1,
  status_label: "Active",
  start_date: "2025-01-15",
  end_date: null,
  transfer_cost: "50000.00",
  currency_code: "USD",
  created_at: "2025-01-01T00:00:00Z",
};

describe("contractRowOutputSchema", () => {
  it("accepts a fully populated contract row", () => {
    expect(contractRowOutputSchema.safeParse(validContractRow).success).toBe(true);
  });

  it("accepts a contract row with all null fields", () => {
    const data = {
      ...validContractRow,
      candidate_name: null,
      company_name: null,
      start_date: null,
      end_date: null,
      transfer_cost: null,
      currency_code: null,
      created_at: null,
    };
    expect(contractRowOutputSchema.safeParse(data).success).toBe(true);
  });

  it("rejects when contract_uuid is missing", () => {
    const { contract_uuid, ...rest } = validContractRow;
    expect(contractRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects when type is missing", () => {
    const { type, ...rest } = validContractRow;
    expect(contractRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects when status is not a number", () => {
    const data = { ...validContractRow, status: "1" };
    expect(contractRowOutputSchema.safeParse(data).success).toBe(false);
  });

  it("rejects when candidate_name is a number instead of string or null", () => {
    const data = { ...validContractRow, candidate_name: 123 };
    expect(contractRowOutputSchema.safeParse(data).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// contractListOutputSchema
// ---------------------------------------------------------------------------
describe("contractListOutputSchema", () => {
  it("accepts a valid contract list response", () => {
    const data = {
      items: [validContractRow],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(contractListOutputSchema.safeParse(data).success).toBe(true);
  });

  it("accepts an empty items array", () => {
    const data = {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(contractListOutputSchema.safeParse(data).success).toBe(true);
  });

  it("rejects when items is missing", () => {
    const { items, ...rest } = {
      items: [validContractRow],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(contractListOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects when total is negative", () => {
    const data = {
      items: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(contractListOutputSchema.safeParse(data).success).toBe(false);
  });

  it("rejects when page is zero (must be positive)", () => {
    const data = {
      items: [],
      total: 0,
      page: 0,
      limit: 20,
      totalPages: 0,
    };
    expect(contractListOutputSchema.safeParse(data).success).toBe(false);
  });

  it("rejects when limit is not positive", () => {
    const data = {
      items: [],
      total: 0,
      page: 1,
      limit: -5,
      totalPages: 0,
    };
    expect(contractListOutputSchema.safeParse(data).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// contractDetailObjectOutputSchema
// ---------------------------------------------------------------------------
const validContractDetail = {
  contract_uuid: "ctr-001",
  type: "full-time",
  detail: "Some details about the contract",
  status: 1,
  status_label: "Active",
  start_date: "2025-01-15",
  end_date: null,
  transfer_cost: "50000.00",
  currency_code: "USD",
  auto_generate: false,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: null,
  candidate: { candidate_name: "Alice Smith" },
  company: { company_name: "Acme Corp" },
};

describe("contractDetailObjectOutputSchema", () => {
  it("accepts a fully populated contract detail object", () => {
    expect(contractDetailObjectOutputSchema.safeParse(validContractDetail).success).toBe(true);
  });

  it("accepts with nullable fields set to null", () => {
    const data = {
      ...validContractDetail,
      detail: null,
      start_date: null,
      end_date: null,
      transfer_cost: null,
      currency_code: null,
      created_at: null,
      updated_at: null,
      candidate: null,
      company: null,
    };
    expect(contractDetailObjectOutputSchema.safeParse(data).success).toBe(true);
  });

  it("accepts with candidate and company having null nested names", () => {
    const data = {
      ...validContractDetail,
      candidate: { candidate_name: null },
      company: { company_name: null },
    };
    expect(contractDetailObjectOutputSchema.safeParse(data).success).toBe(true);
  });

  it("rejects when auto_generate is not a boolean", () => {
    const data = { ...validContractDetail, auto_generate: "yes" };
    expect(contractDetailObjectOutputSchema.safeParse(data).success).toBe(false);
  });

  it("rejects when candidate has wrong shape", () => {
    const data = { ...validContractDetail, candidate: { wrong: "key" } };
    expect(contractDetailObjectOutputSchema.safeParse(data).success).toBe(false);
  });

  it("rejects when status is missing", () => {
    const { status, ...rest } = validContractDetail;
    expect(contractDetailObjectOutputSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// contractDetailOutputSchema
// ---------------------------------------------------------------------------
describe("contractDetailOutputSchema", () => {
  it("accepts a valid contract detail response with contract", () => {
    const data = { contract: validContractDetail };
    expect(contractDetailOutputSchema.safeParse(data).success).toBe(true);
  });

  it("accepts contract set to null", () => {
    const data = { contract: null };
    expect(contractDetailOutputSchema.safeParse(data).success).toBe(true);
  });

  it("rejects when contract is missing", () => {
    expect(contractDetailOutputSchema.safeParse({}).success).toBe(false);
  });

  it("rejects when contract has invalid shape", () => {
    const data = { contract: { contract_uuid: 123 } };
    expect(contractDetailOutputSchema.safeParse(data).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// contractStatusUpdateOutputSchema
// ---------------------------------------------------------------------------
describe("contractStatusUpdateOutputSchema", () => {
  it("accepts a success response", () => {
    expect(contractStatusUpdateOutputSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("accepts a failure response", () => {
    expect(contractStatusUpdateOutputSchema.safeParse({ success: false }).success).toBe(true);
  });

  it("rejects when success is missing", () => {
    expect(contractStatusUpdateOutputSchema.safeParse({}).success).toBe(false);
  });

  it("rejects when success is not a boolean", () => {
    expect(contractStatusUpdateOutputSchema.safeParse({ success: "yes" }).success).toBe(false);
    expect(contractStatusUpdateOutputSchema.safeParse({ success: 1 }).success).toBe(false);
  });
});
