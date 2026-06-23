import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock Prisma — only contract model used
vi.mock("@/lib/prisma", () => ({
  prisma: {
    contract: {
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
  listContracts,
  getContract,
  createContract,
  updateContract,
  deleteContract,
} = await import("../actions");

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_CONTRACT_ROW = {
  contract_uuid: "abc-123-def",
  type: "full_time",
  detail: "Standard employment contract",
  status: 1,
  start_date: new Date("2026-01-15"),
  end_date: new Date("2027-01-15"),
  transfer_cost: 500.0,
  currency_code: "KWD",
  company_id: 1,
  candidate_id: 100,
  created_by: 5,
  store_id: null,
  auto_generate: false,
  deleted: false,
  created_at: new Date("2026-01-01"),
  updated_at: new Date("2026-01-01"),
  company_contract_company_idTocompany: {
    company_name: "Test Corp",
  },
  candidate: {
    candidate_name: "John Doe",
  },
  staff: {
    staff_name: "Admin User",
  },
  store: null,
  _count: { transfer: 2 },
};

const MOCK_CONTRACT_CREATED = {
  contract_uuid: "new-uuid-456",
  type: "part_time",
  detail: "Part time contract",
  status: 0,
  start_date: new Date("2026-06-01"),
  end_date: null,
  transfer_cost: null,
  currency_code: "KWD",
  company_id: 1,
  candidate_id: 100,
  created_by: 5,
  store_id: null,
  auto_generate: false,
  deleted: false,
  created_at: new Date("2026-06-23"),
  updated_at: new Date("2026-06-23"),
};

// ---------------------------------------------------------------------------
// listContracts
// ---------------------------------------------------------------------------

describe("listContracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated results with defaults when no input", async () => {
    vi.mocked(prisma.contract.findMany).mockResolvedValue([]);
    vi.mocked(prisma.contract.count).mockResolvedValue(0);

    const result = await listContracts({});

    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
    expect(result.items).toEqual([]);
  });

  it("maps contract rows with related data", async () => {
    vi.mocked(prisma.contract.findMany).mockResolvedValue([MOCK_CONTRACT_ROW as any]);
    vi.mocked(prisma.contract.count).mockResolvedValue(1);

    const result = await listContracts({ page: 1, limit: 20 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      contract_uuid: "abc-123-def",
      type: "full_time",
      status: 1,
      company_name: "Test Corp",
      candidate_name: "John Doe",
    });
    expect(result.total).toBe(1);
  });

  it("passes pagination params to Prisma", async () => {
    vi.mocked(prisma.contract.findMany).mockResolvedValue([]);
    vi.mocked(prisma.contract.count).mockResolvedValue(0);

    await listContracts({ page: 3, limit: 10 });

    expect(vi.mocked(prisma.contract.findMany).mock.calls[0][0]).toMatchObject({
      skip: 20,
      take: 10,
    });
  });

  it("filters non-deleted contracts only", async () => {
    vi.mocked(prisma.contract.findMany).mockResolvedValue([]);
    vi.mocked(prisma.contract.count).mockResolvedValue(0);

    await listContracts({});

    const where = vi.mocked(prisma.contract.findMany).mock.calls[0][0]?.where as any;
    expect(where.deleted).toBe(false);
  });

  it("filters by search query on type", async () => {
    vi.mocked(prisma.contract.findMany).mockResolvedValue([]);
    vi.mocked(prisma.contract.count).mockResolvedValue(0);

    await listContracts({ q: "full_time" });

    const where = vi.mocked(prisma.contract.findMany).mock.calls[0][0]?.where as any;
    expect(where.deleted).toBe(false);
    expect(where.OR).toBeDefined();
    expect(where.OR[0]).toEqual({ type: { contains: "full_time" } });
  });

  it("handles null rows gracefully", async () => {
    vi.mocked(prisma.contract.findMany).mockResolvedValue([]);
    vi.mocked(prisma.contract.count).mockResolvedValue(0);

    const result = await listContracts({});
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("computes totalPages correctly", async () => {
    vi.mocked(prisma.contract.findMany).mockResolvedValue(Array(10).fill(MOCK_CONTRACT_ROW) as any);
    vi.mocked(prisma.contract.count).mockResolvedValue(25);

    const result = await listContracts({ page: 1, limit: 10 });

    expect(result.totalPages).toBe(3);
    expect(result.total).toBe(25);
  });

  it("requires admin.read capability", async () => {
    vi.mocked(prisma.contract.findMany).mockResolvedValue([]);
    vi.mocked(prisma.contract.count).mockResolvedValue(0);

    const { requireCapability } = await import("@/modules/auth/session");
    await listContracts({});
    expect(requireCapability).toHaveBeenCalledWith("admin.read");
  });
});

// ---------------------------------------------------------------------------
// getContract
// ---------------------------------------------------------------------------

describe("getContract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns contract detail when found", async () => {
    vi.mocked(prisma.contract.findFirst).mockResolvedValue(MOCK_CONTRACT_ROW as any);

    const result = await getContract("abc-123-def");

    expect(result.contract).not.toBeNull();
    expect(result.contract!.type).toBe("full_time");
    expect(result.contract!.company_name).toBe("Test Corp");
    expect(result.contract!.candidate_name).toBe("John Doe");
  });

  it("returns null contract when not found", async () => {
    vi.mocked(prisma.contract.findFirst).mockResolvedValue(null);

    const result = await getContract("nonexistent");

    expect(result.contract).toBeNull();
  });

  it("requires admin.read capability", async () => {
    vi.mocked(prisma.contract.findFirst).mockResolvedValue(MOCK_CONTRACT_ROW as any);

    const { requireCapability } = await import("@/modules/auth/session");
    await getContract("abc-123-def");
    expect(requireCapability).toHaveBeenCalledWith("admin.read");
  });

  it("queries by contract_uuid with non-deleted filter", async () => {
    vi.mocked(prisma.contract.findFirst).mockResolvedValue(MOCK_CONTRACT_ROW as any);

    await getContract("abc-123-def");

    expect(vi.mocked(prisma.contract.findFirst)).toHaveBeenCalledWith({
      where: { contract_uuid: "abc-123-def", deleted: false },
      include: expect.any(Object),
    });
  });
});

// ---------------------------------------------------------------------------
// createContract
// ---------------------------------------------------------------------------

describe("createContract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a contract and returns success", async () => {
    vi.mocked(prisma.contract.create).mockResolvedValue(MOCK_CONTRACT_CREATED as any);

    const result = await createContract({
      type: "part_time",
      companyId: 1,
      candidateId: 100,
    });

    expect(result.operation).toBe("success");
    expect(result.message).toContain("part_time");
    expect((result as any).data).toBeDefined();
    expect((result as any).data.contract_uuid).toBe("new-uuid-456");
  });

  it("passes optional fields to create", async () => {
    vi.mocked(prisma.contract.create).mockResolvedValue(MOCK_CONTRACT_CREATED as any);

    await createContract({
      type: "part_time",
      companyId: 1,
      candidateId: 100,
      detail: "Part time contract",
      transferCost: 300,
      currencyCode: "KWD",
      startDate: "2026-06-01T00:00:00.000Z",
      autoGenerate: false,
    });

    expect(vi.mocked(prisma.contract.create)).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: "part_time",
        company_id: 1,
        candidate_id: 100,
        detail: "Part time contract",
        transfer_cost: 300,
        currency_code: "KWD",
        start_date: expect.any(Date),
        auto_generate: false,
      }),
    });
  });

  it("returns error on missing required fields", async () => {
    const result = await createContract({
      type: "",
      companyId: 0,
    });

    expect(result.operation).toBe("error");
    expect(result.message).toBeTruthy();
  });

  it("returns error on Prisma failure", async () => {
    vi.mocked(prisma.contract.create).mockRejectedValue(new Error("DB error"));

    const result = await createContract({
      type: "full_time",
      companyId: 1,
    });

    expect(result.operation).toBe("error");
    expect(result.message).toBe("DB error");
  });

  it("requires admin.write capability", async () => {
    vi.mocked(prisma.contract.create).mockResolvedValue(MOCK_CONTRACT_CREATED as any);

    const { requireCapability } = await import("@/modules/auth/session");
    await createContract({
      type: "full_time",
      companyId: 1,
    });
    expect(requireCapability).toHaveBeenCalledWith("admin.write");
  });

  it("calls revalidatePath on success", async () => {
    vi.mocked(prisma.contract.create).mockResolvedValue(MOCK_CONTRACT_CREATED as any);

    const { revalidatePath } = await import("next/cache");
    await createContract({
      type: "full_time",
      companyId: 1,
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/contracts");
  });

  it("does not call revalidatePath on error", async () => {
    const result = await createContract({
      type: "",
      companyId: 0,
    });

    const { revalidatePath } = await import("next/cache");
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(result.operation).toBe("error");
  });
});

