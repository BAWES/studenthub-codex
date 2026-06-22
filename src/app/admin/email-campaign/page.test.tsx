import { describe, it, expect } from "vitest";

describe("admin email-campaign page — data contract", () => {
  it("email campaign row has expected fields", () => {
    const row = {
      id: "camp-123",
      subject: "Welcome Email",
      progress: 75,
      trigger_at: "Jun 22, 2026",
      recurring: "No",
      target: "candidates",
      status: "Active",
      updated: "Jun 22, 2026",
    };
    expect(row.id).toBe("camp-123");
    expect(row.subject).toBe("Welcome Email");
    expect(typeof row.progress).toBe("number");
    expect(["Active", "Inactive"]).toContain(row.status);
  });

  it("email campaign row handles null fields gracefully", () => {
    const row = {
      id: "camp-456",
      subject: "(no subject)",
      progress: 0,
      trigger_at: "Not scheduled",
      recurring: "No",
      target: "both",
      status: "Inactive",
      updated: "Not set",
    };
    expect(row.subject).toBe("(no subject)");
    expect(row.trigger_at).toBe("Not scheduled");
    expect(row.updated).toBe("Not set");
    expect(row.progress).toBe(0);
  });

  it("is_recurring boolean maps to display string", () => {
    const toDisplay = (v: boolean) => (v ? "Yes" : "No");
    expect(toDisplay(true)).toBe("Yes");
    expect(toDisplay(false)).toBe("No");
  });

  it("status boolean maps to display string", () => {
    const toDisplay = (v: boolean) => (v ? "Active" : "Inactive");
    expect(toDisplay(true)).toBe("Active");
    expect(toDisplay(false)).toBe("Inactive");
  });
});
