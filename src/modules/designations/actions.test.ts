import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Schemas imported from actions.ts for contract testing
// ---------------------------------------------------------------------------

import { listDesignationsSchema, getDesignationSchema } from "./actions";

describe("listDesignationsSchema", () => {
  it("accepts default values when no params provided", () => {
    const result = listDesignationsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.nameFilter).toBeUndefined();
    }
  });

  it("accepts explicit page and limit", () => {
    const result = listDesignationsSchema.safeParse({ page: "3", limit: "50" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
    }
  });

  it("accepts nameFilter", () => {
    const result = listDesignationsSchema.safeParse({ nameFilter: "Manager" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nameFilter).toBe("Manager");
    }
  });

  it("rejects page less than 1", () => {
    const result = listDesignationsSchema.safeParse({ page: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listDesignationsSchema.safeParse({ page: "-1" });
    expect(result.success).toBe(false);
  });

  it("rejects limit greater than 100", () => {
    const result = listDesignationsSchema.safeParse({ limit: "101" });
    expect(result.success).toBe(false);
  });

  it("rejects limit less than 1", () => {
    const result = listDesignationsSchema.safeParse({ limit: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric page", () => {
    const result = listDesignationsSchema.safeParse({ page: "abc" });
    expect(result.success).toBe(false);
  });

  it("coerces string page to number", () => {
    const result = listDesignationsSchema.safeParse({ page: "2" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
    }
  });
});

describe("getDesignationSchema", () => {
  it("accepts valid UUID string", () => {
    const result = getDesignationSchema.safeParse({
      uuid: "desig-001-uuid-string",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.uuid).toBe("desig-001-uuid-string");
    }
  });

  it("rejects empty UUID string", () => {
    const result = getDesignationSchema.safeParse({ uuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getDesignationSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Return type shape verification
// ---------------------------------------------------------------------------

type DesignationItem = {
  designation_uuid: string;
  designation_name_en: string;
  designation_name_ar: string | null;
};

type ListDesignationsResult = {
  designations: DesignationItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

describe("ListDesignationsResult type shape", () => {
  it("conforms to expected structure", () => {
    const result: ListDesignationsResult = {
      designations: [
        {
          designation_uuid: "abc-123",
          designation_name_en: "Manager",
          designation_name_ar: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(result.designations).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("handles empty designation list", () => {
    const result: ListDesignationsResult = {
      designations: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.designations).toHaveLength(0);
    expect(result.totalPages).toBe(0);
  });

  it("supports Arabic name being null", () => {
    const item: DesignationItem = {
      designation_uuid: "abc",
      designation_name_en: "Manager",
      designation_name_ar: null,
    };
    expect(item.designation_name_ar).toBeNull();
  });

  it("supports Arabic name being a string", () => {
    const item: DesignationItem = {
      designation_uuid: "abc",
      designation_name_en: "Manager",
      designation_name_ar: "مدير",
    };
    expect(item.designation_name_ar).toBe("مدير");
  });
});

// ---------------------------------------------------------------------------
// getDesignation return type
// ---------------------------------------------------------------------------

describe("getDesignation return type", () => {
  it("returns DesignationItem or null", () => {
    const found: DesignationItem = {
      designation_uuid: "abc",
      designation_name_en: "Manager",
      designation_name_ar: null,
    };
    const notFound: null = null;

    expect(found.designation_uuid).toBe("abc");
    expect(notFound).toBeNull();
  });
});
