import { describe, it, expect } from "vitest";
import {
  applicationItemSchema,
  listApplicationsResultSchema,
  applicationActionResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// applicationItemSchema
// ---------------------------------------------------------------------------

describe("applicationItemSchema", () => {
  const validItem = () => ({
    applicationId: 1,
    jobListingId: 10,
    jobTitle: "Software Engineer",
    employerName: "Acme Corp",
    status: "applied",
    coverLetter: "I am interested...",
    createdAt: new Date("2026-06-01"),
    updatedAt: new Date("2026-06-05"),
  });

  it("accepts a valid application item", () => {
    const r = applicationItemSchema.safeParse(validItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable coverLetter and dates", () => {
    const r = applicationItemSchema.safeParse({
      ...validItem(),
      coverLetter: null,
      createdAt: null,
      updatedAt: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing applicationId", () => {
    const { applicationId: _, ...rest } = validItem();
    expect(applicationItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-integer jobListingId", () => {
    expect(
      applicationItemSchema.safeParse({ ...validItem(), jobListingId: "ten" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listApplicationsResultSchema
// ---------------------------------------------------------------------------

describe("listApplicationsResultSchema", () => {
  const validItem = () => ({
    applicationId: 1,
    jobListingId: 10,
    jobTitle: "Engineer",
    employerName: "Acme",
    status: "applied",
    coverLetter: null,
    createdAt: null,
    updatedAt: null,
  });

  it("accepts a valid paginated result", () => {
    const r = listApplicationsResultSchema.safeParse({
      items: [validItem()],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty items", () => {
    const r = listApplicationsResultSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing total", () => {
    const r = listApplicationsResultSchema.safeParse({
      items: [], page: 1, pageSize: 20,
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// applicationActionResultSchema  (discriminatedUnion)
// ---------------------------------------------------------------------------

describe("applicationActionResultSchema", () => {
  it("accepts success with applicationId", () => {
    const r = applicationActionResultSchema.safeParse({ success: true, applicationId: 42 });
    expect(r.success).toBe(true);
  });

  it("rejects success without applicationId", () => {
    const r = applicationActionResultSchema.safeParse({ success: true });
    expect(r.success).toBe(false);
  });

  it("accepts failure with error", () => {
    const r = applicationActionResultSchema.safeParse({ success: false, error: "Failed" });
    expect(r.success).toBe(true);
  });

  it("rejects failure without error", () => {
    const r = applicationActionResultSchema.safeParse({ success: false });
    expect(r.success).toBe(false);
  });

  it("rejects unknown discriminator", () => {
    const r = applicationActionResultSchema.safeParse({ success: "maybe", error: "X" });
    expect(r.success).toBe(false);
  });
});
