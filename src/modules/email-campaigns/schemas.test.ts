import { describe, it, expect } from "vitest";
import {
  emailCampaignListItemSchema,
  listEmailCampaignsResultSchema,
  createUpdateResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// emailCampaignListItemSchema
// ---------------------------------------------------------------------------
describe("emailCampaignListItemSchema", () => {
  const valid = {
    campaign_uuid: "camp-uuid-1",
    subject: "Welcome Email",
    message: "<p>Welcome to our platform!</p>",
    progress: 75,
    target: "new_candidates",
    status: true,
    created_at: new Date("2026-06-01"),
  };

  it("accepts a valid email campaign list item", () => {
    expect(emailCampaignListItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts all nullable fields as null", () => {
    expect(
      emailCampaignListItemSchema.safeParse({
        ...valid,
        subject: null,
        message: null,
        progress: null,
        target: null,
        status: null,
        created_at: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing campaign_uuid", () => {
    const { campaign_uuid: _, ...rest } = valid;
    expect(emailCampaignListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-boolean status", () => {
    expect(
      emailCampaignListItemSchema.safeParse({ ...valid, status: "active" }).success,
    ).toBe(false);
  });

  it("rejects non-number progress", () => {
    expect(
      emailCampaignListItemSchema.safeParse({ ...valid, progress: "half" }).success,
    ).toBe(false);
  });

  it("rejects non-date created_at", () => {
    expect(
      emailCampaignListItemSchema.safeParse({ ...valid, created_at: "yesterday" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listEmailCampaignsResultSchema
// ---------------------------------------------------------------------------
describe("listEmailCampaignsResultSchema", () => {
  const valid = () => ({
    campaigns: [
      {
        campaign_uuid: "camp-uuid-1",
        subject: null,
        message: null,
        progress: null,
        target: null,
        status: null,
        created_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  it("accepts a valid paginated result", () => {
    expect(listEmailCampaignsResultSchema.safeParse(valid()).success).toBe(true);
  });

  it("accepts empty campaigns array", () => {
    expect(
      listEmailCampaignsResultSchema.safeParse({ ...valid(), campaigns: [] }).success,
    ).toBe(true);
  });

  it("rejects missing campaigns", () => {
    const { campaigns: _, ...rest } = valid();
    expect(listEmailCampaignsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-array campaigns", () => {
    expect(
      listEmailCampaignsResultSchema.safeParse({ ...valid(), campaigns: "not-array" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createUpdateResultSchema
// ---------------------------------------------------------------------------
describe("createUpdateResultSchema", () => {
  const valid = { operation: "create", message: "Campaign created" };

  it("accepts a valid result", () => {
    expect(createUpdateResultSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing operation", () => {
    const { operation: _, ...rest } = valid;
    expect(createUpdateResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing message", () => {
    const { message: _, ...rest } = valid;
    expect(createUpdateResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-string operation", () => {
    expect(
      createUpdateResultSchema.safeParse({ ...valid, operation: 123 }).success,
    ).toBe(false);
  });
});
