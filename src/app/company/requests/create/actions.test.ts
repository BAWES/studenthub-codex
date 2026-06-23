import { describe, it, expect } from "vitest";
import { getCompanyListSchema } from "./schemas";

// ---------------------------------------------------------------------------
// Pure logic: Zod schema validation for company/requests/create server actions
// ---------------------------------------------------------------------------

describe("getCompanyListSchema", () => {
  it("accepts a valid contact UUID", () => {
    const result = getCompanyListSchema.safeParse({
      contactUuid: "contact_test-uuid-1234",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty contact UUID", () => {
    const result = getCompanyListSchema.safeParse({
      contactUuid: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing contactUuid", () => {
    const result = getCompanyListSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-string contactUuid", () => {
    const result = getCompanyListSchema.safeParse({
      contactUuid: 123,
    });
    expect(result.success).toBe(false);
  });
});
