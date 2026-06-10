import { describe, it, expect } from "vitest";
import {
  listCandidateJobsSchema,
  getCandidateJobSchema,
  applyToJobSchema,
  listMyApplicationsSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Candidate Job Browsing & Applications — schema tests
// ---------------------------------------------------------------------------

describe("listCandidateJobsSchema", () => {
  it("accepts valid input with all fields", () => {
    const r = listCandidateJobsSchema.safeParse({
      page: 1,
      limit: 20,
      q: "software",
      employmentType: "full-time",
      location: "Kuwait",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.q).toBe("software");
    }
  });

  it("defaults page and limit", () => {
    const r = listCandidateJobsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("rejects page < 1", () => {
    expect(listCandidateJobsSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects limit > 100", () => {
    expect(listCandidateJobsSchema.safeParse({ limit: 200 }).success).toBe(
      false,
    );
  });

  it("coerces string page to number", () => {
    const r = listCandidateJobsSchema.safeParse({ page: "2" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
    }
  });
});

describe("getCandidateJobSchema", () => {
  it("accepts valid job ID", () => {
    const r = getCandidateJobSchema.safeParse({ jobId: 42 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.jobId).toBe(42);
    }
  });

  it("rejects zero job ID", () => {
    expect(getCandidateJobSchema.safeParse({ jobId: 0 }).success).toBe(false);
  });

  it("rejects negative job ID", () => {
    expect(getCandidateJobSchema.safeParse({ jobId: -1 }).success).toBe(false);
  });

  it("rejects non-numeric job ID", () => {
    expect(
      getCandidateJobSchema.safeParse({ jobId: "abc" }).success,
    ).toBe(false);
  });

  it("rejects missing job ID", () => {
    expect(getCandidateJobSchema.safeParse({}).success).toBe(false);
  });

  it("coerces string job ID to number", () => {
    const r = getCandidateJobSchema.safeParse({ jobId: "7" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.jobId).toBe(7);
    }
  });
});

describe("applyToJobSchema", () => {
  it("accepts valid input", () => {
    const r = applyToJobSchema.safeParse({
      jobListingId: 42,
      coverLetter: "I am interested in this position.",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.jobListingId).toBe(42);
      expect(r.data.coverLetter).toBe("I am interested in this position.");
    }
  });

  it("accepts input with jobListingId only", () => {
    const r = applyToJobSchema.safeParse({ jobListingId: 42 });
    expect(r.success).toBe(true);
  });

  it("rejects zero job listing ID", () => {
    expect(applyToJobSchema.safeParse({ jobListingId: 0 }).success).toBe(false);
  });

  it("rejects negative job listing ID", () => {
    expect(applyToJobSchema.safeParse({ jobListingId: -1 }).success).toBe(false);
  });

  it("rejects missing jobListingId", () => {
    expect(applyToJobSchema.safeParse({}).success).toBe(false);
  });

  it("coerces string job listing ID to number", () => {
    const r = applyToJobSchema.safeParse({ jobListingId: "99" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.jobListingId).toBe(99);
    }
  });
});

describe("listMyApplicationsSchema", () => {
  it("accepts valid pagination", () => {
    const r = listMyApplicationsSchema.safeParse({ page: 1, limit: 10 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(10);
    }
  });

  it("defaults page and limit", () => {
    const r = listMyApplicationsSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("rejects page < 1", () => {
    expect(listMyApplicationsSchema.safeParse({ page: 0 }).success).toBe(
      false,
    );
  });

  it("rejects limit > 100", () => {
    expect(listMyApplicationsSchema.safeParse({ limit: 200 }).success).toBe(
      false,
    );
  });
});
