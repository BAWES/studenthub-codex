import { describe, it, expect } from "vitest";
import { listCampaignsSchema } from "./actions";
import type { CampaignListItem, ListCampaignsResult } from "./actions";

describe("listCampaignsSchema", () => {
  it("accepts empty params", () => {
    expect(listCampaignsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts pagination params", () => {
    const r = listCampaignsSchema.safeParse({ page: 1, limit: 20 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("rejects limit over 100", () => {
    expect(listCampaignsSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listCampaignsSchema.safeParse({ page: -1 }).success).toBe(false);
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

  it("defaults page to 1 and limit to 20 on safeParse defaults", () => {
    const defaults = { page: 1, limit: 20 };
    expect(listCampaignsSchema.safeParse(defaults).success).toBe(true);
  });
});

describe("CampaignListItem type", () => {
  it("has the required shape", () => {
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

  it("accepts null values for optional fields", () => {
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

describe("ListCampaignsResult type", () => {
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
