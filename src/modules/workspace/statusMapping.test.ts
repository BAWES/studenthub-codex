import { describe, it, expect } from "vitest";
import {
  lookupStatus,
  mapCandidateStatus,
  mapRequestStatus,
  mapCompanyStatus,
  mapTransferStatus,
} from "./statusMapping";

// ---------------------------------------------------------------------------
// lookupStatus — centralized registry
// ---------------------------------------------------------------------------

describe("lookupStatus", () => {
  describe("candidate domain", () => {
    it("returns 'Needs review' when approved is 0", () => {
      const result = lookupStatus("candidate", {
        approved: 0,
        candidateStatus: 0,
      });
      expect(result).toEqual({ variant: "warning", label: "Needs review" });
    });

    it("returns 'Active' when candidateStatus is 10", () => {
      const result = lookupStatus("candidate", {
        approved: 1,
        candidateStatus: 10,
      });
      expect(result).toEqual({ variant: "success", label: "Active" });
    });

    it("returns 'Status N' for unknown candidateStatus", () => {
      const result = lookupStatus("candidate", {
        approved: 1,
        candidateStatus: 5,
      });
      expect(result).toEqual({ variant: "neutral", label: "Status 5" });
    });

    it("returns 'Unknown' when both inputs are null", () => {
      const result = lookupStatus("candidate", {
        approved: null,
        candidateStatus: null,
      });
      expect(result).toEqual({ variant: "neutral", label: "Unknown" });
    });

    it("prefers 'Needs review' over candidateStatus when approved is 0", () => {
      const result = lookupStatus("candidate", {
        approved: 0,
        candidateStatus: 10,
      });
      expect(result).toEqual({ variant: "warning", label: "Needs review" });
    });
  });

  describe("request domain", () => {
    it("returns info+Started for 'started'", () => {
      expect(lookupStatus("request", "started")).toEqual({
        variant: "info",
        label: "Started",
      });
    });

    it("returns success+Delivered for 'delivered'", () => {
      expect(lookupStatus("request", "delivered")).toEqual({
        variant: "success",
        label: "Delivered",
      });
    });

    it("returns error+Cancelled for 'cancelled'", () => {
      expect(lookupStatus("request", "cancelled")).toEqual({
        variant: "error",
        label: "Cancelled",
      });
    });

    it("returns info+'Finished by Recruitment' for 'finished_by_recruitment'", () => {
      expect(lookupStatus("request", "finished_by_recruitment")).toEqual({
        variant: "info",
        label: "Finished by Recruitment",
      });
    });

    it("handles case-insensitive input", () => {
      expect(lookupStatus("request", "Started")).toEqual({
        variant: "info",
        label: "Started",
      });
      expect(lookupStatus("request", "DELIVERED")).toEqual({
        variant: "success",
        label: "Delivered",
      });
    });

    it("returns neutral+input for unknown status string", () => {
      expect(lookupStatus("request", "unknown_value")).toEqual({
        variant: "neutral",
        label: "unknown_value",
      });
    });

    it("returns neutral+'No status' for null/undefined", () => {
      expect(lookupStatus("request", null)).toEqual({
        variant: "neutral",
        label: "No status",
      });
      expect(lookupStatus("request", undefined)).toEqual({
        variant: "neutral",
        label: "No status",
      });
    });
  });

  describe("company domain", () => {
    it("returns success+Approved for true", () => {
      expect(lookupStatus("company", true)).toEqual({
        variant: "success",
        label: "Approved",
      });
    });

    it("returns error+'Not approved' for false", () => {
      expect(lookupStatus("company", false)).toEqual({
        variant: "error",
        label: "Not approved",
      });
    });
  });

  describe("transfer domain", () => {
    it("maps code 0 to neutral+Draft", () => {
      expect(lookupStatus("transfer", 0)).toEqual({
        variant: "neutral",
        label: "Draft",
      });
    });

    it("maps code 1 to warning+Pending", () => {
      expect(lookupStatus("transfer", 1)).toEqual({
        variant: "warning",
        label: "Pending",
      });
    });

    it("maps code 3 to info+Processing", () => {
      expect(lookupStatus("transfer", 3)).toEqual({
        variant: "info",
        label: "Processing",
      });
    });

    it("maps code 4 to success+Completed", () => {
      expect(lookupStatus("transfer", 4)).toEqual({
        variant: "success",
        label: "Completed",
      });
    });

    it("maps code 5 to error+Cancelled", () => {
      expect(lookupStatus("transfer", 5)).toEqual({
        variant: "error",
        label: "Cancelled",
      });
    });

    it("maps code 10 to neutral+Archived", () => {
      expect(lookupStatus("transfer", 10)).toEqual({
        variant: "neutral",
        label: "Archived",
      });
    });

    it("returns neutral+'Status N' for unknown code", () => {
      expect(lookupStatus("transfer", 99)).toEqual({
        variant: "neutral",
        label: "Status 99",
      });
    });

    it("returns neutral+'No status' for null/undefined", () => {
      expect(lookupStatus("transfer", null)).toEqual({
        variant: "neutral",
        label: "No status",
      });
      expect(lookupStatus("transfer", undefined)).toEqual({
        variant: "neutral",
        label: "No status",
      });
    });
  });
});

// ---------------------------------------------------------------------------
// Legacy per-domain wrappers — must match lookupStatus output
// ---------------------------------------------------------------------------

describe("mapCandidateStatus (legacy wrapper)", () => {
  it("delegates to lookupStatus", () => {
    expect(mapCandidateStatus(0, 0)).toEqual(
      lookupStatus("candidate", { approved: 0, candidateStatus: 0 }),
    );
    expect(mapCandidateStatus(1, 10)).toEqual(
      lookupStatus("candidate", { approved: 1, candidateStatus: 10 }),
    );
  });
});

describe("mapRequestStatus (legacy wrapper)", () => {
  it("delegates to lookupStatus", () => {
    expect(mapRequestStatus("started")).toEqual(
      lookupStatus("request", "started"),
    );
    expect(mapRequestStatus(null)).toEqual(lookupStatus("request", null));
  });
});

describe("mapCompanyStatus (legacy wrapper)", () => {
  it("delegates to lookupStatus", () => {
    expect(mapCompanyStatus(true)).toEqual(lookupStatus("company", true));
    expect(mapCompanyStatus(false)).toEqual(lookupStatus("company", false));
  });
});

describe("mapTransferStatus (legacy wrapper)", () => {
  it("delegates to lookupStatus", () => {
    expect(mapTransferStatus(1)).toEqual(lookupStatus("transfer", 1));
    expect(mapTransferStatus(null)).toEqual(lookupStatus("transfer", null));
  });
});
