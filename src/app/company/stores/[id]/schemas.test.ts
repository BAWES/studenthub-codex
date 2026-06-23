import { describe, it, expect } from "vitest";
import { getStoreDetailSchema } from "./schemas";

// ---------------------------------------------------------------------------
// getStoreDetailSchema
// ---------------------------------------------------------------------------
describe("getStoreDetailSchema", () => {
  it("accepts a valid positive integer storeId", () => {
    expect(getStoreDetailSchema.safeParse({ storeId: 42 }).success).toBe(true);
  });

  it("rejects missing storeId", () => {
    expect(getStoreDetailSchema.safeParse({}).success).toBe(false);
  });

  it("rejects negative storeId", () => {
    expect(getStoreDetailSchema.safeParse({ storeId: -1 }).success).toBe(false);
  });

  it("rejects zero storeId", () => {
    expect(getStoreDetailSchema.safeParse({ storeId: 0 }).success).toBe(false);
  });

  it("rejects non-integer storeId (float)", () => {
    expect(getStoreDetailSchema.safeParse({ storeId: 3.14 }).success).toBe(false);
  });

  it("rejects string storeId", () => {
    expect(getStoreDetailSchema.safeParse({ storeId: "abc" }).success).toBe(false);
  });

  it("rejects null storeId", () => {
    expect(getStoreDetailSchema.safeParse({ storeId: null }).success).toBe(false);
  });

  it("rejects undefined storeId", () => {
    expect(getStoreDetailSchema.safeParse({ storeId: undefined }).success).toBe(false);
  });
});
