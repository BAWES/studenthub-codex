import { describe, it, expect } from "vitest";
import {
  getContractSchema,
  contractDetailObjectOutputSchema,
  contractDetailOutputSchema,
  contractStatusUpdateOutputSchema,
} from "@/modules/staff/contracts/schemas";

/**
 * Page data-contract tests for staff/contracts/[id].
 *
 * The page calls getContractDetail({ uuid: id }) from the parent-level
 * actions barrel, which delegates to the module-level implementation at
 * @/modules/staff/contracts/actions. The module-level schemas carry the
 * output validation.
 *
 * This test verifies input validation and output shapes for the
 * contract detail action.
 */

describe("staff/contracts/[id] — getContractSchema", () => {
  it("accepts a valid UUID string", () => {
    const r = getContractSchema.safeParse({
      uuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const r = getContractSchema.safeParse({ uuid: "" });
    expect(r.success).toBe(false);
  });

  it("rejects missing uuid", () => {
    const r = getContractSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects null", () => {
    const r = getContractSchema.safeParse(null);
    expect(r.success).toBe(false);
  });
});

describe("staff/contracts/[id] — contractDetailObjectOutputSchema", () => {
  const validContract = {
    contract_uuid: "550e8400-e29b-41d4-a716-446655440000",
    type: "Hourly",
    detail: "Some details",
    status: 1,
    status_label: "active",
    start_date: "2024-01-01T00:00:00.000Z",
    end_date: null,
    transfer_cost: null,
    currency_code: "KWD",
    auto_generate: false,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: null,
    candidate: { candidate_name: "Alice" },
    company: { company_name: "Company A" },
  };

  it("accepts full contract detail object", () => {
    const r = contractDetailObjectOutputSchema.safeParse(validContract);
    expect(r.success).toBe(true);
  });

  it("allows null candidate and company", () => {
    const r = contractDetailObjectOutputSchema.safeParse({
      ...validContract,
      candidate: null,
      company: null,
    });
    expect(r.success).toBe(true);
  });

  it("allows nullable dates and costs", () => {
    const r = contractDetailObjectOutputSchema.safeParse({
      ...validContract,
      start_date: null,
      end_date: null,
      transfer_cost: null,
      updated_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing contract_uuid", () => {
    const r = contractDetailObjectOutputSchema.safeParse({
      type: "Hourly",
      status: 1,
      status_label: "active",
      auto_generate: false,
    });
    expect(r.success).toBe(false);
  });

  it("rejects non-boolean auto_generate", () => {
    const r = contractDetailObjectOutputSchema.safeParse({
      ...validContract,
      auto_generate: "yes",
    });
    expect(r.success).toBe(false);
  });

  it("rejects null input", () => {
    const r = contractDetailObjectOutputSchema.safeParse(null);
    expect(r.success).toBe(false);
  });
});

describe("staff/contracts/[id] — contractDetailOutputSchema", () => {
  it("accepts result with full contract", () => {
    const r = contractDetailOutputSchema.safeParse({
      contract: {
        contract_uuid: "550e8400-e29b-41d4-a716-446655440000",
        type: "Monthly",
        detail: null,
        status: 1,
        status_label: "active",
        start_date: "2024-06-01T00:00:00.000Z",
        end_date: null,
        transfer_cost: "500.00",
        currency_code: "KWD",
        auto_generate: true,
        created_at: "2024-06-01T00:00:00.000Z",
        updated_at: null,
        candidate: null,
        company: null,
      },
    });
    expect(r.success).toBe(true);
  });

  it("accepts null contract (not-found case)", () => {
    const r = contractDetailOutputSchema.safeParse({ contract: null });
    expect(r.success).toBe(true);
  });

  it("rejects empty object", () => {
    const r = contractDetailOutputSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects null", () => {
    const r = contractDetailOutputSchema.safeParse(null);
    expect(r.success).toBe(false);
  });
});

describe("staff/contracts/[id] — contractStatusUpdateOutputSchema", () => {
  it("accepts success: true", () => {
    const r = contractStatusUpdateOutputSchema.safeParse({
      success: true,
    });
    expect(r.success).toBe(true);
  });

  it("accepts success: false", () => {
    const r = contractStatusUpdateOutputSchema.safeParse({
      success: false,
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty object", () => {
    const r = contractStatusUpdateOutputSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects null", () => {
    const r = contractStatusUpdateOutputSchema.safeParse(null);
    expect(r.success).toBe(false);
  });
});
