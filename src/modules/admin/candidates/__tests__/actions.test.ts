import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate: {
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock session
vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn().mockResolvedValue(undefined),
}));

// Mock bcrypt
vi.mock("bcryptjs", () => ({
  default: { hash: vi.fn().mockResolvedValue("$2a$10$hashed_password") },
  hash: vi.fn().mockResolvedValue("$2a$10$hashed_password"),
}));

// Mock crypto
vi.mock("node:crypto", () => ({
  default: {
    randomBytes: vi.fn(() => Buffer.from("mock-auth-key-16-bytes")),
  },
  randomBytes: vi.fn(() => Buffer.from("mock-auth-key-16-bytes")),
}));

const {
  listCandidates,
  getCandidate,
  searchCandidates,
  createCandidate,
  updateCandidate,
  deleteCandidate,
} = await import("../actions");

describe("admin/candidates actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // listCandidates
  // -------------------------------------------------------------------------
  describe("listCandidates", () => {
    it("returns paginated candidate list", async () => {
      const mockRows = [
        {
          candidate_id: 1,
          candidate_name: "Alice",
          candidate_name_ar: "أليس",
          candidate_email: "alice@test.com",
          candidate_phone: "+96512345678",
          candidate_status: 10,
          candidate_created_at: new Date("2026-01-01"),
          candidate_updated_at: new Date("2026-06-01"),
          store: { store_name: "Main Store" },
        },
      ];
      vi.mocked(prisma.candidate.findMany).mockResolvedValue(mockRows as any);
      vi.mocked(prisma.candidate.count).mockResolvedValue(1);

      const result = await listCandidates({ page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe("Alice");
      expect(result.items[0].email).toBe("alice@test.com");
      expect(result.items[0].store_name).toBe("Main Store");
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.totalPages).toBe(1);
    });

    it("applies search filter via q parameter", async () => {
      vi.mocked(prisma.candidate.findMany).mockResolvedValue([]);
      vi.mocked(prisma.candidate.count).mockResolvedValue(0);

      await listCandidates({ q: "Alice" });

      const where = vi.mocked(prisma.candidate.findMany).mock.calls[0][0]
        ?.where as any;
      expect(where.OR).toBeDefined();
      expect(where.OR[0]).toMatchObject({
        candidate_name: { contains: "Alice" },
      });
    });

    it("applies status filter", async () => {
      vi.mocked(prisma.candidate.findMany).mockResolvedValue([]);
      vi.mocked(prisma.candidate.count).mockResolvedValue(0);

      await listCandidates({ status: 10 });

      const where = vi.mocked(prisma.candidate.findMany).mock.calls[0][0]
        ?.where as any;
      expect(where.status).toBeUndefined();
      expect(where.candidate_status).toBe(10);
    });

    it("returns empty result on invalid input", async () => {
      const result = await listCandidates({ page: -1 } as any);

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(vi.mocked(prisma.candidate.findMany)).not.toHaveBeenCalled();
    });

    it("requires admin.system capability", async () => {
      const { requireCapability } = await import("@/modules/auth/session");
      vi.mocked(prisma.candidate.findMany).mockResolvedValue([]);
      vi.mocked(prisma.candidate.count).mockResolvedValue(0);

      await listCandidates({});

      expect(requireCapability).toHaveBeenCalledWith("admin.system");
    });
  });

  // -------------------------------------------------------------------------
  // getCandidate
  // -------------------------------------------------------------------------
  describe("getCandidate", () => {
    it("returns candidate detail with metrics", async () => {
      const mockCandidate = {
        candidate_id: 1,
        candidate_name: "Alice",
        candidate_name_ar: "أليس",
        candidate_email: "alice@test.com",
        candidate_phone: "+96512345678",
        candidate_status: 10,
        candidate_gender: 1,
        candidate_birth_date: new Date("1995-05-15"),
        candidate_hourly_rate: 5.5,
        currency_code: "KWD",
        candidate_created_at: new Date("2026-01-01"),
        candidate_updated_at: new Date("2026-06-01"),
        store: { store_name: "Main Store" },
        country: { country_name_en: "Kuwait" },
      };
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue(
        mockCandidate as any,
      );

      const result = await getCandidate(1);

      expect(result.candidate).not.toBeNull();
      expect(result.candidate!.candidate_name).toBe("Alice");
      expect(result.candidate!.candidate_email).toBe("alice@test.com");
      expect(result.candidate!.candidate_hourly_rate).toBe(5.5);
      expect(result.candidate!.store!.store_name).toBe("Main Store");
      expect(result.candidate!.country!.country_name_en).toBe("Kuwait");
      expect(result.metrics).toHaveLength(4);
      expect(result.metrics[0].label).toBe("Status");
    });

    it("returns null candidate when not found", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue(null);

      const result = await getCandidate(999);

      expect(result.candidate).toBeNull();
      expect(result.metrics).toEqual([]);
    });

    it("throws on invalid input", async () => {
      await expect(getCandidate(-1 as any)).rejects.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // searchCandidates
  // -------------------------------------------------------------------------
  describe("searchCandidates", () => {
    it("searches candidates by name or email", async () => {
      const mockRows = [
        {
          candidate_id: 1,
          candidate_name: "Alice Smith",
          candidate_name_ar: "",
          candidate_email: "alice@test.com",
          candidate_phone: "+96512345678",
          candidate_status: 10,
          candidate_created_at: new Date("2026-01-01"),
          candidate_updated_at: new Date("2026-06-01"),
          store: { store_name: "Store A" },
        },
      ];
      vi.mocked(prisma.candidate.findMany).mockResolvedValue(mockRows as any);
      vi.mocked(prisma.candidate.count).mockResolvedValue(1);

      const result = await searchCandidates({ q: "Alice", page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe("Alice Smith");
      expect(result.total).toBe(1);

      const where = vi.mocked(prisma.candidate.findMany).mock.calls[0][0]
        ?.where as any;
      expect(where.OR[0]).toMatchObject({
        candidate_name: { contains: "Alice" },
      });
      expect(where.OR[1]).toMatchObject({
        candidate_email: { contains: "Alice" },
      });
    });

    it("returns empty result on empty search", async () => {
      vi.mocked(prisma.candidate.findMany).mockResolvedValue([]);
      vi.mocked(prisma.candidate.count).mockResolvedValue(0);

      const result = await searchCandidates({ q: "zzz_nonexistent" });

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("returns empty on invalid input", async () => {
      const result = await searchCandidates({ q: "" } as any);

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // createCandidate
  // -------------------------------------------------------------------------
  describe("createCandidate", () => {
    const validData = {
      name: "New Candidate",
      email: "new@test.com",
      nameAr: "مرشح جديد",
      phone: "+96599999999",
    };

    it("creates a candidate with password hash and auth key", async () => {
      vi.mocked(prisma.candidate.create).mockResolvedValue({
        candidate_id: 42,
      } as any);

      const result = await createCandidate(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.candidateId).toBe(42);
      }

      const createCall = vi.mocked(prisma.candidate.create).mock.calls[0][0]
        ?.data as any;
      expect(createCall.candidate_name).toBe("New Candidate");
      expect(createCall.candidate_email).toBe("new@test.com");
      expect(createCall.candidate_password_hash).toBe(
        "$2a$10$hashed_password",
      );
      expect(createCall.candidate_auth_key).toBeDefined();
      expect(createCall.candidate_status).toBe(10);
      expect(createCall.deleted).toBe(0);
    });

    it("revalidates /admin/candidates on success", async () => {
      const { revalidatePath } = await import("next/cache");
      vi.mocked(prisma.candidate.create).mockResolvedValue({
        candidate_id: 42,
      } as any);

      await createCandidate(validData);

      expect(revalidatePath).toHaveBeenCalledWith("/admin/candidates");
    });

    it("returns error on validation failure", async () => {
      const result = await createCandidate({
        ...validData,
        email: "not-an-email",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Invalid email");
      }
    });

    it("returns error on Prisma failure", async () => {
      vi.mocked(prisma.candidate.create).mockRejectedValue(
        new Error("DB error"),
      );

      const result = await createCandidate(validData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("DB error");
      }
    });
  });

  // -------------------------------------------------------------------------
  // updateCandidate
  // -------------------------------------------------------------------------
  describe("updateCandidate", () => {
    it("updates candidate name", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
      } as any);
      vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);

      const result = await updateCandidate({
        candidateId: 1,
        name: "Updated Name",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.candidateId).toBe(1);
      }
    });

    it("revalidates /admin/candidates on success", async () => {
      const { revalidatePath } = await import("next/cache");
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
      } as any);
      vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);

      await updateCandidate({ candidateId: 1, name: "Updated" });

      expect(revalidatePath).toHaveBeenCalledWith("/admin/candidates");
    });

    it("returns error when candidate not found", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue(null);

      const result = await updateCandidate({
        candidateId: 999,
        name: "Nope",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("not found");
      }
    });

    it("only includes provided fields in update data", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
      } as any);
      vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);

      await updateCandidate({ candidateId: 1, phone: "+96555555555" });

      const data = vi.mocked(prisma.candidate.update).mock.calls[0][0]
        ?.data as any;
      expect(data.candidate_phone).toBe("+96555555555");
      expect(data.candidate_name).toBeUndefined();
      expect(data.candidate_updated_at).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // deleteCandidate
  // -------------------------------------------------------------------------
  describe("deleteCandidate", () => {
    it("soft-deletes a candidate", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
      } as any);
      vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);

      const result = await deleteCandidate({ candidateId: 1 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.candidateId).toBe(1);
      }
      expect(vi.mocked(prisma.candidate.update).mock.calls[0][0]?.data).toMatchObject({
        deleted: 1,
      });
    });

    it("revalidates /admin/candidates on success", async () => {
      const { revalidatePath } = await import("next/cache");
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
      } as any);
      vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);

      await deleteCandidate({ candidateId: 1 });

      expect(revalidatePath).toHaveBeenCalledWith("/admin/candidates");
    });

    it("returns error when candidate not found", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue(null);

      const result = await deleteCandidate({ candidateId: 999 });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("not found");
      }
    });
  });
});
