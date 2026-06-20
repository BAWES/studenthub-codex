import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock Prisma — only bank model used
vi.mock("@/lib/prisma", () => ({
  prisma: {
    bank: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
  },
}));

// Mock session
vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn().mockResolvedValue(undefined),
}));

const {
  listBanks,
  getBank,
  createBank,
  updateBank,
  deleteBank,
} = await import("../actions");

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_BANK_ROW = {
  bank_id: 1,
  bank_name: "Test Bank",
  bank_iban_code: "KW123456789",
  bank_swift_code: "TESTKWKW",
  bank_code_abk: 123,
  bank_address: "Kuwait City",
  bank_transfer_type: "W",
  deleted: 0,
  _count: { candidate: 3 },
};

const MOCK_BANK_CREATED = {
  bank_id: 2,
  bank_name: "New Bank",
  bank_iban_code: "KW987654321",
  bank_swift_code: "NEWBKWKW",
  bank_code_abk: null,
  bank_address: null,
  bank_transfer_type: null,
  deleted: 0,
};

// ---------------------------------------------------------------------------
// listBanks
// ---------------------------------------------------------------------------

describe("listBanks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated results with defaults when no input", async () => {
    vi.mocked(prisma.bank.findMany).mockResolvedValue([]);
    vi.mocked(prisma.bank.count).mockResolvedValue(0);

    const result = await listBanks({});

    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
    expect(result.items).toEqual([]);
  });

  it("maps bank rows with candidate count", async () => {
    vi.mocked(prisma.bank.findMany).mockResolvedValue([MOCK_BANK_ROW]);
    vi.mocked(prisma.bank.count).mockResolvedValue(1);

    const result = await listBanks({ page: 1, limit: 20 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      bank_id: 1,
      bank_name: "Test Bank",
      bank_iban_code: "KW123456789",
      candidate_count: 3,
    });
    expect(result.total).toBe(1);
  });

  it("passes pagination params to Prisma", async () => {
    vi.mocked(prisma.bank.findMany).mockResolvedValue([]);
    vi.mocked(prisma.bank.count).mockResolvedValue(0);

    await listBanks({ page: 3, limit: 10 });

    expect(vi.mocked(prisma.bank.findMany).mock.calls[0][0]).toMatchObject({
      skip: 20,
      take: 10,
    });
  });

  it("filters by search query on name", async () => {
    vi.mocked(prisma.bank.findMany).mockResolvedValue([]);
    vi.mocked(prisma.bank.count).mockResolvedValue(0);

    await listBanks({ q: "Test" });

    const where = vi.mocked(prisma.bank.findMany).mock.calls[0][0]?.where as any;
    expect(where.deleted).toBe(0);
    expect(where.OR).toBeDefined();
    expect(where.OR[0]).toEqual({ bank_name: { contains: "Test" } });
  });

  it("omits OR filter when q is empty", async () => {
    vi.mocked(prisma.bank.findMany).mockResolvedValue([]);
    vi.mocked(prisma.bank.count).mockResolvedValue(0);

    await listBanks({ q: "" });

    const where = vi.mocked(prisma.bank.findMany).mock.calls[0][0]?.where as any;
    expect(where.deleted).toBe(0);
    expect(where.OR).toBeUndefined();
  });

  it("handles null rows gracefully", async () => {
    vi.mocked(prisma.bank.findMany).mockResolvedValue([]);
    vi.mocked(prisma.bank.count).mockResolvedValue(0);

    const result = await listBanks({});
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("computes totalPages correctly", async () => {
    vi.mocked(prisma.bank.findMany).mockResolvedValue(Array(10).fill(MOCK_BANK_ROW));
    vi.mocked(prisma.bank.count).mockResolvedValue(25);

    const result = await listBanks({ page: 1, limit: 10 });

    expect(result.totalPages).toBe(3);
    expect(result.total).toBe(25);
  });

  it("requires admin.read capability", async () => {
    vi.mocked(prisma.bank.findMany).mockResolvedValue([]);
    vi.mocked(prisma.bank.count).mockResolvedValue(0);

    const { requireCapability } = await import("@/modules/auth/session");
    await listBanks({});
    expect(requireCapability).toHaveBeenCalledWith("admin.read");
  });
});

