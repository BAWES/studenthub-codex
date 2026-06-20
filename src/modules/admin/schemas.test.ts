import { describe, it, expect } from "vitest";
import {
  adminListItemSchema,
  adminDetailSchema,
  listAdminsResultSchema,
  createAdminResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// adminListItemSchema
// ---------------------------------------------------------------------------
describe("adminListItemSchema", () => {
  const valid = {
    admin_id: 1,
    admin_name: "John Doe",
    admin_email: "john@example.com",
    admin_status: 1,
    admin_created_at: new Date("2026-01-01"),
  };

  it("accepts a valid admin list item", () => {
    expect(adminListItemSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing admin_id", () => {
    const { admin_id: _, ...rest } = valid;
    expect(adminListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing admin_name", () => {
    const { admin_name: _, ...rest } = valid;
    expect(adminListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing admin_email", () => {
    const { admin_email: _, ...rest } = valid;
    expect(adminListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing admin_status", () => {
    const { admin_status: _, ...rest } = valid;
    expect(adminListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing admin_created_at", () => {
    const { admin_created_at: _, ...rest } = valid;
    expect(adminListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for admin_id", () => {
    expect(
      adminListItemSchema.safeParse({ ...valid, admin_id: "not-a-number" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for admin_status", () => {
    expect(
      adminListItemSchema.safeParse({ ...valid, admin_status: "active" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for admin_created_at", () => {
    expect(
      adminListItemSchema.safeParse({ ...valid, admin_created_at: "2026-01-01" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// adminDetailSchema
// ---------------------------------------------------------------------------
describe("adminDetailSchema", () => {
  const valid = {
    admin_id: 1,
    admin_name: "John Doe",
    admin_email: "john@example.com",
    admin_status: 1,
    admin_created_at: new Date("2026-01-01"),
    admin_updated_at: new Date("2026-06-01"),
    admin_limited_access: 0,
  };

  it("accepts a valid admin detail", () => {
    expect(adminDetailSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable admin_limited_access", () => {
    expect(
      adminDetailSchema.safeParse({ ...valid, admin_limited_access: null }).success,
    ).toBe(true);
  });

  it("rejects missing admin_updated_at", () => {
    const { admin_updated_at: _, ...rest } = valid;
    expect(adminDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing admin_limited_access", () => {
    const { admin_limited_access: _, ...rest } = valid;
    expect(adminDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for admin_updated_at", () => {
    expect(
      adminDetailSchema.safeParse({ ...valid, admin_updated_at: "2026-06-01" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listAdminsResultSchema
// ---------------------------------------------------------------------------
describe("listAdminsResultSchema", () => {
  const valid = {
    admins: [
      {
        admin_id: 1,
        admin_name: "John Doe",
        admin_email: "john@example.com",
        admin_status: 1,
        admin_created_at: new Date("2026-01-01"),
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid result", () => {
    expect(listAdminsResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty admins array", () => {
    expect(
      listAdminsResultSchema.safeParse({ ...valid, admins: [], total: 0, totalPages: 0 }).success,
    ).toBe(true);
  });

  it("rejects missing admins", () => {
    const { admins: _, ...rest } = valid;
    expect(listAdminsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = valid;
    expect(listAdminsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing page", () => {
    const { page: _, ...rest } = valid;
    expect(listAdminsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listAdminsResultSchema.safeParse({ ...valid, total: -1 }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      listAdminsResultSchema.safeParse({ ...valid, page: 0 }).success,
    ).toBe(false);
  });

  it("rejects non-integer limit", () => {
    expect(
      listAdminsResultSchema.safeParse({ ...valid, limit: 20.5 }).success,
    ).toBe(false);
  });

  it("rejects non-array admins", () => {
    expect(
      listAdminsResultSchema.safeParse({ ...valid, admins: "not-an-array" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createAdminResultSchema
// ---------------------------------------------------------------------------
describe("createAdminResultSchema", () => {
  const valid = {
    admin_id: 42,
  };

  it("accepts a valid create admin result", () => {
    expect(createAdminResultSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing admin_id", () => {
    expect(createAdminResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects wrong type for admin_id", () => {
    expect(
      createAdminResultSchema.safeParse({ admin_id: "not-a-number" }).success,
    ).toBe(false);
  });
});
