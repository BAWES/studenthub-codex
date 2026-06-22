import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireCapability,
  mockRequireRoleCapability,
  mockRevalidatePath,
  mockRandomUUID,
  mockRequestFindMany,
  mockRequestFindUnique,
  mockRequestCreate,
  mockRequestUpdate,
  mockRequestCount,
  mockCompanyContactFindMany,
  mockGetRequestDetail,
} = vi.hoisted(() => {
  const mockGetRequestDetail = vi.fn();
  return {
    mockRequireCapability: vi.fn(),
    mockRequireRoleCapability: vi.fn(),
    mockRevalidatePath: vi.fn(),
    mockRandomUUID: vi.fn(),
    mockRequestFindMany: vi.fn(),
    mockRequestFindUnique: vi.fn(),
    mockRequestCreate: vi.fn(),
    mockRequestUpdate: vi.fn(),
    mockRequestCount: vi.fn(),
    mockCompanyContactFindMany: vi.fn(),
    mockGetRequestDetail,
  };
});

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    request: {
      findMany: mockRequestFindMany,
      findUnique: mockRequestFindUnique,
      create: mockRequestCreate,
      update: mockRequestUpdate,
      count: mockRequestCount,
    },
    company_contact: {
      findMany: mockCompanyContactFindMany,
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
  requireRoleCapability: mockRequireRoleCapability,
}));

vi.mock("node:crypto", () => ({
  default: { randomUUID: mockRandomUUID },
  randomUUID: mockRandomUUID,
}));

// Mock the core request detail function
vi.mock("@/modules/workspace/request-detail-core", () => ({
  getRequestDetail: mockGetRequestDetail,
}));

// ── Imports (after mocks) ──────────────────────────────────
import {
  listCompanyRequests,
  getCompanyRequestDetail,
  createCompanyRequest,
  getCompanyRequestDetailWithScope,
  updateRequestStatus,
  deleteRequest,
  getCompanyList,
  getCompanyRequestRows,
} from "./company";

// ===========================================================================
// listCompanyRequests()
// ===========================================================================
describe("listCompanyRequests()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
  });

  it("lists requests with default pagination", async () => {
    mockRequestFindMany.mockResolvedValue([
      {
        request_uuid: "req-1",
        company_id: 1,
        request_position_title: "Software Engineer",
        request_compensation: "1200 KWD",
        request_number_of_employees: 2,
        request_location: "Kuwait City",
        request_status: "pending",
        request_created_datetime: new Date("2025-01-01"),
        request_updated_datetime: new Date("2025-01-02"),
        company: { company_name: "Test Corp" },
      },
    ]);
    mockRequestCount.mockResolvedValue(1);

    const result = await listCompanyRequests({});

    expect(mockRequireCapability).toHaveBeenCalledWith("request.read.linked");
    expect(result.total).toBe(1);
    expect(result.requests).toHaveLength(1);
    expect(result.requests[0].request_position_title).toBe("Software Engineer");
    expect(result.requests[0].company_name).toBe("Test Corp");
  });

  it("filters by company_id", async () => {
    mockRequestFindMany.mockResolvedValue([]);
    mockRequestCount.mockResolvedValue(0);

    await listCompanyRequests({ company_id: 5 });

    expect(mockRequestFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { company_id: 5 },
      }),
    );
  });

  it("applies pagination offset", async () => {
    mockRequestFindMany.mockResolvedValue([]);
    mockRequestCount.mockResolvedValue(0);

    await listCompanyRequests({ page: 3, limit: 10 });

    expect(mockRequestFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 }),
    );
  });

  it("returns empty result when no requests exist", async () => {
    mockRequestFindMany.mockResolvedValue([]);
    mockRequestCount.mockResolvedValue(0);

    const result = await listCompanyRequests({});
    expect(result.requests).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("throws on negative page", async () => {
    await expect(listCompanyRequests({ page: -1 })).rejects.toThrow();
  });

  it("throws on limit over 100", async () => {
    await expect(listCompanyRequests({ limit: 101 })).rejects.toThrow();
  });
});

