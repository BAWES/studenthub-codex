import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listContractsSchema,
  getContractSchema,
  updateContractStatusSchema,
  contractRowOutputSchema,
  contractListOutputSchema,
  contractDetailObjectOutputSchema,
  contractDetailOutputSchema,
  contractStatusUpdateOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests — pure unit tests, no DB required
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
    const r = listContractsSchema.safeParse({
      page: 2,
      limit: 10,
      status: 1,
      type: "full-time",
    });
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
    expect(listContractsSchema.safeParse({ status: "abc" }).success).toBe(
      false,
    );
  });

  it("rejects negative candidateId", () => {
    expect(listContractsSchema.safeParse({ candidateId: -1 }).success).toBe(
      false,
    );
  });

  it("accepts candidateId and companyId filters", () => {
    const r = listContractsSchema.safeParse({
      candidateId: 5,
      companyId: 10,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.candidateId).toBe(5);
      expect(r.data.companyId).toBe(10);
    }
  });

  it("accepts free-text search query", () => {
    const r = listContractsSchema.safeParse({ q: "developer" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.q).toBe("developer");
    }
  });

  it("coerces string page/limit/status to numbers", () => {
    const r = listContractsSchema.safeParse({
      page: "3",
      limit: "25",
      status: "1",
      candidateId: "7",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(3);
      expect(r.data.limit).toBe(25);
      expect(r.data.status).toBe(1);
      expect(r.data.candidateId).toBe(7);
    }
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
    expect(
      updateContractStatusSchema.safeParse({ uuid: "abc", status: 0 }).success,
    ).toBe(true);
  });

  it("accepts status 1 (active)", () => {
    expect(
      updateContractStatusSchema.safeParse({ uuid: "abc", status: 1 }).success,
    ).toBe(true);
  });

  it("accepts status 2 (terminated)", () => {
    expect(
      updateContractStatusSchema.safeParse({ uuid: "abc", status: 2 }).success,
    ).toBe(true);
  });

  it("rejects status 3 (out of range)", () => {
    expect(
      updateContractStatusSchema.safeParse({ uuid: "abc", status: 3 }).success,
    ).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(updateContractStatusSchema.safeParse({ status: 1 }).success).toBe(
      false,
    );
  });

  it("rejects empty UUID", () => {
    expect(
      updateContractStatusSchema.safeParse({ uuid: "", status: 1 }).success,
    ).toBe(false);
  });

  it("coerces string status to number", () => {
    const r = updateContractStatusSchema.safeParse({
      uuid: "contract_abc",
      status: "1",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.status).toBe(1);
    }
  });

  it("rejects negative status", () => {
    expect(
      updateContractStatusSchema.safeParse({ uuid: "abc", status: -1 })
        .success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

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
    expect(
      contractRowOutputSchema.safeParse({
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
      }).success,
    ).toBe(false);
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
    expect(
      contractDetailObjectOutputSchema.safeParse(detail).success,
    ).toBe(true);
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
    expect(
      contractDetailObjectOutputSchema.safeParse(detail).success,
    ).toBe(true);
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
    expect(
      contractDetailObjectOutputSchema.safeParse(detail).success,
    ).toBe(false);
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
    expect(contractDetailOutputSchema.safeParse({ contract: null }).success).toBe(
      true,
    );
  });
});

