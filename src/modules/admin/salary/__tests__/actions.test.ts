import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the auth/session module
vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn().mockResolvedValue(undefined),
}));

// Mock next/cache (revalidatePath throws outside Next.js runtime)
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    staff_salary: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const {
  listSalaries,
  createSalary,
  updateSalary,
  deleteSalary,
} = await import("../actions");
const { prisma } = await import("@/lib/prisma");

const mockedFindMany = vi.mocked(prisma.staff_salary.findMany);
const mockedFindUnique = vi.mocked(prisma.staff_salary.findUnique);
const mockedCount = vi.mocked(prisma.staff_salary.count);
const mockedCreate = vi.mocked(prisma.staff_salary.create);
const mockedUpdate = vi.mocked(prisma.staff_salary.update);
const mockedDelete = vi.mocked(prisma.staff_salary.delete);

// Helper: create a FormData with the given entries
function formDataFrom(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    fd.append(key, value);
  }
  return fd;
}

describe("admin/salary actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listSalaries", () => {
    it("returns paginated results", async () => {
      const mockRows = [
        {
          staff_salary_uuid: "SAL-001",
          staff_id: 1,
          salary: 2500,
          salary_currency: "KWD",
          comment: "Monthly salary",
          salary_date: new Date("2026-06-01"),
          created_at: null,
          updated_at: null,
        },
        {
          staff_salary_uuid: "SAL-002",
          staff_id: 2,
          salary: 1800,
          salary_currency: "KWD",
          comment: "Bonus",
          salary_date: new Date("2026-05-01"),
          created_at: null,
          updated_at: null,
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
          staff_id: null,
          salary: null,
          salary_currency: null,
          comment: null,
          salary_date: null,
          created_at: null,
          updated_at: null,
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
  });

  describe("createSalary", () => {
    it("creates a salary record with valid input", async () => {
      mockedCreate.mockResolvedValue({} as any);

      const fd = formDataFrom({
        staffId: "1",
        salary: "750",
        salaryCurrency: "KWD",
        salaryDate: "2026-06-01",
      });

      const result = await createSalary(null, fd);

      expect(result.operation).toBe("success");
      expect(result.message).toContain("created");
      expect(mockedCreate).toHaveBeenCalledOnce();
      const callData = mockedCreate.mock.calls[0][0].data;
      expect(callData.staff_id).toBe(1);
      expect(callData.salary).toBe(750);
    });

    it("returns error for invalid input", async () => {
      const fd = formDataFrom({});
      const result = await createSalary(null, fd);

      expect(result.operation).toBe("error");
      expect(mockedCreate).not.toHaveBeenCalled();
    });
  });

  describe("updateSalary", () => {
    it("updates an existing salary record", async () => {
      mockedFindUnique.mockResolvedValue({
        staff_salary_uuid: "SAL-001",
        salary: 500,
        salary_currency: "KWD",
        salary_date: new Date("2026-06-01"),
        updated_at: new Date(),
      } as any);
      mockedUpdate.mockResolvedValue({} as any);

      const fd = formDataFrom({
        salaryUuid: "SAL-001",
        salary: "800",
        salaryDate: "2026-06-01",
      });
      const result = await updateSalary(null, fd);

      expect(result.operation).toBe("success");
      expect(mockedUpdate).toHaveBeenCalledOnce();
    });

    it("returns error when salary not found", async () => {
      mockedFindUnique.mockResolvedValue(null);

      const fd = formDataFrom({
        salaryUuid: "DOES-NOT-EXIST",
        salary: "800",
      });
      const result = await updateSalary(null, fd);

      expect(result.operation).toBe("error");
      expect(result.message).toContain("not found");
      expect(mockedUpdate).not.toHaveBeenCalled();
    });

    it("returns error for invalid input", async () => {
      const fd = formDataFrom({});
      const result = await updateSalary(null, fd);

      expect(result.operation).toBe("error");
      expect(mockedUpdate).not.toHaveBeenCalled();
    });
  });

  describe("deleteSalary", () => {
    it("deletes an existing salary record", async () => {
      mockedFindUnique.mockResolvedValue({
        staff_salary_uuid: "SAL-001",
      } as any);
      mockedDelete.mockResolvedValue({} as any);

      const result = await deleteSalary("SAL-001");

      expect(result.operation).toBe("success");
      expect(mockedDelete).toHaveBeenCalledOnce();
      expect(mockedDelete.mock.calls[0][0].where.staff_salary_uuid).toBe("SAL-001");
    });

    it("returns error when salary not found", async () => {
      mockedFindUnique.mockResolvedValue(null);

      const result = await deleteSalary("DOES-NOT-EXIST");

      expect(result.operation).toBe("error");
      expect(result.message).toContain("not found");
      expect(mockedDelete).not.toHaveBeenCalled();
    });

    it("returns error for invalid input", async () => {
      const result = await deleteSalary("");

      expect(result.operation).toBe("error");
      expect(mockedDelete).not.toHaveBeenCalled();
    });
  });
});
