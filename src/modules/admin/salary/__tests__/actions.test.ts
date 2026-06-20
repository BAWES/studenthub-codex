import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the auth/session module
vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn().mockResolvedValue(undefined),
}));

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    staff_salary: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    staff: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

const { listSalaries } = await import("../actions");
const { prisma } = await import("@/lib/prisma");

const mockedFindMany = vi.mocked(prisma.staff_salary.findMany);
const mockedCount = vi.mocked(prisma.staff_salary.count);

describe("admin/salary actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("listSalaries returns paginated results", async () => {
    const mockRows = [
      {
        staff_salary_uuid: "SAL-001",
        salary: 2500,
        salary_currency: "KWD",
        comment: "Monthly salary",
        salary_date: new Date("2026-06-01"),
        staff: { staff_name: "John Doe" },
      },
      {
        staff_salary_uuid: "SAL-002",
        salary: 1800,
        salary_currency: "KWD",
        comment: "Bonus",
        salary_date: new Date("2026-05-01"),
        staff: { staff_name: "Jane Smith" },
      },
    ];
    mockedFindMany.mockResolvedValue(mockRows as any);
    mockedCount.mockResolvedValue(2);

    const result = await listSalaries({ limit: 100 });
    expect(result.salaries).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.salaries[0].salary).toBe(2500);
    expect(result.salaries[1].salary).toBe(1800);
  });

  it("handles null salary gracefully", async () => {
    const mockRows = [
      {
        staff_salary_uuid: "SAL-003",
        salary: null,
        salary_currency: null,
        comment: null,
        salary_date: null,
        staff: null,
      },
    ];
    mockedFindMany.mockResolvedValue(mockRows as any);
    mockedCount.mockResolvedValue(1);

    const result = await listSalaries();
    expect(result.salaries).toHaveLength(1);
    expect(result.salaries[0].salary).toBeNull();
    expect(result.salaries[0].salary_currency).toBeNull();
  });

  it("returns empty result when no salaries exist", async () => {
    mockedFindMany.mockResolvedValue([]);
    mockedCount.mockResolvedValue(0);

    const result = await listSalaries();
    expect(result.salaries).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it("calls prisma with correct orderBy and pagination", async () => {
    mockedFindMany.mockResolvedValue([]);
    mockedCount.mockResolvedValue(0);

    await listSalaries({ page: 2, limit: 10 });
    expect(mockedFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { salary_date: "desc" },
        skip: 10,
        take: 10,
      }),
    );
  });

  it("includes staff_name from staff relation", async () => {
    const mockRows = [
      {
        staff_salary_uuid: "SAL-004",
        salary: 3000,
        salary_currency: "KWD",
        comment: null,
        salary_date: null,
        staff: { staff_name: "Ahmed Ali" },
      },
    ];
    mockedFindMany.mockResolvedValue(mockRows as any);
    mockedCount.mockResolvedValue(1);

    const result = await listSalaries();
    expect(result.salaries[0].staff_name).toBe("Ahmed Ali");
  });

  it("handles null staff gracefully", async () => {
    const mockRows = [
      {
        staff_salary_uuid: "SAL-005",
        salary: 2000,
        salary_currency: "KWD",
        comment: null,
        salary_date: null,
        staff: null,
      },
    ];
    mockedFindMany.mockResolvedValue(mockRows as any);
    mockedCount.mockResolvedValue(1);

    const result = await listSalaries();
    expect(result.salaries[0].staff_name).toBeNull();
  });
});
