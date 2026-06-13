import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock Next.js server-only (not available in test env) ────
vi.mock("server-only", () => ({}));

// ── Hoisted mock functions ──────────────────────────────────
const {
  mockRequireCapability,
  mockCampaignFindMany,
  mockCampaignCount,
} = vi.hoisted(() => ({
  mockRequireCapability: vi.fn(),
  mockCampaignFindMany: vi.fn(),
  mockCampaignCount: vi.fn(),
}));

// ── Mock session module ─────────────────────────────────────
vi.mock("@/modules/auth/session", () => ({
  requireCapability: mockRequireCapability,
}));

// ── Mock Prisma ─────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    campaign: {
      findMany: mockCampaignFindMany,
      count: mockCampaignCount,
    },
  },
}));

// ── Now import the module under test ────────────────────────
import { listCampaigns } from "./actions";
import {
  listCampaignsSchema,
  campaignListItemSchema,
  listCampaignsResultSchema,
} from "./schemas";
import type { CampaignListItem, ListCampaignsResult } from "./schemas";

// ---------------------------------------------------------------------------
// Reset mocks before each test
// ---------------------------------------------------------------------------
beforeEach(() => {
  vi.clearAllMocks();
});

// ===========================================================================
// Schema validation tests
// ===========================================================================