// ---------------------------------------------------------------------------
// updateContract
// ---------------------------------------------------------------------------

describe("updateContract", () => {
  const MOCK_EXISTING = { contract_uuid: "abc-123-def", type: "full_time" } as any;
  const MOCK_UPDATED: any = {
    contract_uuid: "abc-123-def",
    type: "updated_type",
    detail: null,
    status: 0,
    start_date: null,
    end_date: null,
    transfer_cost: null,
    currency_code: "KWD",
    company_id: 1,
    candidate_id: null,
    parent_company_id: null,
    store_id: null,
    created_by: null,
    auto_generate: false,
    deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.contract.findFirst).mockResolvedValue(MOCK_EXISTING);
  });

  it("updates a contract and returns success", async () => {
    vi.mocked(prisma.contract.update).mockResolvedValue(MOCK_UPDATED);

    const result = await updateContract({
      contractUuid: "abc-123-def",
      type: "updated_type",
    });

    expect(result.operation).toBe("success");
    expect(result.message).toContain("updated_type");
    expect((result as any).data).toBeDefined();
    expect((result as any).data.contract_uuid).toBe("abc-123-def");
  });

  it("updates only provided fields", async () => {
    vi.mocked(prisma.contract.update).mockResolvedValue(MOCK_UPDATED);

    await updateContract({
      contractUuid: "abc-123-def",
      type: "updated_type",
    });

    expect(vi.mocked(prisma.contract.update)).toHaveBeenCalledWith({
      where: { contract_uuid: "abc-123-def" },
      data: { type: "updated_type" },
    });
  });

  it("returns error when contract not found", async () => {
    vi.mocked(prisma.contract.findFirst).mockResolvedValue(null);

    const result = await updateContract({
      contractUuid: "nonexistent",
      type: "updated",
    });

    expect(result.operation).toBe("error");
    expect(result.message).toBe("Contract not found");
  });

  it("returns error on invalid input", async () => {
    const result = await updateContract({
      contractUuid: "",
      type: "updated",
    });

    expect(result.operation).toBe("error");
    expect(result.message).toBeTruthy();
  });

  it("requires admin.write capability", async () => {
    vi.mocked(prisma.contract.update).mockResolvedValue(MOCK_UPDATED);

    const { requireCapability } = await import("@/modules/auth/session");
    await updateContract({
      contractUuid: "abc-123-def",
      type: "updated",
    });
    expect(requireCapability).toHaveBeenCalledWith("admin.write");
  });

  it("calls revalidatePath for list and detail on success", async () => {
    vi.mocked(prisma.contract.update).mockResolvedValue(MOCK_UPDATED);

    const { revalidatePath } = await import("next/cache");
    await updateContract({
      contractUuid: "abc-123-def",
      type: "updated",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/contracts");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/contracts/abc-123-def");
  });
});

