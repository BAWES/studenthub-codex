import { describe, it, expect } from "vitest";
import {
  listCompanyContactsSchema,
  getCompanyContactSchema,
  createCompanyContactSchema,
  updateCompanyContactSchema,
  listCompanyContactsRowsSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests (pure unit tests — no DB required)
// ---------------------------------------------------------------------------

describe("listCompanyContactsSchema", () => {
  it("accepts empty params (default pagination)", () => {
    expect(listCompanyContactsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts pagination params", () => {
    const r = listCompanyContactsSchema.safeParse({ page: 2, limit: 50 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(50);
    }
  });

  it("rejects limit over 100", () => {
    expect(listCompanyContactsSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listCompanyContactsSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("accepts optional company_id filter", () => {
    const r = listCompanyContactsSchema.safeParse({ company_id: 5 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.company_id).toBe(5);
    }
  });

  it("rejects zero company_id", () => {
    expect(listCompanyContactsSchema.safeParse({ company_id: 0 }).success).toBe(false);
  });
});

describe("getCompanyContactSchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      getCompanyContactSchema.safeParse({ uuid: "abc-123-def" }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(getCompanyContactSchema.safeParse({ uuid: "" }).success).toBe(false);
  });
});

describe("createCompanyContactSchema", () => {
  it("accepts valid company contact data", () => {
    const r = createCompanyContactSchema.safeParse({
      company_id: 1,
      contact_name: "John Doe",
      contact_email: "john@example.com",
      contact_position: "Manager",
      allow_access: true,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.company_id).toBe(1);
      expect(r.data.contact_name).toBe("John Doe");
      expect(r.data.contact_email).toBe("john@example.com");
      expect(r.data.allow_access).toBe(true);
    }
  });

  it("accepts minimal data (name + company only)", () => {
    const r = createCompanyContactSchema.safeParse({
      company_id: 1,
      contact_name: "Jane Doe",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.contact_email).toBeUndefined();
      expect(r.data.allow_access).toBe(false);
    }
  });

  it("rejects empty name", () => {
    expect(
      createCompanyContactSchema.safeParse({
        company_id: 1,
        contact_name: "",
      }).success,
    ).toBe(false);
  });

  it("rejects missing company_id", () => {
    expect(
      createCompanyContactSchema.safeParse({
        contact_name: "John",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      createCompanyContactSchema.safeParse({
        company_id: 1,
        contact_name: "John",
        contact_email: "not-an-email",
      }).success,
    ).toBe(false);
  });

  it("rejects negative company_id", () => {
    expect(
      createCompanyContactSchema.safeParse({
        company_id: -1,
        contact_name: "John",
      }).success,
    ).toBe(false);
  });
});

describe("updateCompanyContactSchema", () => {
  it("accepts valid update data", () => {
    const r = updateCompanyContactSchema.safeParse({
      uuid: "abc-def-123",
      contact_position: "Senior Manager",
      allow_access: true,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.uuid).toBe("abc-def-123");
      expect(r.data.contact_position).toBe("Senior Manager");
      expect(r.data.allow_access).toBe(true);
    }
  });

  it("accepts partial update (position only)", () => {
    const r = updateCompanyContactSchema.safeParse({
      uuid: "abc-def-123",
      contact_position: "Updated Position",
    });
    expect(r.success).toBe(true);
  });

  it("accepts partial update (access only)", () => {
    const r = updateCompanyContactSchema.safeParse({
      uuid: "abc-def-123",
      allow_access: false,
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(
      updateCompanyContactSchema.safeParse({
        uuid: "",
        allow_access: true,
      }).success,
    ).toBe(false);
  });
});

describe("listCompanyContactsRowsSchema", () => {
  it("accepts a valid contact UUID", () => {
    expect(
      listCompanyContactsRowsSchema.safeParse({ contactUuid: "abc-123-def" }).success,
    ).toBe(true);
  });

  it("rejects empty contact UUID", () => {
    expect(listCompanyContactsRowsSchema.safeParse({ contactUuid: "" }).success).toBe(false);
  });

  it("rejects missing contactUuid", () => {
    expect(listCompanyContactsRowsSchema.safeParse({}).success).toBe(false);
  });
});