describe("listCampaignsSchema", () => {
  it("accepts empty params", () => {
    expect(listCampaignsSchema.safeParse({}).success).toBe(true);
  });

  it("applies default page and limit", () => {
    const r = listCampaignsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBeUndefined();
      expect(r.data.limit).toBeUndefined();
    }
  });

  it("accepts explicit pagination", () => {
    const r = listCampaignsSchema.safeParse({ page: 2, limit: 50 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(50);
    }
  });

  it("rejects limit over 100", () => {
    expect(listCampaignsSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects limit of 0", () => {
    expect(listCampaignsSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listCampaignsSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects page 0", () => {
    expect(listCampaignsSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("accepts utm filter params", () => {
    const r = listCampaignsSchema.safeParse({
      utmSource: "linkedin",
      utmMedium: "cpc",
      utmCampaign: "summer2024",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.utmSource).toBe("linkedin");
      expect(r.data.utmMedium).toBe("cpc");
      expect(r.data.utmCampaign).toBe("summer2024");
    }
  });

  it("accepts partial utm filters", () => {
    const r = listCampaignsSchema.safeParse({ utmSource: "google" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.utmSource).toBe("google");
      expect(r.data.utmMedium).toBeUndefined();
    }
  });

  it("rejects non-integer page", () => {
    expect(listCampaignsSchema.safeParse({ page: "abc" }).success).toBe(false);
  });

  it("rejects non-integer limit", () => {
    expect(listCampaignsSchema.safeParse({ limit: "abc" }).success).toBe(false);
  });
});

describe("campaignListItemSchema", () => {
  const validItem = {
    utm_uuid: "utm_abc123",
    utm_source: "linkedin",
    utm_medium: "cpc",
    utm_campaign: "summer2024",
    utm_content: "hero-banner",
    utm_term: "software-engineer",
    no_of_signups: 42,
    no_of_clicks: 128,
    created_at: new Date("2024-01-15T10:00:00.000Z"),
  };

  it("accepts a valid campaign item", () => {
    expect(campaignListItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts null values for all nullable fields", () => {
    const r = campaignListItemSchema.safeParse({
      utm_uuid: "utm_def456",
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
      no_of_signups: null,
      no_of_clicks: null,
      created_at: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing required utm_uuid", () => {
    const { utm_uuid, ...rest } = validItem;
    expect(campaignListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("accepts zero for numeric fields", () => {
    const r = campaignListItemSchema.safeParse({
      ...validItem,
      no_of_signups: 0,
      no_of_clicks: 0,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.no_of_signups).toBe(0);
      expect(r.data.no_of_clicks).toBe(0);
    }
  });

  it("validates created_at as Date", () => {
    const r = campaignListItemSchema.safeParse({
      ...validItem,
      created_at: "not-a-date",
    });
    expect(r.success).toBe(false);
  });
});

describe("listCampaignsResultSchema", () => {
  const validResult = {
    campaigns: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  };

  it("accepts an empty result", () => {
    expect(listCampaignsResultSchema.safeParse(validResult).success).toBe(true);
  });

  it("accepts a result with items", () => {
    const r = listCampaignsResultSchema.safeParse({
      campaigns: [
        {
          utm_uuid: "utm_abc",
          utm_source: "google",
          utm_medium: null,
          utm_campaign: null,
          utm_content: null,
          utm_term: null,
          no_of_signups: 10,
          no_of_clicks: 50,
          created_at: new Date(),
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("rejects negative total", () => {
    expect(
      listCampaignsResultSchema.safeParse({ ...validResult, total: -1 })
        .success,
    ).toBe(false);
  });

  it("rejects page 0", () => {
    expect(
      listCampaignsResultSchema.safeParse({ ...validResult, page: 0 }).success,
    ).toBe(false);
  });

  it("rejects limit 0", () => {
    expect(
      listCampaignsResultSchema.safeParse({ ...validResult, limit: 0 }).success,
    ).toBe(false);
  });

  it("rejects missing campaigns array", () => {
    const { campaigns, ...rest } = validResult;
    expect(listCampaignsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects campaigns that is not an array", () => {
    expect(
      listCampaignsResultSchema.safeParse({ ...validResult, campaigns: "nope" })
        .success,
    ).toBe(false);
  });
});

// ===========================================================================
// Type-shape tests
// ===========================================================================

describe("CampaignListItem type shape", () => {
  it("has the required fields", () => {
    const item: CampaignListItem = {
      utm_uuid: "utm_abc123",
      utm_source: "linkedin",
      utm_medium: "cpc",
      utm_campaign: "summer2024",
      utm_content: null,
      utm_term: null,
      no_of_signups: 42,
      no_of_clicks: 128,
      created_at: new Date("2024-01-15T10:00:00.000Z"),
    };
    expect(item.utm_uuid).toBe("utm_abc123");
    expect(item.utm_source).toBe("linkedin");
    expect(item.no_of_signups).toBe(42);
  });

  it("accepts null values for optional fields at type level", () => {
    const item: CampaignListItem = {
      utm_uuid: "utm_def456",
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
      no_of_signups: null,
      no_of_clicks: null,
      created_at: null,
    };
    expect(item.utm_source).toBeNull();
    expect(item.created_at).toBeNull();
  });
});

describe("ListCampaignsResult type shape", () => {
  it("has the correct shape", () => {
    const result: ListCampaignsResult = {
      campaigns: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.campaigns).toHaveLength(0);
    expect(result.totalPages).toBe(0);
    expect(result.page).toBe(1);
  });
});

// ===========================================================================
// Action function tests (mocked prisma + session)
// ===========================================================================

describe("listCampaigns action", () => {
  it("requires candidate.read.own capability", async () => {
    mockRequireCapability.mockRejectedValue(new Error("Unauthorized"));
    mockCampaignFindMany.mockResolvedValue([]);
    mockCampaignCount.mockResolvedValue(0);

    await expect(listCampaigns({})).rejects.toThrow("Unauthorized");
    expect(mockRequireCapability).toHaveBeenCalledWith("candidate.read.own");
  });

  it("returns empty result when no campaigns exist", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockCampaignFindMany.mockResolvedValue([]);
    mockCampaignCount.mockResolvedValue(0);

    const result = await listCampaigns({});
    expect(result.campaigns).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(0);
  });

  it("returns paginated campaigns", async () => {
    const mockData = [
      {
        utm_uuid: "utm_001",
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "campaign1",
        utm_content: null,
        utm_term: null,
        no_of_signups: 10,
        no_of_clicks: 50,
        created_at: new Date("2024-06-01"),
      },
      {
        utm_uuid: "utm_002",
        utm_source: "linkedin",
        utm_medium: "organic",
        utm_campaign: "campaign2",
        utm_content: null,
        utm_term: null,
        no_of_signups: 5,
        no_of_clicks: 25,
        created_at: new Date("2024-06-02"),
      },
    ];

    mockRequireCapability.mockResolvedValue(undefined);
    mockCampaignFindMany.mockResolvedValue(mockData);
    mockCampaignCount.mockResolvedValue(2);

    const result = await listCampaigns({ page: 1, limit: 10 });
    expect(result.campaigns).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(1);
    expect(result.campaigns[0].utm_uuid).toBe("utm_001");
    expect(result.campaigns[1].utm_uuid).toBe("utm_002");
  });

  it("computes totalPages correctly", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockCampaignFindMany.mockResolvedValue(Array(5).fill({
      utm_uuid: "utm_xxx",
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
      no_of_signups: null,
      no_of_clicks: null,
      created_at: null,
    }));
    mockCampaignCount.mockResolvedValue(25);

    const result = await listCampaigns({ page: 1, limit: 10 });
    expect(result.totalPages).toBe(3); // ceil(25 / 10)
    expect(result.total).toBe(25);
  });

  it("applies utmSource filter to prisma query", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockCampaignFindMany.mockResolvedValue([]);
    mockCampaignCount.mockResolvedValue(0);

    await listCampaigns({ utmSource: "google" });

    expect(mockCampaignFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          utm_source: { contains: "google" },
        }),
      }),
    );
  });

  it("applies utmMedium filter to prisma query", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockCampaignFindMany.mockResolvedValue([]);
    mockCampaignCount.mockResolvedValue(0);

    await listCampaigns({ utmMedium: "cpc" });

    expect(mockCampaignFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          utm_medium: { contains: "cpc" },
        }),
      }),
    );
  });

  it("applies utmCampaign filter to prisma query", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockCampaignFindMany.mockResolvedValue([]);
    mockCampaignCount.mockResolvedValue(0);

    await listCampaigns({ utmCampaign: "summer2024" });

    expect(mockCampaignFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          utm_campaign: { contains: "summer2024" },
        }),
      }),
    );
  });

  it("combines multiple utm filters in prisma query", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockCampaignFindMany.mockResolvedValue([]);
    mockCampaignCount.mockResolvedValue(0);

    await listCampaigns({
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "summer2024",
    });

    expect(mockCampaignFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          utm_source: { contains: "google" },
          utm_medium: { contains: "cpc" },
          utm_campaign: { contains: "summer2024" },
        },
      }),
    );
  });

  it("passes correct pagination to prisma query", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockCampaignFindMany.mockResolvedValue([]);
    mockCampaignCount.mockResolvedValue(0);

    await listCampaigns({ page: 3, limit: 25 });

    expect(mockCampaignFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 50, // (page - 1) * limit = 2 * 25
        take: 25,
      }),
    );
  });

  it("orders by created_at descending", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockCampaignFindMany.mockResolvedValue([]);
    mockCampaignCount.mockResolvedValue(0);

    await listCampaigns({});

    expect(mockCampaignFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { created_at: "desc" },
      }),
    );
  });

  it("uses default page=1, limit=20 when called without params", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockCampaignFindMany.mockResolvedValue([]);
    mockCampaignCount.mockResolvedValue(0);

    await listCampaigns();

    expect(mockCampaignFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 20 }),
    );
  });

  it("validates output schema on the returned result", async () => {
    mockRequireCapability.mockResolvedValue(undefined);
    mockCampaignFindMany.mockResolvedValue([]);
    mockCampaignCount.mockResolvedValue(0);

    const result = await listCampaigns({});
    // The result should pass the output schema
    expect(listCampaignsResultSchema.safeParse(result).success).toBe(true);
  });
});
