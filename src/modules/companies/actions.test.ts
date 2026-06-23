import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/prisma", () => ({
  prisma: {
    company: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    company_contact: {
      findMany: vi.fn(),
    },
    request: {
      findMany: vi.fn(),
    },
    store: {
      findMany: vi.fn(),
    },
    note: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn(),
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: vi.fn((d: unknown) => d instanceof Date ? d.toISOString().slice(0, 10) : String(d ?? "")),
  formatMoney: vi.fn((_v: unknown, c = "KWD") => `15.500 ${c}`),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import {
  listCompaniesSchema,
  getCompanySchema,
  createCompanySchema,
  updateCompanySchema,
  companyListItemSchema,
  listCompaniesResultSchema,
  companyDetailSchema,
  companyCreateResultSchema,
  companyAccountRowSchema,
  companyAccountDetailOutputSchema,
} from "./schemas";

const { prisma } = await import("@/lib/prisma");
const actions = await import("./actions");

// ---------------------------------------------------------------------------
// Input schema: listCompaniesSchema
// ---------------------------------------------------------------------------

describe("listCompaniesSchema", () => {
  it("accepts empty params with all defaults", () => {
    const r = listCompaniesSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBeUndefined();
      expect(r.data.limit).toBeUndefined();
      expect(r.data.search).toBeUndefined();
      expect(r.data.country_id).toBeUndefined();
      expect(r.data.currency_code).toBeUndefined();
    }
  });

  it("accepts pagination params", () => {
    const r = listCompaniesSchema.safeParse({ page: 2, limit: 50 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(50);
    }
  });

  it("accepts search and filter params", () => {
    const r = listCompaniesSchema.safeParse({
      search: "Kuwait Co",
      country_id: 1,
      currency_code: "KWD",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.search).toBe("Kuwait Co");
      expect(r.data.country_id).toBe(1);
      expect(r.data.currency_code).toBe("KWD");
    }
  });

  it("rejects negative page", () => {
    expect(listCompaniesSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects zero page", () => {
    expect(listCompaniesSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects limit exceeding 100", () => {
    expect(listCompaniesSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("rejects limit below 1", () => {
    expect(listCompaniesSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects empty search string", () => {
    expect(listCompaniesSchema.safeParse({ search: "" }).success).toBe(false);
  });

  it("rejects search over 255 chars", () => {
    expect(
      listCompaniesSchema.safeParse({ search: "x".repeat(256) }).success,
    ).toBe(false);
  });

  it("rejects currency_code over 3 chars", () => {
    expect(
      listCompaniesSchema.safeParse({ currency_code: "KWDX" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema: getCompanySchema
// ---------------------------------------------------------------------------

describe("getCompanySchema", () => {
  it("accepts a valid company ID", () => {
    const r = getCompanySchema.safeParse({ companyId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.companyId).toBe(42);
    }
  });

  it("rejects zero company ID", () => {
    expect(getCompanySchema.safeParse({ companyId: 0 }).success).toBe(false);
  });

  it("rejects negative company ID", () => {
    expect(getCompanySchema.safeParse({ companyId: -1 }).success).toBe(false);
  });

  it("rejects missing companyId", () => {
    expect(getCompanySchema.safeParse({}).success).toBe(false);
  });

  it("rejects string companyId (no coercion)", () => {
    expect(getCompanySchema.safeParse({ companyId: "abc" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema: createCompanySchema
// ---------------------------------------------------------------------------

describe("createCompanySchema", () => {
  it("accepts minimal required fields", () => {
    const r = createCompanySchema.safeParse({
      company_name: "Acme Corp",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.company_name).toBe("Acme Corp");
    }
  });

  it("accepts full company data", () => {
    const r = createCompanySchema.safeParse({
      company_name: "Acme Corp",
      company_common_name_en: "Acme",
      company_common_name_ar: "أكمي",
      company_description_en: "A company",
      company_description_ar: "شركة",
      company_website: "https://acme.com",
      company_email: "info@acme.com",
      commercial_licence: "LIC-12345",
      country_id: 1,
      currency_code: "KWD",
      company_hourly_rate: 15.5,
      company_bonus_commission: 10,
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty company_name", () => {
    const r = createCompanySchema.safeParse({ company_name: "" });
    expect(r.success).toBe(false);
    expect(r.error!.errors[0]?.message).toBe("Company name is required");
  });

  it("rejects company_name over 255 chars", () => {
    expect(
      createCompanySchema.safeParse({
        company_name: "x".repeat(256),
      }).success,
    ).toBe(false);
  });

  it("rejects invalid URL for website", () => {
    expect(
      createCompanySchema.safeParse({
        company_name: "Acme",
        company_website: "not-a-url",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      createCompanySchema.safeParse({
        company_name: "Acme",
        company_email: "not-an-email",
      }).success,
    ).toBe(false);
  });

  it("rejects company_email over 225 chars", () => {
    expect(
      createCompanySchema.safeParse({
        company_name: "Acme",
        company_email: "a@".repeat(150) + ".com",
      }).success,
    ).toBe(false);
  });

  it("accepts nullable optional fields", () => {
    const r = createCompanySchema.safeParse({
      company_name: "Acme",
      company_website: undefined,
      company_email: undefined,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative hourly rate", () => {
    expect(
      createCompanySchema.safeParse({
        company_name: "Acme",
        company_hourly_rate: -5,
      }).success,
    ).toBe(false);
  });

  it("rejects bonus commission over 100", () => {
    expect(
      createCompanySchema.safeParse({
        company_name: "Acme",
        company_bonus_commission: 101,
      }).success,
    ).toBe(false);
  });

  it("rejects bonus commission below 0", () => {
    expect(
      createCompanySchema.safeParse({
        company_name: "Acme",
        company_bonus_commission: -1,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Input schema: updateCompanySchema
// ---------------------------------------------------------------------------

describe("updateCompanySchema", () => {
  it("accepts a partial update with company ID", () => {
    const r = updateCompanySchema.safeParse({
      companyId: 42,
      company_name: "Updated Name",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.companyId).toBe(42);
      expect(r.data.company_name).toBe("Updated Name");
    }
  });

  it("accepts a full update", () => {
    const r = updateCompanySchema.safeParse({
      companyId: 1,
      company_name: "Acme Corp",
      company_common_name_en: "Acme",
      company_common_name_ar: "أكمي",
      company_description_en: "Updated",
      company_website: "https://acme.com",
      company_email: "info@acme.com",
      commercial_licence: "LIC-999",
      country_id: 2,
      currency_code: "USD",
      company_hourly_rate: 20,
      company_bonus_commission: 5,
      company_followup: true,
      company_approved_to_hire: true,
      company_status_override: false,
      parent_company_id: 10,
    });
    expect(r.success).toBe(true);
  });

  it("accepts update with only boolean fields", () => {
    const r = updateCompanySchema.safeParse({
      companyId: 1,
      company_followup: false,
      company_approved_to_hire: true,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing companyId", () => {
    expect(updateCompanySchema.safeParse({}).success).toBe(false);
  });

  it("rejects zero companyId", () => {
    expect(
      updateCompanySchema.safeParse({ companyId: 0 }).success,
    ).toBe(false);
  });

  it("rejects empty company_name string", () => {
    expect(
      updateCompanySchema.safeParse({
        companyId: 1,
        company_name: "",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: companyListItemSchema
// ---------------------------------------------------------------------------

describe("companyListItemSchema", () => {
  it("accepts a valid company list item", () => {
    const r = companyListItemSchema.safeParse({
      company_id: 1,
      company_name: "Acme Corp",
      company_email: "info@acme.com",
      company_website: "https://acme.com",
      country_name: "Kuwait",
      country_id: 1,
      no_of_active_requests: 5,
      total_candidate: 42,
      company_updated_at: new Date("2026-01-01"),
      currency_code: "KWD",
      commercial_licence: "LIC-001",
    });
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = companyListItemSchema.safeParse({
      company_id: 2,
      company_name: "Test Co",
      company_email: null,
      company_website: null,
      country_name: null,
      country_id: null,
      no_of_active_requests: null,
      total_candidate: null,
      company_updated_at: new Date(),
      currency_code: null,
      commercial_licence: null,
    });
    expect(r.success).toBe(true);
  });

  it("accepts total_candidate as bigint", () => {
    const r = companyListItemSchema.safeParse({
      company_id: 3,
      company_name: "Big Co",
      company_email: null,
      company_website: null,
      country_name: null,
      country_id: null,
      no_of_active_requests: null,
      total_candidate: BigInt(1000),
      company_updated_at: new Date(),
      currency_code: "KWD",
      commercial_licence: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required company_id", () => {
    expect(
      companyListItemSchema.safeParse({
        company_name: "Acme",
      }).success,
    ).toBe(false);
  });

  it("rejects missing company_name", () => {
    expect(
      companyListItemSchema.safeParse({
        company_id: 1,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: listCompaniesResultSchema
// ---------------------------------------------------------------------------

describe("listCompaniesResultSchema", () => {
  it("accepts empty company list", () => {
    const r = listCompaniesResultSchema.safeParse({
      companies: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(r.success).toBe(true);
  });

  it("accepts populated company list", () => {
    const r = listCompaniesResultSchema.safeParse({
      companies: [
        {
          company_id: 1,
          company_name: "Acme Corp",
          company_email: null,
          company_website: null,
          country_name: null,
          country_id: null,
          no_of_active_requests: null,
          total_candidate: null,
          company_updated_at: new Date(),
          currency_code: null,
          commercial_licence: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing companies array", () => {
    expect(
      listCompaniesResultSchema.safeParse({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: companyDetailSchema
// ---------------------------------------------------------------------------

describe("companyDetailSchema", () => {
  it("accepts a valid company detail object", () => {
    const r = companyDetailSchema.safeParse({
      company_id: 1,
      parent_company_id: null,
      company_name: "Acme Corp",
      company_common_name_en: "Acme",
      company_common_name_ar: null,
      company_description_en: "Description",
      company_description_ar: null,
      company_website: "https://acme.com",
      company_email: "info@acme.com",
      company_logo: null,
      commercial_licence: "LIC-001",
      company_hourly_rate: 15.5,
      company_bonus_commission: 10,
      company_followup: null,
      total_candidate: 42,
      no_of_active_requests: 3,
      is_request_updates_in_30_days: true,
      company_approved_to_hire: true,
      company_status_override: false,
      company_created_at: new Date("2025-01-01"),
      company_updated_at: new Date("2026-06-01"),
      last_request_datetime: new Date("2026-05-01"),
      last_payment_datetime: null,
      country_id: 1,
      currency_code: "KWD",
      country_name: "Kuwait",
      parent_company_name: null,
      staff_name: "John",
    });
    expect(r.success).toBe(true);
  });

  it("accepts all-null optional fields", () => {
    const r = companyDetailSchema.safeParse({
      company_id: 1,
      parent_company_id: null,
      company_name: "Test Co",
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
      country_name: null,
      parent_company_name: null,
      staff_name: null,
    });
    expect(r.success).toBe(true);
  });

  it("accepts total_candidate as bigint", () => {
    const r = companyDetailSchema.safeParse({
      company_id: 1,
      parent_company_id: null,
      company_name: "Test Co",
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
      total_candidate: BigInt(500),
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
      country_name: null,
      parent_company_name: null,
      staff_name: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing company_name", () => {
    expect(
      companyDetailSchema.safeParse({ company_id: 1 }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: companyCreateResultSchema
// ---------------------------------------------------------------------------

describe("companyCreateResultSchema", () => {
  it("accepts a valid creation result", () => {
    const r = companyCreateResultSchema.safeParse({ company_id: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.company_id).toBe(42);
    }
  });

  it("rejects missing company_id", () => {
    expect(companyCreateResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects string company_id", () => {
    expect(
      companyCreateResultSchema.safeParse({ company_id: "abc" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: companyAccountRowSchema
// ---------------------------------------------------------------------------

describe("companyAccountRowSchema", () => {
  it("accepts a valid account row", () => {
    const r = companyAccountRowSchema.safeParse({
      id: 1,
      name: "Acme Corp",
      email: "info@acme.com",
      country: "Kuwait",
      requests: 3,
      status: "Approved",
      rate: "15.500 KWD",
      updated: "2026-06-01",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    expect(
      companyAccountRowSchema.safeParse({ id: 1 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for id", () => {
    expect(
      companyAccountRowSchema.safeParse({
        id: "abc",
        name: "Acme",
        email: "a@b.com",
        country: "KW",
        requests: 1,
        status: "Active",
        rate: "10",
        updated: "2025-01-01",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema: companyAccountDetailOutputSchema
// ---------------------------------------------------------------------------

describe("companyAccountDetailOutputSchema", () => {
  it("accepts a full account detail output", () => {
    const r = companyAccountDetailOutputSchema.safeParse({
      company: { company_id: 1, company_name: "Acme Corp" },
      metrics: [
        { label: "Requests", value: "12", note: "Active requests" },
        { label: "Rate", value: 15.5, note: "Avg hourly rate" },
      ],
      requests: [
        { id: "req-1", title: "Software Engineer", subtitle: "Pending", meta: "KWD" },
      ],
      contacts: [
        { id: "contact-1", title: "John Doe", subtitle: "Manager", meta: "john@acme.com" },
      ],
      stores: [
        { id: 1, title: "Main Branch", subtitle: "Kuwait City", meta: "Active" },
      ],
      notes: [
        { id: "note-1", title: "Follow-up needed", subtitle: "Yesterday", meta: "Urgent" },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("accepts null (no detail data)", () => {
    const r = companyAccountDetailOutputSchema.safeParse(null);
    expect(r.success).toBe(true);
  });

  it("accepts empty arrays", () => {
    const r = companyAccountDetailOutputSchema.safeParse({
      company: null,
      metrics: [],
      requests: [],
      contacts: [],
      stores: [],
      notes: [],
    });
    expect(r.success).toBe(true);
  });

  it("accepts numeric and string metric values", () => {
    const r = companyAccountDetailOutputSchema.safeParse({
      company: null,
      metrics: [
        { label: "Count", value: 42, note: "Numeric" },
        { label: "Rate", value: "15.500 KWD", note: "String value" },
      ],
      requests: [],
      contacts: [],
      stores: [],
      notes: [],
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing metrics", () => {
    const r = companyAccountDetailOutputSchema.safeParse({
      company: null,
      requests: [],
      contacts: [],
      stores: [],
      notes: [],
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Server Action: listCompanies
// ---------------------------------------------------------------------------

describe("listCompanies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated list with default params", async () => {
    const mockCompanies = [
      {
        company_id: 1,
        company_name: "Acme Corp",
        company_email: "info@acme.com",
        company_website: "https://acme.com",
        country_id: 1,
        no_of_active_requests: 3,
        total_candidate: 42,
        company_updated_at: new Date("2026-06-01"),
        currency_code: "KWD",
        commercial_licence: "LIC-001",
        country: { country_name_en: "Kuwait" },
      },
    ];

    vi.mocked(prisma.company.findMany).mockResolvedValue(mockCompanies as any);
    vi.mocked(prisma.company.count).mockResolvedValue(1);

    const result = await actions.listCompanies({});

    expect(result.companies).toHaveLength(1);
    expect(result.companies[0].company_name).toBe("Acme Corp");
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(1);
    expect(prisma.company.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 20,
        orderBy: { company_updated_at: "desc" },
      }),
    );
  });

  it("filters by search term", async () => {
    vi.mocked(prisma.company.findMany).mockResolvedValue([]);
    vi.mocked(prisma.company.count).mockResolvedValue(0);

    await actions.listCompanies({ search: "Kuwait" });

    expect(prisma.company.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { company_name: { contains: "Kuwait" } },
            { company_common_name_en: { contains: "Kuwait" } },
            { company_email: { contains: "Kuwait" } },
          ],
        }),
      }),
    );
  });

  it("filters by country_id", async () => {
    vi.mocked(prisma.company.findMany).mockResolvedValue([]);
    vi.mocked(prisma.company.count).mockResolvedValue(0);

    await actions.listCompanies({ country_id: 1 });

    expect(prisma.company.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ country_id: 1 }),
      }),
    );
  });

  it("filters by currency_code", async () => {
    vi.mocked(prisma.company.findMany).mockResolvedValue([]);
    vi.mocked(prisma.company.count).mockResolvedValue(0);

    await actions.listCompanies({ currency_code: "KWD" });

    expect(prisma.company.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ currency_code: "KWD" }),
      }),
    );
  });

  it("validates that deleted: 0 is always in where clause", async () => {
    vi.mocked(prisma.company.findMany).mockResolvedValue([]);
    vi.mocked(prisma.company.count).mockResolvedValue(0);

    await actions.listCompanies({});

    expect(prisma.company.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ deleted: 0 }),
      }),
    );
  });

  it("respects custom pagination", async () => {
    vi.mocked(prisma.company.findMany).mockResolvedValue([]);
    vi.mocked(prisma.company.count).mockResolvedValue(0);

    const result = await actions.listCompanies({ page: 3, limit: 10 });

    expect(result.page).toBe(3);
    expect(result.limit).toBe(10);
    expect(prisma.company.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 }),
    );
  });

  it("throws on invalid schema params", async () => {
    await expect(actions.listCompanies({ page: -1 })).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Server Action: getCompany
// ---------------------------------------------------------------------------

describe("getCompany", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns company detail when found", async () => {
    const mockCompany = {
      company_id: 1,
      parent_company_id: null,
      company_name: "Acme Corp",
      company_common_name_en: "Acme",
      company_common_name_ar: null,
      company_description_en: "A company",
      company_description_ar: null,
      company_website: "https://acme.com",
      company_email: "info@acme.com",
      company_logo: null,
      commercial_licence: "LIC-001",
      company_hourly_rate: 15.5,
      company_bonus_commission: 10,
      company_followup: null,
      total_candidate: 42,
      no_of_active_requests: 3,
      is_request_updates_in_30_days: true,
      company_approved_to_hire: true,
      company_status_override: false,
      company_created_at: new Date("2025-01-01"),
      company_updated_at: new Date("2026-06-01"),
      last_request_datetime: new Date("2026-05-01"),
      last_payment_datetime: null,
      country_id: 1,
      currency_code: "KWD",
      country: { country_name_en: "Kuwait" },
      company: null,
      staff: { staff_name: "John" },
    };

    vi.mocked(prisma.company.findUnique).mockResolvedValue(mockCompany as any);

    const result = await actions.getCompany(1);

    expect(result).not.toBeNull();
    expect(result!.company_name).toBe("Acme Corp");
    expect(result!.country_name).toBe("Kuwait");
    expect(result!.staff_name).toBe("John");
    expect(prisma.company.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { company_id: 1 },
      }),
    );
  });

  it("returns null when company not found", async () => {
    vi.mocked(prisma.company.findUnique).mockResolvedValue(null);

    const result = await actions.getCompany(999);
    expect(result).toBeNull();
  });

  it("throws on invalid company ID", async () => {
    await expect(actions.getCompany(0)).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Server Action: createCompany
// ---------------------------------------------------------------------------

describe("createCompany", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a company with minimal data", async () => {
    vi.mocked(prisma.company.create).mockResolvedValue({ company_id: 42 } as any);

    const result = await actions.createCompany({ company_name: "New Co" });

    expect(result.company_id).toBe(42);
    expect(prisma.company.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          company_name: "New Co",
          currency_code: "KWD",
        }),
      }),
    );
  });

  it("creates a company with all optional fields", async () => {
    vi.mocked(prisma.company.create).mockResolvedValue({ company_id: 99 } as any);

    const result = await actions.createCompany({
      company_name: "Full Co",
      company_common_name_en: "FC",
      company_common_name_ar: "شركة",
      company_description_en: "A full company",
      company_description_ar: "شركة كاملة",
      company_website: "https://fullco.com",
      company_email: "info@fullco.com",
      commercial_licence: "LIC-999",
      country_id: 2,
      currency_code: "USD",
      company_hourly_rate: 20,
      company_bonus_commission: 5,
    });

    expect(result.company_id).toBe(99);
    expect(prisma.company.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          company_name: "Full Co",
          country_id: 2,
          currency_code: "USD",
          company_hourly_rate: 20,
        }),
      }),
    );
  });

  it("throws on missing company_name", async () => {
    await expect(actions.createCompany({} as any)).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Server Action: updateCompany
// ---------------------------------------------------------------------------

describe("updateCompany", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a company with partial fields", async () => {
    vi.mocked(prisma.company.update).mockResolvedValue({ company_id: 1 } as any);

    const result = await actions.updateCompany({
      companyId: 1,
      company_name: "Updated Name",
      company_hourly_rate: 25,
    });

    expect(result.company_id).toBe(1);
    expect(prisma.company.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { company_id: 1 },
        data: expect.objectContaining({
          company_name: "Updated Name",
          company_hourly_rate: 25,
        }),
      }),
    );
  });

  it("updates boolean fields correctly", async () => {
    vi.mocked(prisma.company.update).mockResolvedValue({ company_id: 1 } as any);

    await actions.updateCompany({
      companyId: 1,
      company_approved_to_hire: true,
      company_followup: false,
    });

    expect(prisma.company.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { company_id: 1 },
        data: expect.objectContaining({
          company_approved_to_hire: true,
          company_followup: false,
        }),
      }),
    );
  });

  it("throws on missing companyId", async () => {
    await expect(actions.updateCompany({} as any)).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Server Action: listCompanyAccountRows
// ---------------------------------------------------------------------------

describe("listCompanyAccountRows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns company rows scoped to contact's linked companies", async () => {
    vi.mocked(prisma.company_contact.findMany).mockResolvedValue([
      { company_id: 1, allow_access: true },
      { company_id: 2, allow_access: true },
    ] as any);

    vi.mocked(prisma.company.findMany).mockResolvedValue([
      {
        company_id: 1,
        company_name: "Acme Corp",
        company_email: "info@acme.com",
        no_of_active_requests: 3,
        company_approved_to_hire: true,
        company_hourly_rate: 15.5,
        currency_code: "KWD",
        company_updated_at: new Date("2026-06-01"),
        country: { country_name_en: "Kuwait" },
      },
    ] as any);

    const result = await actions.listCompanyAccountRows("contact-uuid-abc");

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Acme Corp");
    expect(result[0].status).toBe("Approved");
    expect(result[0].rate).toBe("15.500 KWD");
    expect(prisma.company_contact.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { contact_uuid: "contact-uuid-abc", allow_access: true },
      }),
    );
  });

  it("returns empty array when contact has no linked companies", async () => {
    vi.mocked(prisma.company_contact.findMany).mockResolvedValue([]);

    const result = await actions.listCompanyAccountRows("uuid-no-links");
    expect(result).toEqual([]);
  });

  it("creates rows using companyAccountRowSchema", async () => {
    vi.mocked(prisma.company_contact.findMany).mockResolvedValue([
      { company_id: 1, allow_access: true },
    ] as any);

    vi.mocked(prisma.company.findMany).mockResolvedValue([
      {
        company_id: 1,
        company_name: "Test Co",
        company_email: null,
        no_of_active_requests: 0,
        company_approved_to_hire: false,
        company_hourly_rate: null,
        currency_code: null,
        company_updated_at: new Date("2026-01-01"),
        country: { country_name_en: null },
      },
    ] as any);

    const result = await actions.listCompanyAccountRows("uuid");

    expect(result[0].email).toBe("No email");
    expect(result[0].country).toBe("No country");
    expect(result[0].status).toBe("Not approved");
    expect(result[0].rate).toBe("15.500 KWD");
  });
});

// ---------------------------------------------------------------------------
// Server Action: getCompanyAccountDetail
// ---------------------------------------------------------------------------

describe("getCompanyAccountDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns full company account detail", async () => {
    vi.mocked(prisma.company_contact.findMany).mockResolvedValue([
      { company_id: 1, allow_access: true },
    ] as any);

    const mockCompany = {
      company_id: 1,
      company_name: "Acme Corp",
      company_common_name_en: "Acme",
      company_email: "info@acme.com",
      company_website: "https://acme.com",
      company_approved_to_hire: true,
      company_hourly_rate: 15.5,
      currency_code: "KWD",
      no_of_active_requests: 3,
      company_created_at: new Date("2025-01-01"),
      company_updated_at: new Date("2026-06-01"),
      staff: { staff_name: "John", staff_email: "john@co.com" },
      country: { country_name_en: "Kuwait" },
    };

    vi.mocked(prisma.$transaction).mockResolvedValue([
      mockCompany,
      [],
      [],
      [],
      [],
    ] as any);

    const result = await actions.getCompanyAccountDetail("contact-uuid", 1);

    expect(result).not.toBeNull();
    expect(result!.company).toEqual(mockCompany);
    expect(result!.metrics).toHaveLength(4);
    expect(result!.requests).toHaveLength(0);
  });

  it("returns null when company not linked to contact", async () => {
    vi.mocked(prisma.company_contact.findMany).mockResolvedValue([
      { company_id: 2, allow_access: true },
    ] as any);

    const result = await actions.getCompanyAccountDetail("contact-uuid", 1);
    expect(result).toBeNull();
  });

  it("returns null when company not linked to contact (even invalid ID)", async () => {
    vi.mocked(prisma.company_contact.findMany).mockResolvedValue([
      { company_id: 2, allow_access: true },
    ] as any);

    const result = await actions.getCompanyAccountDetail("contact-uuid", -1);
    expect(result).toBeNull();
  });
});
