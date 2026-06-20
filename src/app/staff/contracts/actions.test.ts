import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listContractsSchema,
  getContractSchema,
  updateContractStatusSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests — pure unit tests, no DB required
// ---------------------------------------------------------------------------

describe("listContractsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const r = listContractsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination and filter params", () => {
    const r = listContractsSchema.safeParse({ page: 2, limit: 10, status: 1, type: "full-time" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
      expect(r.data.status).toBe(1);
      expect(r.data.type).toBe("full-time");
    }
  });

  it("rejects limit over 100", () => {
    expect(listContractsSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listContractsSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects non-numeric status", () => {
    expect(listContractsSchema.safeParse({ status: "abc" }).success).toBe(false);
  });

  it("rejects negative candidateId", () => {
    expect(listContractsSchema.safeParse({ candidateId: -1 }).success).toBe(false);
  });
});

describe("getContractSchema", () => {
  it("accepts a valid UUID", () => {
    const r = getContractSchema.safeParse({ uuid: "contract_abc-123" });
    expect(r.success).toBe(true);
  });

  it("rejects missing UUID", () => {
    expect(getContractSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty UUID", () => {
    expect(getContractSchema.safeParse({ uuid: "" }).success).toBe(false);
  });
});

describe("updateContractStatusSchema", () => {
  it("accepts valid UUID and status 0 (inactive)", () => {
    expect(updateContractStatusSchema.safeParse({ uuid: "abc", status: 0 }).success).toBe(true);
  });

  it("accepts status 1 (active)", () => {
    expect(updateContractStatusSchema.safeParse({ uuid: "abc", status: 1 }).success).toBe(true);
  });

  it("accepts status 2 (terminated)", () => {
    expect(updateContractStatusSchema.safeParse({ uuid: "abc", status: 2 }).success).toBe(true);
  });

  it("rejects status 3 (out of range)", () => {
    expect(updateContractStatusSchema.safeParse({ uuid: "abc", status: 3 }).success).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(updateContractStatusSchema.safeParse({ status: 1 }).success).toBe(false);
  });

  it("rejects empty UUID", () => {
    expect(updateContractStatusSchema.safeParse({ uuid: "", status: 1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Action tests — mock Prisma + auth
// ---------------------------------------------------------------------------

const mockFindMany = vi.fn();
const mockCount = vi.fn();
const mockFindFirst = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    contract: {
      findMany: mockFindMany,
      count: mockCount,
      findFirst: mockFindFirst,
      update: mockUpdate,
    },
  },
}));

vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const { requireCapability } = await import("@/modules/auth/session");
const contracts = await import("./actions");

const mockUser = {
  role: "staff" as const,
  id: "42",
  name: "Staff User",
  email: "staff@studenthub.ai",
  issuedAt: Date.now(),
};

function makeContract(overrides: Record<string, unknown> = {}) {
  return {
    contract_uuid: "contract_abc-123",
    type: "full-time",
    detail: "Standard employment contract",
    status: 1,
    start_date: new Date("2026-01-01"),
    end_date: new Date("2026-12-31"),
    transfer_cost: "500.00",
    currency_code: "KWD",
    deleted: false,
    created_at: new Date("2026-01-01"),
    updated_at: new Date("2026-06-10"),
    candidate: { candidate_name: "Ahmed Al-Mutairi" },
    company_contract_company_idTocompany: { company_name: "Acme Corp" },
    ...overrides,
  };
}

describe("listContracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
  });

  it("returns paginated contracts with defaults", async () => {
    mockFindMany.mockResolvedValue([makeContract()]);
    mockCount.mockResolvedValue(1);
    const result = await contracts.listContracts({});
    expect(requireCapability).toHaveBeenCalledWith("contracts.read");
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(1);
    expect(result.items[0].candidate_name).toBe("Ahmed Al-Mutairi");
    expect(result.items[0].company_name).toBe("Acme Corp");
    expect(result.items[0].status_label).toBe("active");
  });

  it("filters by status", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);
    await contracts.listContracts({ status: 1 });
    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.where.status).toBe(1);
  });

  it("respects pagination", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);
    await contracts.listContracts({ page: 3, limit: 10 });
    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.skip).toBe(20);
    expect(callArgs.take).toBe(10);
  });

  it("returns empty result on invalid input", async () => {
    const result = await contracts.listContracts({ limit: 999 });
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });
});

describe("getContractDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
  });

  it("returns contract detail for valid UUID", async () => {
    mockFindFirst.mockResolvedValue(makeContract());
    const result = await contracts.getContractDetail({ uuid: "contract_abc-123" });
    expect(result.contract).not.toBeNull();
    expect(result.contract?.candidate?.candidate_name).toBe("Ahmed Al-Mutairi");
    expect(result.contract?.company?.company_name).toBe("Acme Corp");
    expect(result.contract?.status_label).toBe("active");
  });

  it("returns null contract when not found", async () => {
    mockFindFirst.mockResolvedValue(null);
    const result = await contracts.getContractDetail({ uuid: "contract_missing" });
    expect(result.contract).toBeNull();
  });

  it("throws on invalid UUID", async () => {
    await expect(contracts.getContractDetail({ uuid: "" })).rejects.toThrow();
    expect(mockFindFirst).not.toHaveBeenCalled();
  });
});

