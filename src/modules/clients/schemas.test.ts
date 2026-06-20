import { describe, it, expect } from "vitest";
import {
  listClientsSchema,
  getClientSchema,
  createClientSchema,
  updateClientSchema,
  clientListItemSchema,
  listClientsResultSchema,
  clientDetailSchema,
  getClientResultSchema,
  clientMutationResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listClientsSchema (input)
// ---------------------------------------------------------------------------
describe("listClientsSchema", () => {
  it("accepts valid params", () => {
    expect(
      listClientsSchema.safeParse({
        name: "Acme",
        staff_id: 1,
        approved_to_hire: 1,
        page: 1,
        limit: 20,
      }).success,
    ).toBe(true);
  });

  it("accepts empty object (all optional)", () => {
    expect(listClientsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts approved_to_hire as 0", () => {
    expect(
      listClientsSchema.safeParse({ approved_to_hire: 0 }).success,
    ).toBe(true);
  });

  it("accepts some fields only", () => {
    expect(
      listClientsSchema.safeParse({ page: 2, limit: 50 }).success,
    ).toBe(true);
  });

  it("rejects negative staff_id", () => {
    expect(
      listClientsSchema.safeParse({ staff_id: -1 }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listClientsSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(listClientsSchema.safeParse({ limit: 200 }).success).toBe(false);
  });

  it("rejects approved_to_hire outside 0/1", () => {
    expect(
      listClientsSchema.safeParse({ approved_to_hire: 2 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for name", () => {
    expect(
      listClientsSchema.safeParse({ name: 123 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for staff_id (string)", () => {
    expect(
      listClientsSchema.safeParse({ staff_id: "abc" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getClientSchema (input)
// ---------------------------------------------------------------------------
describe("getClientSchema", () => {
  it("accepts valid id", () => {
    expect(getClientSchema.safeParse({ id: 1 }).success).toBe(true);
  });

  it("rejects missing id", () => {
    expect(getClientSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-positive id", () => {
    expect(getClientSchema.safeParse({ id: 0 }).success).toBe(false);
  });

  it("rejects negative id", () => {
    expect(getClientSchema.safeParse({ id: -5 }).success).toBe(false);
  });

  it("rejects wrong type for id", () => {
    expect(getClientSchema.safeParse({ id: "abc" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createClientSchema (input)
// ---------------------------------------------------------------------------
describe("createClientSchema", () => {
  const valid = {
    name: "Acme Corp",
    common_name_en: "Acme",
    common_name_ar: "أكمي",
    description_en: "A company",
    description_ar: "شركة",
    website: "https://acme.com",
    email: "info@acme.com",
    hourly_rate: 150,
    bonus_commission: 10,
    approved_to_hire: 1,
    country_id: 1,
    currency_code: "KWD",
  };

  it("accepts valid input with all fields", () => {
    expect(createClientSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts input with only required fields", () => {
    expect(createClientSchema.safeParse({ name: "Acme" }).success).toBe(true);
  });

  it("accepts missing all optional fields", () => {
    expect(createClientSchema.safeParse({ name: "Acme" }).success).toBe(true);
  });

  it("rejects missing name", () => {
    expect(createClientSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty name", () => {
    expect(createClientSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("rejects name exceeding 255 chars", () => {
    expect(
      createClientSchema.safeParse({ name: "x".repeat(256) }).success,
    ).toBe(false);
  });

  it("rejects negative hourly_rate", () => {
    expect(
      createClientSchema.safeParse({ name: "Acme", hourly_rate: -10 }).success,
    ).toBe(false);
  });

  it("rejects zero hourly_rate", () => {
    expect(
      createClientSchema.safeParse({ name: "Acme", hourly_rate: 0 }).success,
    ).toBe(false);
  });

  it("rejects negative bonus_commission", () => {
    expect(
      createClientSchema.safeParse({ name: "Acme", bonus_commission: -1 }).success,
    ).toBe(false);
  });

  it("rejects approved_to_hire outside 0/1", () => {
    expect(
      createClientSchema.safeParse({ name: "Acme", approved_to_hire: 2 }).success,
    ).toBe(false);
  });

  it("rejects non-positive country_id", () => {
    expect(
      createClientSchema.safeParse({ name: "Acme", country_id: 0 }).success,
    ).toBe(false);
  });

  it("rejects wrong-length currency_code", () => {
    expect(
      createClientSchema.safeParse({ name: "Acme", currency_code: "US" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for name", () => {
    expect(createClientSchema.safeParse({ name: 123 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateClientSchema (input)
// ---------------------------------------------------------------------------
describe("updateClientSchema", () => {
  const valid = {
    id: 1,
    name: "Acme Corp Updated",
    common_name_en: "Acme",
    common_name_ar: "أكمي",
    description_en: "Updated description",
    description_ar: "وصف محدث",
    website: "https://acme.com",
    email: "info@acme.com",
    hourly_rate: 200,
    bonus_commission: 15,
    approved_to_hire: 0,
    country_id: 2,
    currency_code: "USD",
    staff_id: 3,
  };

  it("accepts valid update with all fields", () => {
    expect(updateClientSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts partial update with only id", () => {
    expect(updateClientSchema.safeParse({ id: 1 }).success).toBe(true);
  });

  it("accepts update with some optional fields", () => {
    expect(
      updateClientSchema.safeParse({ id: 1, name: "New Name", hourly_rate: 100 }).success,
    ).toBe(true);
  });

  it("rejects missing id", () => {
    expect(updateClientSchema.safeParse({ name: "Test" }).success).toBe(false);
  });

  it("rejects non-positive id", () => {
    expect(updateClientSchema.safeParse({ id: 0 }).success).toBe(false);
  });

  it("rejects empty name", () => {
    expect(updateClientSchema.safeParse({ id: 1, name: "" }).success).toBe(false);
  });

  it("rejects negative hourly_rate", () => {
    expect(
      updateClientSchema.safeParse({ id: 1, hourly_rate: -5 }).success,
    ).toBe(false);
  });

  it("rejects zero hourly_rate", () => {
    expect(
      updateClientSchema.safeParse({ id: 1, hourly_rate: 0 }).success,
    ).toBe(false);
  });

  it("rejects negative bonus_commission", () => {
    expect(
      updateClientSchema.safeParse({ id: 1, bonus_commission: -10 }).success,
    ).toBe(false);
  });

  it("rejects wrong-length currency_code", () => {
    expect(
      updateClientSchema.safeParse({ id: 1, currency_code: "KWDX" }).success,
    ).toBe(false);
  });

  it("rejects non-positive staff_id", () => {
    expect(
      updateClientSchema.safeParse({ id: 1, staff_id: 0 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for id", () => {
    expect(updateClientSchema.safeParse({ id: "abc" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// clientListItemSchema
// ---------------------------------------------------------------------------
describe("clientListItemSchema", () => {
  const valid = {
    company_id: 1,
    company_name: "Acme Corp",
    company_common_name_en: null,
    company_common_name_ar: null,
    company_email: null,
    company_hourly_rate: null,
    company_bonus_commission: null,
    company_approved_to_hire: true,
    company_status_override: false,
    company_created_at: new Date("2026-01-01"),
    company_updated_at: new Date("2026-06-01"),
    country_id: null,
    currency_code: null,
    staff_id: null,
    parent_company_id: null,
    deleted: 0,
  };

  it("accepts a valid client list item", () => {
    expect(clientListItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable company_common_name_en", () => {
    expect(
      clientListItemSchema.safeParse({ ...valid, company_common_name_en: null }).success,
    ).toBe(true);
  });

  it("accepts nullable company_common_name_ar", () => {
    expect(
      clientListItemSchema.safeParse({ ...valid, company_common_name_ar: null }).success,
    ).toBe(true);
  });

  it("accepts nullable company_email", () => {
    expect(
      clientListItemSchema.safeParse({ ...valid, company_email: null }).success,
    ).toBe(true);
  });

  it("accepts nullable company_hourly_rate", () => {
    expect(
      clientListItemSchema.safeParse({ ...valid, company_hourly_rate: null }).success,
    ).toBe(true);
  });

  it("accepts nullable company_bonus_commission", () => {
    expect(
      clientListItemSchema.safeParse({ ...valid, company_bonus_commission: null }).success,
    ).toBe(true);
  });

  it("accepts nullable country_id", () => {
    expect(
      clientListItemSchema.safeParse({ ...valid, country_id: null }).success,
    ).toBe(true);
  });

  it("accepts nullable currency_code", () => {
    expect(
      clientListItemSchema.safeParse({ ...valid, currency_code: null }).success,
    ).toBe(true);
  });

  it("accepts nullable staff_id", () => {
    expect(
      clientListItemSchema.safeParse({ ...valid, staff_id: null }).success,
    ).toBe(true);
  });

  it("accepts nullable parent_company_id", () => {
    expect(
      clientListItemSchema.safeParse({ ...valid, parent_company_id: null }).success,
    ).toBe(true);
  });

  it("rejects missing company_id", () => {
    const { company_id: _, ...rest } = valid;
    expect(clientListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company_name", () => {
    const { company_name: _, ...rest } = valid;
    expect(clientListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company_approved_to_hire", () => {
    const { company_approved_to_hire: _, ...rest } = valid;
    expect(clientListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company_created_at", () => {
    const { company_created_at: _, ...rest } = valid;
    expect(clientListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing deleted", () => {
    const { deleted: _, ...rest } = valid;
    expect(clientListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for company_id", () => {
    expect(
      clientListItemSchema.safeParse({ ...valid, company_id: "not-a-number" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for company_name", () => {
    expect(
      clientListItemSchema.safeParse({ ...valid, company_name: 123 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for company_approved_to_hire", () => {
    expect(
      clientListItemSchema.safeParse({ ...valid, company_approved_to_hire: 1 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for company_created_at", () => {
    expect(
      clientListItemSchema.safeParse({ ...valid, company_created_at: "2026-01-01" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for deleted", () => {
    expect(
      clientListItemSchema.safeParse({ ...valid, deleted: "abc" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listClientsResultSchema
// ---------------------------------------------------------------------------
describe("listClientsResultSchema", () => {
  const valid = {
    clients: [
      {
        company_id: 1,
        company_name: "Acme Corp",
        company_common_name_en: null,
        company_common_name_ar: null,
        company_email: null,
        company_hourly_rate: null,
        company_bonus_commission: null,
        company_approved_to_hire: true,
        company_status_override: false,
        company_created_at: new Date("2026-01-01"),
        company_updated_at: new Date("2026-06-01"),
        country_id: null,
        currency_code: null,
        staff_id: null,
        parent_company_id: null,
        deleted: 0,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid result", () => {
    expect(listClientsResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty clients array", () => {
    expect(
      listClientsResultSchema.safeParse({
        ...valid,
        clients: [],
        total: 0,
        totalPages: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects missing clients", () => {
    const { clients: _, ...rest } = valid;
    expect(listClientsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = valid;
    expect(listClientsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing page", () => {
    const { page: _, ...rest } = valid;
    expect(listClientsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listClientsResultSchema.safeParse({ ...valid, total: -1 }).success,
    ).toBe(false);
  });

  it("rejects negative page", () => {
    expect(
      listClientsResultSchema.safeParse({ ...valid, page: -1 }).success,
    ).toBe(false);
  });

  it("rejects non-array clients", () => {
    expect(
      listClientsResultSchema.safeParse({ ...valid, clients: "not-an-array" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for total", () => {
    expect(
      listClientsResultSchema.safeParse({ ...valid, total: "abc" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// clientDetailSchema
// ---------------------------------------------------------------------------
describe("clientDetailSchema", () => {
  const valid = {
    company_id: 1,
    company_name: "Acme Corp",
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
    company_approved_to_hire: true,
    company_status_override: false,
    company_followup: false,
    company_followup_interval_weeks: null,
    company_created_at: new Date("2026-01-01"),
    company_updated_at: new Date("2026-06-01"),
    last_request_datetime: null,
    last_payment_datetime: null,
    country_id: null,
    currency_code: null,
    staff_id: null,
    parent_company_id: null,
    total_candidate: null,
    no_of_active_requests: null,
    deleted: 0,
  };

  it("accepts a valid client detail", () => {
    expect(clientDetailSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable company_description_en", () => {
    expect(
      clientDetailSchema.safeParse({ ...valid, company_description_en: null }).success,
    ).toBe(true);
  });

  it("accepts nullable company_description_ar", () => {
    expect(
      clientDetailSchema.safeParse({ ...valid, company_description_ar: null }).success,
    ).toBe(true);
  });

  it("accepts nullable company_website", () => {
    expect(
      clientDetailSchema.safeParse({ ...valid, company_website: null }).success,
    ).toBe(true);
  });

  it("accepts nullable company_logo", () => {
    expect(
      clientDetailSchema.safeParse({ ...valid, company_logo: null }).success,
    ).toBe(true);
  });

  it("accepts nullable commercial_licence", () => {
    expect(
      clientDetailSchema.safeParse({ ...valid, commercial_licence: null }).success,
    ).toBe(true);
  });

  it("accepts nullable company_followup_interval_weeks", () => {
    expect(
      clientDetailSchema.safeParse({ ...valid, company_followup_interval_weeks: null }).success,
    ).toBe(true);
  });

  it("accepts nullable last_request_datetime", () => {
    expect(
      clientDetailSchema.safeParse({ ...valid, last_request_datetime: null }).success,
    ).toBe(true);
  });

  it("accepts nullable last_payment_datetime", () => {
    expect(
      clientDetailSchema.safeParse({ ...valid, last_payment_datetime: null }).success,
    ).toBe(true);
  });

  it("accepts nullable total_candidate", () => {
    expect(
      clientDetailSchema.safeParse({ ...valid, total_candidate: null }).success,
    ).toBe(true);
  });

  it("accepts nullable no_of_active_requests", () => {
    expect(
      clientDetailSchema.safeParse({ ...valid, no_of_active_requests: null }).success,
    ).toBe(true);
  });

  it("accepts total_candidate as integer string (union with bigint)", () => {
    // total_candidate accepts z.number().int() or z.bigint()
    expect(
      clientDetailSchema.safeParse({ ...valid, total_candidate: 42 }).success,
    ).toBe(true);
  });

  it("rejects missing company_id", () => {
    const { company_id: _, ...rest } = valid;
    expect(clientDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company_name", () => {
    const { company_name: _, ...rest } = valid;
    expect(clientDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company_approved_to_hire", () => {
    const { company_approved_to_hire: _, ...rest } = valid;
    expect(clientDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company_followup", () => {
    const { company_followup: _, ...rest } = valid;
    expect(clientDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing company_created_at", () => {
    const { company_created_at: _, ...rest } = valid;
    expect(clientDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing deleted", () => {
    const { deleted: _, ...rest } = valid;
    expect(clientDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for company_id", () => {
    expect(
      clientDetailSchema.safeParse({ ...valid, company_id: "abc" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for company_approved_to_hire", () => {
    expect(
      clientDetailSchema.safeParse({ ...valid, company_approved_to_hire: 1 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for company_created_at", () => {
    expect(
      clientDetailSchema.safeParse({ ...valid, company_created_at: "2026-01-01" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for total_candidate", () => {
    expect(
      clientDetailSchema.safeParse({ ...valid, total_candidate: "abc" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getClientResultSchema (nullable)
// ---------------------------------------------------------------------------
describe("getClientResultSchema", () => {
  it("accepts a valid client detail", () => {
    const result = getClientResultSchema.safeParse({
      company_id: 1,
      company_name: "Acme Corp",
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
      company_approved_to_hire: true,
      company_status_override: false,
      company_followup: false,
      company_followup_interval_weeks: null,
      company_created_at: new Date("2026-01-01"),
      company_updated_at: new Date("2026-06-01"),
      last_request_datetime: null,
      last_payment_datetime: null,
      country_id: null,
      currency_code: null,
      staff_id: null,
      parent_company_id: null,
      total_candidate: null,
      no_of_active_requests: null,
      deleted: 0,
    });
    expect(result.success).toBe(true);
  });

  it("accepts null", () => {
    expect(getClientResultSchema.safeParse(null).success).toBe(true);
  });

  it("rejects invalid data", () => {
    expect(getClientResultSchema.safeParse({ company_id: "abc" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// clientMutationResultSchema
// ---------------------------------------------------------------------------
describe("clientMutationResultSchema", () => {
  it("accepts a valid mutation result", () => {
    expect(
      clientMutationResultSchema.safeParse({ company_id: 1 }).success,
    ).toBe(true);
  });

  it("rejects missing company_id", () => {
    expect(clientMutationResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects wrong type for company_id", () => {
    expect(
      clientMutationResultSchema.safeParse({ company_id: "abc" }).success,
    ).toBe(false);
  });
});
