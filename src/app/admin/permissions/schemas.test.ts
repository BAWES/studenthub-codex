import { describe, it, expect } from "vitest";
import {
  listPermissionSectionsSchema,
  createPermissionSectionSchema,
  updatePermissionSectionSchema,
  listPermissionSectionsOutputSchema,
  createPermissionSectionOutputSchema,
  updatePermissionSectionOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listPermissionSectionsSchema
// ---------------------------------------------------------------------------
describe("listPermissionSectionsSchema", () => {
  it("accepts empty object", () => {
    expect(listPermissionSectionsSchema.safeParse({}).success).toBe(true);
  });

  it("rejects non-object", () => {
    expect(listPermissionSectionsSchema.safeParse("invalid").success).toBe(false);
  });

  it("rejects null", () => {
    expect(listPermissionSectionsSchema.safeParse(null).success).toBe(false);
  });

  it("rejects undefined", () => {
    expect(listPermissionSectionsSchema.safeParse(undefined).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createPermissionSectionSchema
// ---------------------------------------------------------------------------
describe("createPermissionSectionSchema", () => {
  it("accepts valid input", () => {
    expect(
      createPermissionSectionSchema.safeParse({ section_name: "User Management" }).success,
    ).toBe(true);
  });

  it("rejects missing section_name", () => {
    expect(createPermissionSectionSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty section_name", () => {
    expect(createPermissionSectionSchema.safeParse({ section_name: "" }).success).toBe(false);
  });

  it("rejects section_name exceeding 255 chars", () => {
    expect(
      createPermissionSectionSchema.safeParse({ section_name: "x".repeat(256) }).success,
    ).toBe(false);
  });

  it("rejects wrong type", () => {
    expect(
      createPermissionSectionSchema.safeParse({ section_name: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updatePermissionSectionSchema
// ---------------------------------------------------------------------------
describe("updatePermissionSectionSchema", () => {
  it("accepts valid input", () => {
    expect(
      updatePermissionSectionSchema.safeParse({
        permission_uuid: "ps-1",
        section_name: "User Management",
      }).success,
    ).toBe(true);
  });

  it("rejects missing permission_uuid", () => {
    expect(
      updatePermissionSectionSchema.safeParse({ section_name: "User Management" }).success,
    ).toBe(false);
  });

  it("rejects empty permission_uuid", () => {
    expect(
      updatePermissionSectionSchema.safeParse({ permission_uuid: "", section_name: "Mgmt" }).success,
    ).toBe(false);
  });

  it("rejects missing section_name", () => {
    expect(
      updatePermissionSectionSchema.safeParse({ permission_uuid: "ps-1" }).success,
    ).toBe(false);
  });

  it("rejects empty section_name", () => {
    expect(
      updatePermissionSectionSchema.safeParse({ permission_uuid: "ps-1", section_name: "" }).success,
    ).toBe(false);
  });

  it("rejects section_name exceeding 255 chars", () => {
    expect(
      updatePermissionSectionSchema.safeParse({
        permission_uuid: "ps-1",
        section_name: "x".repeat(256),
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listPermissionSectionsOutputSchema
// ---------------------------------------------------------------------------
describe("listPermissionSectionsOutputSchema", () => {
  const validOutput = [
    {
      permission_uuid: "ps-1",
      section_name: "User Management",
      created_at: new Date("2024-01-01"),
    },
  ];

  it("accepts a valid list", () => {
    expect(listPermissionSectionsOutputSchema.safeParse(validOutput).success).toBe(true);
  });

  it("accepts empty array", () => {
    expect(listPermissionSectionsOutputSchema.safeParse([]).success).toBe(true);
  });

  it("accepts nullable section_name", () => {
    expect(
      listPermissionSectionsOutputSchema.safeParse([
        { permission_uuid: "ps-1", section_name: null, created_at: new Date() },
      ]).success,
    ).toBe(true);
  });

  it("rejects missing permission_uuid", () => {
    const [{ permission_uuid: _, ...item }] = validOutput;
    expect(listPermissionSectionsOutputSchema.safeParse([item]).success).toBe(false);
  });

  it("rejects empty permission_uuid", () => {
    expect(
      listPermissionSectionsOutputSchema.safeParse([
        { permission_uuid: "", section_name: "Mgmt", created_at: new Date() },
      ]).success,
    ).toBe(false);
  });

  it("rejects missing created_at", () => {
    const [{ created_at: _, ...item }] = validOutput;
    expect(listPermissionSectionsOutputSchema.safeParse([item]).success).toBe(false);
  });

  it("rejects wrong type for created_at", () => {
    expect(
      listPermissionSectionsOutputSchema.safeParse([
        { permission_uuid: "ps-1", section_name: "Mgmt", created_at: "not-a-date" },
      ]).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createPermissionSectionOutputSchema
// ---------------------------------------------------------------------------
describe("createPermissionSectionOutputSchema", () => {
  it("accepts valid output", () => {
    expect(
      createPermissionSectionOutputSchema.safeParse({ permission_uuid: "ps-1" }).success,
    ).toBe(true);
  });

  it("rejects missing permission_uuid", () => {
    expect(createPermissionSectionOutputSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty permission_uuid", () => {
    expect(
      createPermissionSectionOutputSchema.safeParse({ permission_uuid: "" }).success,
    ).toBe(false);
  });

  it("rejects wrong type", () => {
    expect(
      createPermissionSectionOutputSchema.safeParse({ permission_uuid: 123 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updatePermissionSectionOutputSchema
// ---------------------------------------------------------------------------
describe("updatePermissionSectionOutputSchema", () => {
  it("accepts valid output", () => {
    expect(
      updatePermissionSectionOutputSchema.safeParse({ permission_uuid: "ps-1" }).success,
    ).toBe(true);
  });

  it("rejects missing permission_uuid", () => {
    expect(updatePermissionSectionOutputSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty permission_uuid", () => {
    expect(
      updatePermissionSectionOutputSchema.safeParse({ permission_uuid: "" }).success,
    ).toBe(false);
  });

  it("rejects wrong type", () => {
    expect(
      updatePermissionSectionOutputSchema.safeParse({ permission_uuid: 123 }).success,
    ).toBe(false);
  });
});
