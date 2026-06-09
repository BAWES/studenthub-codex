import { describe, it, expect } from "vitest";
import {
  TRANSITION_RULES,
  getValidTransitions,
  isValidTransition,
  transitionError,
} from "./transition-rules";

// ---------------------------------------------------------------------------
// Status transition rules for request lifecycle
//
// Maps the valid state machine transitions from the legacy Yii2
// RequestController. Tests are pure — no DB, no session.
// ---------------------------------------------------------------------------

// ===========================================================================
// TRANSITION_RULES map
// ===========================================================================

describe("TRANSITION_RULES", () => {
  it("defines transitions for all 6 statuses", () => {
    expect(Object.keys(TRANSITION_RULES).sort()).toEqual([
      "cancelled",
      "delivered",
      "finished_by_recruitment",
      "pending",
      "re_work",
      "started",
    ]);
  });

  it("defines valid transitions for 'pending'", () => {
    expect(TRANSITION_RULES.pending.sort()).toEqual([
      "cancelled",
      "finished_by_recruitment",
      "started",
    ]);
  });

  it("defines valid transitions for 'started'", () => {
    expect(TRANSITION_RULES.started.sort()).toEqual([
      "cancelled",
      "delivered",
      "pending",
    ]);
  });

  it("defines valid transitions for 'delivered'", () => {
    expect(TRANSITION_RULES.delivered).toEqual(["re_work"]);
  });

  it("allows re_work to go back to started or delivered", () => {
    expect(TRANSITION_RULES.re_work.sort()).toEqual(["delivered", "started"]);
  });

  it("marks 'cancelled' as terminal (empty transitions)", () => {
    expect(TRANSITION_RULES.cancelled).toEqual([]);
  });

  it("marks 'finished_by_recruitment' as terminal (empty transitions)", () => {
    expect(TRANSITION_RULES.finished_by_recruitment).toEqual([]);
  });
});

// ===========================================================================
// getValidTransitions
// ===========================================================================

describe("getValidTransitions", () => {
  it("returns valid targets for pending", () => {
    const t = getValidTransitions("pending");
    expect(t).toBeDefined();
    expect(t!.sort()).toEqual([
      "cancelled",
      "finished_by_recruitment",
      "started",
    ]);
  });

  it("returns null for an unknown status", () => {
    expect(getValidTransitions("unknown_status")).toBeNull();
  });

  it("returns empty array for terminal statuses", () => {
    expect(getValidTransitions("cancelled")).toEqual([]);
    expect(getValidTransitions("finished_by_recruitment")).toEqual([]);
  });
});

// ===========================================================================
// isValidTransition
// ===========================================================================

describe("isValidTransition", () => {
  // ---- Valid transitions ----
  it.each([
    ["pending", "started"],
    ["pending", "cancelled"],
    ["pending", "finished_by_recruitment"],
    ["started", "delivered"],
    ["started", "cancelled"],
    ["started", "pending"],
    ["delivered", "re_work"],
    ["re_work", "started"],
    ["re_work", "delivered"],
  ])("allows %s -> %s", (from, to) => {
    expect(isValidTransition(from, to)).toBe(true);
  });

  // ---- Invalid transitions ----
  it.each([
    ["pending", "delivered"],
    ["pending", "re_work"],
    ["pending", "pending"],
    ["started", "finished_by_recruitment"],
    ["started", "started"],
    ["delivered", "pending"],
    ["delivered", "started"],
    ["delivered", "cancelled"],
    ["delivered", "finished_by_recruitment"],
    ["delivered", "delivered"],
    ["cancelled", "pending"],
    ["cancelled", "started"],
    ["cancelled", "delivered"],
    ["cancelled", "re_work"],
    ["cancelled", "finished_by_recruitment"],
    ["finished_by_recruitment", "pending"],
    ["finished_by_recruitment", "started"],
    ["finished_by_recruitment", "delivered"],
    ["finished_by_recruitment", "re_work"],
    ["finished_by_recruitment", "finished_by_recruitment"],
    ["re_work", "pending"],
    ["re_work", "cancelled"],
    ["re_work", "finished_by_recruitment"],
    ["re_work", "re_work"],
  ])("rejects %s -> %s", (from, to) => {
    expect(isValidTransition(from, to)).toBe(false);
  });

  it("rejects transitions from unknown source status", () => {
    expect(isValidTransition("nonexistent", "pending")).toBe(false);
  });

  it("rejects transitions to unknown target status", () => {
    expect(isValidTransition("pending", "nonexistent")).toBe(false);
  });

  it("rejects transitions with empty source", () => {
    expect(isValidTransition("", "pending")).toBe(false);
  });

  it("rejects transitions with empty target", () => {
    expect(isValidTransition("pending", "")).toBe(false);
  });
});

// ===========================================================================
// transitionError
// ===========================================================================

describe("transitionError", () => {
  it("returns null for a valid transition", () => {
    expect(transitionError("pending", "started")).toBeNull();
    expect(transitionError("delivered", "re_work")).toBeNull();
    expect(transitionError("re_work", "delivered")).toBeNull();
  });

  it("returns error message for invalid transition", () => {
    const err = transitionError("pending", "delivered");
    expect(err).toBe(
      'Cannot transition from "pending" to "delivered". Valid targets: cancelled, finished_by_recruitment, started',
    );
  });

  it("returns error for terminal status", () => {
    const err = transitionError("cancelled", "started");
    expect(err).toBe(
      'Cannot transition from "cancelled" to "started". Valid targets: (terminal — no transitions allowed)',
    );
  });

  it("returns error for unknown source status", () => {
    const err = transitionError("bogus", "pending");
    expect(err).toBe('Unknown source status: "bogus"');
  });
});
