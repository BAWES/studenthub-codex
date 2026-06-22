import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireCapability,
  mockFindUnique,
} = vi.hoisted(() => ({
  mockRequireCapability: vi.fn(),
  mockFindUnique: vi.fn(),
}));

// ── Mock session module ─────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    employee: {
      findUnique: mockFindUnique,
    },
  },
}));

import { getEmployeeById } from "../actions";
import type { GetEmployeeByIdInput } from "../schemas";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_EMPLOYEE_ROW = {
  employee_uuid: "emp-uuid-1",
  employee_name: "Ahmed Al-Mutawa",
  employee_email: "ahmed@example.com",
  employee_phone: "+965 5555 1234",
  employee_salary: 1500n,
  employee_status: 10,
  employee_created_at: new Date("2024-01-01"),
  employee_updated_at: new Date("2026-06-01"),
  designation_uuid: "des-uuid-1",
  department_uuid: "dep-uuid-1",
  designation: { designation_name_en: "Software Engineer" },
  department: { department_name_en: "Engineering" },
};

// ---------------------------------------------------------------------------
// getEmployeeById — runtime
// ---------------------------------------------------------------------------

describe("getEmployeeById — runtime", () => {
  const VALID_INPUT: GetEmployeeByIdInput = { uuid: "emp-uuid-1" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapability.mockResolvedValue(undefined);
    mockFindUnique.mockResolvedValue(MOCK_EMPLOYEE_ROW);
  });

  it("returns employee detail with designation and department names", async () => {
    const result = await getEmployeeById(VALID_INPUT);

    expect(result).not.toBeNull();
    expect(result!.employee_name).toBe("Ahmed Al-Mutawa");
    expect(result!.employee_email).toBe("ahmed@example.com");
    expect(result!.employee_phone).toBe("+965 5555 1234");
    expect(result!.designation_name_en).toBe("Software Engineer");
    expect(result!.department_name_en).toBe("Engineering");
  });

  it("returns null when employee not found", async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await getEmployeeById(VALID_INPUT);

    expect(result).toBeNull();
  });

  it("calls requireCapability with admin.read", async () => {
    await getEmployeeById(VALID_INPUT);

    expect(mockRequireCapability).toHaveBeenCalledWith("admin.read");
  });

  it("queries Prisma by employee_uuid with includes", async () => {
    await getEmployeeById(VALID_INPUT);

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { employee_uuid: "emp-uuid-1" },
      include: {
        designation: { select: { designation_name_en: true } },
        department: { select: { department_name_en: true } },
      },
    });
  });

  it("converts salary from BigInt to Number", async () => {
    const result = await getEmployeeById(VALID_INPUT);

    expect(result!.employee_salary).toBe(1500);
  });

  it("sets salary to null when not present", async () => {
    mockFindUnique.mockResolvedValue({ ...MOCK_EMPLOYEE_ROW, employee_salary: null });

    const result = await getEmployeeById(VALID_INPUT);

    expect(result!.employee_salary).toBeNull();
  });

  it("sets designation_name_en to null when no designation", async () => {
    mockFindUnique.mockResolvedValue({
      ...MOCK_EMPLOYEE_ROW,
      designation: null,
    });

    const result = await getEmployeeById(VALID_INPUT);

    expect(result!.designation_name_en).toBeNull();
  });

  it("sets department_name_en to null when no department", async () => {
    mockFindUnique.mockResolvedValue({
      ...MOCK_EMPLOYEE_ROW,
      department: null,
    });

    const result = await getEmployeeById(VALID_INPUT);

    expect(result!.department_name_en).toBeNull();
  });

  it("throws on empty uuid", async () => {
    await expect(getEmployeeById({ uuid: "" })).rejects.toThrow();
  });

  it("throws on missing uuid", async () => {
    await expect(getEmployeeById({} as GetEmployeeByIdInput)).rejects.toThrow();
  });

  it("propagates requireCapability rejection", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

    await expect(getEmployeeById(VALID_INPUT)).rejects.toThrow("Unauthorized");
  });

  it("includes employee_created_at and employee_updated_at", async () => {
    const result = await getEmployeeById(VALID_INPUT);

    expect(result!.employee_created_at).toBeInstanceOf(Date);
    expect(result!.employee_updated_at).toBeInstanceOf(Date);
  });
});
