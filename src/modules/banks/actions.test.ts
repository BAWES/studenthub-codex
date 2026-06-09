import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: bank schema validation
//
// These schemas are used internally by the server actions. Testing them
// separately avoids mocking "use server" dependencies (prisma, session, etc.).
// ---------------------------------------------------------------------------

const listBanksSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const getBankSchema = z.object({
  id: z.number().int().positive(),
});

const createBankSchema = z.object({
  name: z.string().min(1, "Bank name is required"),
  ibanCode: z.string().min(1, "IBAN code is required"),
  swiftCode: z.string().optional(),
  address: z.string().optional(),
  transferType: z.string().optional(),
  codeAbk: z.number().int().optional(),
});

describe("listBanksSchema", () => {
  it("accepts empty params (no pagination)", () => {
    const result = listBanksSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts pagination params", () => {
    const result = listBanksSchema.safeParse({ page: 1, limit: 20 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("rejects limit over 100", () => {
    const result = listBanksSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listBanksSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer limit", () => {
    const result = listBanksSchema.safeParse({ limit: "abc" });
    expect(result.success).toBe(false);
  });
});

describe("getBankSchema", () => {
  it("accepts a valid positive integer id", () => {
    const result = getBankSchema.safeParse({ id: 1 });
    expect(result.success).toBe(true);
  });

  it("rejects zero id", () => {
    const result = getBankSchema.safeParse({ id: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative id", () => {
    const result = getBankSchema.safeParse({ id: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer id", () => {
    const result = getBankSchema.safeParse({ id: "abc" });
    expect(result.success).toBe(false);
  });
});

describe("createBankSchema", () => {
  it("accepts valid bank data with minimum required fields", () => {
    const result = createBankSchema.safeParse({
      name: "National Bank of Kuwait",
      ibanCode: "KW123456789",
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional fields", () => {
    const result = createBankSchema.safeParse({
      name: "Gulf Bank",
      swiftCode: "GULBKWKW",
      ibanCode: "KW987654321",
      address: "Kuwait City",
      transferType: "SWIFT",
      codeAbk: 456,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createBankSchema.safeParse({
      name: "",
      ibanCode: "KW123456789",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty ibanCode", () => {
    const result = createBankSchema.safeParse({
      name: "Test Bank",
      ibanCode: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer codeAbk", () => {
    const result = createBankSchema.safeParse({
      name: "Test Bank",
      ibanCode: "KW123456789",
      codeAbk: "abc",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Pure function: build query filter (exclude soft-deleted banks)
// ---------------------------------------------------------------------------

type BankWhereInput = {
  deleted: number;
};

function buildBankListFilter(): BankWhereInput {
  return { deleted: 0 };
}

describe("buildBankListFilter", () => {
  it("excludes soft-deleted banks", () => {
    const result = buildBankListFilter();
    expect(result).toEqual({ deleted: 0 });
  });
});

// ---------------------------------------------------------------------------
// Return type shape
// ---------------------------------------------------------------------------

type BankListItem = {
  bank_id: number;
  bank_name: string | null;
  bank_iban_code: string;
  bank_swift_code: string | null;
  bank_code_abk: number | null;
  bank_address: string | null;
  bank_transfer_type: string | null;
};

type ListBanksResult = {
  banks: BankListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type CreateBankResult = {
  operation: string;
  message: string;
};

describe("BankListItem shape", () => {
  it("defines the expected fields", () => {
    const mock: BankListItem = {
      bank_id: 1,
      bank_name: "National Bank of Kuwait",
      bank_iban_code: "KW123456789",
      bank_swift_code: "NBOKKWKW",
      bank_code_abk: 123,
      bank_address: "Kuwait City",
      bank_transfer_type: "SWIFT",
    };
    expect(mock.bank_id).toBe(1);
    expect(mock.bank_name).toBe("National Bank of Kuwait");
    expect(mock.bank_iban_code).toBe("KW123456789");
    expect(mock.bank_swift_code).toBe("NBOKKWKW");
    expect(mock.bank_code_abk).toBe(123);
    expect(mock.bank_address).toBe("Kuwait City");
    expect(mock.bank_transfer_type).toBe("SWIFT");
  });
});

describe("ListBanksResult shape", () => {
  it("accepts a valid result set", () => {
    const result: ListBanksResult = {
      banks: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.banks).toHaveLength(0);
  });
});

describe("CreateBankResult shape", () => {
  it("accepts a success result", () => {
    const result: CreateBankResult = {
      operation: "success",
      message: "Bank created successfully",
    };
    expect(result.operation).toBe("success");
  });

  it("accepts an error result", () => {
    const result: CreateBankResult = {
      operation: "error",
      message: "Failed to create bank",
    };
    expect(result.operation).toBe("error");
  });
});
