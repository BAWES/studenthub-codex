import { describe, it, expect } from "vitest";
import {
  permissionSubSectionItemSchema,
  permissionSectionItemSchema,
  permissionSectionListResponseSchema,
  permissionUserItemSchema,
  permissionUserListResponseSchema,
} from "./schemas";

describe("permissionSubSectionItemSchema", () => {
  const valid = { permission_sub_section_uuid: "ps-uuid-1", sub_section_name: "View", sub_section_slug: "view" };
  it("accepts a valid sub-section", () => expect(permissionSubSectionItemSchema.safeParse(valid).success).toBe(true));
  it("accepts all fields as null", () => {
    expect(permissionSubSectionItemSchema.safeParse({
      permission_sub_section_uuid: "ps-1", sub_section_name: null, sub_section_slug: null,
    }).success).toBe(true);
  });
  it("rejects missing permission_sub_section_uuid", () => {
    const { permission_sub_section_uuid: _, ...rest } = valid;
    expect(permissionSubSectionItemSchema.safeParse(rest).success).toBe(false);
  });
});

describe("permissionSectionItemSchema", () => {
  const valid = {
    permission_uuid: "p-uuid-1", section_name: "Reports",
    subSections: [{ permission_sub_section_uuid: "ps-1", sub_section_name: null, sub_section_slug: null }],
  };
  it("accepts a valid section", () => expect(permissionSectionItemSchema.safeParse(valid).success).toBe(true));
  it("accepts empty subSections", () => {
    expect(permissionSectionItemSchema.safeParse({ ...valid, subSections: [] }).success).toBe(true);
  });
  it("rejects missing subSections", () => {
    const { subSections: _, ...rest } = valid;
    expect(permissionSectionItemSchema.safeParse(rest).success).toBe(false);
  });
});

describe("permissionSectionListResponseSchema", () => {
  const item = { permission_uuid: "p-1", section_name: null, subSections: [] };
  it("accepts an array of sections", () => expect(permissionSectionListResponseSchema.safeParse([item]).success).toBe(true));
  it("accepts empty array", () => expect(permissionSectionListResponseSchema.safeParse([]).success).toBe(true));
});

describe("permissionUserItemSchema", () => {
  const valid = {
    permission_user_uuid: "pu-uuid-1", admin_id: 1, staff_id: null,
    permission_sub_section_uuid: "ps-1", sub_section_name: "View",
    sub_section_slug: "view", section_name: "Reports", companies: [],
  };
  it("accepts a valid permission user item", () => {
    expect(permissionUserItemSchema.safeParse(valid).success).toBe(true);
  });
  it("accepts all nullable and empty array", () => {
    expect(permissionUserItemSchema.safeParse({
      ...valid, admin_id: null, staff_id: null, permission_sub_section_uuid: null,
      sub_section_name: null, sub_section_slug: null, section_name: null,
    }).success).toBe(true);
  });
  it("rejects missing companies", () => {
    const { companies: _, ...rest } = valid;
    expect(permissionUserItemSchema.safeParse(rest).success).toBe(false);
  });
});

describe("permissionUserListResponseSchema", () => {
  const item = { permission_user_uuid: "pu-1", admin_id: null, staff_id: null,
                 permission_sub_section_uuid: null, sub_section_name: null,
                 sub_section_slug: null, section_name: null, companies: [] };
  it("accepts an array", () => expect(permissionUserListResponseSchema.safeParse([item]).success).toBe(true));
  it("accepts empty array", () => expect(permissionUserListResponseSchema.safeParse([]).success).toBe(true));
});
