import { describe, it, expect } from "vitest";
import {
  listPermissionSectionsSchema,
  getPermissionSectionSchema,
  createPermissionSectionSchema,
  updatePermissionSectionSchema,
} from "./actions";
import type {
  PermissionSectionListItem,
  PermissionSectionDetail,
  ListPermissionSectionsResult,
} from "./actions";

// ---------------------------------------------------------------------------
// Schema tests
// ---------------------------------------------------------------------------

describe("listPermissionSectionsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    expect(listPermissionSectionsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts pagination params", () => {
    const r = listPermissionSectionsSchema.safeParse({ page: 2, limit: 50 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(50);
    }
  });

  it("rejects limit over 100", () => {
    expect(
      listPermissionSectionsSchema.safeParse({ limit: 999 }).success,
    ).toBe(false);
  });

  it("rejects negative page", () => {
    expect(
      listPermissionSectionsSchema.safeParse({ page: -1 }).success,
    ).toBe(false);
  });

  it("defaults page to 1 and limit to 20", () => {
    const defaults = { page: 1, limit: 20 };
    expect(listPermissionSectionsSchema.safeParse(defaults).success).toBe(true);
  });
});

describe("getPermissionSectionSchema", () => {
  it("rejects empty UUID", () => {
    const r = getPermissionSectionSchema.safeParse({ uuid: "" });
    expect(r.success).toBe(false);
  });

  it("accepts valid UUID", () => {
    const r = getPermissionSectionSchema.safeParse({
      uuid: "perm_section_abc123",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.uuid).toBe("perm_section_abc123");
    }
  });
});

describe("createPermissionSectionSchema", () => {
  it("rejects empty section_name", () => {
    const r = createPermissionSectionSchema.safeParse({ section_name: "" });
    expect(r.success).toBe(false);
  });

  it("rejects missing section_name", () => {
    const r = createPermissionSectionSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("accepts valid section_name", () => {
    const r = createPermissionSectionSchema.safeParse({
      section_name: "Candidate Management",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.section_name).toBe("Candidate Management");
    }
  });

  it("rejects over-length section_name", () => {
    const r = createPermissionSectionSchema.safeParse({
      section_name: "x".repeat(256),
    });
    expect(r.success).toBe(false);
  });
});

describe("updatePermissionSectionSchema", () => {
  it("rejects empty UUID", () => {
    const r = updatePermissionSectionSchema.safeParse({
      uuid: "",
      section_name: "New Name",
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const r = updatePermissionSectionSchema.safeParse({
      section_name: "New Name",
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty section_name", () => {
    const r = updatePermissionSectionSchema.safeParse({
      uuid: "perm_uuid_123",
      section_name: "",
    });
    expect(r.success).toBe(false);
  });

  it("accepts valid update data", () => {
    const r = updatePermissionSectionSchema.safeParse({
      uuid: "perm_uuid_123",
      section_name: "Updated Section",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.uuid).toBe("perm_uuid_123");
      expect(r.data.section_name).toBe("Updated Section");
    }
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

describe("PermissionSectionListItem type", () => {
  it("has the required shape", () => {
    const item: PermissionSectionListItem = {
      permission_uuid: "perm_uuid_123",
      section_name: "Candidate Management",
      created_at: new Date("2024-06-01T10:00:00.000Z"),
    };
    expect(item.permission_uuid).toBe("perm_uuid_123");
    expect(item.section_name).toBe("Candidate Management");
  });
});

describe("PermissionSectionDetail type", () => {
  it("has the required shape", () => {
    const detail: PermissionSectionDetail = {
      permission_uuid: "perm_uuid_456",
      section_name: "Finance",
      created_at: new Date("2024-06-01T10:00:00.000Z"),
    };
    expect(detail.permission_uuid).toBe("perm_uuid_456");
    expect(detail.section_name).toBe("Finance");
  });
});

describe("ListPermissionSectionsResult type", () => {
  it("has the correct shape", () => {
    const result: ListPermissionSectionsResult = {
      sections: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.sections).toHaveLength(0);
    expect(result.totalPages).toBe(0);
    expect(result.page).toBe(1);
  });
});
