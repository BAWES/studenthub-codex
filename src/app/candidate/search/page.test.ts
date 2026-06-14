import { describe, it, expect } from "vitest";
import {
  facetOptionSchema,
  searchMetricRowSchema,
  sourceInfoSchema,
} from "./schemas";

describe("candidate search page — data contract", () => {
  it("facetOptionSchema validates a valid option", () => {
    const r = facetOptionSchema.safeParse({ value: "kw", label: "Kuwait", count: 42, active: true });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.label).toBe("Kuwait");
  });

  it("facetOptionSchema rejects missing value", () => {
    const r = facetOptionSchema.safeParse({ label: "Test" });
    expect(r.success).toBe(false);
  });

  it("searchMetricRowSchema validates a metric row", () => {
    const r = searchMetricRowSchema.safeParse({ label: "Total", value: 100, note: "Count" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.label).toBe("Total");
  });

  it("searchMetricRowSchema rejects missing label", () => {
    const r = searchMetricRowSchema.safeParse({ value: 0 });
    expect(r.success).toBe(false);
  });

  it("sourceInfoSchema validates source info", () => {
    const r = sourceInfoSchema.safeParse({ current: "Search", target: "Detail", note: "From search" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.current).toBe("Search");
  });

  it("sourceInfoSchema rejects missing current", () => {
    const r = sourceInfoSchema.safeParse({ target: "Detail" });
    expect(r.success).toBe(false);
  });
});
