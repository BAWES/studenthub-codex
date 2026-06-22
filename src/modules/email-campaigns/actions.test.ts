import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas (test the pure validation logic in isolation)
// ---------------------------------------------------------------------------

const listEmailCampaignsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  subject: z.string().optional(),
  target: z.string().optional(),
  status: z.boolean().optional(),
});

const getEmailCampaignSchema = z.object({
  campaignUuid: z.string().min(1, "Campaign UUID is required"),
});

const createEmailCampaignSchema = z.object({
  subject: z.string().optional(),
  message: z.string().optional(),
  target: z.string().optional(),
  isRecurring: z.boolean().optional(),
  triggerPeriod: z.number().int().positive().optional(),
  triggerDateTime: z.string().datetime().optional(),
});

const updateEmailCampaignSchema = z.object({
  campaignUuid: z.string().min(1, "Campaign UUID is required"),
  subject: z.string().optional(),
  message: z.string().optional(),
  target: z.string().optional(),
  isRecurring: z.boolean().optional(),
  triggerPeriod: z.number().int().positive().optional(),
  triggerDateTime: z.string().datetime().optional(),
  status: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// listEmailCampaignsSchema
// ---------------------------------------------------------------------------

describe("listEmailCampaignsSchema", () => {
  it("accepts empty params", () => {
    expect(listEmailCampaignsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts pagination params", () => {
    const r = listEmailCampaignsSchema.safeParse({ page: 1, limit: 20 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("rejects limit over 100", () => {
    expect(listEmailCampaignsSchema.safeParse({ limit: 999 }).success).toBe(false);
  });

  it("rejects negative page", () => {
    expect(listEmailCampaignsSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("accepts filter params", () => {
    const r = listEmailCampaignsSchema.safeParse({
      subject: "welcome",
      target: "candidate",
      status: true,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.subject).toBe("welcome");
      expect(r.data.target).toBe("candidate");
      expect(r.data.status).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// getEmailCampaignSchema
// ---------------------------------------------------------------------------

describe("getEmailCampaignSchema", () => {
  it("accepts a valid UUID", () => {
    const r = getEmailCampaignSchema.safeParse({ campaignUuid: "abc123" });
    expect(r.success).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(getEmailCampaignSchema.safeParse({ campaignUuid: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createEmailCampaignSchema
// ---------------------------------------------------------------------------

describe("createEmailCampaignSchema", () => {
  it("accepts empty object (all fields optional on create)", () => {
    expect(createEmailCampaignSchema.safeParse({}).success).toBe(true);
  });

  it("accepts full campaign data", () => {
    const r = createEmailCampaignSchema.safeParse({
      subject: "Welcome to StudentHub!",
      message: "<h1>Welcome</h1><p>Thank you for joining.</p>",
      target: "candidate",
      isRecurring: false,
      triggerPeriod: 7,
      triggerDateTime: "2026-06-15T09:00:00Z",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.subject).toBe("Welcome to StudentHub!");
      expect(r.data.target).toBe("candidate");
      expect(r.data.triggerPeriod).toBe(7);
    }
  });

  it("rejects non-positive triggerPeriod", () => {
    expect(createEmailCampaignSchema.safeParse({ triggerPeriod: 0 }).success).toBe(false);
  });

  it("rejects invalid datetime", () => {
    expect(createEmailCampaignSchema.safeParse({ triggerDateTime: "not-a-date" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateEmailCampaignSchema
// ---------------------------------------------------------------------------

describe("updateEmailCampaignSchema", () => {
  it("requires campaignUuid", () => {
    const r = updateEmailCampaignSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("accepts partial update with subject only", () => {
    const r = updateEmailCampaignSchema.safeParse({
      campaignUuid: "camp_001",
      subject: "Updated Subject",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.campaignUuid).toBe("camp_001");
      expect(r.data.subject).toBe("Updated Subject");
    }
  });

  it("accepts all update fields", () => {
    const r = updateEmailCampaignSchema.safeParse({
      campaignUuid: "camp_001",
      subject: "Reminder",
      message: "Don't forget!",
      target: "company",
      isRecurring: true,
      triggerPeriod: 3,
      status: true,
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty campaignUuid", () => {
    expect(updateEmailCampaignSchema.safeParse({ campaignUuid: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Type shapes
// ---------------------------------------------------------------------------

type EmailCampaignListItem = {
  campaign_uuid: string;
  subject: string | null;
  message: string | null;
  progress: number | null;
  target: string | null;
  status: boolean | null;
  created_at: Date | null;
};

type ListEmailCampaignsResult = {
  campaigns: EmailCampaignListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type CreateUpdateResult = {
  operation: string;
  message: string;
};

describe("EmailCampaignListItem shape", () => {
  it("defines the expected fields", () => {
    const item: EmailCampaignListItem = {
      campaign_uuid: "abc123",
      subject: "Welcome",
      message: null,
      progress: 50,
      target: "candidate",
      status: true,
      created_at: new Date(),
    };
    expect(item.campaign_uuid).toBe("abc123");
    expect(item.subject).toBe("Welcome");
    expect(item.progress).toBe(50);
    expect(item.target).toBe("candidate");
  });
});

describe("ListEmailCampaignsResult shape", () => {
  it("accepts empty result set", () => {
    const result: ListEmailCampaignsResult = {
      campaigns: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.total).toBe(0);
    expect(result.campaigns).toHaveLength(0);
  });
});

describe("CreateUpdateResult shape", () => {
  it("accepts success result", () => {
    const r: CreateUpdateResult = { operation: "success", message: "Done" };
    expect(r.operation).toBe("success");
  });

  it("accepts error result", () => {
    const r: CreateUpdateResult = { operation: "error", message: "Failed" };
    expect(r.operation).toBe("error");
  });
});