describe("updateContractStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireCapability).mockResolvedValue(mockUser);
  });

  it("updates contract status successfully", async () => {
    mockFindFirst.mockResolvedValue({ contract_uuid: "contract_abc-123", status: 1 });
    mockUpdate.mockResolvedValue({});
    const result = await contracts.updateContractStatus({ uuid: "contract_abc-123", status: 2 });
    expect(result.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { contract_uuid: "contract_abc-123" },
      data: expect.objectContaining({ status: 2, updated_at: expect.any(Date) }),
    });
  });

  it("throws when contract not found", async () => {
    mockFindFirst.mockResolvedValue(null);
    await expect(contracts.updateContractStatus({ uuid: "contract_missing", status: 2 })).rejects.toThrow("Contract not found");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("throws on invalid input", async () => {
    await expect(contracts.updateContractStatus({ uuid: "" } as any)).rejects.toThrow();
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

import {
  contractRowOutputSchema,
  contractListOutputSchema,
  contractDetailObjectOutputSchema,
  contractDetailOutputSchema,
  contractStatusUpdateOutputSchema,
} from "./schemas";

describe("contractRowOutputSchema", () => {
  it("accepts a valid contract row", () => {
    const row = {
      contract_uuid: "contract_abc-123",
      candidate_name: "Ahmed Al-Mutairi",
      company_name: "Acme Corp",
      type: "full-time",
      status: 1,
      status_label: "active",
      start_date: "2026-01-01T00:00:00.000Z",
      end_date: "2026-12-31T00:00:00.000Z",
      transfer_cost: "500.00",
      currency_code: "KWD",
      created_at: "2026-01-01T00:00:00.000Z",
    };
    expect(contractRowOutputSchema.safeParse(row).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const row = {
      contract_uuid: "contract_abc-123",
      candidate_name: null,
      company_name: null,
      type: "full-time",
      status: 1,
      status_label: "active",
      start_date: null,
      end_date: null,
      transfer_cost: null,
      currency_code: null,
      created_at: null,
    };
    expect(contractRowOutputSchema.safeParse(row).success).toBe(true);
  });

  it("rejects missing required fields", () => {
    expect(contractRowOutputSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-string contract_uuid", () => {
    const row = {
      contract_uuid: 123,
      candidate_name: null,
      company_name: null,
      type: "full-time",
      status: 1,
      status_label: "active",
      start_date: null,
      end_date: null,
      transfer_cost: null,
      currency_code: null,
      created_at: null,
    };
    expect(contractRowOutputSchema.safeParse(row).success).toBe(false);
  });
});

describe("contractListOutputSchema", () => {
  const validItem = {
    contract_uuid: "contract_abc-123",
    candidate_name: null,
    company_name: null,
    type: "full-time",
    status: 1,
    status_label: "active",
    start_date: null,
    end_date: null,
    transfer_cost: null,
    currency_code: null,
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
    expect(contractListOutputSchema.safeParse(result).success).toBe(true);
  });

  it("accepts empty items", () => {
    const result = {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(contractListOutputSchema.safeParse(result).success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = {
      items: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(contractListOutputSchema.safeParse(result).success).toBe(false);
  });
});

describe("contractDetailObjectOutputSchema", () => {
  it("accepts a valid contract detail object", () => {
    const detail = {
      contract_uuid: "contract_abc-123",
      type: "full-time",
      detail: "Standard employment contract",
      status: 1,
      status_label: "active",
      start_date: "2026-01-01T00:00:00.000Z",
      end_date: "2026-12-31T00:00:00.000Z",
      transfer_cost: "500.00",
      currency_code: "KWD",
      auto_generate: false,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-06-10T00:00:00.000Z",
      candidate: { candidate_name: "Ahmed Al-Mutairi" },
      company: { company_name: "Acme Corp" },
    };
    expect(contractDetailObjectOutputSchema.safeParse(detail).success).toBe(true);
  });

  it("accepts nullable nested objects as null", () => {
    const detail = {
      contract_uuid: "contract_abc-123",
      type: "full-time",
      detail: null,
      status: 1,
      status_label: "active",
      start_date: null,
      end_date: null,
      transfer_cost: null,
      currency_code: null,
      auto_generate: false,
      created_at: null,
      updated_at: null,
      candidate: null,
      company: null,
    };
    expect(contractDetailObjectOutputSchema.safeParse(detail).success).toBe(true);
  });

  it("rejects missing auto_generate", () => {
    const detail = {
      contract_uuid: "contract_abc-123",
      type: "full-time",
      detail: null,
      status: 1,
      status_label: "active",
      start_date: null,
      end_date: null,
      transfer_cost: null,
      currency_code: null,
      created_at: null,
      updated_at: null,
      candidate: null,
      company: null,
    };
    expect(contractDetailObjectOutputSchema.safeParse(detail).success).toBe(false);
  });
});

describe("contractDetailOutputSchema", () => {
  it("accepts a valid contract detail result", () => {
    const result = {
      contract: {
        contract_uuid: "contract_abc-123",
        type: "full-time",
        detail: null,
        status: 1,
        status_label: "active",
        start_date: null,
        end_date: null,
        transfer_cost: null,
        currency_code: null,
        auto_generate: false,
        created_at: null,
        updated_at: null,
        candidate: null,
        company: null,
      },
    };
    expect(contractDetailOutputSchema.safeParse(result).success).toBe(true);
  });

  it("accepts null contract (not found)", () => {
    expect(contractDetailOutputSchema.safeParse({ contract: null }).success).toBe(true);
  });
});

describe("contractStatusUpdateOutputSchema", () => {
  it("accepts success: true", () => {
    expect(contractStatusUpdateOutputSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("accepts success: false", () => {
    expect(contractStatusUpdateOutputSchema.safeParse({ success: false }).success).toBe(true);
  });

  it("rejects missing success", () => {
    expect(contractStatusUpdateOutputSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-boolean success", () => {
    expect(contractStatusUpdateOutputSchema.safeParse({ success: "yes" }).success).toBe(false);
  });
});
