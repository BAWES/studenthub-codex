import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    permission_section: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock session
vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn().mockResolvedValue(undefined),
}));

const {
  listPermissionSections,
  createPermissionSection,
  updatePermissionSection,
} = await import("../actions");

// ---------------------------------------------------------------------------
// admin/permissions actions
// ---------------------------------------------------------------------------

describe("admin/permissions actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // listPermissionSections
  // -----------------------------------------------------------------------

  describe("listPermissionSections", () => {
    it("returns all permission sections ordered by name", async () => {
      const mockSections = [
        {
          permission_uuid: "per_sec-1",
          section_name: "Admin",
          created_at: new Date("2026-01-01"),
        },
        {
          permission_uuid: "per_sec-2",
          section_name: "Finance",
          created_at: new Date("2026-01-02"),
        },
      ] as any;

      vi.mocked(prisma.permission_section.findMany).mockResolvedValue(mockSections);

      const result = await listPermissionSections();

      expect(result).toHaveLength(2);
      expect(result[0].permission_uuid).toBe("per_sec-1");
      expect(result[0].section_name).toBe("Admin");
      expect(vi.mocked(prisma.permission_section.findMany).mock.calls[0][0])
        .toMatchObject({ orderBy: { section_name: "asc" } });
    });

    it("returns empty array when no sections exist", async () => {
      vi.mocked(prisma.permission_section.findMany).mockResolvedValue([]);

      const result = await listPermissionSections();

      expect(result).toHaveLength(0);
    });

    it("handles null section_name gracefully", async () => {
      vi.mocked(prisma.permission_section.findMany).mockResolvedValue([
        {
          permission_uuid: "per_sec-3",
          section_name: null,
          created_at: new Date("2026-01-03"),
        } as any,
      ]);

      const result = await listPermissionSections();

      expect(result[0].section_name).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // createPermissionSection
  // -----------------------------------------------------------------------

  describe("createPermissionSection", () => {
    it("creates a permission section and returns its UUID", async () => {
      vi.mocked(prisma.permission_section.create).mockResolvedValue({
        permission_uuid: "per_seckdfj4k5",
      } as any);

      const result = await createPermissionSection({
        section_name: "Operations",
      });

      expect(result.permission_uuid).toBeDefined();
      expect(typeof result.permission_uuid).toBe("string");
      expect(result.permission_uuid).toContain("per_sec");
    });

    it("throws error for empty section name", async () => {
      await expect(
        createPermissionSection({ section_name: "" }),
      ).rejects.toThrow();
    });

    it("throws error for missing section name", async () => {
      await expect(
        createPermissionSection({} as any),
      ).rejects.toThrow();
    });

    it("throws error on Prisma failure", async () => {
      vi.mocked(prisma.permission_section.create).mockRejectedValue(
        new Error("Unique constraint violation"),
      );

      await expect(
        createPermissionSection({ section_name: "Duplicate" }),
      ).rejects.toThrow("Unique constraint violation");
    });

    it("calls revalidatePath after creation", async () => {
      const { revalidatePath } = await import("next/cache");
      vi.mocked(prisma.permission_section.create).mockResolvedValue({
        permission_uuid: "per_sec-new-uuid",
      } as any);

      await createPermissionSection({ section_name: "New Section" });

      expect(revalidatePath).toHaveBeenCalledWith("/admin/permissions");
    });
  });

  // -----------------------------------------------------------------------
  // updatePermissionSection
  // -----------------------------------------------------------------------

  describe("updatePermissionSection", () => {
    it("updates the section name", async () => {
      vi.mocked(prisma.permission_section.findUnique).mockResolvedValue({
        permission_uuid: "per_sec-to-update",
        section_name: "Old Name",
        created_at: new Date(),
      } as any);
      vi.mocked(prisma.permission_section.update).mockResolvedValue({} as any);

      const result = await updatePermissionSection({
        permission_uuid: "per_sec-to-update",
        section_name: "Updated Name",
      });

      expect(result.permission_uuid).toBe("per_sec-to-update");
      expect(vi.mocked(prisma.permission_section.update).mock.calls[0][0]?.data)
        .toMatchObject({ section_name: "Updated Name" });
    });

    it("throws error for non-existent section", async () => {
      vi.mocked(prisma.permission_section.findUnique).mockResolvedValue(null);

      await expect(
        updatePermissionSection({
          permission_uuid: "per_sec-nonexistent",
          section_name: "Nope",
        }),
      ).rejects.toThrow("Permission section not found");
    });

    it("throws error for empty permission UUID", async () => {
      await expect(
        updatePermissionSection({
          permission_uuid: "",
          section_name: "Anything",
        }),
      ).rejects.toThrow();
    });

    it("throws error for empty section name", async () => {
      await expect(
        updatePermissionSection({
          permission_uuid: "per_sec-valid",
          section_name: "",
        }),
      ).rejects.toThrow();
    });

    it("throws error on Prisma failure", async () => {
      vi.mocked(prisma.permission_section.findUnique).mockResolvedValue({
        permission_uuid: "per_sec-to-update",
        section_name: "Old Name",
        created_at: new Date(),
      } as any);
      vi.mocked(prisma.permission_section.update).mockRejectedValue(
        new Error("Deadlock detected"),
      );

      await expect(
        updatePermissionSection({
          permission_uuid: "per_sec-to-update",
          section_name: "New Name",
        }),
      ).rejects.toThrow("Deadlock detected");
    });

    it("calls revalidatePath after update", async () => {
      const { revalidatePath } = await import("next/cache");
      vi.mocked(prisma.permission_section.findUnique).mockResolvedValue({
        permission_uuid: "per_sec-to-update",
        section_name: "Old Name",
        created_at: new Date(),
      } as any);
      vi.mocked(prisma.permission_section.update).mockResolvedValue({} as any);

      await updatePermissionSection({
        permission_uuid: "per_sec-to-update",
        section_name: "Updated",
      });

      expect(revalidatePath).toHaveBeenCalledWith("/admin/permissions");
    });
  });
});