describe("contractStatusUpdateOutputSchema", () => {
  it("accepts success: true", () => {
    expect(
      contractStatusUpdateOutputSchema.safeParse({ success: true }).success,
    ).toBe(true);
  });

  it("accepts success: false", () => {
    expect(
      contractStatusUpdateOutputSchema.safeParse({ success: false }).success,
    ).toBe(true);
  });

  it("rejects missing success", () => {
    expect(contractStatusUpdateOutputSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-boolean success", () => {
    expect(
      contractStatusUpdateOutputSchema.safeParse({ success: "yes" }).success,
    ).toBe(false);
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

const mockRequireCapability = vi.fn();
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

const mockRevalidatePath = vi.fn();
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

const actions = await import("./actions");
const { requireCapability } = await import("@/modules/auth/session");
const { revalidatePath } = await import("next/cache");

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
    mockRequireCapability.mockResolvedValue(mockUser);
  });

  it("returns paginated contracts with defaults", async () => {
    mockFindMany.mockResolvedValue([makeContract()]);
    mockCount.mockResolvedValue(1);

    const result = await actions.listContracts({});

    expect(mockRequireCapability).toHaveBeenCalledWith("contracts.read");
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(1);
    expect(result.items[0].candidate_name).toBe("Ahmed Al-Mutairi");
    expect(result.items[0].company_name).toBe("Acme Corp");
    expect(result.items[0].status_label).toBe("active");
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ deleted: false }),
        orderBy: { created_at: "desc" },
      }),
    );
  });

  it("filters by status", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await actions.listContracts({ status: 1 });

    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.where.status).toBe(1);
  });

  it("filters by type", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await actions.listContracts({ type: "part-time" });

    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.where.type).toBe("part-time");
  });

  it("filters by candidateId", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await actions.listContracts({ candidateId: 5 });

    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.where.candidate_id).toBe(5);
  });

  it("filters by companyId", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await actions.listContracts({ companyId: 10 });

    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.where.company_id).toBe(10);
  });

  it("searches by free-text query", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await actions.listContracts({ q: "developer" });

    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.where.OR).toBeDefined();
    expect(callArgs.where.OR[0].type.contains).toBe("developer");
    expect(callArgs.where.OR[2].candidate.candidate_name.contains).toBe(
      "developer",
    );
  });

  it("respects pagination", async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await actions.listContracts({ page: 3, limit: 10 });

    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.skip).toBe(20);
    expect(callArgs.take).toBe(10);
  });

  it("returns empty result on invalid input", async () => {
    const result = await actions.listContracts({ limit: 999 });

    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("handles null candidate_name gracefully", async () => {
    mockFindMany.mockResolvedValue([
      makeContract({ candidate: { candidate_name: null } }),
    ]);
    mockCount.mockResolvedValue(1);

    const result = await actions.listContracts({});

    expect(result.items[0].candidate_name).toBeNull();
  });

  it("handles null company_name gracefully", async () => {
    mockFindMany.mockResolvedValue([
      makeContract({
        company_contract_company_idTocompany: { company_name: null },
      }),
    ]);
    mockCount.mockResolvedValue(1);

    const result = await actions.listContracts({});

    expect(result.items[0].company_name).toBeNull();
  });

  it("maps status labels correctly for all statuses", async () => {
    mockCount.mockResolvedValue(1);

    for (const [status, expectedLabel] of [
      [0, "inactive"],
      [1, "active"],
      [2, "terminated"],
    ] as const) {
      mockFindMany.mockResolvedValue([makeContract({ status })]);

      const result = await actions.listContracts({});
      expect(result.items[0].status_label).toBe(expectedLabel);
    }
  });

  it("handles unknown status value gracefully", async () => {
    mockFindMany.mockResolvedValue([makeContract({ status: 99 })]);
    mockCount.mockResolvedValue(1);

    const result = await actions.listContracts({});

    expect(result.items[0].status_label).toBe("unknown (99)");
  });

  it("throws on unauthorized access", async () => {
    mockRequireCapability.mockRejectedValue(
      new Error("Unauthorized: insufficient capability"),
    );

    await expect(actions.listContracts({})).rejects.toThrow("Unauthorized");
    expect(mockFindMany).not.toHaveBeenCalled();
  });
});

describe("getContractDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(mockUser);
  });

  it("returns contract detail for valid UUID", async () => {
    mockFindFirst.mockResolvedValue(makeContract());

    const result = await actions.getContractDetail({
      uuid: "contract_abc-123",
    });

    expect(result.contract).not.toBeNull();
    expect(result.contract?.candidate?.candidate_name).toBe(
      "Ahmed Al-Mutairi",
    );
    expect(result.contract?.company?.company_name).toBe("Acme Corp");
    expect(result.contract?.status_label).toBe("active");
    expect(result.contract?.type).toBe("full-time");
    expect(result.contract?.detail).toBe("Standard employment contract");
  });

  it("returns null contract when not found", async () => {
    mockFindFirst.mockResolvedValue(null);

    const result = await actions.getContractDetail({
      uuid: "contract_missing",
    });

    expect(result.contract).toBeNull();
  });

  it("throws on invalid UUID", async () => {
    await expect(
      actions.getContractDetail({ uuid: "" }),
    ).rejects.toThrow();
    expect(mockFindFirst).not.toHaveBeenCalled();
  });

  it("throws on missing UUID", async () => {
    await expect(
      actions.getContractDetail({} as any),
    ).rejects.toThrow();
    expect(mockFindFirst).not.toHaveBeenCalled();
  });

  it("queries with correct where clause", async () => {
    mockFindFirst.mockResolvedValue(makeContract());

    await actions.getContractDetail({ uuid: "contract_abc-123" });

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { contract_uuid: "contract_abc-123", deleted: false },
      include: expect.any(Object),
    });
  });

  it("handles null candidate gracefully", async () => {
    mockFindFirst.mockResolvedValue(
      makeContract({ candidate: null }),
    );

    const result = await actions.getContractDetail({
      uuid: "contract_abc-123",
    });

    expect(result.contract?.candidate).toBeNull();
  });

  it("handles null company gracefully", async () => {
    mockFindFirst.mockResolvedValue(
      makeContract({
        company_contract_company_idTocompany: null,
      }),
    );

    const result = await actions.getContractDetail({
      uuid: "contract_abc-123",
    });

    expect(result.contract?.company).toBeNull();
  });

  it("throws on unauthorized access", async () => {
    mockRequireCapability.mockRejectedValue(
      new Error("Unauthorized: insufficient capability"),
    );

    await expect(
      actions.getContractDetail({ uuid: "contract_abc-123" }),
    ).rejects.toThrow("Unauthorized");
    expect(mockFindFirst).not.toHaveBeenCalled();
  });
});