// ===========================================================================
// getCompanyRequestDetail()
// ===========================================================================
describe("getCompanyRequestDetail()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
  });

  it("returns request detail when found", async () => {
    mockRequestFindUnique.mockResolvedValue({
      request_uuid: "req-1",
      company_id: 1,
      contact_uuid: "contact-1",
      staff_id: null,
      request_position_title: "Engineer",
      request_job_description: "Build stuff",
      request_compensation: "1200 KWD",
      request_number_of_employees: 2,
      request_location: "Kuwait",
      request_additional_info: null,
      request_status: "pending",
      request_feedback: null,
      request_created_datetime: new Date("2025-01-01"),
      request_updated_datetime: new Date("2025-01-02"),
      company: { company_name: "Test Corp" },
    });

    const result = await getCompanyRequestDetail("req-1");

    expect(result).not.toBeNull();
    expect(result!.request_uuid).toBe("req-1");
    expect(result!.request_position_title).toBe("Engineer");
    expect(result!.company_name).toBe("Test Corp");
  });

  it("returns null when request not found", async () => {
    mockRequestFindUnique.mockResolvedValue(null);

    const result = await getCompanyRequestDetail("nonexistent");
    expect(result).toBeNull();
  });

  it("throws on empty UUID", async () => {
    await expect(getCompanyRequestDetail("")).rejects.toThrow();
  });

  it("handles null optional fields", async () => {
    mockRequestFindUnique.mockResolvedValue({
      request_uuid: "req-2",
      company_id: null,
      contact_uuid: null,
      staff_id: null,
      request_position_title: null,
      request_job_description: "",
      request_compensation: "",
      request_number_of_employees: null,
      request_location: null,
      request_additional_info: null,
      request_status: null,
      request_feedback: null,
      request_created_datetime: new Date("2025-01-01"),
      request_updated_datetime: new Date("2025-01-02"),
      company: null,
    });

    const result = await getCompanyRequestDetail("req-2");

    expect(result).not.toBeNull();
    expect(result!.company_name).toBeNull();
  });
});

// ===========================================================================
// createCompanyRequest()
// ===========================================================================
describe("createCompanyRequest()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockRandomUUID.mockReturnValue("req-uuid-1");
    mockRequestCreate.mockResolvedValue({ request_uuid: "req-uuid-1" });
  });

  it("creates a request with all fields", async () => {
    const result = await createCompanyRequest({
      company_id: 1,
      position_title: "Software Engineer",
      compensation: "1500 KWD",
      number_of_employees: 3,
      location: "Kuwait City",
    });

    expect(mockRequireCapability).toHaveBeenCalledWith("request.create");
    expect(mockRequestCreate).toHaveBeenCalledWith({
      data: {
        request_uuid: "req-uuid-1",
        company_id: 1,
        request_position_title: "Software Engineer",
        request_compensation: "1500 KWD",
        request_number_of_employees: 3,
        request_location: "Kuwait City",
        request_job_description: "",
        request_status: "pending",
        request_created_datetime: expect.any(Date),
        request_updated_datetime: expect.any(Date),
      },
      select: { request_uuid: true },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/company/requests");
    expect(result.request_uuid).toBe("req-uuid-1");
  });

  it("creates a request with minimal fields", async () => {
    const result = await createCompanyRequest({
      company_id: 1,
      position_title: "Minimal Role",
    });

    expect(mockRequestCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          request_compensation: "",
          request_number_of_employees: null,
          request_location: null,
        }),
      }),
    );
    expect(result.request_uuid).toBe("req-uuid-1");
  });

  it("throws on missing company_id", async () => {
    await expect(
      createCompanyRequest({ position_title: "Engineer" } as any),
    ).rejects.toThrow();
  });

  it("throws on empty position_title", async () => {
    await expect(
      createCompanyRequest({ company_id: 1, position_title: "" }),
    ).rejects.toThrow();
  });

  it("throws on negative company_id", async () => {
    await expect(
      createCompanyRequest({ company_id: -1, position_title: "Engineer" }),
    ).rejects.toThrow();
  });
});

