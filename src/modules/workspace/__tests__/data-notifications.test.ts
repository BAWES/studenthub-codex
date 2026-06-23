import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Notification type mapping — mirrored from Yii2 CandidateNotification
// constants. Test pure logic for label resolution.
// ---------------------------------------------------------------------------

const NOTIFICATION_TYPE_LABELS: Record<number, string> = {
  0: "Invitation",
  1: "Assignment",
  2: "Unassigned",
  3: "Work Approved",
  4: "Work Rejected",
  5: "Transfer Initiated",
  6: "Transfer Paid",
  7: "Transfer Unpaid",
  8: "Work Session Approved",
  9: "Work Session Rejected",
  10: "Job Interest Shortlisted",
  11: "Job Interest Rejected",
};

function getNotificationTypeLabel(type: number): string {
  return NOTIFICATION_TYPE_LABELS[type] ?? `Unknown (${type})`;
}

describe("getNotificationTypeLabel", () => {
  it("returns label for type 0 (Invitation)", () => {
    expect(getNotificationTypeLabel(0)).toBe("Invitation");
  });

  it("returns label for type 1 (Assignment)", () => {
    expect(getNotificationTypeLabel(1)).toBe("Assignment");
  });

  it("returns label for type 3 (Work Approved)", () => {
    expect(getNotificationTypeLabel(3)).toBe("Work Approved");
  });

  it("returns label for type 5 (Transfer Initiated)", () => {
    expect(getNotificationTypeLabel(5)).toBe("Transfer Initiated");
  });

  it("returns 'Unknown (N)' for unrecognised type", () => {
    expect(getNotificationTypeLabel(99)).toBe("Unknown (99)");
  });

  it("handles all known types without throwing", () => {
    const known = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    for (const t of known) {
      const label = getNotificationTypeLabel(t);
      expect(label).not.toContain("Unknown");
    }
  });

  it("handles edge case type 11 (Job Interest Rejected)", () => {
    expect(getNotificationTypeLabel(11)).toBe("Job Interest Rejected");
  });
});
