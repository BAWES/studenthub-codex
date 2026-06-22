import { describe, it, expect } from "vitest";
import {
  inspectorMetricSchema,
  inspectorRequestRowSchema,
  inspectorObjectOutputSchema,
  inspectorWorkspaceOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Output schema validation tests
// ---------------------------------------------------------------------------

describe("inspectorMetricSchema", () => {
  const validMetric = {
    label: "Total Inspections",
    value: 42,
    note: "Inspections completed this month",
  };

  it("accepts a valid metric with numeric value", () => {
    expect(inspectorMetricSchema.safeParse(validMetric).success).toBe(true);
  });

  it("accepts a metric with string value", () => {
    expect(
      inspectorMetricSchema.safeParse({
        ...validMetric,
        value: "Review",
      }).success,
    ).toBe(true);
  });

  it("accepts empty note", () => {
    expect(
      inspectorMetricSchema.safeParse({
        ...validMetric,
        note: "",
      }).success,
    ).toBe(true);
  });

  it("rejects missing label", () => {
    const { label: _, ...rest } = validMetric;
    expect(inspectorMetricSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty label", () => {
    expect(
      inspectorMetricSchema.safeParse({
        ...validMetric,
        label: "",
      }).success,
    ).toBe(false);
  });

  it("rejects missing value", () => {
    const { value: _, ...rest } = validMetric;
    expect(inspectorMetricSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects boolean value", () => {
    expect(
      inspectorMetricSchema.safeParse({
        ...validMetric,
        value: true,
      }).success,
    ).toBe(false);
  });

  it("rejects missing note", () => {
    const { note: _, ...rest } = validMetric;
    expect(inspectorMetricSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects null value", () => {
    expect(
      inspectorMetricSchema.safeParse({
        ...validMetric,
        value: null,
      }).success,
    ).toBe(false);
  });
});

describe("inspectorRequestRowSchema", () => {
  const validRequest = {
    id: "req_001",
    title: "ID Verification Request",
    subtitle: "Pending review",
    meta: "Submitted 2026-06-10",
  };

  it("accepts a valid request row", () => {
    expect(inspectorRequestRowSchema.safeParse(validRequest).success).toBe(
      true,
    );
  });

  it("accepts empty subtitle", () => {
    expect(
      inspectorRequestRowSchema.safeParse({
        ...validRequest,
        subtitle: "",
      }).success,
    ).toBe(true);
  });

  it("accepts empty meta", () => {
    expect(
      inspectorRequestRowSchema.safeParse({
        ...validRequest,
        meta: "",
      }).success,
    ).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validRequest;
    expect(inspectorRequestRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty id", () => {
    expect(
      inspectorRequestRowSchema.safeParse({
        ...validRequest,
        id: "",
      }).success,
    ).toBe(false);
  });

  it("rejects missing title", () => {
    const { title: _, ...rest } = validRequest;
    expect(inspectorRequestRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty title", () => {
    expect(
      inspectorRequestRowSchema.safeParse({
        ...validRequest,
        title: "",
      }).success,
    ).toBe(false);
  });

  it("rejects missing subtitle", () => {
    const { subtitle: _, ...rest } = validRequest;
    expect(inspectorRequestRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing meta", () => {
    const { meta: _, ...rest } = validRequest;
    expect(inspectorRequestRowSchema.safeParse(rest).success).toBe(false);
  });
});

describe("inspectorObjectOutputSchema", () => {
  const validInspector = {
    inspector_name: "Jane Smith",
    inspector_email: "jane.smith@example.com",
  };

  it("accepts a valid inspector object", () => {
    expect(inspectorObjectOutputSchema.safeParse(validInspector).success).toBe(
      true,
    );
  });

  it("accepts empty name", () => {
    expect(
      inspectorObjectOutputSchema.safeParse({
        ...validInspector,
        inspector_name: "",
      }).success,
    ).toBe(true);
  });

  it("rejects missing inspector_name", () => {
    const { inspector_name: _, ...rest } = validInspector;
    expect(inspectorObjectOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing inspector_email", () => {
    const { inspector_email: _, ...rest } = validInspector;
    expect(inspectorObjectOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for inspector_email", () => {
    expect(
      inspectorObjectOutputSchema.safeParse({
        ...validInspector,
        inspector_email: 123,
      }).success,
    ).toBe(false);
  });
});

describe("inspectorWorkspaceOutputSchema", () => {
  const validWorkspace = {
    inspector: {
      inspector_name: "Jane Smith",
      inspector_email: "jane.smith@example.com",
    },
    metrics: [
      { label: "Total", value: 42, note: "Total inspections" },
      { label: "Pending", value: 10, note: "Pending reviews" },
      { label: "Approved", value: 30, note: "Approved requests" },
      { label: "Mode", value: "Review", note: "Current mode" },
    ],
    requests: [
      {
        id: "req_001",
        title: "ID Verification",
        subtitle: "Pending",
        meta: "2026-06-10",
      },
    ],
  };

  it("accepts a valid workspace with all fields", () => {
    expect(
      inspectorWorkspaceOutputSchema.safeParse(validWorkspace).success,
    ).toBe(true);
  });

  it("accepts null inspector", () => {
    expect(
      inspectorWorkspaceOutputSchema.safeParse({
        ...validWorkspace,
        inspector: null,
      }).success,
    ).toBe(true);
  });

  it("accepts empty requests array", () => {
    expect(
      inspectorWorkspaceOutputSchema.safeParse({
        ...validWorkspace,
        requests: [],
      }).success,
    ).toBe(true);
  });

  it("rejects metrics array with wrong length (less than 4)", () => {
    expect(
      inspectorWorkspaceOutputSchema.safeParse({
        ...validWorkspace,
        metrics: [
          { label: "Total", value: 42, note: "Total" },
          { label: "Pending", value: 10, note: "Pending" },
          { label: "Approved", value: 30, note: "Approved" },
        ],
      }).success,
    ).toBe(false);
  });

  it("rejects metrics array with wrong length (more than 4)", () => {
    expect(
      inspectorWorkspaceOutputSchema.safeParse({
        ...validWorkspace,
        metrics: [
          { label: "A", value: 1, note: "a" },
          { label: "B", value: 2, note: "b" },
          { label: "C", value: 3, note: "c" },
          { label: "D", value: 4, note: "d" },
          { label: "E", value: 5, note: "e" },
        ],
      }).success,
    ).toBe(false);
  });

  it("rejects missing inspector", () => {
    const { inspector: _, ...rest } = validWorkspace;
    expect(inspectorWorkspaceOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing metrics", () => {
    const { metrics: _, ...rest } = validWorkspace;
    expect(inspectorWorkspaceOutputSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing requests", () => {
    const { requests: _, ...rest } = validWorkspace;
    expect(inspectorWorkspaceOutputSchema.safeParse(rest).success).toBe(false);
  });
});