// ---------------------------------------------------------------------------
// getBank
// ---------------------------------------------------------------------------

describe("getBank", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns bank detail when found", async () => {
    vi.mocked(prisma.bank.findFirst).mockResolvedValue(MOCK_BANK_ROW);

    const result = await getBank(1);

    expect(result.bank).not.toBeNull();
    expect(result.bank.bank_name).toBe("Test Bank");
    expect(result.bank.bank_iban_code).toBe("KW123456789");
    expect(result.candidate_count).toBe(3);
  });

  it("returns null bank when not found", async () => {
    vi.mocked(prisma.bank.findFirst).mockResolvedValue(null);

    const result = await getBank(999);

    expect(result.bank).toBeNull();
    expect(result.candidate_count).toBe(0);
  });

  it("requires admin.read capability", async () => {
    vi.mocked(prisma.bank.findFirst).mockResolvedValue(MOCK_BANK_ROW);

    const { requireCapability } = await import("@/modules/auth/session");
    await getBank(1);
    expect(requireCapability).toHaveBeenCalledWith("admin.read");
  });

  it("queries by bank_id with non-deleted filter", async () => {
    vi.mocked(prisma.bank.findFirst).mockResolvedValue(MOCK_BANK_ROW);

    await getBank(1);

    expect(vi.mocked(prisma.bank.findFirst)).toHaveBeenCalledWith({
      where: { bank_id: 1, deleted: 0 },
      include: { _count: { select: { candidate: true } } },
    });
  });

  it("throws on invalid bankId (negative)", async () => {
    await expect(getBank(-1)).rejects.toThrow();
  });

  it("throws on invalid bankId (zero)", async () => {
    await expect(getBank(0)).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// createBank
// ---------------------------------------------------------------------------

describe("createBank", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a bank and returns success", async () => {
    vi.mocked(prisma.bank.create).mockResolvedValue(MOCK_BANK_CREATED);

    const result = await createBank({
      bankName: "New Bank",
      bankIbanCode: "KW987654321",
    });

    expect(result.operation).toBe("success");
    expect(result.message).toContain("New Bank");
    expect((result as any).data).toBeDefined();
    expect((result as any).data.bank_id).toBe(2);
  });

  it("passes optional fields to create", async () => {
    vi.mocked(prisma.bank.create).mockResolvedValue(MOCK_BANK_CREATED);

    await createBank({
      bankName: "New Bank",
      bankIbanCode: "KW987654321",
      bankSwiftCode: "NEWBKWKW",
      bankCodeAbk: 123,
      bankAddress: "Kuwait City",
      bankTransferType: "W",
    });

    expect(vi.mocked(prisma.bank.create)).toHaveBeenCalledWith({
      data: {
        bank_name: "New Bank",
        bank_iban_code: "KW987654321",
        bank_swift_code: "NEWBKWKW",
        bank_code_abk: 123,
        bank_address: "Kuwait City",
        bank_transfer_type: "W",
      },
    });
  });

  it("sets nullable fields to null when omitted", async () => {
    vi.mocked(prisma.bank.create).mockResolvedValue(MOCK_BANK_CREATED);

    await createBank({
      bankName: "New Bank",
      bankIbanCode: "KW987654321",
    });

    expect(vi.mocked(prisma.bank.create)).toHaveBeenCalledWith({
      data: {
        bank_name: "New Bank",
        bank_iban_code: "KW987654321",
        bank_swift_code: null,
        bank_code_abk: null,
        bank_address: null,
        bank_transfer_type: null,
      },
    });
  });

  it("returns error on missing required fields", async () => {
    const result = await createBank({
      bankName: "",
      bankIbanCode: "",
    });

    expect(result.operation).toBe("error");
    expect(result.message).toBeTruthy();
  });

  it("returns error on Prisma failure", async () => {
    vi.mocked(prisma.bank.create).mockRejectedValue(new Error("DB error"));

    const result = await createBank({
      bankName: "New Bank",
      bankIbanCode: "KW987654321",
    });

    expect(result.operation).toBe("error");
    expect(result.message).toBe("DB error");
  });

  it("requires admin.write capability", async () => {
    vi.mocked(prisma.bank.create).mockResolvedValue(MOCK_BANK_CREATED);

    const { requireCapability } = await import("@/modules/auth/session");
    await createBank({
      bankName: "New Bank",
      bankIbanCode: "KW987654321",
    });
    expect(requireCapability).toHaveBeenCalledWith("admin.write");
  });

  it("calls revalidatePath on success", async () => {
    vi.mocked(prisma.bank.create).mockResolvedValue(MOCK_BANK_CREATED);

    const { revalidatePath } = await import("next/cache");
    await createBank({
      bankName: "New Bank",
      bankIbanCode: "KW987654321",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/bank");
  });

  it("does not call revalidatePath on error", async () => {
    const result = await createBank({
      bankName: "",
      bankIbanCode: "",
    });

    const { revalidatePath } = await import("next/cache");
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(result.operation).toBe("error");
  });
});

// ---------------------------------------------------------------------------
// updateBank
// ---------------------------------------------------------------------------

describe("updateBank", () => {
  const MOCK_EXISTING = { bank_id: 1, bank_name: "Test Bank" } as any;
  const MOCK_UPDATED = {
    bank_id: 1,
    bank_name: "Updated Bank",
    bank_iban_code: "KW123456789",
    bank_swift_code: "TESTKWKW",
    bank_code_abk: null,
    bank_address: null,
    bank_transfer_type: null,
    deleted: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.bank.findFirst).mockResolvedValue(MOCK_EXISTING);
  });

  it("updates a bank and returns success", async () => {
    vi.mocked(prisma.bank.update).mockResolvedValue(MOCK_UPDATED);

    const result = await updateBank({
      bankId: 1,
      bankName: "Updated Bank",
    });

    expect(result.operation).toBe("success");
    expect(result.message).toContain("Updated Bank");
    expect((result as any).data).toBeDefined();
    expect((result as any).data.bank_id).toBe(1);
  });

  it("updates only provided fields", async () => {
    vi.mocked(prisma.bank.update).mockResolvedValue(MOCK_UPDATED);

    await updateBank({
      bankId: 1,
      bankName: "Updated Bank",
    });

    expect(vi.mocked(prisma.bank.update)).toHaveBeenCalledWith({
      where: { bank_id: 1 },
      data: { bank_name: "Updated Bank" },
    });
  });

  it("returns error when bank not found", async () => {
    vi.mocked(prisma.bank.findFirst).mockResolvedValue(null);

    const result = await updateBank({
      bankId: 999,
      bankName: "Updated Bank",
    });

    expect(result.operation).toBe("error");
    expect(result.message).toBe("Bank not found");
  });

  it("returns error on invalid input", async () => {
    const result = await updateBank({
      bankId: -1,
      bankName: "Updated Bank",
    });

    expect(result.operation).toBe("error");
    expect(result.message).toBeTruthy();
  });

  it("requires admin.write capability", async () => {
    vi.mocked(prisma.bank.update).mockResolvedValue(MOCK_UPDATED);

    const { requireCapability } = await import("@/modules/auth/session");
    await updateBank({
      bankId: 1,
      bankName: "Updated Bank",
    });
    expect(requireCapability).toHaveBeenCalledWith("admin.write");
  });

  it("calls revalidatePath for list and detail on success", async () => {
    vi.mocked(prisma.bank.update).mockResolvedValue(MOCK_UPDATED);

    const { revalidatePath } = await import("next/cache");
    await updateBank({
      bankId: 1,
      bankName: "Updated Bank",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/bank");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/bank/1");
  });
});

