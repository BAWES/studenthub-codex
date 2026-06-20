import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    store: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
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
  listStores, getStore, createStore, updateStore, deleteStore,
} = await import("../actions");

describe("admin/stores actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createStore", () => {
    it("creates a store with minimal required fields", async () => {
      vi.mocked(prisma.store.create).mockResolvedValue({
        store_id: 1,
        store_name: "Test Store",
      } as any);

      const result = await createStore({
        store_name: "Test Store",
        store_location: "Location A",
      });

      expect(result.success).toBe(true);
      expect((result as any).storeId).toBe(1);
      expect(vi.mocked(prisma.store.create).mock.calls[0][0]?.data).toMatchObject({
        store_name: "Test Store",
        store_location: "Location A",
      });
    });

    it("returns error for missing store name", async () => {
      const result = await createStore({
        store_name: "",
        store_location: "Location A",
      } as any);

      expect(result.success).toBe(false);
      expect((result as any).error).toBeDefined();
    });

    it("returns error for Prisma failure", async () => {
      vi.mocked(prisma.store.create).mockRejectedValue(new Error("DB error"));

      const result = await createStore({
        store_name: "Test Store",
        store_location: "Location A",
      });

      expect(result.success).toBe(false);
      expect((result as any).error).toBe("DB error");
    });
  });

  describe("updateStore", () => {
    it("updates store name", async () => {
      vi.mocked(prisma.store.findUnique).mockResolvedValue({
        store_id: 1,
      } as any);
      vi.mocked(prisma.store.update).mockResolvedValue({} as any);

      const result = await updateStore({
        storeId: 1,
        store_name: "Updated Store",
      });

      expect(result.success).toBe(true);
      expect((result as any).storeId).toBe(1);
    });

    it("returns error for non-existent store", async () => {
      vi.mocked(prisma.store.findUnique).mockResolvedValue(null);

      const result = await updateStore({
        storeId: 999,
        store_name: "Nope",
      });

      expect(result.success).toBe(false);
      expect((result as any).error).toBe("Store not found");
    });

    it("only includes provided fields in update data", async () => {
      vi.mocked(prisma.store.findUnique).mockResolvedValue({
        store_id: 1,
      } as any);
      vi.mocked(prisma.store.update).mockResolvedValue({} as any);

      await updateStore({
        storeId: 1,
        store_location: "New Location",
      });

      const data = vi.mocked(prisma.store.update).mock.calls[0][0]?.data as any;
      expect(data.store_location).toBe("New Location");
      expect(data.store_name).toBeUndefined();
    });
  });

  describe("deleteStore", () => {
    it("soft-deletes a store", async () => {
      vi.mocked(prisma.store.findUnique).mockResolvedValue({
        store_id: 1,
      } as any);
      vi.mocked(prisma.store.update).mockResolvedValue({} as any);

      const result = await deleteStore({ storeId: 1 });

      expect(result.success).toBe(true);
      expect(vi.mocked(prisma.store.update).mock.calls[0][0]?.data).toMatchObject({
        deleted: 1,
      });
    });

    it("returns error for non-existent store", async () => {
      vi.mocked(prisma.store.findUnique).mockResolvedValue(null);

      const result = await deleteStore({ storeId: 999 });

      expect(result.success).toBe(false);
      expect((result as any).error).toBe("Store not found");
    });
  });
});
