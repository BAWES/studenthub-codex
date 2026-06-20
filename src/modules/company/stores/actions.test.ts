import { describe, it, expect } from "vitest";
import {
  listStoresRowsSchema,
  listMallsAndBrandsSchema,
} from "./schemas";
import type { StoreRow } from "./schemas";

// ---------------------------------------------------------------------------
// listStoresRowsSchema
// ---------------------------------------------------------------------------

describe("listStoresRowsSchema", () => {
  it("accepts a valid contact UUID", () => {
    const result = listStoresRowsSchema.safeParse({
      contactUuid: "contact_uuid_12345",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contactUuid).toBe("contact_uuid_12345");
    }
  });

  it("rejects empty contact UUID", () => {
    const result = listStoresRowsSchema.safeParse({ contactUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing contact UUID", () => {
    const result = listStoresRowsSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listMallsAndBrandsSchema
// ---------------------------------------------------------------------------

describe("listMallsAndBrandsSchema", () => {
  it("accepts a valid contact UUID", () => {
    const result = listMallsAndBrandsSchema.safeParse({
      contactUuid: "contact_uuid_12345",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contactUuid).toBe("contact_uuid_12345");
    }
  });

  it("rejects empty contact UUID", () => {
    const result = listMallsAndBrandsSchema.safeParse({ contactUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing contact UUID", () => {
    const result = listMallsAndBrandsSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Types compile check (type-level test)
// ---------------------------------------------------------------------------

describe("StoreRow type", () => {
  it("matches the expected shape", () => {
    const row: StoreRow = {
      id: 1,
      name: "Test Store",
      location: "Test Location",
      mallName: "Test Mall",
      brandName: "Test Brand",
      companyName: "Test Company",
      managerName: "Manager",
    };
    expect(row.id).toBe(1);
    expect(row.name).toBe("Test Store");
    expect(row.location).toBe("Test Location");
  });
});
