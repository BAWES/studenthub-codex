import { describe, it, expect } from "vitest";
import {
  listPaymentsSchema,
  getPaymentDetailSchema,
  createPaymentSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests — candidate/payments
// ---------------------------------------------------------------------------

describe("listPaymentsSchema", () => {
  it("accepts valid pagination input", () => {
    const r = listPaymentsSchema.safeParse({ page: 1, limit: 20 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("defaults page and limit", () => {
    const r = listPaymentsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("rejects page < 1", () => {
    expect(listPaymentsSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects limit > 100", () => {
    expect(listPaymentsSchema.safeParse({ limit: 200 }).success).toBe(false);
  });

  it("rejects negative limit", () => {
    expect(listPaymentsSchema.safeParse({ limit: -5 }).success).toBe(false);
  });

  it("coerces string page and limit to number", () => {
    const r = listPaymentsSchema.safeParse({ page: "2", limit: "10" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });
});

describe("getPaymentDetailSchema", () => {
  it("accepts valid positive integer tcId", () => {
    const r = getPaymentDetailSchema.safeParse({ tcId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.tcId).toBe(42);
    }
  });

  it("coerces string tcId to number", () => {
    const r = getPaymentDetailSchema.safeParse({ tcId: "42" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.tcId).toBe(42);
    }
  });

  it("rejects missing tcId", () => {
    expect(getPaymentDetailSchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero tcId", () => {
    expect(getPaymentDetailSchema.safeParse({ tcId: 0 }).success).toBe(false);
  });

  it("rejects negative tcId", () => {
    expect(getPaymentDetailSchema.safeParse({ tcId: -5 }).success).toBe(false);
  });

  it("rejects non-integer tcId", () => {
    expect(getPaymentDetailSchema.safeParse({ tcId: "abc" }).success).toBe(
      false,
    );
  });
});

describe("createPaymentSchema", () => {
  const validInput = {
    transferBenefName: "John Doe",
    transferBenefIban: "KW00CBKU0000000000000000000000",
    bankId: 1,
  };

  it("accepts valid payment creation input", () => {
    const r = createPaymentSchema.safeParse(validInput);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.transferBenefName).toBe("John Doe");
      expect(r.data.transferBenefIban).toBe(
        "KW00CBKU0000000000000000000000",
      );
      expect(r.data.bankId).toBe(1);
    }
  });

  it("accepts optional amount", () => {
    const r = createPaymentSchema.safeParse({
      ...validInput,
      amount: 500.0,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.amount).toBe(500.0);
    }
  });

  it("rejects missing beneficiary name", () => {
    const { transferBenefName: _, ...rest } = validInput;
    expect(createPaymentSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty beneficiary name", () => {
    expect(
      createPaymentSchema.safeParse({
        ...validInput,
        transferBenefName: "",
      }).success,
    ).toBe(false);
  });

  it("rejects beneficiary name exceeding 60 chars", () => {
    expect(
      createPaymentSchema.safeParse({
        ...validInput,
        transferBenefName: "A".repeat(61),
      }).success,
    ).toBe(false);
  });

  it("rejects missing IBAN", () => {
    const { transferBenefIban: _, ...rest } = validInput;
    expect(createPaymentSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty IBAN", () => {
    expect(
      createPaymentSchema.safeParse({
        ...validInput,
        transferBenefIban: "",
      }).success,
    ).toBe(false);
  });

  it("rejects IBAN exceeding 50 chars", () => {
    expect(
      createPaymentSchema.safeParse({
        ...validInput,
        transferBenefIban: "A".repeat(51),
      }).success,
    ).toBe(false);
  });

  it("rejects missing bankId", () => {
    const { bankId: _, ...rest } = validInput;
    expect(createPaymentSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-integer bankId", () => {
    expect(
      createPaymentSchema.safeParse({
        ...validInput,
        bankId: 1.5,
      }).success,
    ).toBe(false);
  });

  it("rejects negative bankId", () => {
    expect(
      createPaymentSchema.safeParse({
        ...validInput,
        bankId: -1,
      }).success,
    ).toBe(false);
  });

  it("rejects zero bankId", () => {
    expect(
      createPaymentSchema.safeParse({
        ...validInput,
        bankId: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects non-positive amount", () => {
    expect(
      createPaymentSchema.safeParse({
        ...validInput,
        amount: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects negative amount", () => {
    expect(
      createPaymentSchema.safeParse({
        ...validInput,
        amount: -10,
      }).success,
    ).toBe(false);
  });
});
