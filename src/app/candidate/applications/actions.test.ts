import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Barrel re-export verification — the app-level actions.ts is now a barrel
// re-export of @/modules/candidates/applications/actions. These tests verify
// that the barrel resolves the correct exports.
// Real logic behavior is tested in src/modules/candidates/applications/actions.test.ts.
// ---------------------------------------------------------------------------

import { applicationItemSchema, listApplicationsResultSchema, withdrawApplicationResultSchema } from "./schemas";

describe("actions barrel", () => {
  it("exports listMyApplications as a function", async () => {
    const { listMyApplications } = await import("./actions");
    expect(typeof listMyApplications).toBe("function");
  });

  it("exports withdrawApplication as a function", async () => {
    const { withdrawApplication } = await import("./actions");
    expect(typeof withdrawApplication).toBe("function");
  });
});

describe("Candidate Applications — Zod output schemas", () => {
  it("validates a valid ApplicationItem", () => {
    const item = {
      applicationId: 1,
      jobListingId: 10,
      jobTitle: "Software Engineer",
      employerName: "Tech Corp",
      status: "applied",
      coverLetter: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(applicationItemSchema.safeParse(item).success).toBe(true);
  });

  it("accepts a valid ApplicationItem with cover letter", () => {
    const item = {
      applicationId: 1,
      jobListingId: 10,
      jobTitle: "Software Engineer",
      employerName: "Tech Corp",
      status: "applied",
      coverLetter: "I am interested",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(applicationItemSchema.safeParse(item).success).toBe(true);
  });

  it("rejects an ApplicationItem missing required fields", () => {
    const item = {
      applicationId: 1,
      jobTitle: "Software Engineer",
    };
    expect(applicationItemSchema.safeParse(item).success).toBe(false);
  });

  it("rejects an ApplicationItem with wrong type for applicationId", () => {
    const item = {
      applicationId: "not-a-number",
      jobListingId: 10,
      jobTitle: "Software Engineer",
      employerName: "Tech Corp",
      status: "applied",
      coverLetter: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(applicationItemSchema.safeParse(item).success).toBe(false);
  });

  it("validates a valid ListApplicationsResult", () => {
    const data = {
      applications: [
        {
          applicationId: 1,
          jobListingId: 10,
          jobTitle: "Engineer",
          employerName: "Corp",
          status: "applied",
          coverLetter: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    };
    expect(listApplicationsResultSchema.safeParse(data).success).toBe(true);
  });

  it("rejects ListApplicationsResult with wrong applications type", () => {
    const data = {
      applications: "not-an-array",
      total: 1,
      page: 1,
      limit: 20,
    };
    expect(listApplicationsResultSchema.safeParse(data).success).toBe(false);
  });

  it("validates a successful withdraw result", () => {
    expect(withdrawApplicationResultSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("validates an error withdraw result", () => {
    expect(
      withdrawApplicationResultSchema.safeParse({ success: false, error: "Not found" }).success,
    ).toBe(true);
  });

  it("rejects an invalid withdraw result", () => {
    expect(withdrawApplicationResultSchema.safeParse({ success: "yes" }).success).toBe(false);
  });
});
