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

describe("contractRowOutputSchema", () => {
  const validRow = () => ({
    contract_uuid: "ct-001",
    candidate_name: "John Doe",
    company_name: "Acme Corp",
    type: "hourly",
    status: 1,
    status_label: "Active",
    start_date: "2026-01-01",
    end_date: null,
    transfer_cost: "500.00",
    currency_code: "KWD",
    created_at: "2026-01-01T00:00:00Z",
  });

  it("accepts a valid contract row", () => {
    const r = contractRowOutputSchema.safeParse(validRow());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = contractRowOutputSchema.safeParse({
      ...validRow(),
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
    const { contract_uuid: _, ...rest } = validRow();
    expect(contractRowOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-integer status", () => {
    expect(
      contractRowOutputSchema.safeParse({ ...validRow(), status: "active" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// contractListOutputSchema
// ---------------------------------------------------------------------------

describe("contractListOutputSchema", () => {
  const validRow = () => ({
    contract_uuid: "ct-001",
    candidate_name: null,
    company_name: "Acme",
    type: "hourly",
    status: 1,
    status_label: "Active",
    start_date: null,
    end_date: null,
    transfer_cost: null,
    currency_code: null,
    created_at: null,
  });

  it("accepts a valid paginated result", () => {
    const r = contractListOutputSchema.safeParse({
      items: [validRow()],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty items array", () => {
    const r = contractListOutputSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative totalPages", () => {
    expect(
      contractListOutputSchema.safeParse({ items: [], total: 0, page: 1, limit: 20, totalPages: -1 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// contractDetailObjectOutputSchema
// ---------------------------------------------------------------------------

describe("contractDetailObjectOutputSchema", () => {
  const validDetail = () => ({
    contract_uuid: "ct-001",
    type: "hourly",
    detail: "Full-time contract",
    status: 1,
    status_label: "Active",
    start_date: "2026-01-01",
    end_date: null,
    transfer_cost: "500.00",
    currency_code: "KWD",
    auto_generate: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: null,
    candidate: { candidate_name: "John Doe" },
    company: { company_name: "Acme Corp" },
  });

  it("accepts a valid contract detail object", () => {
    const r = contractDetailObjectOutputSchema.safeParse(validDetail());
    expect(r.success).toBe(true);
  });

  it("accepts nullable sub-objects", () => {
    const r = contractDetailObjectOutputSchema.safeParse({
      ...validDetail(),
      candidate: null,
      company: null,
      detail: null,
      end_date: null,
      updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects non-boolean auto_generate", () => {
    expect(
      contractDetailObjectOutputSchema.safeParse({ ...validDetail(), auto_generate: "yes" }).success,
    ).toBe(false);
  });

  it("rejects missing contract_uuid", () => {
    const { contract_uuid: _, ...rest } = validDetail();
    expect(contractDetailObjectOutputSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// contractDetailOutputSchema
// ---------------------------------------------------------------------------

describe("contractDetailOutputSchema", () => {
  it("accepts valid contract detail with contract object", () => {
    const r = contractDetailOutputSchema.safeParse({
      contract: {
        contract_uuid: "ct-001",
        type: "hourly",
        detail: null,
        status: 1,
        status_label: "Active",
        start_date: null,
        end_date: null,
        transfer_cost: null,
        currency_code: null,
        auto_generate: false,
        created_at: null,
        updated_at: null,
        candidate: null,
        company: null,
      },
    });
    expect(r.success).toBe(true);
  });

  it("accepts null contract", () => {
    const r = contractDetailOutputSchema.safeParse({ contract: null });
    expect(r.success).toBe(true);
  });

  it("rejects missing contract key", () => {
    expect(contractDetailOutputSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// contractStatusUpdateOutputSchema
// ---------------------------------------------------------------------------

describe("contractStatusUpdateOutputSchema", () => {
  it("accepts success: true", () => {
    const r = contractStatusUpdateOutputSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("accepts success: false", () => {
    const r = contractStatusUpdateOutputSchema.safeParse({ success: false });
    expect(r.success).toBe(true);
  });

  it("rejects non-boolean success", () => {
    expect(contractStatusUpdateOutputSchema.safeParse({ success: "yes" }).success).toBe(false);
  });

  it("rejects missing success", () => {
    expect(contractStatusUpdateOutputSchema.safeParse({}).success).toBe(false);
  });
});
