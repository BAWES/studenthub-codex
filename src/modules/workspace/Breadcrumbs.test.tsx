import { describe, it, expect } from "vitest";
import { humanize } from "./Breadcrumbs";

describe("humanize", () => {
  it("converts a simple kebab-case segment to Title Case", () => {
    expect(humanize("candidates")).toBe("Candidates");
    expect(humanize("Candidates")).toBe("Candidates");
  });

  it("converts multi-word kebab-case to Title Case", () => {
    expect(humanize("new-application")).toBe("New Application");
    expect(humanize("id-reviews")).toBe("Id Reviews");
    expect(humanize("pending-approvals")).toBe("Pending Approvals");
  });

  it("maps [id] to Detail", () => {
    expect(humanize("[id]")).toBe("Detail");
  });

  it("maps bare id to Detail", () => {
    expect(humanize("id")).toBe("Detail");
  });

  it("handles mixed patterns like id-requests", () => {
    expect(humanize("id-requests")).toBe("Id Requests");
  });

  it("handles empty input", () => {
    expect(humanize("")).toBe("");
  });
});
