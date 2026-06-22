import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: admin list schema validation
// ---------------------------------------------------------------------------

const listAdminsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  search: z.string().max(255).optional(),
});

const getAdminSchema = z.object({
  id: z.number().int().positive(),
});

const createAdminSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  password: z.string().min(8).max(255),
  roleId: z.string().optional(),
});

describe("listAdminsSchema", () => {
  it("accepts empty params (no pagination)", () => {
    const result = listAdminsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts pagination params", () => {
    const result = listAdminsSchema.safeParse({ page: 1, limit: 20 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts search param", () => {
    const result = listAdminsSchema.safeParse({ search: "john" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBe("john");
    }
  });

  it("rejects limit over 100", () => {
    const result = listAdminsSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listAdminsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer limit", () => {
    const result = listAdminsSchema.safeParse({ limit: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects search over 255 chars", () => {
    const result = listAdminsSchema.safeParse({ search: "x".repeat(256) });
    expect(result.success).toBe(false);
  });
});

describe("getAdminSchema", () => {
  it("accepts a valid positive integer id", () => {
    const result = getAdminSchema.safeParse({ id: 1 });
    expect(result.success).toBe(true);
  });

  it("rejects zero id", () => {
    const result = getAdminSchema.safeParse({ id: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative id", () => {
    const result = getAdminSchema.safeParse({ id: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer id", () => {
    const result = getAdminSchema.safeParse({ id: "abc" });
    expect(result.success).toBe(false);
  });
});

describe("createAdminSchema", () => {
  it("accepts valid admin creation data", () => {
    const result = createAdminSchema.safeParse({
      name: "John Admin",
      email: "john@example.com",
      password: "password123",
      roleId: "role-uuid-123",
    });
    expect(result.success).toBe(true);
  });

  it("accepts creation without optional roleId", () => {
    const result = createAdminSchema.safeParse({
      name: "John Admin",
      email: "john@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createAdminSchema.safeParse({
      name: "",
      email: "john@example.com",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = createAdminSchema.safeParse({
      name: "John Admin",
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password (< 8 chars)", () => {
    const result = createAdminSchema.safeParse({
      name: "John Admin",
      email: "john@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Return type shapes
// ---------------------------------------------------------------------------

type AdminListItem = {
  admin_id: number;
  admin_name: string;
  admin_email: string;
  admin_status: number;
  admin_created_at: string;
};

type ListAdminsResult = {
  admins: AdminListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type AdminDetail = AdminListItem & {
  admin_updated_at: string;
  admin_limited_access: number | null;
};

describe("AdminListItem shape", () => {
  it("defines the expected fields", () => {
    const mock: AdminListItem = {
      admin_id: 1,
      admin_name: "John Admin",
      admin_email: "john@example.com",
      admin_status: 10,
      admin_created_at: "2024-01-01T00:00:00.000Z",
    };
    expect(mock.admin_id).toBe(1);
    expect(mock.admin_name).toBe("John Admin");
    expect(mock.admin_email).toBe("john@example.com");
    expect(mock.admin_status).toBe(10);
    expect(mock.admin_created_at).toBeTruthy();
  });
});

describe("ListAdminsResult shape", () => {
  it("accepts a valid result set", () => {
    const result: ListAdminsResult = {
      admins: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.admins).toHaveLength(0);
  });
});
