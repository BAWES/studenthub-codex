import { describe, it, expect } from "vitest";
import {
  candidateWorkHistoryItemSchema,
  listCandidateWorkHistoryResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// candidateWorkHistoryItemSchema
// ---------------------------------------------------------------------------
describe("candidateWorkHistoryItemSchema", () => {
  const validItem = {
    id: 1,
    candidate_id: 42,
    contract_uuid: "550e8400-e29b-41d4-a716-446655440000",
    store_id: 5,
    company_id: 10,
    parent_company_id: 20,
    staff_id: 99,
    start_date: "2024-01-15",
    end_date: "2024-06-30",
    candidate_hourly_rate: 25.5,
    company_hourly_rate: 45.0,
    transfer_cost: 5.0,
    deleted: false,
  };

  it("accepts a fully valid item", () => {
    expect(candidateWorkHistoryItemSchema.safeParse(validItem).success).toBe(
      true,
    );
  });

  it("accepts all nullable fields set to null simultaneously", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        candidate_id: null,
        contract_uuid: null,
        store_id: null,
        company_id: null,
        parent_company_id: null,
        staff_id: null,
        start_date: null,
        end_date: null,
        candidate_hourly_rate: null,
        company_hourly_rate: null,
        transfer_cost: null,
      }).success,
    ).toBe(true);
  });

  // --- Individual nullable fields as null ---
  it("accepts null candidate_id", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        candidate_id: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null contract_uuid", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        contract_uuid: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null store_id", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        store_id: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null company_id", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        company_id: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null parent_company_id", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        parent_company_id: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null staff_id", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        staff_id: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null start_date", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        start_date: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null end_date", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        end_date: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null candidate_hourly_rate", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        candidate_hourly_rate: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null company_hourly_rate", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        company_hourly_rate: null,
      }).success,
    ).toBe(true);
  });

  it("accepts null transfer_cost", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        transfer_cost: null,
      }).success,
    ).toBe(true);
  });

  // --- Zero / boundary values ---
  it("accepts id at minimum (positive integer)", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        id: 1,
      }).success,
    ).toBe(true);
  });

  it("accepts zero values for nullable numeric fields", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        candidate_id: 0,
        store_id: 0,
        company_id: 0,
        parent_company_id: 0,
        staff_id: 0,
        candidate_hourly_rate: 0,
        company_hourly_rate: 0,
        transfer_cost: 0,
      }).success,
    ).toBe(true);
  });

  it("accepts empty string for nullable string fields", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        contract_uuid: "",
        start_date: "",
        end_date: "",
      }).success,
    ).toBe(true);
  });

  it("accepts deleted=true", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        deleted: true,
      }).success,
    ).toBe(true);
  });

  it("accepts negative numeric rates (valid numbers)", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        candidate_hourly_rate: -10,
        company_hourly_rate: -20,
        transfer_cost: -5,
      }).success,
    ).toBe(true);
  });

  // --- Missing required fields ---
  it("rejects missing id", () => {
    const { id: _, ...rest } = validItem;
    expect(candidateWorkHistoryItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing deleted", () => {
    const { deleted: _, ...rest } = validItem;
    expect(candidateWorkHistoryItemSchema.safeParse(rest).success).toBe(false);
  });

  // --- Invalid types ---
  it("rejects string id", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        id: "not-a-number",
      }).success,
    ).toBe(false);
  });

  it("rejects float id (not int)", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        id: 1.5,
      }).success,
    ).toBe(false);
  });

  it("rejects zero id (not positive)", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        id: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects negative id", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        id: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects string for candidate_id (must be number or null)", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        candidate_id: "abc",
      }).success,
    ).toBe(false);
  });

  it("rejects number for contract_uuid (must be string or null)", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        contract_uuid: 123,
      }).success,
    ).toBe(false);
  });

  it("rejects float for store_id (must be int or null)", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        store_id: 5.7,
      }).success,
    ).toBe(false);
  });

  it("rejects string for company_id (must be number or null)", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        company_id: "abc",
      }).success,
    ).toBe(false);
  });

  it("rejects string for parent_company_id (must be number or null)", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        parent_company_id: "abc",
      }).success,
    ).toBe(false);
  });

  it("rejects float for staff_id (must be int or null)", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        staff_id: 3.14,
      }).success,
    ).toBe(false);
  });

  it("rejects number for start_date (must be string or null)", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        start_date: 123,
      }).success,
    ).toBe(false);
  });

  it("rejects number for end_date (must be string or null)", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        end_date: 456,
      }).success,
    ).toBe(false);
  });

  it("rejects string for candidate_hourly_rate (must be number or null)", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        candidate_hourly_rate: "abc",
      }).success,
    ).toBe(false);
  });

  it("rejects string for company_hourly_rate (must be number or null)", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        company_hourly_rate: "xyz",
      }).success,
    ).toBe(false);
  });

  it("rejects string for transfer_cost (must be number or null)", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        transfer_cost: "abc",
      }).success,
    ).toBe(false);
  });

  it("rejects string for deleted (must be boolean)", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        deleted: "true",
      }).success,
    ).toBe(false);
  });

  it("rejects number for deleted (must be boolean)", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        deleted: 1,
      }).success,
    ).toBe(false);
  });

  it("rejects null for id (required field)", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        id: null,
      }).success,
    ).toBe(false);
  });

  it("rejects null for deleted (required field)", () => {
    expect(
      candidateWorkHistoryItemSchema.safeParse({
        ...validItem,
        deleted: null,
      }).success,
    ).toBe(false);
  });

  it("rejects undefined for required fields", () => {
    expect(candidateWorkHistoryItemSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCandidateWorkHistoryResultSchema
// ---------------------------------------------------------------------------
describe("listCandidateWorkHistoryResultSchema", () => {
  const validItem = {
    id: 1,
    candidate_id: 42,
    contract_uuid: null,
    store_id: null,
    company_id: null,
    parent_company_id: null,
    staff_id: null,
    start_date: null,
    end_date: null,
    candidate_hourly_rate: null,
    company_hourly_rate: null,
    transfer_cost: null,
    deleted: false,
  };

  const validResult = {
    items: [validItem],
    total: 1,
    page: 0,
    pageSize: 20,
  };

  it("accepts a fully valid result with one item", () => {
    expect(
      listCandidateWorkHistoryResultSchema.safeParse(validResult).success,
    ).toBe(true);
  });

  it("accepts empty items array", () => {
    expect(
      listCandidateWorkHistoryResultSchema.safeParse({
        ...validResult,
        items: [],
        total: 0,
      }).success,
    ).toBe(true);
  });

  it("accepts multiple items in the array", () => {
    const item2 = { ...validItem, id: 2, candidate_id: 99 };
    expect(
      listCandidateWorkHistoryResultSchema.safeParse({
        ...validResult,
        items: [validItem, item2],
        total: 2,
      }).success,
    ).toBe(true);
  });

  // --- Boundary values ---
  it("accepts total=0", () => {
    expect(
      listCandidateWorkHistoryResultSchema.safeParse({
        ...validResult,
        items: [],
        total: 0,
      }).success,
    ).toBe(true);
  });

  it("accepts page=0", () => {
    expect(
      listCandidateWorkHistoryResultSchema.safeParse({
        ...validResult,
        page: 0,
      }).success,
    ).toBe(true);
  });

  it("accepts pageSize=1 (minimum positive)", () => {
    expect(
      listCandidateWorkHistoryResultSchema.safeParse({
        ...validResult,
        pageSize: 1,
      }).success,
    ).toBe(true);
  });

  it("accepts large pageSize", () => {
    expect(
      listCandidateWorkHistoryResultSchema.safeParse({
        ...validResult,
        pageSize: 100,
      }).success,
    ).toBe(true);
  });

  // --- Missing required fields ---
  it("rejects missing items", () => {
    const { items: _, ...rest } = validResult;
    expect(listCandidateWorkHistoryResultSchema.safeParse(rest).success).toBe(
      false,
    );
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = validResult;
    expect(listCandidateWorkHistoryResultSchema.safeParse(rest).success).toBe(
      false,
    );
  });

  it("rejects missing page", () => {
    const { page: _, ...rest } = validResult;
    expect(listCandidateWorkHistoryResultSchema.safeParse(rest).success).toBe(
      false,
    );
  });

  it("rejects missing pageSize", () => {
    const { pageSize: _, ...rest } = validResult;
    expect(listCandidateWorkHistoryResultSchema.safeParse(rest).success).toBe(
      false,
    );
  });

  // --- Invalid types ---
  it("rejects non-array items", () => {
    expect(
      listCandidateWorkHistoryResultSchema.safeParse({
        ...validResult,
        items: "not-an-array",
      }).success,
    ).toBe(false);
  });

  it("rejects string total", () => {
    expect(
      listCandidateWorkHistoryResultSchema.safeParse({
        ...validResult,
        total: "abc",
      }).success,
    ).toBe(false);
  });

  it("rejects float total (not int)", () => {
    expect(
      listCandidateWorkHistoryResultSchema.safeParse({
        ...validResult,
        total: 1.5,
      }).success,
    ).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listCandidateWorkHistoryResultSchema.safeParse({
        ...validResult,
        total: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects null total", () => {
    expect(
      listCandidateWorkHistoryResultSchema.safeParse({
        ...validResult,
        total: null,
      }).success,
    ).toBe(false);
  });

  it("rejects string page", () => {
    expect(
      listCandidateWorkHistoryResultSchema.safeParse({
        ...validResult,
        page: "abc",
      }).success,
    ).toBe(false);
  });

  it("rejects float page (not int)", () => {
    expect(
      listCandidateWorkHistoryResultSchema.safeParse({
        ...validResult,
        page: 0.5,
      }).success,
    ).toBe(false);
  });

  it("rejects negative page", () => {
    expect(
      listCandidateWorkHistoryResultSchema.safeParse({
        ...validResult,
        page: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects null page", () => {
    expect(
      listCandidateWorkHistoryResultSchema.safeParse({
        ...validResult,
        page: null,
      }).success,
    ).toBe(false);
  });

  it("rejects string pageSize", () => {
    expect(
      listCandidateWorkHistoryResultSchema.safeParse({
        ...validResult,
        pageSize: "abc",
      }).success,
    ).toBe(false);
  });

  it("rejects float pageSize (not int)", () => {
    expect(
      listCandidateWorkHistoryResultSchema.safeParse({
        ...validResult,
        pageSize: 1.5,
      }).success,
    ).toBe(false);
  });

  it("rejects zero pageSize (not positive)", () => {
    expect(
      listCandidateWorkHistoryResultSchema.safeParse({
        ...validResult,
        pageSize: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects negative pageSize", () => {
    expect(
      listCandidateWorkHistoryResultSchema.safeParse({
        ...validResult,
        pageSize: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects null pageSize", () => {
    expect(
      listCandidateWorkHistoryResultSchema.safeParse({
        ...validResult,
        pageSize: null,
      }).success,
    ).toBe(false);
  });

  it("rejects empty object", () => {
    expect(listCandidateWorkHistoryResultSchema.safeParse({}).success).toBe(
      false,
    );
  });

  it("rejects invalid item within items array", () => {
    expect(
      listCandidateWorkHistoryResultSchema.safeParse({
        ...validResult,
        items: [{ id: "not-a-number", deleted: false }],
      }).success,
    ).toBe(false);
  });

  it("rejects items array containing null", () => {
    expect(
      listCandidateWorkHistoryResultSchema.safeParse({
        ...validResult,
        items: [null],
      }).success,
    ).toBe(false);
  });
});
