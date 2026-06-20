import { describe, it, expect } from "vitest";
import {
  listTransferBankAdvicesSchema,
  getTransferBankAdviceSchema,
  createTransferBankAdviceSchema,
  updateTransferBankAdviceSchema,
  deleteTransferBankAdviceSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listTransferBankAdvicesSchema
// ---------------------------------------------------------------------------
describe("listTransferBankAdvicesSchema", () => {
  it("accepts empty input with defaults", () => {
    const result = listTransferBankAdvicesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts explicit page and limit", () => {
    const result = listTransferBankAdvicesSchema.safeParse({
      page: "3",
      limit: "50",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects limit above max (100)", () => {
    expect(
      listTransferBankAdvicesSchema.safeParse({ limit: "101" }).success,
    ).toBe(false);
  });

  it("rejects limit below min (1)", () => {
    expect(
      listTransferBankAdvicesSchema.safeParse({ limit: "0" }).success,
    ).toBe(false);
  });

  it("rejects non-numeric page", () => {
    expect(
      listTransferBankAdvicesSchema.safeParse({ page: "abc" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getTransferBankAdviceSchema
// ---------------------------------------------------------------------------
describe("getTransferBankAdviceSchema", () => {
  it("accepts valid UUID", () => {
    expect(
      getTransferBankAdviceSchema.safeParse({
        uuid: "550e8400-e29b-41d4-a716-446655440000",
      }).success,
    ).toBe(true);
  });

  it("rejects empty uuid", () => {
    expect(getTransferBankAdviceSchema.safeParse({ uuid: "" }).success).toBe(
      false,
    );
  });

  it("rejects missing uuid", () => {
    expect(getTransferBankAdviceSchema.safeParse({}).success).toBe(false);
  });

  it("rejects wrong type", () => {
    expect(
      getTransferBankAdviceSchema.safeParse({ uuid: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createTransferBankAdviceSchema
// ---------------------------------------------------------------------------
describe("createTransferBankAdviceSchema", () => {
  it("accepts valid file path", () => {
    expect(
      createTransferBankAdviceSchema.safeParse({
        file_path: "/uploads/advice.pdf",
      }).success,
    ).toBe(true);
  });

  it("rejects empty file path", () => {
    expect(
      createTransferBankAdviceSchema.safeParse({ file_path: "" }).success,
    ).toBe(false);
  });

  it("rejects missing file path", () => {
    expect(createTransferBankAdviceSchema.safeParse({}).success).toBe(false);
  });

  it("rejects file path exceeding max length", () => {
    expect(
      createTransferBankAdviceSchema.safeParse({
        file_path: "/" + "x".repeat(255),
      }).success,
    ).toBe(false);
  });

  it("rejects wrong type", () => {
    expect(
      createTransferBankAdviceSchema.safeParse({ file_path: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateTransferBankAdviceSchema
// ---------------------------------------------------------------------------
describe("updateTransferBankAdviceSchema", () => {
  const validInput = {
    uuid: "550e8400-e29b-41d4-a716-446655440000",
    file_path: "/uploads/updated.pdf",
  };

  it("accepts valid input", () => {
    expect(updateTransferBankAdviceSchema.safeParse(validInput).success).toBe(
      true,
    );
  });

  it("rejects empty uuid", () => {
    expect(
      updateTransferBankAdviceSchema.safeParse({
        ...validInput,
        uuid: "",
      }).success,
    ).toBe(false);
  });

  it("rejects empty file_path", () => {
    expect(
      updateTransferBankAdviceSchema.safeParse({
        ...validInput,
        file_path: "",
      }).success,
    ).toBe(false);
  });

  it("rejects missing uuid", () => {
    const { uuid: _, ...rest } = validInput;
    expect(updateTransferBankAdviceSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing file_path", () => {
    const { file_path: _, ...rest } = validInput;
    expect(updateTransferBankAdviceSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong types", () => {
    expect(
      updateTransferBankAdviceSchema.safeParse({
        uuid: 123,
        file_path: true,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteTransferBankAdviceSchema
// ---------------------------------------------------------------------------
describe("deleteTransferBankAdviceSchema", () => {
  it("accepts valid UUID", () => {
    expect(
      deleteTransferBankAdviceSchema.safeParse({
        uuid: "550e8400-e29b-41d4-a716-446655440000",
      }).success,
    ).toBe(true);
  });

  it("rejects empty uuid", () => {
    expect(
      deleteTransferBankAdviceSchema.safeParse({ uuid: "" }).success,
    ).toBe(false);
  });

  it("rejects missing uuid", () => {
    expect(deleteTransferBankAdviceSchema.safeParse({}).success).toBe(false);
  });

  it("rejects wrong type", () => {
    expect(
      deleteTransferBankAdviceSchema.safeParse({ uuid: 456 }).success,
    ).toBe(false);
  });
});
