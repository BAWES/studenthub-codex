import { describe, it, expect } from "vitest";
import {
  listTransferBankAdvicesSchema,
  getTransferBankAdviceSchema,
  createTransferBankAdviceSchema,
  updateTransferBankAdviceSchema,
  deleteTransferBankAdviceSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listTransferBankAdvicesSchema tests
// ---------------------------------------------------------------------------

describe("listTransferBankAdvicesSchema", () => {
  it("accepts empty input (uses defaults)", () => {
    const result = listTransferBankAdvicesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts explicit page and limit", () => {
    const result = listTransferBankAdvicesSchema.safeParse({
      page: 3,
      limit: 50,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
    }
  });

  it("coerces string values to numbers", () => {
    const result = listTransferBankAdvicesSchema.safeParse({
      page: "2",
      limit: "10",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("rejects page of zero", () => {
    expect(
      listTransferBankAdvicesSchema.safeParse({ page: 0 }).success,
    ).toBe(false);
  });

  it("rejects negative page", () => {
    expect(
      listTransferBankAdvicesSchema.safeParse({ page: -1 }).success,
    ).toBe(false);
  });

  it("rejects limit of zero", () => {
    expect(
      listTransferBankAdvicesSchema.safeParse({ limit: 0 }).success,
    ).toBe(false);
  });

  it("rejects limit exceeding 100", () => {
    expect(
      listTransferBankAdvicesSchema.safeParse({ limit: 101 }).success,
    ).toBe(false);
  });

  it("rejects non-numeric page", () => {
    expect(
      listTransferBankAdvicesSchema.safeParse({ page: "abc" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getTransferBankAdviceSchema tests
// ---------------------------------------------------------------------------

describe("getTransferBankAdviceSchema", () => {
  it("accepts a valid UUID string", () => {
    expect(
      getTransferBankAdviceSchema.safeParse({
        uuid: "550e8400-e29b-41d4-a716-446655440000",
      }).success,
    ).toBe(true);
  });

  it("accepts any non-empty string as uuid", () => {
    expect(
      getTransferBankAdviceSchema.safeParse({ uuid: "abc-123" }).success,
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

  it("rejects null uuid", () => {
    expect(getTransferBankAdviceSchema.safeParse({ uuid: null }).success).toBe(
      false,
    );
  });
});

// ---------------------------------------------------------------------------
// createTransferBankAdviceSchema tests
// ---------------------------------------------------------------------------

describe("createTransferBankAdviceSchema", () => {
  it("accepts a valid file_path", () => {
    expect(
      createTransferBankAdviceSchema.safeParse({
        file_path: "/tmp/bank-advice.pdf",
      }).success,
    ).toBe(true);
  });

  it("rejects empty file_path", () => {
    expect(
      createTransferBankAdviceSchema.safeParse({ file_path: "" }).success,
    ).toBe(false);
  });

  it("rejects missing file_path", () => {
    expect(createTransferBankAdviceSchema.safeParse({}).success).toBe(false);
  });

  it("rejects file_path exceeding 255 chars", () => {
    expect(
      createTransferBankAdviceSchema.safeParse({
        file_path: "x".repeat(256),
      }).success,
    ).toBe(false);
  });

  it("rejects null file_path", () => {
    expect(
      createTransferBankAdviceSchema.safeParse({ file_path: null }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateTransferBankAdviceSchema tests
// ---------------------------------------------------------------------------

describe("updateTransferBankAdviceSchema", () => {
  const valid = {
    uuid: "550e8400-e29b-41d4-a716-446655440000",
    file_path: "/uploads/advice.pdf",
  };

  it("accepts valid uuid and file_path", () => {
    expect(updateTransferBankAdviceSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects empty uuid", () => {
    expect(
      updateTransferBankAdviceSchema.safeParse({
        ...valid,
        uuid: "",
      }).success,
    ).toBe(false);
  });

  it("rejects missing uuid", () => {
    expect(
      updateTransferBankAdviceSchema.safeParse({ file_path: "path" }).success,
    ).toBe(false);
  });

  it("rejects empty file_path", () => {
    expect(
      updateTransferBankAdviceSchema.safeParse({
        ...valid,
        file_path: "",
      }).success,
    ).toBe(false);
  });

  it("rejects file_path exceeding 255 chars", () => {
    expect(
      updateTransferBankAdviceSchema.safeParse({
        ...valid,
        file_path: "x".repeat(256),
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteTransferBankAdviceSchema tests
// ---------------------------------------------------------------------------

describe("deleteTransferBankAdviceSchema", () => {
  it("accepts a valid uuid", () => {
    expect(
      deleteTransferBankAdviceSchema.safeParse({
        uuid: "550e8400-e29b-41d4-a716-446655440000",
      }).success,
    ).toBe(true);
  });

  it("rejects empty uuid", () => {
    expect(deleteTransferBankAdviceSchema.safeParse({ uuid: "" }).success).toBe(
      false,
    );
  });

  it("rejects missing uuid", () => {
    expect(deleteTransferBankAdviceSchema.safeParse({}).success).toBe(false);
  });

  it("rejects null uuid", () => {
    expect(
      deleteTransferBankAdviceSchema.safeParse({ uuid: null }).success,
    ).toBe(false);
  });
});
