import { describe, it, expect } from "vitest";

import {
  listOffersSchema,
  getOfferSchema,
  createOfferSchema,
  offerListItemSchema,
  offerDetailSchema,
  listOffersResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Pure logic: offer list schema validation
//
// The listOffers action uses this schema internally. Testing it
// separately avoids mocking "use server" dependencies (prisma, session, etc.).
// ---------------------------------------------------------------------------

describe("listOffersSchema", () => {
  it("accepts empty params (default pagination)", () => {
    const result = listOffersSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const result = listOffersSchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("accepts status filter", () => {
    const result = listOffersSchema.safeParse({ status: "true" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(true);
    }
  });

  it("accepts false status filter", () => {
    const result = listOffersSchema.safeParse({ status: "0" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(false);
    }
  });

  it("accepts companyId filter", () => {
    const result = listOffersSchema.safeParse({ companyId: "42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(42);
    }
  });

  it("accepts search term", () => {
    const result = listOffersSchema.safeParse({ search: "cashier" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBe("cashier");
    }
  });

  it("rejects limit over 100", () => {
    const result = listOffersSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listOffersSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric limit", () => {
    const result = listOffersSchema.safeParse({ limit: "abc" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getOffer schema validation
// ---------------------------------------------------------------------------

describe("getOfferSchema", () => {
  it("accepts a valid UUID string", () => {
    const result = getOfferSchema.safeParse({ offerUuid: "abc-123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    const result = getOfferSchema.safeParse({ offerUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing UUID", () => {
    const result = getOfferSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createOffer schema validation
// ---------------------------------------------------------------------------

describe("createOfferSchema", () => {
  it("accepts a valid offer input (minimum required)", () => {
    const result = createOfferSchema.safeParse({
      storyUuid: "story-123",
      requestUuid: "req-456",
      position: "Cashier",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.position).toBe("Cashier");
    }
  });

  it("accepts a full offer input", () => {
    const result = createOfferSchema.safeParse({
      storyUuid: "story-123",
      requestUuid: "req-456",
      areaUuid: "area-789",
      position: "Sales Associate",
      positionAr: "مساعد مبيعات",
      description: "Looking for a sales associate",
      hoursPerDay: 8,
      daysPerWeek: true,
      compensationType: "MONTHLY_SALARY",
      compensationAmount: "300",
      compensationDescription: "Monthly salary",
      compensationDescriptionAr: "راتب شهري",
      minAge: 18,
      maxAge: 50,
      gender: false,
      availableFrom: "2025-01-01",
      availableTo: "2025-12-31",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty position", () => {
    const result = createOfferSchema.safeParse({
      storyUuid: "story-123",
      requestUuid: "req-456",
      position: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = createOfferSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects negative hoursPerDay", () => {
    const result = createOfferSchema.safeParse({
      storyUuid: "story-123",
      requestUuid: "req-456",
      position: "Cashier",
      hoursPerDay: -1,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema shape tests
// ---------------------------------------------------------------------------

describe("offerListItemSchema", () => {
  it("validates a well-formed offer list item", () => {
    const item = {
      job_uuid: "abc-123",
      position: "Cashier",
      position_ar: null,
      description: "Looking for a cashier",
      hours_per_day: null,
      days_per_week: null,
      status: true,
      area_uuid: null,
      request_uuid: "req-456",
      created_at: null,
      updated_at: null,
    };
    const result = offerListItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("allows nullable fields", () => {
    const item = {
      job_uuid: "abc-123",
      position: "Cashier",
      position_ar: null,
      description: null,
      hours_per_day: null,
      days_per_week: null,
      status: null,
      area_uuid: null,
      request_uuid: "req-456",
      created_at: null,
      updated_at: null,
    };
    const result = offerListItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });
});

describe("offerDetailSchema", () => {
  it("validates a well-formed offer detail", () => {
    const detail = {
      job_uuid: "abc-123",
      position: "Cashier",
      position_ar: null,
      description: "Looking for a cashier",
      description_ar: null,
      hours_per_day: 8,
      days_per_week: true,
      compensation_type: "Monthly Salary",
      compensation_amount: "300",
      compensation_description: "Monthly salary",
      compensation_description_ar: null,
      min_age: 18,
      max_age: 50,
      gender: false,
      status: true,
      area_uuid: null,
      request_uuid: "req-456",
      available_from: null,
      available_to: null,
      created_at: null,
      updated_at: null,
    };
    const result = offerDetailSchema.safeParse(detail);
    expect(result.success).toBe(true);
  });
});

describe("listOffersResultSchema", () => {
  it("validates an empty result set", () => {
    const result = listOffersResultSchema.safeParse({
      offers: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });

  it("validates a non-empty result set", () => {
    const result = listOffersResultSchema.safeParse({
      offers: [
        {
          job_uuid: "abc-123",
          position: "Cashier",
          position_ar: null,
          description: null,
          hours_per_day: null,
          days_per_week: null,
          status: true,
          area_uuid: null,
          request_uuid: "req-456",
          created_at: null,
          updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Pure function: build offer list query filter
// ---------------------------------------------------------------------------

type OfferWhereInput = {
  status?: boolean;
  deleted_at?: null;
  request?: { company_id?: number };
  OR?: Array<Record<string, unknown>>;
};

function buildOfferListFilter(
  status?: boolean,
  companyId?: number,
  search?: string,
): OfferWhereInput {
  const where: Record<string, unknown> = { deleted_at: null };

  if (status !== undefined) {
    where.status = status;
  }

  if (companyId !== undefined) {
    where.request = { company_id: companyId };
  }

  if (search !== undefined && search.trim().length > 0) {
    const term = search.trim();
    where.OR = [
      { position: { contains: term } },
      { position_ar: { contains: term } },
      { description: { contains: term } },
      { description_ar: { contains: term } },
    ];
  }

  return where as OfferWhereInput;
}

describe("buildOfferListFilter", () => {
  it("returns base filter with deleted_at: null when no params", () => {
    const result = buildOfferListFilter();
    expect(result).toEqual({ deleted_at: null });
  });

  it("filters by active status", () => {
    const result = buildOfferListFilter(true);
    expect(result.status).toBe(true);
    expect(result.deleted_at).toBeNull();
  });

  it("filters by inactive status", () => {
    const result = buildOfferListFilter(false);
    expect(result.status).toBe(false);
    expect(result.deleted_at).toBeNull();
  });

  it("filters by companyId via request relation", () => {
    const result = buildOfferListFilter(undefined, 42);
    expect(result.request).toEqual({ company_id: 42 });
  });

  it("adds search OR terms for non-empty search", () => {
    const result = buildOfferListFilter(undefined, undefined, "cashier");
    expect(result.OR).toBeDefined();
    expect(result.OR).toHaveLength(4);
    expect(result.OR![0]).toEqual({ position: { contains: "cashier" } });
  });

  it("ignores empty search string", () => {
    const result = buildOfferListFilter(undefined, undefined, "  ");
    expect(result.OR).toBeUndefined();
  });

  it("combines status and companyId filters", () => {
    const result = buildOfferListFilter(true, 42);
    expect(result.status).toBe(true);
    expect(result.request).toEqual({ company_id: 42 });
  });
});