// ===========================================================================
// getCompanyRequestDetailWithScope()
// ===========================================================================
describe("getCompanyRequestDetailWithScope()", () => {
  const mockSession = { id: "contact-uuid-1" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue(mockSession);
  });

  it("returns request detail when contact has access", async () => {
    mockCompanyContactFindMany.mockResolvedValue([
      { company_id: 1 },
    ]);
    mockRequestFindUnique.mockResolvedValue({ company_id: 1 });
    mockGetRequestDetail.mockResolvedValue({ request_uuid: "req-1" });

    const result = await getCompanyRequestDetailWithScope("req-1");

    expect(mockRequireRoleCapability).toHaveBeenCalledWith("company", "request.read.linked");
    expect(result).toEqual({ request_uuid: "req-1" });
  });

  it("returns null when contact has no linked companies", async () => {
    mockCompanyContactFindMany.mockResolvedValue([]);

    const result = await getCompanyRequestDetailWithScope("req-1");

    expect(result).toBeNull();
    expect(mockGetRequestDetail).not.toHaveBeenCalled();
  });

  it("returns null when request not found", async () => {
    mockCompanyContactFindMany.mockResolvedValue([
      { company_id: 1 },
    ]);
    mockRequestFindUnique.mockResolvedValue(null);

    const result = await getCompanyRequestDetailWithScope("req-1");

    expect(result).toBeNull();
  });

  it("returns null when request company not in accessible companies", async () => {
    mockCompanyContactFindMany.mockResolvedValue([
      { company_id: 1 },
    ]);
    mockRequestFindUnique.mockResolvedValue({ company_id: 999 });

    const result = await getCompanyRequestDetailWithScope("req-1");

    expect(result).toBeNull();
  });

  it("throws on empty UUID", async () => {
    await expect(getCompanyRequestDetailWithScope("")).rejects.toThrow();
  });
});

// ===========================================================================
// updateRequestStatus()
// ===========================================================================
describe("updateRequestStatus()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue({ id: "contact-1" });
  });

  it("updates request status and feedback", async () => {
    mockRequestFindUnique.mockResolvedValue({
      request_uuid: "req-1",
      request_status: "pending",
    });
    mockRequestUpdate.mockResolvedValue({ request_uuid: "req-1" });

    const result = await updateRequestStatus({
      uuid: "req-1",
      status: "started",
      feedback: "Approved for next stage",
    });

    expect(mockRequireRoleCapability).toHaveBeenCalledWith("company", "request.write");
    expect(mockRequestUpdate).toHaveBeenCalledWith({
      where: { request_uuid: "req-1" },
      data: {
        request_status: "started",
        request_feedback: "Approved for next stage",
        request_updated_datetime: expect.any(Date),
      },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/company/requests/req-1");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/company/requests");
    expect(result).toEqual({ success: true });
  });

  it("updates status without feedback", async () => {
    mockRequestFindUnique.mockResolvedValue({
      request_uuid: "req-1",
      request_status: "pending",
    });
    mockRequestUpdate.mockResolvedValue({ request_uuid: "req-1" });

    await updateRequestStatus({ uuid: "req-1", status: "cancelled" });

    const callData = mockRequestUpdate.mock.calls[0][0].data;
    expect(callData.request_status).toBe("cancelled");
    expect(callData).not.toHaveProperty("request_feedback");
  });

  it("returns error when request not found", async () => {
    mockRequestFindUnique.mockResolvedValue(null);

    const result = await updateRequestStatus({
      uuid: "nonexistent",
      status: "started",
    });

    expect(result).toEqual({ error: "Request not found." });
    expect(mockRequestUpdate).not.toHaveBeenCalled();
  });

  it("returns validation error for missing UUID", async () => {
    const result = await updateRequestStatus({ uuid: "", status: "started" });
    expect(result).toHaveProperty("error");
  });

  it("returns validation error for invalid status", async () => {
    const result = await updateRequestStatus({
      uuid: "req-1",
      status: "invalid_status" as any,
    });
    expect(result).toHaveProperty("error");
  });
});

