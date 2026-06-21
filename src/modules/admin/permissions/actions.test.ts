import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createPermissionSectionSchema,
  updatePermissionSectionSchema,
  listPermissionSectionsSchema,
  listPermissionSectionsOutputSchema,
  createPermissionSectionOutputSchema,
  updatePermissionSectionOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests — pure unit tests, no DB required
// ---------------------------------------------------------------------------

describe("listPermissionSectionsSchema", () => {
  it("accepts empty params (no pagination needed — returns full tree)", () => {
    const r = listPermissionSectionsSchema.safeParse({});
    expect(r.success).toBe(true);
  });
});

describe("createPermissionSectionSchema", () => {
  it("accepts valid section_name", () => {
    const r = createPermissionSectionSchema.safeParse({
      section_name: "Finance Management",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.section_name).toBe("Finance Management");
    }
  });

  it("rejects empty section_name", () => {
    expect(
      createPermissionSectionSchema.safeParse({ section_name: "" }).success,
    ).toBe(false);
  });

  it("rejects missing section_name", () => {
    expect(createPermissionSectionSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-string section_name", () => {
    expect(
      createPermissionSectionSchema.safeParse({ section_name: 123 }).success,
    ).toBe(false);
  });
});

describe("updatePermissionSectionSchema", () => {
  it("accepts valid UUID and section_name", () => {
    const r = updatePermissionSectionSchema.safeParse({
      permission_uuid: "per_sec1234-5678-90ab-cdef-1234567890ab",
      section_name: "Updated Section Name",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.permission_uuid).toBe(
        "per_sec1234-5678-90ab-cdef-1234567890ab",
      );
      expect(r.data.section_name).toBe("Updated Section Name");
    }
  });

  it("rejects empty UUID", () => {
    expect(
      updatePermissionSectionSchema.safeParse({
        permission_uuid: "",
        section_name: "Test",
      }).success,
    ).toBe(false);
  });

  it("rejects missing UUID", () => {
    expect(
      updatePermissionSectionSchema.safeParse({ section_name: "Test" }).success,
    ).toBe(false);
  });

  it("rejects empty section_name", () => {
    expect(
      updatePermissionSectionSchema.safeParse({
        permission_uuid: "per_sec1234-5678-90ab-cdef-1234567890ab",
        section_name: "",
      }).success,
    ).toBe(false);
  });

  it("rejects missing section_name", () => {
    expect(
      updatePermissionSectionSchema.safeParse({
        permission_uuid: "per_sec1234-5678-90ab-cdef-1234567890ab",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("listPermissionSectionsOutputSchema", () => {
  it("validates a valid array of permission sections", () => {
    const data = [
      {
        permission_uuid: "per_sec_uuid_1",
        section_name: "Finance Management",
        created_at: new Date("2024-01-01"),
      },
      {
        permission_uuid: "per_sec_uuid_2",
        section_name: null,
        created_at: new Date("2024-01-02"),
      },
    ];
    const r = listPermissionSectionsOutputSchema.safeParse(data);
    expect(r.success).toBe(true);
  });

  it("rejects items with missing permission_uuid", () => {
    const data = [
      {
        section_name: "Test",
        created_at: new Date(),
      },
    ];
    const r = listPermissionSectionsOutputSchema.safeParse(data);
    expect(r.success).toBe(false);
  });

  it("rejects items with wrong created_at type", () => {
    const data = [
      {
        permission_uuid: "per_sec_test",
        section_name: "Test",
        created_at: "2024-01-01",
      },
    ];
    const r = listPermissionSectionsOutputSchema.safeParse(data);
    expect(r.success).toBe(false);
  });
});

describe("createPermissionSectionOutputSchema", () => {
  it("validates a valid creation result", () => {
    const r = createPermissionSectionOutputSchema.safeParse({
      permission_uuid: "per_sec_new_uuid",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing permission_uuid", () => {
    const r = createPermissionSectionOutputSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

describe("updatePermissionSectionOutputSchema", () => {
  it("validates a valid update result", () => {
    const r = updatePermissionSectionOutputSchema.safeParse({
      permission_uuid: "per_sec_updated_uuid",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing permission_uuid", () => {
    const r = updatePermissionSectionOutputSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

// ── Runtime tests with mocked Prisma ─────────────────────────
// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireCapabilityPerm,
  mockRevalidatePathPerm,
  mockFindManyPerm,
  mockFindUniquePerm,
  mockCreatePerm,
  mockUpdatePerm,
} = vi.hoisted(() => ({
  mockRequireCapabilityPerm: vi.fn(),
  mockRevalidatePathPerm: vi.fn(),
  mockFindManyPerm: vi.fn(),
  mockFindUniquePerm: vi.fn(),
  mockCreatePerm: vi.fn(),
  mockUpdatePerm: vi.fn(),
}));

// ── Mock session module ─────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapabilityPerm,
}));

// ── Mock next/cache ─────────────────────────────────────────
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePathPerm,
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    permission_section: {
      findMany: mockFindManyPerm,
      findUnique: mockFindUniquePerm,
      create: mockCreatePerm,
      update: mockUpdatePerm,
    },
  },
}));

import {
  listPermissionSections,
  createPermissionSection,
  updatePermissionSection,
} from "./actions";

// ---------------------------------------------------------------------------
// listPermissionSections — runtime
// ---------------------------------------------------------------------------

describe("listPermissionSections — runtime", () => {
  const MOCK_SECTIONS = [
    {
      permission_uuid: "per_sec_001",
      section_name: "Finance Management",
      created_at: new Date("2024-01-01"),
    },
    {
      permission_uuid: "per_sec_002",
      section_name: "Student Management",
      created_at: new Date("2024-01-02"),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapabilityPerm.mockResolvedValue(undefined);
    mockFindManyPerm.mockResolvedValue(MOCK_SECTIONS);
  });

  it("returns all permission sections", async () => {
    const result = await listPermissionSections();
    expect(result).toHaveLength(2);
    expect(result[0].permission_uuid).toBe("per_sec_001");
    expect(result[1].permission_uuid).toBe("per_sec_002");
  });

  it("calls requireCapability with admin.read", async () => {
    await listPermissionSections();
    expect(mockRequireCapabilityPerm).toHaveBeenCalledWith("admin.read");
  });

  it("queries Prisma findMany ordered by section_name asc", async () => {
    await listPermissionSections();
    expect(mockFindManyPerm).toHaveBeenCalledWith({
      orderBy: { section_name: "asc" },
    });
  });

  it("returns empty array when no sections exist", async () => {
    mockFindManyPerm.mockResolvedValue([]);
    const result = await listPermissionSections();
    expect(result).toEqual([]);
  });

  it("handles sections with null section_name", async () => {
    const sectionsWithNull = [
      {
        permission_uuid: "per_sec_null",
        section_name: null,
        created_at: new Date("2024-01-01"),
      },
    ];
    mockFindManyPerm.mockResolvedValue(sectionsWithNull);
    const result = await listPermissionSections();
    expect(result[0].section_name).toBeNull();
  });

  it("propagates requireCapability rejection", async () => {
    mockRequireCapabilityPerm.mockRejectedValue(
      new Error("Unauthorized: insufficient capability"),
    );
    await expect(listPermissionSections()).rejects.toThrow(
      "Unauthorized: insufficient capability",
    );
  });

  it("propagates Prisma exception", async () => {
    mockFindManyPerm.mockRejectedValue(new Error("Database connection failed"));
    await expect(listPermissionSections()).rejects.toThrow(
      "Database connection failed",
    );
  });
});

// ---------------------------------------------------------------------------
// createPermissionSection — runtime
// ---------------------------------------------------------------------------

describe("createPermissionSection — runtime", () => {
  const CREATED_UUID = "per_sec_newly_created_uuid";

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapabilityPerm.mockResolvedValue(undefined);
    mockCreatePerm.mockResolvedValue({
      permission_uuid: CREATED_UUID,
      section_name: "New Section",
      created_at: new Date(),
    });
  });

  it("creates section and returns permission_uuid", async () => {
    const result = await createPermissionSection({
      section_name: "New Section",
    });
    expect(result.permission_uuid).toBe(CREATED_UUID);
  });

  it("calls requireCapability with admin.write", async () => {
    await createPermissionSection({ section_name: "New Section" });
    expect(mockRequireCapabilityPerm).toHaveBeenCalledWith("admin.write");
  });

  it("passes section_name to Prisma create", async () => {
    await createPermissionSection({ section_name: "Finance Management" });
    const call = mockCreatePerm.mock.calls[0][0];
    expect(call.data.section_name).toBe("Finance Management");
    // permission_uuid is auto-generated with per_sec prefix
    expect(call.data.permission_uuid).toMatch(/^per_sec/);
  });

  it("sets created_at to a Date instance", async () => {
    await createPermissionSection({ section_name: "Test Section" });
    const call = mockCreatePerm.mock.calls[0][0];
    expect(call.data.created_at).toBeInstanceOf(Date);
  });

  it("re-validates /admin/permissions on success", async () => {
    await createPermissionSection({ section_name: "New Section" });
    expect(mockRevalidatePathPerm).toHaveBeenCalledWith("/admin/permissions");
  });

  it("throws on validation failure (empty section_name)", async () => {
    await expect(
      createPermissionSection({ section_name: "" }),
    ).rejects.toThrow();
  });

  it("throws on validation failure (missing section_name)", async () => {
    await expect(createPermissionSection({} as any)).rejects.toThrow();
  });

  it("throws on Prisma exception", async () => {
    mockCreatePerm.mockRejectedValue(new Error("Duplicate entry"));
    await expect(
      createPermissionSection({ section_name: "Duplicate" }),
    ).rejects.toThrow("Duplicate entry");
  });

  it("propagates requireCapability rejection", async () => {
    mockRequireCapabilityPerm.mockRejectedValue(
      new Error("Unauthorized: insufficient capability"),
    );
    await expect(
      createPermissionSection({ section_name: "Test" }),
    ).rejects.toThrow("Unauthorized: insufficient capability");
  });
});

// ---------------------------------------------------------------------------
// updatePermissionSection — runtime
// ---------------------------------------------------------------------------

describe("updatePermissionSection — runtime", () => {
  const EXISTING_UUID = "per_sec_existing";
  const MOCK_EXISTING_SECTION = {
    permission_uuid: EXISTING_UUID,
    section_name: "Old Name",
    created_at: new Date("2024-01-01"),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireCapabilityPerm.mockResolvedValue(undefined);
    mockFindUniquePerm.mockResolvedValue(MOCK_EXISTING_SECTION);
    mockUpdatePerm.mockResolvedValue({
      permission_uuid: EXISTING_UUID,
      section_name: "Updated Name",
      created_at: new Date("2024-01-01"),
    });
  });

  it("updates section and returns permission_uuid", async () => {
    const result = await updatePermissionSection({
      permission_uuid: EXISTING_UUID,
      section_name: "Updated Name",
    });
    expect(result.permission_uuid).toBe(EXISTING_UUID);
  });

  it("calls requireCapability with admin.write", async () => {
    await updatePermissionSection({
      permission_uuid: EXISTING_UUID,
      section_name: "Updated Name",
    });
    expect(mockRequireCapabilityPerm).toHaveBeenCalledWith("admin.write");
  });

  it("checks existing section with findUnique before updating", async () => {
    await updatePermissionSection({
      permission_uuid: EXISTING_UUID,
      section_name: "Updated Name",
    });
    expect(mockFindUniquePerm).toHaveBeenCalledWith({
      where: { permission_uuid: EXISTING_UUID },
    });
  });

  it("passes section_name to Prisma update", async () => {
    await updatePermissionSection({
      permission_uuid: EXISTING_UUID,
      section_name: "Updated Name",
    });
    expect(mockUpdatePerm).toHaveBeenCalledWith({
      where: { permission_uuid: EXISTING_UUID },
      data: { section_name: "Updated Name" },
    });
  });

  it("re-validates /admin/permissions on success", async () => {
    await updatePermissionSection({
      permission_uuid: EXISTING_UUID,
      section_name: "Updated Name",
    });
    expect(mockRevalidatePathPerm).toHaveBeenCalledWith("/admin/permissions");
  });

  it("throws when section not found", async () => {
    mockFindUniquePerm.mockResolvedValue(null);
    await expect(
      updatePermissionSection({
        permission_uuid: "per_sec_nonexistent",
        section_name: "Wont Work",
      }),
    ).rejects.toThrow("Permission section not found");
  });

  it("throws on validation failure (empty UUID)", async () => {
    await expect(
      updatePermissionSection({
        permission_uuid: "",
        section_name: "Test",
      }),
    ).rejects.toThrow();
  });

  it("throws on validation failure (missing section_name)", async () => {
    await expect(
      updatePermissionSection({
        permission_uuid: EXISTING_UUID,
      } as any),
    ).rejects.toThrow();
  });

  it("throws on Prisma exception during findUnique", async () => {
    mockFindUniquePerm.mockRejectedValue(new Error("DB lookup failed"));
    await expect(
      updatePermissionSection({
        permission_uuid: EXISTING_UUID,
        section_name: "Updated",
      }),
    ).rejects.toThrow("DB lookup failed");
  });

  it("throws on Prisma exception during update", async () => {
    mockFindUniquePerm.mockResolvedValue(MOCK_EXISTING_SECTION);
    mockUpdatePerm.mockRejectedValue(new Error("FK constraint"));
    await expect(
      updatePermissionSection({
        permission_uuid: EXISTING_UUID,
        section_name: "Updated",
      }),
    ).rejects.toThrow("FK constraint");
  });

  it("propagates requireCapability rejection", async () => {
    mockRequireCapabilityPerm.mockRejectedValue(
      new Error("Unauthorized: insufficient capability"),
    );
    await expect(
      updatePermissionSection({
        permission_uuid: EXISTING_UUID,
        section_name: "Test",
      }),
    ).rejects.toThrow("Unauthorized: insufficient capability");
  });
});
