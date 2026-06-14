import { describe, it, expect } from "vitest";
import { applicationItemSchema } from "./schemas";

describe("candidate/applications/[id] — data contract", () => {
  it("applicationItemSchema validates a valid detail item", () => {
    const r = applicationItemSchema.safeParse({
      applicationId: 1,
      jobListingId: 101,
      jobTitle: "Software Engineer",
      employerName: "Tech Corp",
      status: "applied",
      coverLetter: "I am interested in this position.",
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-20"),
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.jobTitle).toBe("Software Engineer");
      expect(r.data.employerName).toBe("Tech Corp");
    }
  });

  it("applicationItemSchema validates with null cover letter", () => {
    const r = applicationItemSchema.safeParse({
      applicationId: 2,
      jobListingId: 102,
      jobTitle: "Designer",
      employerName: "Design Co",
      status: "pending",
      coverLetter: null,
      createdAt: null,
      updatedAt: null,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.coverLetter).toBeNull();
      expect(r.data.createdAt).toBeNull();
    }
  });

  it("applicationItemSchema rejects missing required applicationId", () => {
    const r = applicationItemSchema.safeParse({
      jobTitle: "Engineer",
      employerName: "Co",
      status: "applied",
    });
    expect(r.success).toBe(false);
  });

  it("applicationItemSchema rejects non-numeric applicationId", () => {
    const r = applicationItemSchema.safeParse({
      applicationId: "abc",
      jobListingId: 101,
      jobTitle: "Engineer",
      employerName: "Co",
      status: "applied",
    });
    expect(r.success).toBe(false);
  });

  it("applicationItemSchema coerces date strings to Date objects", () => {
    const r = applicationItemSchema.safeParse({
      applicationId: 3,
      jobListingId: 103,
      jobTitle: "Dev",
      employerName: "Corp",
      status: "hired",
      coverLetter: null,
      createdAt: "2024-06-01T00:00:00.000Z",
      updatedAt: null,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.createdAt).toBeInstanceOf(Date);
    }
  });
});
