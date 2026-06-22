import { describe, it, expect } from "vitest";
import { searchCandidatesQuerySchema } from "./schemas";

describe("searchCandidatesQuerySchema", () => {
  it("accepts empty input with defaults", () => {
    const r = searchCandidatesQuerySchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.q).toBe("");
      expect(r.data.filter).toBe("all");
      expect(r.data.role).toBe("admin");
      expect(r.data.page).toBe(1);
    }
  });

  it("accepts a valid search query", () => {
    const r = searchCandidatesQuerySchema.safeParse({ q: "engineer", filter: "active", page: "2" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.q).toBe("engineer");
      expect(r.data.filter).toBe("active");
      expect(r.data.page).toBe(2);
    }
  });

  it("accepts all facet filters", () => {
    const r = searchCandidatesQuerySchema.safeParse({
      country: "1",
      university: "2",
      company: "3",
      skill: "JavaScript",
      gender: "1",
      profile: "complete",
      assignment: "assigned",
      document: "resume",
    });
    expect(r.success).toBe(true);
  });

  it("accepts staff role with staffId", () => {
    const r = searchCandidatesQuerySchema.safeParse({ role: "staff", staffId: "5" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.role).toBe("staff");
      expect(r.data.staffId).toBe(5);
    }
  });

  it("rejects invalid filter value", () => {
    const r = searchCandidatesQuerySchema.safeParse({ filter: "invalid" });
    expect(r.success).toBe(false);
  });

  it("rejects invalid role value", () => {
    const r = searchCandidatesQuerySchema.safeParse({ role: "superadmin" });
    expect(r.success).toBe(false);
  });

  it("rejects negative page number", () => {
    const r = searchCandidatesQuerySchema.safeParse({ page: "-1" });
    expect(r.success).toBe(false);
  });

  it("rejects zero page number", () => {
    const r = searchCandidatesQuerySchema.safeParse({ page: "0" });
    expect(r.success).toBe(false);
  });

  it("rejects invalid profile value", () => {
    const r = searchCandidatesQuerySchema.safeParse({ profile: "partial" });
    expect(r.success).toBe(false);
  });

  it("rejects invalid assignment value", () => {
    const r = searchCandidatesQuerySchema.safeParse({ assignment: "all" });
    expect(r.success).toBe(false);
  });

  it("rejects invalid document value", () => {
    const r = searchCandidatesQuerySchema.safeParse({ document: "photo-id" });
    expect(r.success).toBe(false);
  });

  it("accepts all valid filter presets", () => {
    for (const filter of ["all", "active", "needs-review", "incomplete", "civil-id"] as const) {
      expect(searchCandidatesQuerySchema.safeParse({ filter }).success).toBe(true);
    }
  });

  it("accepts all valid role options", () => {
    for (const role of ["admin", "staff", "candidate"] as const) {
      expect(searchCandidatesQuerySchema.safeParse({ role }).success).toBe(true);
    }
  });

  it("accepts visibility param", () => {
    const r = searchCandidatesQuerySchema.safeParse({ visibility: "assigned" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.visibility).toBe("assigned");
    }
  });
});
