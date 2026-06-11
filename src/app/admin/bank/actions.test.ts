import { describe, it, expect, vi, beforeEach } from "vitest";
import { listBanksSchema, createBankSchema, updateBankSchema, deleteBankSchema } from "./schemas";

// ---------------------------------------------------------------------------
// Admin Bank — unit tests (Zod schema validation)
// ---------------------------------------------------------------------------

describe("admin/bank — schemas", () => {
  // -- listBanksSchema --

  describe("listBanksSchema", () => {
    it("defaults page and limit when given empty input", () => {
      const result = listBanksSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it("accepts optional search query", () => {
      const result = listBanksSchema.parse({ q: "NBK" });
      expect(result.q).toBe("NBK");
    });

    it("coerces string page/limit to numbers", () => {
      const result = listBanksSchema.parse({ page: "2", limit: "10" });
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
    });

    it("rejects page < 1", () => {
      const result = listBanksSchema.safeParse({ page: 0 });
      expect(result.success).toBe(false);
    });

    it("rejects limit > 100", () => {
      const result = listBanksSchema.safeParse({ limit: 101 });
      expect(result.success).toBe(false);
    });
  });

  // -- createBankSchema --

  describe("createBankSchema", () => {
    it("accepts valid input with required fields", () => {
      const result = createBankSchema.parse({
        bankName: "National Bank of Kuwait",
        bankIbanCode: "KW00NBK0000000000000000000000",
      });
      expect(result.bankName).toBe("National Bank of Kuwait");
      expect(result.bankIbanCode).toBe("KW00NBK0000000000000000000000");
    });

    it("accepts input with all optional fields", () => {
      const result = createBankSchema.parse({
        bankName: "Gulf Bank",
        bankIbanCode: "KW00GBK0000000000000000000000",
        bankSwiftCode: "GULBKWKW",
        bankCodeAbk: 123,
        bankAddress: "Kuwait City",
        bankTransferType: "STD",
      });
      expect(result.bankSwiftCode).toBe("GULBKWKW");
      expect(result.bankCodeAbk).toBe(123);
      expect(result.bankAddress).toBe("Kuwait City");
      expect(result.bankTransferType).toBe("STD");
    });

    it("rejects empty bankName", () => {
      const result = createBankSchema.safeParse({
        bankName: "",
        bankIbanCode: "KW00NBK0000000000000000000000",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty bankIbanCode", () => {
      const result = createBankSchema.safeParse({
        bankName: "NBK",
        bankIbanCode: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects bankName over 100 chars", () => {
      const result = createBankSchema.safeParse({
        bankName: "A".repeat(101),
        bankIbanCode: "KW00NBK0000000000000000000000",
      });
      expect(result.success).toBe(false);
    });

    it("rejects bankTransferType over 3 chars", () => {
      const result = createBankSchema.safeParse({
        bankName: "Test Bank",
        bankIbanCode: "KW00NBK0000000000000000000000",
        bankTransferType: "STD4",
      });
      expect(result.success).toBe(false);
    });
  });

  // -- updateBankSchema --

  describe("updateBankSchema", () => {
    it("requires bankId", () => {
      const result = updateBankSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("accepts bankId with partial fields", () => {
      const result = updateBankSchema.parse({
        bankId: 5,
        bankName: "Updated Bank Name",
      });
      expect(result.bankId).toBe(5);
      expect(result.bankName).toBe("Updated Bank Name");
    });

    it("coerces string bankId to number", () => {
      const result = updateBankSchema.parse({ bankId: "7" });
      expect(result.bankId).toBe(7);
    });

    it("allows nullable swift code to be set to null", () => {
      const result = updateBankSchema.parse({
        bankId: 1,
        bankSwiftCode: null,
      });
      expect(result.bankSwiftCode).toBeNull();
    });
  });

  // -- deleteBankSchema --

  describe("deleteBankSchema", () => {
    it("requires positive bankId", () => {
      const result = deleteBankSchema.safeParse({ bankId: -1 });
      expect(result.success).toBe(false);
    });

    it("accepts valid bankId", () => {
      const result = deleteBankSchema.parse({ bankId: 10 });
      expect(result.bankId).toBe(10);
    });
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

import {
  bankRowOutputSchema,
  listBanksOutputSchema,
  bankObjectOutputSchema,
  bankDetailOutputSchema,
  bankMutationOutputSchema,
} from "./schemas";

describe("bankRowOutputSchema", () => {
  it("accepts a valid bank row", () => {
    const row = {
      bank_id: 1,
      bank_name: "National Bank of Kuwait",
      bank_iban_code: "KW00NBK0000000000000000000000",
      bank_swift_code: "NBKKWKWK",
      bank_code_abk: 123,
      bank_address: "Kuwait City",
      bank_transfer_type: "STD",
      candidate_count: 5,
      created_at: null,
    };
    expect(bankRowOutputSchema.safeParse(row).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const row = {
      bank_id: 1,
      bank_name: null,
      bank_iban_code: "KW00NBK0000000000000000000000",
      bank_swift_code: null,
      bank_code_abk: null,
      bank_address: null,
      bank_transfer_type: null,
      candidate_count: 0,
      created_at: null,
    };
    expect(bankRowOutputSchema.safeParse(row).success).toBe(true);
  });

  it("rejects missing required fields", () => {
    expect(bankRowOutputSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-number bank_id", () => {
    const row = {
      bank_id: "abc",
      bank_name: null,
      bank_iban_code: "KW00NBK0000000000000000000000",
      bank_swift_code: null,
      bank_code_abk: null,
      bank_address: null,
      bank_transfer_type: null,
      candidate_count: 0,
      created_at: null,
    };
    expect(bankRowOutputSchema.safeParse(row).success).toBe(false);
  });

  it("rejects negative candidate_count", () => {
    const row = {
      bank_id: 1,
      bank_name: null,
      bank_iban_code: "KW00NBK0000000000000000000000",
      bank_swift_code: null,
      bank_code_abk: null,
      bank_address: null,
      bank_transfer_type: null,
      candidate_count: -1,
      created_at: null,
    };
    expect(bankRowOutputSchema.safeParse(row).success).toBe(false);
  });
});

describe("listBanksOutputSchema", () => {
  const validItem = {
    bank_id: 1,
    bank_name: null,
    bank_iban_code: "KW00NBK0000000000000000000000",
    bank_swift_code: null,
    bank_code_abk: null,
    bank_address: null,
    bank_transfer_type: null,
    candidate_count: 0,
    created_at: null,
  };

  it("accepts a valid list result", () => {
    const result = {
      items: [validItem],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(listBanksOutputSchema.safeParse(result).success).toBe(true);
  });

  it("accepts empty items", () => {
    const result = {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(listBanksOutputSchema.safeParse(result).success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = {
      items: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(listBanksOutputSchema.safeParse(result).success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = {
      items: [],
      total: 0,
      page: -1,
      limit: 20,
      totalPages: 0,
    };
    expect(listBanksOutputSchema.safeParse(result).success).toBe(false);
  });
});

describe("bankObjectOutputSchema", () => {
  it("accepts a valid bank object", () => {
    const obj = {
      bank_id: 1,
      bank_name: "NBK",
      bank_iban_code: "KW00NBK0000000000000000000000",
      bank_swift_code: "NBKKWKWK",
      bank_code_abk: 123,
      bank_address: "Kuwait City",
      bank_transfer_type: "STD",
    };
    expect(bankObjectOutputSchema.safeParse(obj).success).toBe(true);
  });

  it("accepts all-null optional fields", () => {
    const obj = {
      bank_id: 1,
      bank_name: null,
      bank_iban_code: "KW00NBK0000000000000000000000",
      bank_swift_code: null,
      bank_code_abk: null,
      bank_address: null,
      bank_transfer_type: null,
    };
    expect(bankObjectOutputSchema.safeParse(obj).success).toBe(true);
  });

  it("rejects missing bank_id", () => {
    const obj = {
      bank_iban_code: "KW00NBK0000000000000000000000",
    };
    expect(bankObjectOutputSchema.safeParse(obj).success).toBe(false);
  });
});

describe("bankDetailOutputSchema", () => {
  it("accepts a valid detail result", () => {
    const result = {
      bank: {
        bank_id: 1,
        bank_name: null,
        bank_iban_code: "KW00NBK0000000000000000000000",
        bank_swift_code: null,
        bank_code_abk: null,
        bank_address: null,
        bank_transfer_type: null,
      },
      candidate_count: 5,
    };
    expect(bankDetailOutputSchema.safeParse(result).success).toBe(true);
  });

  it("accepts null bank (not found)", () => {
    const result = { bank: null, candidate_count: 0 };
    expect(bankDetailOutputSchema.safeParse(result).success).toBe(true);
  });

  it("rejects missing candidate_count", () => {
    const result = { bank: null };
    expect(bankDetailOutputSchema.safeParse(result).success).toBe(false);
  });
});

describe("bankMutationOutputSchema", () => {
  it("accepts a success response with data", () => {
    const resp = {
      operation: "success",
      message: "Bank created",
      data: {
        bank_id: 1,
        bank_name: "NBK",
        bank_iban_code: "KW00NBK0000000000000000000000",
        bank_swift_code: null,
        bank_code_abk: null,
        bank_address: null,
        bank_transfer_type: null,
      },
    };
    expect(bankMutationOutputSchema.safeParse(resp).success).toBe(true);
  });

  it("accepts a success response without data", () => {
    const resp = { operation: "success", message: "Bank deleted" };
    expect(bankMutationOutputSchema.safeParse(resp).success).toBe(true);
  });

  it("accepts an error response", () => {
    const resp = { operation: "error", message: "Bank not found" };
    expect(bankMutationOutputSchema.safeParse(resp).success).toBe(true);
  });

  it("rejects missing message", () => {
    const resp = { operation: "success" };
    expect(bankMutationOutputSchema.safeParse(resp).success).toBe(false);
  });

  it("rejects invalid operation", () => {
    const resp = { operation: "unknown", message: "test" };
    expect(bankMutationOutputSchema.safeParse(resp).success).toBe(false);
  });
});
