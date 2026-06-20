import { describe, it, expect } from "vitest";
import {
  campaignListItemSchema,
  listCampaignsResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// campaignListItemSchema
// ---------------------------------------------------------------------------
describe("campaignListItemSchema", () => {
  const valid = {
    utm_uuid: "abc-123-def",
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "summer-sale",
    utm_content: "banner-1",
    utm_term: "keyword",
    no_of_signups: 42,
    no_of_clicks: 1000,
    created_at: new Date("2026-01-01"),
  };

  it("accepts a valid campaign list item", () => {
    expect(campaignListItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable utm_source", () => {
    expect(
      campaignListItemSchema.safeParse({ ...valid, utm_source: null }).success,
    ).toBe(true);
  });

  it("accepts nullable utm_medium", () => {
    expect(
      campaignListItemSchema.safeParse({ ...valid, utm_medium: null }).success,
    ).toBe(true);
  });

  it("accepts nullable utm_campaign", () => {
    expect(
      campaignListItemSchema.safeParse({ ...valid, utm_campaign: null }).success,
    ).toBe(true);
  });

  it("accepts nullable utm_content", () => {
    expect(
      campaignListItemSchema.safeParse({ ...valid, utm_content: null }).success,
    ).toBe(true);
  });

  it("accepts nullable utm_term", () => {
    expect(
      campaignListItemSchema.safeParse({ ...valid, utm_term: null }).success,
    ).toBe(true);
  });

  it("accepts nullable no_of_signups", () => {
    expect(
      campaignListItemSchema.safeParse({ ...valid, no_of_signups: null }).success,
    ).toBe(true);
  });

  it("accepts nullable no_of_clicks", () => {
    expect(
      campaignListItemSchema.safeParse({ ...valid, no_of_clicks: null }).success,
    ).toBe(true);
  });

  it("accepts nullable created_at", () => {
    expect(
      campaignListItemSchema.safeParse({ ...valid, created_at: null }).success,
    ).toBe(true);
  });

  it("rejects missing utm_uuid", () => {
    const { utm_uuid: _, ...rest } = valid;
    expect(campaignListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for no_of_signups", () => {
    expect(
      campaignListItemSchema.safeParse({ ...valid, no_of_signups: "many" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for created_at", () => {
    expect(
      campaignListItemSchema.safeParse({ ...valid, created_at: "2026-01-01" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listCampaignsResultSchema
// ---------------------------------------------------------------------------
describe("listCampaignsResultSchema", () => {
  const valid = {
    campaigns: [
      {
        utm_uuid: "abc-123",
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        utm_content: null,
        utm_term: null,
        no_of_signups: null,
        no_of_clicks: null,
        created_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid result", () => {
    expect(listCampaignsResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty campaigns array", () => {
    expect(
      listCampaignsResultSchema.safeParse({ ...valid, campaigns: [], total: 0, totalPages: 0 })
        .success,
    ).toBe(true);
  });

  it("rejects missing campaigns", () => {
    const { campaigns: _, ...rest } = valid;
    expect(listCampaignsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = valid;
    expect(listCampaignsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing page", () => {
    const { page: _, ...rest } = valid;
    expect(listCampaignsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listCampaignsResultSchema.safeParse({ ...valid, total: -1 }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      listCampaignsResultSchema.safeParse({ ...valid, page: 0 }).success,
    ).toBe(false);
  });

  it("rejects limit below 1", () => {
    expect(
      listCampaignsResultSchema.safeParse({ ...valid, limit: 0 }).success,
    ).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(
      listCampaignsResultSchema.safeParse({ ...valid, limit: 101 }).success,
    ).toBe(false);
  });

  it("rejects non-array campaigns", () => {
    expect(
      listCampaignsResultSchema.safeParse({ ...valid, campaigns: "not-an-array" }).success,
    ).toBe(false);
  });
});
