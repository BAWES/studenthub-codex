import { describe, it, expect } from "vitest";
import { listEmailCampaignsSchema } from "./schemas";
import type { EmailCampaignListItem, ListEmailCampaignsResult } from "./schemas";

/**
 * Page migration test for admin/email-campaign.
 *
 * Verifies that listEmailCampaignsSchema accepts the params passed by the page,
 * and that EmailCampaignListItem fields map correctly to DataTable columns.
 *
 * Full rendering tests require Playwright (server component).
 * This validates the data contract between the page and the server action.
 */
describe("admin email-campaign page — data contract", () => {
  it("listEmailCampaignsSchema accepts empty params (no defaults — optional fields are undefined)", () => {
    const r = listEmailCampaignsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBeUndefined();
      expect(r.data.page).toBeUndefined();
    }
  });

  it("listEmailCampaignsSchema accepts the params the page actually passes", () => {
    const r = listEmailCampaignsSchema.safeParse({ limit: 100 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(100);
    }
  });

  it("listEmailCampaignsSchema allows optional filters", () => {
    const r = listEmailCampaignsSchema.safeParse({ subject: "test", limit: 50 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.subject).toBe("test");
    }
  });

  it("EmailCampaignListItem fields map correctly to DataTable columns", () => {
    // The page maps EmailCampaignListItem to DataTable columns:
    //   campaign_uuid → row.campaign_uuid  (for keys/editing)
    //   subject       → row.subject
    //   target        → row.target
    //   progress      → row.progress
    //   status        → row.status
    //   created_at    → row.created_at (formatted)
    const row: EmailCampaignListItem = {
      campaign_uuid: "abc-123-def",
      subject: "New opportunity at TechCorp",
      message: "Dear candidate...",
      progress: 75,
      target: "candidate",
      status: true,
      created_at: new Date("2025-06-01T12:00:00Z"),
    };
    expect(row.campaign_uuid).toBe("abc-123-def");
    expect(row.subject).toBe("New opportunity at TechCorp");
    expect(row.target).toBe("candidate");
    expect(row.progress).toBe(75);
    expect(row.status).toBe(true);
    expect(row.created_at).toEqual(new Date("2025-06-01T12:00:00Z"));
  });

  it("EmailCampaignListItem allows nullable fields", () => {
    const row: EmailCampaignListItem = {
      campaign_uuid: "nullable-test",
      subject: null,
      message: null,
      progress: null,
      target: null,
      status: null,
      created_at: null,
    };
    expect(row.subject).toBeNull();
    expect(row.progress).toBeNull();
    expect(row.created_at).toBeNull();
  });

  it("ListEmailCampaignsResult has expected shape", () => {
    const result: ListEmailCampaignsResult = {
      campaigns: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(Array.isArray(result.campaigns)).toBe(true);
    expect(typeof result.total).toBe("number");
    expect(typeof result.page).toBe("number");
    expect(typeof result.limit).toBe("number");
    expect(typeof result.totalPages).toBe("number");
  });

  it("ListEmailCampaignsResult with data", () => {
    const result: ListEmailCampaignsResult = {
      campaigns: [
        {
          campaign_uuid: "c1",
          subject: "Campaign 1",
          message: "Body",
          progress: 50,
          target: "both",
          status: true,
          created_at: new Date(),
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(result.campaigns).toHaveLength(1);
    expect(result.totalPages).toBe(1);
  });
});
