import { describe, it, expect } from "vitest";
import {
  paymentRowOutputSchema,
  listPaymentsResultOutputSchema,
  createPaymentResultOutputSchema,
} from "./schemas";

describe("candidate payments page — data contract", () => {
  it("paymentRowOutputSchema validates a valid payment row", () => {
    const r = paymentRowOutputSchema.safeParse({
      id: 1, transferId: 100, company: "Tech Corp", period: "2024-06",
      hours: "40", candidateTotal: "500", companyTotal: "600",
      cost: "100", paid: "500", paymentDate: "2024-06-15", updated: "2024-06-15",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.id).toBe(1);
  });

  it("paymentRowOutputSchema rejects missing id", () => {
    const r = paymentRowOutputSchema.safeParse({ company: "Co", period: "2024-06", hours: "40", candidateTotal: "500", companyTotal: "600", cost: "100", paid: "500", paymentDate: "d1", updated: "d1" });
    expect(r.success).toBe(false);
  });

  it("listPaymentsResultOutputSchema validates paginated list", () => {
    const validRow = { id: 1, transferId: null, company: "C", period: "2024-06", hours: "40", candidateTotal: "500", companyTotal: "600", cost: "100", paid: "500", paymentDate: "d1", updated: "d1" };
    const r = listPaymentsResultOutputSchema.safeParse({ items: [validRow], total: 1, page: 1, limit: 20, totalPages: 1 });
    expect(r.success).toBe(true);
  });

  it("createPaymentResultOutputSchema validates success with tcId", () => {
    const r = createPaymentResultOutputSchema.safeParse({ tcId: 42 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.tcId).toBe(42);
  });
});
