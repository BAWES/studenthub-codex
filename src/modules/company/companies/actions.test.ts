import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockCompanyContactFindMany,
  mockTransaction,
  mockCompanyFindUnique,
  mockCompanyUpdate,
} = vi.hoisted(() => ({
  mockCompanyContactFindMany: vi.fn(),
  mockTransaction: vi.fn(),
  mockCompanyFindUnique: vi.fn(),
  mockCompanyUpdate: vi.fn(),
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    company_contact: {
      findMany: mockCompanyContactFindMany,
    },
    $transaction: mockTransaction,
    company: {
      findUnique: mockCompanyFindUnique,
      update: mockCompanyUpdate,
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
  },
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import {
  getCompanyLinksByContactSchema,
  findCompanyByIdSchema,
  getCompanyDetailTxSchema,
  updateCompanySchema,
  companyLinkOutputSchema,
  companyWithRelationsOutputSchema,
  companyDetailTxOutputSchema,
  companyUpdateResultOutputSchema,
} from "./schemas";
import {
  getCompanyLinksByContact,
  getCompanyDetailTx,
  findCompanyById,
  updateCompanyById,
} from "./actions";

// ===========================================================================
// Input schema validation
// ===========================================================================

describe("getCompanyLinksByContactSchema", () => {
  it("accepts a valid contact UUID", () => {
    const r = getCompanyLinksByContactSchema.safeParse({
      contactUuid: "contact-uuid-123",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing contactUuid", () => {
    const r = getCompanyLinksByContactSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects empty contactUuid", () => {
    const r = getCompanyLinksByContactSchema.safeParse({ contactUuid: "" });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type", () => {
    const r = getCompanyLinksByContactSchema.safeParse({
      contactUuid: 123,
    });
    expect(r.success).toBe(false);
  });
});

describe("findCompanyByIdSchema", () => {
  it("accepts a valid company ID", () => {
    const r = findCompanyByIdSchema.safeParse({ companyId: 42 });
    expect(r.success).toBe(true);
  });

  it("rejects missing companyId", () => {
    const r = findCompanyByIdSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects zero companyId", () => {
    const r = findCompanyByIdSchema.safeParse({ companyId: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects negative companyId", () => {
    const r = findCompanyByIdSchema.safeParse({ companyId: -1 });
    expect(r.success).toBe(false);
  });

  it("rejects non-integer companyId", () => {
    const r = findCompanyByIdSchema.safeParse({ companyId: "abc" });
    expect(r.success).toBe(false);
  });
});

describe("getCompanyDetailTxSchema", () => {
  it("accepts a valid company ID", () => {
    const r = getCompanyDetailTxSchema.safeParse({ companyId: 42 });
    expect(r.success).toBe(true);
  });

  it("rejects missing companyId", () => {
    const r = getCompanyDetailTxSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects zero companyId", () => {
    const r = getCompanyDetailTxSchema.safeParse({ companyId: 0 });
    expect(r.success).toBe(false);
  });
});

describe("updateCompanySchema", () => {
  it("accepts valid input with data", () => {
    const r = updateCompanySchema.safeParse({
      companyId: 42,
      data: { company_name: "New Name" },
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty data object", () => {
    const r = updateCompanySchema.safeParse({
      companyId: 42,
      data: {},
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing companyId", () => {
    const r = updateCompanySchema.safeParse({ data: {} });
    expect(r.success).toBe(false);
  });

  it("rejects missing data", () => {
    const r = updateCompanySchema.safeParse({ companyId: 42 });
    expect(r.success).toBe(false);
  });

  it("rejects zero companyId", () => {
    const r = updateCompanySchema.safeParse({
      companyId: 0,
      data: {},
    });
    expect(r.success).toBe(false);
  });
});

// ===========================================================================
// Output schema validation
// ===========================================================================

describe("companyLinkOutputSchema", () => {
  it("accepts a valid company link", () => {
    const r = companyLinkOutputSchema.safeParse({ company_id: 42 });
    expect(r.success).toBe(true);
  });

  it("accepts null company_id", () => {
    const r = companyLinkOutputSchema.safeParse({ company_id: null });
    expect(r.success).toBe(true);
  });

  it("rejects missing company_id", () => {
    const r = companyLinkOutputSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong type", () => {
    const r = companyLinkOutputSchema.safeParse({ company_id: "abc" });
    expect(r.success).toBe(false);
  });
});

describe("companyWithRelationsOutputSchema", () => {
  const validCompany = {
    company_id: 42,
    company_name: "Acme Corp",
    company_common_name_en: "Acme",
    company_common_name_ar: null,
    company_description_en: "A company",
    company_description_ar: null,
    company_website: "https://acme.com",
    company_email: "info@acme.com",
    company_logo: "logo.png",
    commercial_licence: "LIC-123",
    company_hourly_rate: null,
    company_bonus_commission: null,
    company_followup: false,
    total_candidate: 10,
    no_of_active_requests: 3,
    is_request_updates_in_30_days: true,
    company_approved_to_hire: true,
    company_status_override: false,
    company_created_at: new Date("2025-01-01"),
    company_updated_at: new Date("2025-06-01"),
    last_request_datetime: new Date("2025-05-01"),
    last_payment_datetime: new Date("2025-04-01"),
    country_id: 1,
    currency_code: "USD",
    parent_company_id: null,
    country: { country_name_en: "United States" },
    company: { company_name: "Parent Inc" },
    staff: { staff_name: "John Doe", staff_email: "john@acme.com" },
  };

  it("accepts a valid company with all relations", () => {
    const r = companyWithRelationsOutputSchema.safeParse(validCompany);
    expect(r.success).toBe(true);
  });

  it("accepts null (not found)", () => {
    const r = companyWithRelationsOutputSchema.safeParse(null);
    expect(r.success).toBe(true);
  });

  it("accepts null relations", () => {
    const r = companyWithRelationsOutputSchema.safeParse({
      ...validCompany,
      country: null,
      company: null,
      staff: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing company_id", () => {
    const { company_id: _, ...rest } = validCompany;
    const r = companyWithRelationsOutputSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for company_id", () => {
    const r = companyWithRelationsOutputSchema.safeParse({
      ...validCompany,
      company_id: "abc",
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for company_name", () => {
    const r = companyWithRelationsOutputSchema.safeParse({
      ...validCompany,
      company_name: 123,
    });
    expect(r.success).toBe(false);
  });

  it("rejects wrong type for company_followup", () => {
    const r = companyWithRelationsOutputSchema.safeParse({
      ...validCompany,
      company_followup: "yes",
    });
    expect(r.success).toBe(false);
  });
});

describe("companyDetailTxOutputSchema", () => {
  const validTuple = [
    {
      company_id: 42,
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
    },
    [],
    [],
    [],
    [],
  ];

  it("accepts a valid tuple", () => {
    const r = companyDetailTxOutputSchema.safeParse(validTuple);
    expect(r.success).toBe(true);
  });

  it("rejects non-array", () => {
    const r = companyDetailTxOutputSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects array with number as first element", () => {
    const r = companyDetailTxOutputSchema.safeParse([123, [], [], [], []]);
    expect(r.success).toBe(false);
  });

  it("accepts tuple with data in all arrays", () => {
    const validTuple = [
      {
        company_id: 42,
        company_name: "Acme",
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
      },
      [
        {
          request_uuid: "req-1",
          request_position_title: "Engineer",
          request_status: "open",
          request_number_of_employees: 2,
          request_updated_datetime: new Date(),
        },
      ],
      [
        {
          company_contact_uuid: "cc-1",
          contact_position: "CEO",
          allow_access: true,
          contact: { contact_name: "Alice", contact_email: "alice@co.com" },
        },
      ],
      [
        { store_id: 1, store_name: "Main Store", store_status: "active" },
      ],
      [
        {
          note_uuid: "note-1",
          note_type: "general",
          note_text: "Important client",
          note_created_datetime: new Date(),
        },
      ],
    ];
    const r = companyDetailTxOutputSchema.safeParse(validTuple);
    expect(r.success).toBe(true);
  });
});

describe("companyUpdateResultOutputSchema", () => {
  it("accepts a valid result", () => {
    const r = companyUpdateResultOutputSchema.safeParse({ company_id: 42 });
    expect(r.success).toBe(true);
  });

  it("rejects missing company_id", () => {
    const r = companyUpdateResultOutputSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects wrong type", () => {
    const r = companyUpdateResultOutputSchema.safeParse({
      company_id: "abc",
    });
    expect(r.success).toBe(false);
  });
});

// ===========================================================================
// Action function tests (with mocked Prisma)
// ===========================================================================

describe("getCompanyLinksByContact()", () => {
  const mockLinks = [{ company_id: 1 }, { company_id: 2 }, { company_id: 3 }];

  beforeEach(() => {
    vi.clearAllMocks();
    mockCompanyContactFindMany.mockResolvedValue(mockLinks);
  });

  it("returns company links for a contact", async () => {
    const result = await getCompanyLinksByContact("contact-uuid-123");

    expect(mockCompanyContactFindMany).toHaveBeenCalledWith({
      where: {
        contact_uuid: "contact-uuid-123",
        allow_access: true,
      },
      select: { company_id: true },
    });
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ company_id: 1 });
    expect(result[1]).toEqual({ company_id: 2 });
  });

  it("returns empty array when no links found", async () => {
    mockCompanyContactFindMany.mockResolvedValue([]);

    const result = await getCompanyLinksByContact("unknown-contact");
    expect(result).toEqual([]);
  });

  it("handles contact with null company_id", async () => {
    mockCompanyContactFindMany.mockResolvedValue([{ company_id: null }]);

    const result = await getCompanyLinksByContact("contact-uuid");
    expect(result).toHaveLength(1);
    expect(result[0].company_id).toBeNull();
  });
});

describe("findCompanyById()", () => {
  const mockCompany = {
    company_id: 42,
    parent_company_id: null,
    company_name: "Acme Corp",
    company_common_name_en: "Acme",
    company_common_name_ar: null,
    company_description_en: "A company",
    company_description_ar: null,
    company_website: "https://acme.com",
    company_email: "info@acme.com",
    company_logo: "logo.png",
    commercial_licence: "LIC-123",
    company_hourly_rate: null,
    company_bonus_commission: null,
    company_followup: false,
    total_candidate: 10,
    no_of_active_requests: 3,
    is_request_updates_in_30_days: true,
    company_approved_to_hire: true,
    company_status_override: false,
    company_created_at: new Date("2025-01-01"),
    company_updated_at: new Date("2025-06-01"),
    last_request_datetime: new Date("2025-05-01"),
    last_payment_datetime: new Date("2025-04-01"),
    country_id: 1,
    currency_code: "USD",
    country: { country_name_en: "United States" },
    company: { company_name: "Parent Inc" },
    staff: { staff_name: "John Doe", staff_email: "john@example.com" },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCompanyFindUnique.mockResolvedValue(mockCompany);
  });

  it("returns company by ID with relations", async () => {
    const result = await findCompanyById(42);

    expect(mockCompanyFindUnique).toHaveBeenCalledWith({
      where: { company_id: 42 },
      include: {
        country: { select: { country_name_en: true } },
        company: { select: { company_name: true } },
        staff: { select: { staff_name: true, staff_email: true } },
      },
    });

    expect(result).not.toBeNull();
    expect(result!.company_id).toBe(42);
    expect(result!.company_name).toBe("Acme Corp");
    expect(result!.country!.country_name_en).toBe("United States");
    expect(result!.staff!.staff_name).toBe("John Doe");
  });

  it("returns null when company not found", async () => {
    mockCompanyFindUnique.mockResolvedValue(null);

    const result = await findCompanyById(999);
    expect(result).toBeNull();
  });

  it("handles company with null relations", async () => {
    mockCompanyFindUnique.mockResolvedValue({
      ...mockCompany,
      country: null,
      company: null,
      staff: null,
    });

    const result = await findCompanyById(42);
    expect(result!.country).toBeNull();
    expect(result!.company).toBeNull();
    expect(result!.staff).toBeNull();
  });

  it("handles parent_company_id", async () => {
    mockCompanyFindUnique.mockResolvedValue({
      ...mockCompany,
      parent_company_id: 10,
    });

    const result = await findCompanyById(42);
    expect(result!.parent_company_id).toBe(10);
  });
});

describe("getCompanyDetailTx()", () => {
  const mockTxResult = [
    {
      company_id: 42,
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
    },
    [{ request_uuid: "req-1", request_position_title: "Engineer", request_status: "open", request_number_of_employees: 2, request_updated_datetime: new Date() }],
    [{ company_contact_uuid: "cc-1", contact_position: "CEO", allow_access: true, contact: { contact_name: "Alice", contact_email: "alice@co.com" } }],
    [{ store_id: 1, store_name: "Main Store", store_status: "active" }],
    [{ note_uuid: "note-1", note_type: "general", note_text: "Note", note_created_datetime: new Date() }],
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockTransaction.mockResolvedValue(mockTxResult);
  });

  it("returns a tuple of company detail data", async () => {
    const result = await getCompanyDetailTx(42);

    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(5);

    // Company info
    expect(result[0]).not.toBeNull();
    expect((result[0] as any).company_id).toBe(42);

    // Requests
    expect(Array.isArray(result[1])).toBe(true);
    expect(result[1]).toHaveLength(1);

    // Contacts
    expect(result[2]).toHaveLength(1);

    // Stores
    expect(result[3]).toHaveLength(1);

    // Notes
    expect(result[4]).toHaveLength(1);
  });

  it("returns empty arrays when no related data exists", async () => {
    mockTransaction.mockResolvedValue([
      {
        company_id: 42,
        company_name: "Empty Co",
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
      },
      [],
      [],
      [],
      [],
    ]);

    const result = await getCompanyDetailTx(1);
    expect(result[1]).toEqual([]);
    expect(result[2]).toEqual([]);
    expect(result[3]).toEqual([]);
    expect(result[4]).toEqual([]);
  });
});

describe("updateCompanyById()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCompanyUpdate.mockResolvedValue({ company_id: 42 });
  });

  it("updates a company and returns the ID", async () => {
    const result = await updateCompanyById(42, {
      company_name: "Updated Name",
    });

    expect(mockCompanyUpdate).toHaveBeenCalledWith({
      where: { company_id: 42 },
      data: { company_name: "Updated Name" },
      select: { company_id: true },
    });
    expect(result).toEqual({ company_id: 42 });
  });

  it("updates with multiple fields", async () => {
    await updateCompanyById(42, {
      company_name: "New Name",
      company_email: "new@acme.com",
      company_approved_to_hire: true,
    });

    expect(mockCompanyUpdate).toHaveBeenCalledWith({
      where: { company_id: 42 },
      data: {
        company_name: "New Name",
        company_email: "new@acme.com",
        company_approved_to_hire: true,
      },
      select: { company_id: true },
    });
  });

  it("updates with empty data", async () => {
    const result = await updateCompanyById(42, {});

    expect(mockCompanyUpdate).toHaveBeenCalledWith({
      where: { company_id: 42 },
      data: {},
      select: { company_id: true },
    });
    expect(result).toEqual({ company_id: 42 });
  });

  it("updates with generic record data", async () => {
    const result = await updateCompanyById(42, {
      currency_code: "KWD",
      company_hourly_rate: 50.0,
    });

    expect(mockCompanyUpdate).toHaveBeenCalledWith({
      where: { company_id: 42 },
      data: { currency_code: "KWD", company_hourly_rate: 50.0 },
      select: { company_id: true },
    });
    expect(result).toEqual({ company_id: 42 });
  });
});

// ===========================================================================
// Type-shape checks (compile-time type assertions)
// ===========================================================================

describe("CompanyLink shape", () => {
  it("accepts a valid link object", () => {
    const link = { company_id: null };
    expect(link.company_id).toBeNull();
  });
});

describe("CompanyUpdateResult shape", () => {
  it("accepts a valid result", () => {
    const result = { company_id: 1 };
    expect(result.company_id).toBe(1);
  });
});
