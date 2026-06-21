import { describe, it, expect } from "vitest";
import {
  applicationItemSchema,
  listApplicationsResultSchema,
  withdrawApplicationResultSchema,
} from "./schemas";

describe("candidate applications page — data contract", () => {
  it("applicationItemSchema validates a valid application item", () => {
    const r = applicationItemSchema.safeParse({
      applicationId: 1,
      jobListingId: 101,
      jobTitle: "Software Engineer",
      employerName: "Tech Corp",
      status: "pending",
      coverLetter: null,
      createdAt: new Date("2024-01-15"),
      updatedAt: null,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.jobTitle).toBe("Software Engineer");
  });

  it("applicationItemSchema rejects missing applicationId", () => {
    const r = applicationItemSchema.safeParse({ jobTitle: "Engineer", employerName: "Co", status: "pending" });
    expect(r.success).toBe(false);
  });

  it("listApplicationsResultSchema validates result list", () => {
    const r = listApplicationsResultSchema.safeParse({
      applications: [{
        applicationId: 1, jobListingId: 101, jobTitle: "Engineer",
        employerName: "Co", status: "pending", coverLetter: null,
        createdAt: null, updatedAt: null,
      }],
      total: 1, page: 1, limit: 20,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.applications.length).toBe(1);
  });

  it("listApplicationsResultSchema rejects non-array applications", () => {
    const r = listApplicationsResultSchema.safeParse({ applications: "bad", total: 0, page: 0, limit: 0 });
    expect(r.success).toBe(false);
  });

  it("withdrawApplicationResultSchema validates success", () => {
    const r = withdrawApplicationResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("withdrawApplicationResultSchema validates failure with error", () => {
    const r = withdrawApplicationResultSchema.safeParse({ success: false, error: "Already withdrawn" });
    expect(r.success).toBe(true);
  });
});
