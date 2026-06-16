import { describe, it, expect } from "vitest";
import { inspectorIdRequestActionResultSchema } from "./schemas";

/**
 * Page migration test for inspector/id-requests/[id].
 *
 * Verifies the data contract between page and action.
 * The inspector ID request detail page calls getIdRequest({ id })
 * and updateIdRequestStatus to verify/reject the request.
 *
 * The page-level schemas.ts re-exports inspectorIdRequestActionResultSchema
 * used by the updateIdRequestStatus action.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("inspector ID request detail page — data contract", () => {
  it("inspectorIdRequestActionResultSchema accepts success result", () => {
    const r = inspectorIdRequestActionResultSchema.safeParse({
      success: true,
    });
    expect(r.success).toBe(true);
  });

  it("inspectorIdRequestActionResultSchema accepts error result", () => {
    const r = inspectorIdRequestActionResultSchema.safeParse({
      error: "ID request not found",
    });
    expect(r.success).toBe(true);
  });

  it("inspectorIdRequestActionResultSchema rejects empty object", () => {
    const r = inspectorIdRequestActionResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("inspectorIdRequestActionResultSchema rejects { success: false }", () => {
    const r = inspectorIdRequestActionResultSchema.safeParse({
      success: false,
    });
    expect(r.success).toBe(false);
  });

  it("inspectorIdRequestActionResultSchema rejects null", () => {
    const r = inspectorIdRequestActionResultSchema.safeParse(null);
    expect(r.success).toBe(false);
  });

  it("inspectorIdRequestActionResultSchema accepts error with non-empty string", () => {
    const r = inspectorIdRequestActionResultSchema.safeParse({
      error: "Request already processed",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      // TypeScript narrowing: if success is true, data has error
      expect("error" in r.data).toBe(true);
    }
  });
});
