import { describe, it, expect } from "vitest";
import {
  workspaceMetricSchema,
  workspaceContactSchema,
  workspaceCompanyItemSchema,
  workspaceRequestItemSchema,
  workspaceOverviewDataSchema,
} from "./schemas";

describe("company workspace page — data contract", () => {
  it("workspaceMetricSchema validates a valid metric", () => {
    const r = workspaceMetricSchema.safeParse({
      label: "Active Requests",
      value: 5,
      note: "3 pending, 2 in review",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.label).toBe("Active Requests");
  });

  it("workspaceMetricSchema rejects missing label", () => {
    const r = workspaceMetricSchema.safeParse({ value: 5, note: "test" });
    expect(r.success).toBe(false);
  });

  it("workspaceContactSchema validates a contact", () => {
    const r = workspaceContactSchema.safeParse({
      contact_name: "John Doe",
      contact_email: "john@example.com",
    });
    expect(r.success).toBe(true);
  });

  it("workspaceContactSchema accepts null", () => {
    const r = workspaceContactSchema.safeParse(null);
    expect(r.success).toBe(true);
  });

  it("workspaceCompanyItemSchema validates a valid company item", () => {
    const r = workspaceCompanyItemSchema.safeParse({
      id: 1,
      title: "Tech Corp",
      subtitle: "Kuwait - Technology",
      meta: "5 active requests",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.title).toBe("Tech Corp");
  });

  it("workspaceCompanyItemSchema validates with string id", () => {
    const r = workspaceCompanyItemSchema.safeParse({
      id: "req-1",
      title: "Request 1",
      subtitle: "Pending",
    });
    expect(r.success).toBe(true);
  });

  it("workspaceCompanyItemSchema rejects missing id", () => {
    const r = workspaceCompanyItemSchema.safeParse({ title: "Item" });
    expect(r.success).toBe(false);
  });

  it("workspaceRequestItemSchema validates a valid request item", () => {
    const r = workspaceRequestItemSchema.safeParse({
      id: "req-1",
      title: "Software Engineer",
      subtitle: "Tech Corp - Kuwait",
      meta: "3 candidates",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.title).toBe("Software Engineer");
  });

  it("workspaceOverviewDataSchema validates full overview data", () => {
    const r = workspaceOverviewDataSchema.safeParse({
      contact: {
        contact_name: "John Doe",
        contact_email: "john@example.com",
      },
      metrics: [
        { label: "Active Requests", value: 5, note: "3 pending" },
        { label: "Total Candidates", value: 100, note: "10 new this month" },
        { label: "Open Positions", value: 3, note: "2 urgent" },
        { label: "Interviews This Week", value: 8, note: "4 scheduled" },
      ],
      companies: [
        { id: 1, title: "Tech Corp", subtitle: "Kuwait", meta: "5 requests" },
      ],
      requests: [
        { id: "req-1", title: "Engineer", subtitle: "Full-time", meta: "3 candidates" },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("workspaceOverviewDataSchema rejects when metrics length != 4", () => {
    const r = workspaceOverviewDataSchema.safeParse({
      contact: null,
      metrics: [
        { label: "M1", value: 1, note: "n" },
      ],
      companies: [],
      requests: [],
    });
    expect(r.success).toBe(false);
  });
});
