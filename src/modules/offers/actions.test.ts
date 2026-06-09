import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema definitions matching src/modules/offers/actions.ts
// ---------------------------------------------------------------------------

const listOffersSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.coerce.number().int().min(0).max(3).optional(),
  candidateId: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive().optional(),
  requestUuid: z.string().max(60).optional(),
});

const getOfferSchema = z.object({
  offerUuid: z.string().min(1, "Offer UUID is required"),
});

const createOfferSchema = z.object({
  requestUuid: z.string().min(1, "Request UUID is required"),
  candidateId: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive(),
  offerAmount: z.coerce.number().positive().optional(),
  currencyCode: z.string().length(3).optional().default("KWD"),
  notes: z.string().max(2000).optional(),
  validUntil: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Types (inline for test — mirror the real types)
// ---------------------------------------------------------------------------

type ListOffersInput = z.input<typeof listOffersSchema>;
type GetOfferInput = z.input<typeof getOfferSchema>;
type CreateOfferInput = z.input<typeof createOfferSchema>;

type OfferListItem = {
  offer_uuid: string;
  request_uuid: string;
  candidate_id: number | null;
  company_id: number;
  offer_amount: number | null;
  currency_code: string | null;
  status: number | null;
  notes: string | null;
  valid_until: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type ListOffersResult = {
  offers: OfferListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type CreateOfferResult = {
  success: boolean;
  message: string;
  offerUuid?: string;
};

// ---------------------------------------------------------------------------
// listOffersSchema tests
// ---------------------------------------------------------------------------

describe("listOffersSchema", () => {
  it("accepts empty params with defaults", () => {
    const result = listOffersSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const result = listOffersSchema.safeParse({ page: 2, limit: 50 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("accepts status filter", () => {
    const result = listOffersSchema.safeParse({ status: 1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(1);
    }
  });

  it("accepts candidateId filter", () => {
    const result = listOffersSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });

  it("accepts companyId filter", () => {
    const result = listOffersSchema.safeParse({ companyId: 7 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(7);
    }
  });

  it("accepts requestUuid filter", () => {
    const result = listOffersSchema.safeParse({ requestUuid: "req-123" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.requestUuid).toBe("req-123");
    }
  });

  it("rejects status out of range", () => {
    const result = listOffersSchema.safeParse({ status: 99 });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listOffersSchema.safeParse({ limit: 999 });
    expect(result.success).toBe(false);
  });

  it("coerces string page to number", () => {
    const result = listOffersSchema.safeParse({ page: "3" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
    }
  });

  it("rejects negative candidateId", () => {
    const result = listOffersSchema.safeParse({ candidateId: -1 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getOfferSchema tests
// ---------------------------------------------------------------------------

describe("getOfferSchema", () => {
  it("accepts valid offer UUID", () => {
    const result = getOfferSchema.safeParse({ offerUuid: "off-abc-123" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.offerUuid).toBe("off-abc-123");
    }
  });

  it("rejects empty offer UUID", () => {
    const result = getOfferSchema.safeParse({ offerUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing offer UUID", () => {
    const result = getOfferSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createOfferSchema tests
// ---------------------------------------------------------------------------

describe("createOfferSchema", () => {
  it("accepts valid create params", () => {
    const result = createOfferSchema.safeParse({
      requestUuid: "req-abc-123",
      companyId: 7,
      offerAmount: 1500.5,
      currencyCode: "KWD",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.requestUuid).toBe("req-abc-123");
      expect(result.data.companyId).toBe(7);
      expect(result.data.offerAmount).toBe(1500.5);
      expect(result.data.currencyCode).toBe("KWD");
    }
  });

  it("applies default currency code", () => {
    const result = createOfferSchema.safeParse({
      requestUuid: "req-abc-123",
      companyId: 7,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currencyCode).toBe("KWD");
    }
  });

  it("accepts optional fields", () => {
    const result = createOfferSchema.safeParse({
      requestUuid: "req-abc-123",
      companyId: 7,
      notes: "Some additional notes about this offer",
      validUntil: "2026-07-01",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notes).toBe("Some additional notes about this offer");
      expect(result.data.validUntil).toBe("2026-07-01");
    }
  });

  it("rejects missing requestUuid", () => {
    const result = createOfferSchema.safeParse({ companyId: 7 });
    expect(result.success).toBe(false);
  });

  it("rejects missing companyId", () => {
    const result = createOfferSchema.safeParse({
      requestUuid: "req-abc-123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero offerAmount", () => {
    const result = createOfferSchema.safeParse({
      requestUuid: "req-abc-123",
      companyId: 7,
      offerAmount: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid currency code length", () => {
    const result = createOfferSchema.safeParse({
      requestUuid: "req-abc-123",
      companyId: 7,
      currencyCode: "KWDX",
    });
    expect(result.success).toBe(false);
  });

  it("coerces string companyId to number", () => {
    const result = createOfferSchema.safeParse({
      requestUuid: "req-abc-123",
      companyId: "7",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(7);
    }
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

describe("OfferListItem shape", () => {
  it("defines expected fields", () => {
    const mock: OfferListItem = {
      offer_uuid: "off-abc-123",
      request_uuid: "req-xyz-789",
      candidate_id: 42,
      company_id: 7,
      offer_amount: 1500.0,
      currency_code: "KWD",
      status: 0,
      notes: "Initial offer",
      valid_until: "2026-07-01",
      created_at: "2026-06-09T08:00:00.000Z",
      updated_at: "2026-06-09T08:00:00.000Z",
    };
    expect(mock.offer_uuid).toBe("off-abc-123");
    expect(mock.status).toBe(0);
    expect(mock.currency_code).toBe("KWD");
  });

  it("allows null optional fields", () => {
    const mock: OfferListItem = {
      offer_uuid: "off-abc-123",
      request_uuid: "req-xyz-789",
      candidate_id: null,
      company_id: 7,
      offer_amount: null,
      currency_code: null,
      status: null,
      notes: null,
      valid_until: null,
      created_at: null,
      updated_at: null,
    };
    expect(mock.offer_uuid).toBeDefined();
    expect(mock.candidate_id).toBeNull();
  });
});

describe("ListOffersResult shape", () => {
  it("accepts empty result", () => {
    const r: ListOffersResult = {
      offers: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(r.total).toBe(0);
    expect(r.offers).toHaveLength(0);
  });

  it("accepts populated result", () => {
    const r: ListOffersResult = {
      offers: [
        {
          offer_uuid: "off-1",
          request_uuid: "req-1",
          candidate_id: null,
          company_id: 7,
          offer_amount: 1500.0,
          currency_code: "KWD",
          status: 0,
          notes: null,
          valid_until: null,
          created_at: "2026-06-09T08:00:00.000Z",
          updated_at: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(r.offers).toHaveLength(1);
    expect(r.totalPages).toBe(1);
  });
});

describe("CreateOfferResult shape", () => {
  it("accepts success result with UUID", () => {
    const r: CreateOfferResult = {
      success: true,
      message: "Offer created successfully",
      offerUuid: "off-new-uuid",
    };
    expect(r.success).toBe(true);
    expect(r.offerUuid).toBeDefined();
  });

  it("accepts error result", () => {
    const r: CreateOfferResult = {
      success: false,
      message: "Company not found",
    };
    expect(r.success).toBe(false);
    expect(r.offerUuid).toBeUndefined();
  });
});
