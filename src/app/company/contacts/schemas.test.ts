import { describe, it, expect } from "vitest";
import {
  listCompanyContactsSchema,
  getCompanyContactSchema,
  createCompanyContactSchema,
  updateCompanyContactSchema,
  companyContactListItemSchema,
  listCompanyContactsResultSchema,
  companyContactDetailSchema,
  companyContactUuidResultSchema,
  companyContactRowSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listCompanyContactsSchema
// ---------------------------------------------------------------------------
describe("listCompanyContactsSchema", () => {
  it("accepts empty input", () => {
    expect(listCompanyContactsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts explicit values", () => {
    expect(listCompanyContactsSchema.safeParse({ company_id: 1, page: 2, limit: 50 }).success).toBe(true);
  });

  it("rejects zero page", () => {
    expect(listCompanyContactsSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects limit below 1", () => {
    expect(listCompanyContactsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listCompanyContactsSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects zero company_id", () => {
    expect(listCompanyContactsSchema.safeParse({ company_id: 0 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getCompanyContactSchema
// ---------------------------------------------------------------------------
describe("getCompanyContactSchema", () => {
  it("accepts valid input", () => {
    expect(getCompanyContactSchema.safeParse({ uuid: "contact-123" }).success).toBe(true);
  });

  it("rejects missing uuid", () => {
    expect(getCompanyContactSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty uuid", () => {
    expect(getCompanyContactSchema.safeParse({ uuid: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createCompanyContactSchema
// ---------------------------------------------------------------------------
describe("createCompanyContactSchema", () => {
  const valid = {
    company_id: 1,
    contact_name: "John Doe",
  };

  it("accepts valid input", () => {
    expect(createCompanyContactSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts with all optionals", () => {
    expect(
      createCompanyContactSchema.safeParse({
        ...valid,
        contact_email: "john@example.com",
        contact_position: "Manager",
        allow_access: true,
      }).success,
    ).toBe(true);
  });

  it("rejects missing company_id", () => {
    expect(createCompanyContactSchema.safeParse({ contact_name: "John" }).success).toBe(false);
  });

  it("rejects missing contact_name", () => {
    expect(createCompanyContactSchema.safeParse({ company_id: 1 }).success).toBe(false);
  });

  it("rejects empty contact_name", () => {
    expect(createCompanyContactSchema.safeParse({ ...valid, contact_name: "" }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      createCompanyContactSchema.safeParse({ ...valid, contact_email: "not-email" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateCompanyContactSchema
// ---------------------------------------------------------------------------
describe("updateCompanyContactSchema", () => {
  it("accepts minimal input (just uuid)", () => {
    expect(updateCompanyContactSchema.safeParse({ uuid: "contact-1" }).success).toBe(true);
  });

  it("accepts full input", () => {
    expect(
      updateCompanyContactSchema.safeParse({ uuid: "contact-1", contact_position: "Director", allow_access: true })
        .success,
    ).toBe(true);
  });

  it("rejects missing uuid", () => {
    expect(updateCompanyContactSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty uuid", () => {
    expect(updateCompanyContactSchema.safeParse({ uuid: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyContactListItemSchema (output)
// ---------------------------------------------------------------------------
describe("companyContactListItemSchema", () => {
  const validItem = {
    company_contact_uuid: "uuid-1",
    company_id: null,
    contact_position: null,
    allow_access: null,
    contact_name: null,
    contact_email: null,
    company_name: null,
  };

  it("accepts valid item with nullable fields", () => {
    expect(companyContactListItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts non-null values", () => {
    expect(
      companyContactListItemSchema.safeParse({
        ...validItem,
        company_id: 1,
        contact_name: "John Doe",
        allow_access: true,
      }).success,
    ).toBe(true);
  });

  it("rejects missing company_contact_uuid", () => {
    const { company_contact_uuid: _, ...rest } = validItem;
    expect(companyContactListItemSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCompanyContactsResultSchema (output)
// ---------------------------------------------------------------------------
describe("listCompanyContactsResultSchema", () => {
  const validResult = {
    contacts: [{
      company_contact_uuid: "uuid-1",
      company_id: null,
      contact_position: null,
      allow_access: null,
      contact_name: null,
      contact_email: null,
      company_name: null,
    }],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts valid result", () => {
    expect(listCompanyContactsResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts empty contacts array", () => {
    expect(
      listCompanyContactsResultSchema.safeParse({ ...validResult, contacts: [], total: 0, totalPages: 0 })
        .success,
    ).toBe(true);
  });

  it("rejects missing contacts", () => {
    const { contacts: _, ...rest } = validResult;
    expect(listCompanyContactsResultSchema.safeParse(rest).success).toBe(false);
  });

  // Note: total uses plain z.number() without nonnegative() — allowed by schema
  it("accepts negative total (schema has no nonnegative constraint)", () => {
    expect(listCompanyContactsResultSchema.safeParse({ ...validResult, total: -1 }).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// companyContactDetailSchema (output — nullable)
// ---------------------------------------------------------------------------
describe("companyContactDetailSchema", () => {
  const validDetail = {
    company_contact_uuid: "uuid-1",
    contact_uuid: null,
    company_id: null,
    contact_position: null,
    allow_access: null,
    created_at: new Date(),
    updated_at: new Date(),
    contact_name: null,
    contact_email: null,
    company_name: null,
  };

  it("accepts valid detail", () => {
    expect(companyContactDetailSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts null (nullable wrapper)", () => {
    expect(companyContactDetailSchema.safeParse(null).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// companyContactUuidResultSchema (output)
// ---------------------------------------------------------------------------
describe("companyContactUuidResultSchema", () => {
  it("accepts valid result", () => {
    expect(companyContactUuidResultSchema.safeParse({ company_contact_uuid: "uuid-1" }).success).toBe(true);
  });

  it("rejects missing uuid", () => {
    expect(companyContactUuidResultSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// companyContactRowSchema (output)
// ---------------------------------------------------------------------------
describe("companyContactRowSchema", () => {
  const validRow = {
    id: "uuid-1",
    name: "John Doe",
    email: "john@example.com",
    position: "Manager",
    companyName: "Test Corp",
    allowAccess: true,
  };

  it("accepts valid row", () => {
    expect(companyContactRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("rejects missing name", () => {
    const { name: _, ...rest } = validRow;
    expect(companyContactRowSchema.safeParse(rest).success).toBe(false);
  });
});