describe("updateContractStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(mockUser);
  });

  it("updates contract status successfully", async () => {
    mockFindFirst.mockResolvedValue({
      contract_uuid: "contract_abc-123",
      status: 1,
    });
    mockUpdate.mockResolvedValue({});

    const result = await actions.updateContractStatus({
      uuid: "contract_abc-123",
      status: 2,
    });

    expect(result.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { contract_uuid: "contract_abc-123" },
      data: expect.objectContaining({
        status: 2,
        updated_at: expect.any(Date),
      }),
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/staff/contracts");
    expect(mockRevalidatePath).toHaveBeenCalledWith(
      "/staff/contracts/contract_abc-123",
    );
  });

  it("updates status to 0 (inactive)", async () => {
    mockFindFirst.mockResolvedValue({
      contract_uuid: "contract_abc-123",
      status: 1,
    });
    mockUpdate.mockResolvedValue({});

    const result = await actions.updateContractStatus({
      uuid: "contract_abc-123",
      status: 0,
    });

    expect(result.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 0 }),
      }),
    );
  });

  it("updates status to 1 (active)", async () => {
    mockFindFirst.mockResolvedValue({
      contract_uuid: "contract_abc-123",
      status: 0,
    });
    mockUpdate.mockResolvedValue({});

    const result = await actions.updateContractStatus({
      uuid: "contract_abc-123",
      status: 1,
    });

    expect(result.success).toBe(true);
  });

  it("throws when contract not found", async () => {
    mockFindFirst.mockResolvedValue(null);

    await expect(
      actions.updateContractStatus({
        uuid: "contract_missing",
        status: 2,
      }),
    ).rejects.toThrow("Contract not found");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("throws on invalid input", async () => {
    await expect(
      actions.updateContractStatus({ uuid: "" } as any),
    ).rejects.toThrow();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("throws on status out of range", async () => {
    await expect(
      actions.updateContractStatus({ uuid: "contract_abc", status: 3 }),
    ).rejects.toThrow();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("throws on unauthorized access", async () => {
    mockRequireCapability.mockRejectedValue(
      new Error("Unauthorized: insufficient capability"),
    );

    await expect(
      actions.updateContractStatus({
        uuid: "contract_abc-123",
        status: 2,
      }),
    ).rejects.toThrow("Unauthorized");
    expect(mockFindFirst).not.toHaveBeenCalled();
  });

  it("throws on prisma update error", async () => {
    mockFindFirst.mockResolvedValue({
      contract_uuid: "contract_abc-123",
      status: 1,
    });
    mockUpdate.mockRejectedValue(new Error("DB connection failed"));

    await expect(
      actions.updateContractStatus({
        uuid: "contract_abc-123",
        status: 2,
      }),
    ).rejects.toThrow("DB connection failed");
  });

  it("throws with fallback message on non-Error exception", async () => {
    mockFindFirst.mockResolvedValue({
      contract_uuid: "contract_abc-123",
      status: 1,
    });
    mockUpdate.mockRejectedValue("string error");

    await expect(
      actions.updateContractStatus({
        uuid: "contract_abc-123",
        status: 2,
      }),
    ).rejects.toThrow("Failed to update contract status");
  });
});