// ---------------------------------------------------------------------------
// deleteContract
// ---------------------------------------------------------------------------

describe("deleteContract", () => {
  const MOCK_EXISTING_EMPTY = {
    contract_uuid: "abc-123-def",
    type: "full_time",
    deleted: false,
    _count: { transfer: 0 },
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("soft-deletes a contract with no transfers", async () => {
    vi.mocked(prisma.contract.findFirst).mockResolvedValue(MOCK_EXISTING_EMPTY);
    vi.mocked(prisma.contract.update).mockResolvedValue({ ...MOCK_EXISTING_EMPTY, deleted: true });

    const result = await deleteContract({ contractUuid: "abc-123-def" });

    expect(result.operation).toBe("success");
    expect(result.message).toBe("Contract deleted successfully");
  });

  it("refuses deletion if transfers still exist", async () => {
    const full = { ...MOCK_EXISTING_EMPTY, _count: { transfer: 3 } };
    vi.mocked(prisma.contract.findFirst).mockResolvedValue(full);

    const result = await deleteContract({ contractUuid: "abc-123-def" });

    expect(result.operation).toBe("error");
    expect(result.message).toContain("transfer");
  });

  it("returns error when contract not found", async () => {
    vi.mocked(prisma.contract.findFirst).mockResolvedValue(null);

    const result = await deleteContract({ contractUuid: "nonexistent" });

    expect(result.operation).toBe("error");
    expect(result.message).toBe("Contract not found or already deleted");
  });

  it("requires admin.write capability", async () => {
    vi.mocked(prisma.contract.findFirst).mockResolvedValue(MOCK_EXISTING_EMPTY);
    vi.mocked(prisma.contract.update).mockResolvedValue({ ...MOCK_EXISTING_EMPTY, deleted: true });

    const { requireCapability } = await import("@/modules/auth/session");
    await deleteContract({ contractUuid: "abc-123-def" });
    expect(requireCapability).toHaveBeenCalledWith("admin.write");
  });

  it("calls revalidatePath on success", async () => {
    vi.mocked(prisma.contract.findFirst).mockResolvedValue(MOCK_EXISTING_EMPTY);
    vi.mocked(prisma.contract.update).mockResolvedValue({ ...MOCK_EXISTING_EMPTY, deleted: true });

    const { revalidatePath } = await import("next/cache");
    await deleteContract({ contractUuid: "abc-123-def" });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/contracts");
  });
});
