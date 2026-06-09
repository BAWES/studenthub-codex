import { describe, it, expect } from "vitest";
import {
  listContractsSchema,
  getContractSchema,
  updateContractStatusSchema,
} from "./actions";

// ---------------------------------------------------------------------------
// Schema tests — pure unit tests, no DB required
// ---------------------------------------------------------------------------

describe("listContractsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const r = listContractsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination and filter params", () => {
    const r = listContractsSchema.safeParse({
      page: 2,
      limit: 10,
      status: 1,
      type: "permanent",
      candidateId: 42,
      companyId: 7,
      q: "developer",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
      expect(r.data.status).toBe(1);
      expect(r.data.type).toBe("permanent");
      expect(r.data.candidateId).toBe(42);
      expect(r.data.companyId).toBe(7);
      expect(r.data.q).toBe("developer");
    }
  });

  it("rejects limit over 100", () => {
    expect(listContractsSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listContractsSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects non-numeric status", () => {
    expect(listContractsSchema.safeParse({ status: "abc" }).success).toBe(false);
  });

  it("rejects negative candidateId", () => {
    expect(listContractsSchema.safeParse({ candidateId: -5 }).success).toBe(false);
  });
});

describe("getContractSchema", () => {
  it("accepts a valid UUID", () => {
    const r = getContractSchema.safeParse({ uuid: "contract_uuid_12345" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.uuid).toBe("contract_uuid_12345");
    }
  });

  it("rejects missing UUID", () => {
    expect(getContractSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty UUID", () => {
    expect(getContractSchema.safeParse({ uuid: "" }).success).toBe(false);
  });
});

describe("updateContractStatusSchema", () => {
  it("accepts valid UUID and status 0 (inactive)", () => {
    const r = updateContractStatusSchema.safeParse({ uuid: "abc", status: 0 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe(0);
    }
  });

  it("accepts status 1 (active)", () => {
    expect(updateContractStatusSchema.safeParse({ uuid: "abc", status: 1 }).success).toBe(true);
  });

  it("accepts status 2 (terminated)", () => {
    expect(updateContractStatusSchema.safeParse({ uuid: "abc", status: 2 }).success).toBe(true);
  });

  it("rejects status 3 (out of range)", () => {
    expect(updateContractStatusSchema.safeParse({ uuid: "abc", status: 3 }).success).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(updateContractStatusSchema.safeParse({ status: 1 }).success).toBe(false);
  });

  it("rejects empty UUID", () => {
    expect(updateContractStatusSchema.safeParse({ uuid: "", status: 1 }).success).toBe(false);
  });
});