// ===========================================================================
// deleteRequest()
// ===========================================================================
describe("deleteRequest()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue({ id: "contact-1" });
  });

  it("cancels a request successfully", async () => {
    mockRequestFindUnique.mockResolvedValue({
      request_uuid: "req-1",
      request_status: "pending",
    });
    mockRequestUpdate.mockResolvedValue({ request_uuid: "req-1" });

    const result = await deleteRequest({ uuid: "req-1" });

    expect(mockRequireRoleCapability).toHaveBeenCalledWith("company", "request.write");
    expect(mockRequestUpdate).toHaveBeenCalledWith({
      where: { request_uuid: "req-1" },
      data: {
        request_status: "cancelled",
        request_cancelled_at: expect.any(Date),
        request_updated_datetime: expect.any(Date),
      },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/company/requests");
    expect(result).toEqual({ success: true });
  });

  it("returns error when request not found", async () => {
    mockRequestFindUnique.mockResolvedValue(null);

    const result = await deleteRequest({ uuid: "nonexistent" });

    expect(result).toEqual({ error: "Request not found." });
    expect(mockRequestUpdate).not.toHaveBeenCalled();
  });

  it("returns error when request already cancelled", async () => {
    mockRequestFindUnique.mockResolvedValue({
      request_uuid: "req-1",
      request_status: "cancelled",
    });

    const result = await deleteRequest({ uuid: "req-1" });

    expect(result).toEqual({ error: "Request is already cancelled." });
    expect(mockRequestUpdate).not.toHaveBeenCalled();
  });

  it("returns validation error for empty UUID", async () => {
    const result = await deleteRequest({ uuid: "" });
    expect(result).toHaveProperty("error");
  });
});

// ===========================================================================
// getCompanyList()
// ===========================================================================
describe("getCompanyList()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
  });

  it("returns companies accessible by contact", async () => {
    mockCompanyContactFindMany.mockResolvedValue([
      { company_id: 1, company: { company_name: "Alpha Corp", company_id: 1 } },
      { company_id: 2, company: { company_name: "Beta Corp", company_id: 2 } },
    ]);

    const result = await getCompanyList("contact-uuid-1");

    expect(mockRequireCapability).toHaveBeenCalledWith("request.create");
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Alpha Corp");
  });

  it("returns empty array when no companies linked", async () => {
    mockCompanyContactFindMany.mockResolvedValue([]);

    const result = await getCompanyList("contact-no-links");
    expect(result).toEqual([]);
  });

  it("throws on empty contact UUID", async () => {
    await expect(getCompanyList("")).rejects.toThrow();
  });
});

// ===========================================================================
// getCompanyRequestRows()
// ===========================================================================
describe("getCompanyRequestRows()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
  });

  it("returns request rows for DataTable", async () => {
    mockCompanyContactFindMany.mockResolvedValue([
      { company_id: 1 },
      { company_id: 2 },
    ]);
    mockRequestFindMany.mockResolvedValue([
      {
        request_uuid: "req-1",
        request_position_title: "Engineer",
        request_status: "pending",
        request_number_of_employees: 2,
        request_updated_datetime: new Date("2025-06-15T10:30:00.000Z"),
        company: { company_name: "Test Corp" },
        staff: { staff_name: "Alice" },
      },
    ]);

    const result = await getCompanyRequestRows("contact-uuid-1");

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Engineer");
    expect(result[0].company).toBe("Test Corp");
    expect(result[0].owner).toBe("Alice");
    expect(result[0].seats).toBe(2);
    expect(result[0].status).toBe("pending");
    expect(result[0].updated).toBe("2025/06/15");
  });

  it("returns empty array when no linked companies", async () => {
    mockCompanyContactFindMany.mockResolvedValue([]);

    const result = await getCompanyRequestRows("contact-no-links");
    expect(result).toEqual([]);
    expect(mockRequestFindMany).not.toHaveBeenCalled();
  });

  it("handles null fields with defaults", async () => {
    mockCompanyContactFindMany.mockResolvedValue([
      { company_id: 1 },
    ]);
    mockRequestFindMany.mockResolvedValue([
      {
        request_uuid: "req-2",
        request_position_title: null,
        request_status: null,
        request_number_of_employees: null,
        request_updated_datetime: new Date("2025-01-01"),
        company: null,
        staff: null,
      },
    ]);

    const result = await getCompanyRequestRows("contact-uuid");

    expect(result[0].title).toBe("Untitled request");
    expect(result[0].company).toBe("No company");
    expect(result[0].owner).toBe("Unassigned");
    expect(result[0].seats).toBe(0);
    expect(result[0].status).toBe("No status");
  });
});
