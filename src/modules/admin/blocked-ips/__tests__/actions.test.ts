import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock ────────────────────────────────────────────────────────
const { mockRequireCapability, mockRevalidatePath } = vi.hoisted(() => ({
  mockRequireCapability: vi.fn(),
  mockRevalidatePath: vi.fn(),
}));

// ── Mock session ────────────────────────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

// ── Mock next/cache ─────────────────────────────────────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

// ── Mock Prisma ─────────────────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    blocked_ip: {
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const { prisma } = await import("@/lib/prisma");
const actions = await import("../actions");

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockRecord = {
  ip_uuid: "ip_550e8400-e29b-41d4-a716-446655440000",
  ip_address: "192.168.1.100",
  note: "Suspicious activity",
  created_at: new Date("2026-06-01T10:00:00Z"),
  updated_at: new Date("2026-06-01T12:00:00Z"),
};

const mockRecords = [
  mockRecord,
  {
    ip_uuid: "ip_660e8400-e29b-41d4-a716-446655440001",
    ip_address: "10.0.0.55",
    note: null,
    created_at: new Date("2026-06-01T09:00:00Z"),
    updated_at: new Date("2026-06-01T09:00:00Z"),
  },
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("admin/blocked-ips actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: requireCapability succeeds unless a test overrides it
    mockRequireCapability.mockResolvedValue(undefined);
  });

  // ── listBlockedIps ───────────────────────────────────────────────────

  describe("listBlockedIps", () => {
    it("returns paginated blocked IP list", async () => {
      vi.mocked(prisma.blocked_ip.findMany).mockResolvedValue(mockRecords as any);
      vi.mocked(prisma.blocked_ip.count).mockResolvedValue(2);

      const result = await actions.listBlockedIps({ page: 1, limit: 20 });

      expect(result.records).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.totalPages).toBe(1);
      expect(result.records[0].ip_address).toBe("192.168.1.100");
      expect(result.records[0].ip_uuid).toBe("ip_550e8400-e29b-41d4-a716-446655440000");
      expect(prisma.blocked_ip.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
      expect(mockRequireCapability).toHaveBeenCalledWith("admin.read");
    });

    it("returns empty result when no blocked IPs exist", async () => {
      vi.mocked(prisma.blocked_ip.findMany).mockResolvedValue([]);
      vi.mocked(prisma.blocked_ip.count).mockResolvedValue(0);

      const result = await actions.listBlockedIps({ page: 1, limit: 20 });

      expect(result.records).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it("paginates correctly with page 2", async () => {
      vi.mocked(prisma.blocked_ip.findMany).mockResolvedValue([]);
      vi.mocked(prisma.blocked_ip.count).mockResolvedValue(25);

      const result = await actions.listBlockedIps({ page: 2, limit: 10 });

      expect(result.page).toBe(2);
      expect(result.totalPages).toBe(3);
      expect(prisma.blocked_ip.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });

    it("returns empty result on invalid input", async () => {
      const result = await actions.listBlockedIps({ page: -1 } as any);

      expect(result.records).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(prisma.blocked_ip.findMany).not.toHaveBeenCalled();
    });

    it("requires admin.read capability", async () => {
      mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

      await expect(actions.listBlockedIps({})).rejects.toThrow("Unauthorized");

      expect(mockRequireCapability).toHaveBeenCalledWith("admin.read");
    });
  });

  // ── getBlockedIp ─────────────────────────────────────────────────────

  describe("getBlockedIp", () => {
    it("returns a single blocked IP record", async () => {
      vi.mocked(prisma.blocked_ip.findFirst).mockResolvedValue(mockRecord as any);

      const result = await actions.getBlockedIp("ip_550e8400-e29b-41d4-a716-446655440000");

      expect(result).not.toBeNull();
      expect(result?.ip_uuid).toBe("ip_550e8400-e29b-41d4-a716-446655440000");
      expect(result?.ip_address).toBe("192.168.1.100");
      expect(result?.note).toBe("Suspicious activity");
      expect(prisma.blocked_ip.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ip_uuid: "ip_550e8400-e29b-41d4-a716-446655440000" },
        }),
      );
      expect(mockRequireCapability).toHaveBeenCalledWith("admin.read");
    });

    it("returns null when record not found", async () => {
      vi.mocked(prisma.blocked_ip.findFirst).mockResolvedValue(null);

      const result = await actions.getBlockedIp("ip_nonexistent");

      expect(result).toBeNull();
    });

    it("throws on invalid UUID (empty string)", async () => {
      await expect(actions.getBlockedIp("")).rejects.toThrow("Blocked IP UUID is required");
    });

    it("requires admin.read capability", async () => {
      mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

      await expect(actions.getBlockedIp("ip_abc123")).rejects.toThrow("Unauthorized");
    });
  });

  // ── createBlockedIp ──────────────────────────────────────────────────

  describe("createBlockedIp", () => {
    it("creates a blocked IP record and returns its UUID", async () => {
      const createdRecord = {
        ip_uuid: "ip_new-uuid-here",
        ip_address: "203.0.113.50",
        note: "Brute force attempt",
      };
      vi.mocked(prisma.blocked_ip.create).mockResolvedValue(createdRecord as any);

      const result = await actions.createBlockedIp({
        ip_address: "203.0.113.50",
        note: "Brute force attempt",
      });

      expect(result.ip_uuid).toBe("ip_new-uuid-here");
      expect(prisma.blocked_ip.create).toHaveBeenCalledOnce();
      expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/ip-blocking");
      expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
    });

    it("creates a blocked IP without optional note", async () => {
      const createdRecord = {
        ip_uuid: "ip_no-note-uuid",
        ip_address: "198.51.100.1",
        note: null,
      };
      vi.mocked(prisma.blocked_ip.create).mockResolvedValue(createdRecord as any);

      const result = await actions.createBlockedIp({
        ip_address: "198.51.100.1",
      });

      expect(result.ip_uuid).toBe("ip_no-note-uuid");
      expect(prisma.blocked_ip.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            ip_address: "198.51.100.1",
            note: null,
          }),
        }),
      );
    });

    it("throws on invalid input (empty IP address)", async () => {
      await expect(
        actions.createBlockedIp({ ip_address: "" }),
      ).rejects.toThrow("IP address is required");
      expect(prisma.blocked_ip.create).not.toHaveBeenCalled();
    });

    it("throws on IP address exceeding max length", async () => {
      await expect(
        actions.createBlockedIp({ ip_address: "a".repeat(46) }),
      ).rejects.toThrow();
      expect(prisma.blocked_ip.create).not.toHaveBeenCalled();
    });

    it("requires admin.write capability", async () => {
      mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

      await expect(
        actions.createBlockedIp({ ip_address: "192.168.1.1" }),
      ).rejects.toThrow("Unauthorized");
    });
  });

  // ── updateBlockedIp ──────────────────────────────────────────────────

  describe("updateBlockedIp", () => {
    it("updates an existing blocked IP record", async () => {
      vi.mocked(prisma.blocked_ip.findFirst).mockResolvedValue(mockRecord as any);
      vi.mocked(prisma.blocked_ip.update).mockResolvedValue({
        ip_uuid: "ip_550e8400-e29b-41d4-a716-446655440000",
        ip_address: "192.168.1.200",
        note: "Updated note",
      } as any);

      const result = await actions.updateBlockedIp({
        ipUuid: "ip_550e8400-e29b-41d4-a716-446655440000",
        ip_address: "192.168.1.200",
        note: "Updated note",
      });

      expect(result.ip_uuid).toBe("ip_550e8400-e29b-41d4-a716-446655440000");
      expect(prisma.blocked_ip.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ip_uuid: "ip_550e8400-e29b-41d4-a716-446655440000" },
        }),
      );
      expect(prisma.blocked_ip.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ip_uuid: "ip_550e8400-e29b-41d4-a716-446655440000" },
          data: { ip_address: "192.168.1.200", note: "Updated note" },
        }),
      );
      expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/ip-blocking");
      expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
    });

    it("throws when record to update does not exist", async () => {
      vi.mocked(prisma.blocked_ip.findFirst).mockResolvedValue(null);

      await expect(
        actions.updateBlockedIp({
          ipUuid: "ip_nonexistent",
          ip_address: "10.0.0.1",
        }),
      ).rejects.toThrow("Blocked IP record not found: ip_nonexistent");
      expect(prisma.blocked_ip.update).not.toHaveBeenCalled();
    });

    it("updates with note cleared to null", async () => {
      vi.mocked(prisma.blocked_ip.findFirst).mockResolvedValue(mockRecord as any);
      vi.mocked(prisma.blocked_ip.update).mockResolvedValue({
        ip_uuid: "ip_550e8400-e29b-41d4-a716-446655440000",
      } as any);

      await actions.updateBlockedIp({
        ipUuid: "ip_550e8400-e29b-41d4-a716-446655440000",
        ip_address: "192.168.1.100",
      });

      expect(prisma.blocked_ip.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ note: null }),
        }),
      );
    });

    it("throws on invalid input (empty UUID)", async () => {
      await expect(
        actions.updateBlockedIp({ ipUuid: "", ip_address: "10.0.0.1" }),
      ).rejects.toThrow("Blocked IP UUID is required");
    });

    it("requires admin.write capability", async () => {
      mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

      await expect(
        actions.updateBlockedIp({
          ipUuid: "ip_abc",
          ip_address: "10.0.0.1",
        }),
      ).rejects.toThrow("Unauthorized");
    });
  });

  // ── deleteBlockedIp ──────────────────────────────────────────────────

  describe("deleteBlockedIp", () => {
    it("deletes an existing blocked IP record", async () => {
      vi.mocked(prisma.blocked_ip.findFirst).mockResolvedValue(mockRecord as any);
      vi.mocked(prisma.blocked_ip.delete).mockResolvedValue({} as any);

      const result = await actions.deleteBlockedIp("ip_550e8400-e29b-41d4-a716-446655440000");

      expect(result.ip_uuid).toBe("ip_550e8400-e29b-41d4-a716-446655440000");
      expect(prisma.blocked_ip.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ip_uuid: "ip_550e8400-e29b-41d4-a716-446655440000" },
        }),
      );
      expect(prisma.blocked_ip.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ip_uuid: "ip_550e8400-e29b-41d4-a716-446655440000" },
        }),
      );
      expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/ip-blocking");
      expect(mockRequireCapability).toHaveBeenCalledWith("admin.write");
    });

    it("throws when record to delete does not exist", async () => {
      vi.mocked(prisma.blocked_ip.findFirst).mockResolvedValue(null);

      await expect(actions.deleteBlockedIp("ip_nonexistent")).rejects.toThrow(
        "Blocked IP record not found: ip_nonexistent",
      );
      expect(prisma.blocked_ip.delete).not.toHaveBeenCalled();
    });

    it("throws on invalid input (empty UUID)", async () => {
      await expect(actions.deleteBlockedIp("")).rejects.toThrow(
        "Blocked IP UUID is required",
      );
    });

    it("requires admin.write capability", async () => {
      mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));

      await expect(actions.deleteBlockedIp("ip_abc")).rejects.toThrow("Unauthorized");
    });
  });
});
