import { describe, it, expect } from "vitest";
import {
  listPaymentsSchema,
  getPaymentDetailSchema,
  createPaymentSchema,
} from "./schemas";

describe("listPaymentsSchema", () => {
  it("accepts empty params", () => {
    const r = listPaymentsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts custom pagination", () => {
    const r = listPaymentsSchema.safeParse({ page: 2, limit: 10 });
    expect(r.success).toBe(true);
  });

  it("rejects limit over 100", () => {
    expect(listPaymentsSchema.safeParse({ limit: 999 }).success).toBe(false);
  });
});

describe("getPaymentDetailSchema", () => {
  it("accepts valid tcId", () => {
    const r = getPaymentDetailSchema.safeParse({ tcId: 42 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.tcId).toBe(42);
  });

  it("rejects missing tcId", () => {
    expect(getPaymentDetailSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero tcId", () => {
    expect(getPaymentDetailSchema.safeParse({ tcId: 0 }).success).toBe(false);
  });
});

describe("createPaymentSchema", () => {
  it("accepts valid create input", () => {
    const r = createPaymentSchema.safeParse({
      transferBenefName: "Ahmed Al-Kuwaiti",
      transferBenefIban: "KW00BANK123456789",
      bankId: 1,
      amount: 500.0,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.transferBenefName).toBe("Ahmed Al-Kuwaiti");
    }
  });

  it("rejects empty beneficiary name", () => {
    expect(createPaymentSchema.safeParse({ transferBenefName: "", transferBenefIban: "IBAN", bankId: 1 }).success).toBe(false);
  });

  it("rejects missing IBAN", () => {
    expect(createPaymentSchema.safeParse({ transferBenefName: "Test", bankId: 1 }).success).toBe(false);
  });

  it("rejects missing bankId", () => {
    expect(createPaymentSchema.safeParse({ transferBenefName: "Test", transferBenefIban: "IBAN" }).success).toBe(false);
  });
});
