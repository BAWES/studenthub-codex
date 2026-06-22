import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  getCompanyLinksByContactSchema,
  findCompanyByIdSchema,
  getCompanyDetailTxSchema,
  updateCompanySchema,
  companyLinkOutputSchema,
  companyWithRelationsOutputSchema,
  companyDetailTxOutputSchema,
  companyUpdateResultOutputSchema,
  type CompanyLinkOutput,
  type CompanyWithRelationsOutput,
  type CompanyDetailTxOutput,
  type CompanyUpdateResultOutput,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests — getCompanyLinksByContactSchema
// ---------------------------------------------------------------------------

describe("getCompanyLinksByContactSchema", () => {
  it("accepts a valid contact UUID", () => {
    const result = getCompanyLinksByContactSchema.safeParse({
      contactUuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty contact UUID", () => {
    const result = getCompanyLinksByContactSchema.safeParse({ contactUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing contact UUID", () => {
    const result = getCompanyLinksByContactSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema tests — findCompanyByIdSchema
// ---------------------------------------------------------------------------

describe("findCompanyByIdSchema", () => {
  it("accepts a valid positive integer ID", () => {
    const result = findCompanyByIdSchema.safeParse({ companyId: 42 });
    expect(result.success).toBe(true);
  });

  it("rejects zero", () => {
    const result = findCompanyByIdSchema.safeParse({ companyId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative ID", () => {
    const result = findCompanyByIdSchema.safeParse({ companyId: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer", () => {
    const result = findCompanyByIdSchema.safeParse({ companyId: 1.5 });
    expect(result.success).toBe(false);
  });

  it("rejects missing companyId", () => {
    const result = findCompanyByIdSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema tests — getCompanyDetailTxSchema
// ---------------------------------------------------------------------------

describe("getCompanyDetailTxSchema", () => {
  it("accepts a valid positive integer ID", () => {
    const result = getCompanyDetailTxSchema.safeParse({ companyId: 99 });
    expect(result.success).toBe(true);
  });

  it("rejects zero", () => {
    const result = getCompanyDetailTxSchema.safeParse({ companyId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects missing companyId", () => {
    const result = getCompanyDetailTxSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema tests — updateCompanySchema
// ---------------------------------------------------------------------------

describe("updateCompanySchema", () => {
  it("accepts valid company ID with data", () => {
    const result = updateCompanySchema.safeParse({
      companyId: 42,
      data: { company_name: "Updated Corp" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty data object", () => {
    const result = updateCompanySchema.safeParse({
      companyId: 42,
      data: {},
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing companyId", () => {
    const result = updateCompanySchema.safeParse({
      data: { company_name: "Name" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing data field", () => {
    const result = updateCompanySchema.safeParse({ companyId: 42 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — companyLinkOutputSchema
// ---------------------------------------------------------------------------

describe("companyLinkOutputSchema", () => {
  it("accepts a valid link with company_id", () => {
    const result = companyLinkOutputSchema.safeParse({ company_id: 42 });
    expect(result.success).toBe(true);
  });

  it("accepts a null company_id", () => {
    const result = companyLinkOutputSchema.safeParse({ company_id: null });
    expect(result.success).toBe(true);
  });

  it("rejects missing company_id", () => {
    const result = companyLinkOutputSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — companyWithRelationsOutputSchema
// ---------------------------------------------------------------------------

describe("companyWithRelationsOutputSchema", () => {
  const validCompany = {
    company_id: 42,
    company_name: "ACME Corp",
    company_common_name_en: "ACME",
    company_common_name_ar: null,
    company_description_en: "A company",
    company_description_ar: null,
    company_website: "https://acme.com",
    company_email: "info@acme.com",
    company_logo: null,
    commercial_licence: "LIC-123",
    company_hourly_rate: null,
    company_bonus_commission: null,
    company_followup: true,
    total_candidate: 15,
    no_of_active_requests: 3,
    is_request_updates_in_30_days: false,
    company_approved_to_hire: true,
    company_status_override: null,
    company_created_at: new Date("2024-01-01"),
    company_updated_at: new Date("2024-06-01"),
    last_request_datetime: new Date("2024-05-01"),
    last_payment_datetime: null,
    country_id: 1,
    currency_code: "KWD",
    parent_company_id: null,
    country: { country_name_en: "Kuwait" },
    company: null,
    staff: { staff_name: "Jane Doe", staff_email: "jane@studenthub.ai" },
  };

  it("accepts a valid company with all fields", () => {
    const result = companyWithRelationsOutputSchema.safeParse(validCompany);
    expect(result.success).toBe(true);
  });

  it("accepts null company (when not found)", () => {
    const result = companyWithRelationsOutputSchema.safeParse(null);
    expect(result.success).toBe(true);
  });

  it("accepts nullable sub-objects", () => {
    const result = companyWithRelationsOutputSchema.safeParse({
      ...validCompany,
      country: null,
      staff: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = companyWithRelationsOutputSchema.safeParse({
      company_name: "No ID",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — companyDetailTxOutputSchema
// ---------------------------------------------------------------------------

describe("companyDetailTxOutputSchema", () => {
  const company = {
    company_id: 42,
    company_name: "ACME Corp",
    company_common_name_en: "ACME",
    company_common_name_ar: null,
    company_description_en: null,
    company_description_ar: null,
    company_website: null,
    company_email: null,
    company_logo: null,
    commercial_licence: null,
    company_hourly_rate: null,
    company_bonus_commission: null,
    company_followup: null,
    total_candidate: null,
    no_of_active_requests: null,
    is_request_updates_in_30_days: null,
    company_approved_to_hire: null,
    company_status_override: null,
    company_created_at: new Date("2024-01-01"),
    company_updated_at: new Date("2024-06-01"),
    last_request_datetime: null,
    last_payment_datetime: null,
    country_id: null,
    currency_code: null,
    parent_company_id: null,
    country: null,
    company: null,
    staff: null,
  };

  it("accepts a valid transaction tuple", () => {
    const result = companyDetailTxOutputSchema.safeParse([
      company,
      [
        {
          request_uuid: "req-uuid-1",
          request_position_title: "Engineer",
          request_status: "open",
          request_number_of_employees: 2,
          request_updated_datetime: new Date("2024-05-01"),
        },
      ],
      [
        {
          company_contact_uuid: "cc-uuid-1",
          contact_position: "Manager",
          allow_access: true,
          contact: { contact_name: "John", contact_email: "john@test.com" },
        },
      ],
      [
        { store_id: 1, store_name: "Main Branch", store_status: "active" },
      ],
      [
        {
          note_uuid: "note-uuid-1",
          note_type: "general",
          note_text: "Important note",
          note_created_datetime: new Date("2024-03-01"),
        },
      ],
    ]);
    expect(result.success).toBe(true);
  });

  it("accepts empty arrays for sub-collections", () => {
    const result = companyDetailTxOutputSchema.safeParse([
      company,
      [],
      [],
      [],
      [],
    ]);
    expect(result.success).toBe(true);
  });

  it("rejects wrong tuple length", () => {
    const result = companyDetailTxOutputSchema.safeParse([company]);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests — companyUpdateResultOutputSchema
// ---------------------------------------------------------------------------

describe("companyUpdateResultOutputSchema", () => {
  it("accepts a valid update result", () => {
    const result = companyUpdateResultOutputSchema.safeParse({
      company_id: 42,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing company_id", () => {
    const result = companyUpdateResultOutputSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-integer company_id", () => {
    const result = companyUpdateResultOutputSchema.safeParse({
      company_id: "not-a-number",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type-level tests (compile-time assertions)
// ---------------------------------------------------------------------------

describe("CompanyLinkOutput type", () => {
  it("accepts a valid link", () => {
    const link: CompanyLinkOutput = { company_id: 42 };
    expect(link.company_id).toBe(42);
  });

  it("accepts null company_id", () => {
    const link: CompanyLinkOutput = { company_id: null };
    expect(link.company_id).toBeNull();
  });
});

describe("CompanyWithRelationsOutput type", () => {
  it("accepts a valid full company object", () => {
    const company: CompanyWithRelationsOutput = {
      company_id: 42,
      company_name: "Test Corp",
      company_common_name_en: null,
      company_common_name_ar: null,
      company_description_en: null,
      company_description_ar: null,
      company_website: null,
      company_email: null,
      company_logo: null,
      commercial_licence: null,
      company_hourly_rate: null,
      company_bonus_commission: null,
      company_followup: null,
      total_candidate: null,
      no_of_active_requests: null,
      is_request_updates_in_30_days: null,
      company_approved_to_hire: null,
      company_status_override: null,
      company_created_at: new Date(),
      company_updated_at: new Date(),
      last_request_datetime: null,
      last_payment_datetime: null,
      country_id: null,
      currency_code: null,
      parent_company_id: null,
      country: null,
      company: null,
      staff: null,
    };
    expect(company.company_name).toBe("Test Corp");
  });
});

describe("CompanyUpdateResultOutput type", () => {
  it("accepts a valid result", () => {
    const result: CompanyUpdateResultOutput = { company_id: 1 };
    expect(result.company_id).toBe(1);
  });
});

describe("CompanyDetailTxOutput type", () => {
  it("accepts a 5-element tuple", () => {
    const tuple: CompanyDetailTxOutput = [null, [], [], [], []];
    expect(tuple.length).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// Zod type inference tests
// ---------------------------------------------------------------------------

describe("inferred types match schemas", () => {
  it("z.input unwraps for getCompanyLinksByContactSchema", () => {
    type Input = z.input<typeof getCompanyLinksByContactSchema>;
    const valid: Input = { contactUuid: "abc" };
    const parsed = getCompanyLinksByContactSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it("z.output unwraps for findCompanyByIdSchema", () => {
    type Output = z.output<typeof findCompanyByIdSchema>;
    const valid: Output = { companyId: 1 };
    const parsed = findCompanyByIdSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it("z.output unwraps for companyLinkOutputSchema", () => {
    type Output = z.output<typeof companyLinkOutputSchema>;
    const valid: Output = { company_id: 1 };
    const parsed = companyLinkOutputSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });
});