// ---------------------------------------------------------------------------
// deleteBank
// ---------------------------------------------------------------------------

describe("deleteBank", () => {
const MOCK_EXISTING_FULL = {
    bank_id: 1,
    bank_name: "Test Bank",
    bank_iban_code: "KW123456789",
    bank_swift_code: "TESTKWKW",
    bank_code_abk: 123,
    bank_address: "Kuwait City",
    bank_transfer_type: "W",
    deleted: 0,
    _count: { candidate: 3 },
  };

  const MOCK_EXISTING_EMPTY = {
    bank_id: 2,
    bank_name: "Empty Bank",
    bank_iban_code: "KW000000000",
    bank_swift_code: null,
    bank_code_abk: null,
    bank_address: null,
    bank_transfer_type: null,
    deleted: 0,
    _count: { candidate: 0 },
  } as any;

  const MOCK_EXISTING_EMPTY_UPDATE = {
    bank_id: 2,
    bank_name: "Empty Bank",
    bank_iban_code: "KW000000000",
    bank_swift_code: null,
    bank_code_abk: null,
    bank_address: null,
    bank_transfer_type: null,
    deleted: 1,
    _count: { candidate: 0 },
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("soft-deletes a bank with no candidates", async () => {
    vi.mocked(prisma.bank.findFirst).mockResolvedValue(MOCK_EXISTING_EMPTY);
    vi.mocked(prisma.bank.update).mockResolvedValue(MOCK_EXISTING_EMPTY_UPDATE);

    const result = await deleteBank({ bankId: 2 });

    expect(result.operation).toBe("success");
    expect(result.message).toBe("Bank deleted successfully");
  });

  it("refuses deletion if candidates still assigned", async () => {
    vi.mocked(prisma.bank.findFirst).mockResolvedValue(MOCK_EXISTING_FULL);

    const result = await deleteBank({ bankId: 1 });

    expect(result.operation).toBe("error");
    expect(result.message).toContain("assigned");
    expect(result.message).toContain("3");
  });

  it("returns error when bank not found", async () => {
    vi.mocked(prisma.bank.findFirst).mockResolvedValue(null);

    const result = await deleteBank({ bankId: 999 });

    expect(result.operation).toBe("error");
    expect(result.message).toContain("not found");
  });

  it("returns error on invalid input", async () => {
    const result = await deleteBank({ bankId: 0 });

    expect(result.operation).toBe("error");
    expect(result.message).toBeTruthy();
  });

  it("requires admin.write capability", async () => {
    vi.mocked(prisma.bank.findFirst).mockResolvedValue(MOCK_EXISTING_EMPTY);
    vi.mocked(prisma.bank.update).mockResolvedValue(MOCK_EXISTING_EMPTY_UPDATE);

    const { requireCapability } = await import("@/modules/auth/session");
    await deleteBank({ bankId: 2 });
    expect(requireCapability).toHaveBeenCalledWith("admin.write");
  });

  it("calls revalidatePath on success", async () => {
    vi.mocked(prisma.bank.findFirst).mockResolvedValue(MOCK_EXISTING_EMPTY);
    vi.mocked(prisma.bank.update).mockResolvedValue(MOCK_EXISTING_EMPTY_UPDATE);

    const { revalidatePath } = await import("next/cache");
    await deleteBank({ bankId: 2 });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/bank");
  });

  it("does not call update if candidates exist", async () => {
    vi.mocked(prisma.bank.findFirst).mockResolvedValue(MOCK_EXISTING_FULL);

    await deleteBank({ bankId: 1 });

    expect(vi.mocked(prisma.bank.update)).not.toHaveBeenCalled();
  });
});
