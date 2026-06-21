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

/**
 * Page migration test for staff/contracts.
 *
 * Verifies the data contract between page and action.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("staff contracts page — data contract", () => {
  it("listContractsSchema accepts valid input", () => {
    const r = listContractsSchema.safeParse({
      page: 1,
      limit: 20,
      status: 1,
      type: "hourly",
      candidateId: 42,
      companyId: 7,
      q: "search",
    });
    expect(r.success).toBe(true);
  });

  it("listContractsSchema accepts empty input (defaults)", () => {
    const r = listContractsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("getContractSchema validates with uuid", () => {
    const r = getContractSchema.safeParse({ uuid: "abc-123" });
    expect(r.success).toBe(true);
  });

  it("getContractSchema rejects missing uuid", () => {
    const r = getContractSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("updateContractStatusSchema validates with uuid and status", () => {
    const r = updateContractStatusSchema.safeParse({
      uuid: "abc-123",
      status: 1,
    });
    expect(r.success).toBe(true);
  });

  it("updateContractStatusSchema rejects invalid status (out of range)", () => {
    const r = updateContractStatusSchema.safeParse({
      uuid: "abc-123",
      status: 5,
    });
    expect(r.success).toBe(false);
  });

  it("contractRowOutputSchema validates a contract row", () => {
    const r = contractRowOutputSchema.safeParse({
      contract_uuid: "abc-123",
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
    expect(r.success).toBe(true);
  });

  it("contractListOutputSchema validates paginated result", () => {
    const r = contractListOutputSchema.safeParse({
      items: [
        {
          contract_uuid: "abc-123",
          candidate_name: "John",
          company_name: "Acme",
          type: "hourly",
          status: 1,
          status_label: "Active",
          start_date: null,
          end_date: null,
          transfer_cost: null,
          currency_code: "KWD",
          created_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("contractDetailObjectOutputSchema validates detail object", () => {
    const r = contractDetailObjectOutputSchema.safeParse({
      contract_uuid: "abc-123",
      type: "hourly",
      detail: "Full-time internship",
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
    expect(r.success).toBe(true);
  });

  it("contractDetailOutputSchema wraps detail object", () => {
    const r = contractDetailOutputSchema.safeParse({
      contract: null,
    });
    expect(r.success).toBe(true);
  });

  it("contractStatusUpdateOutputSchema validates success response", () => {
    const r = contractStatusUpdateOutputSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });
});
