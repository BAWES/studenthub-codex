import { describe, it, expect } from "vitest";
import {
  inspectorWorkspaceOutputSchema,
  inspectorMetricSchema,
  inspectorRequestRowSchema,
  inspectorObjectOutputSchema,
  getInspectorWorkspaceSchema,
} from "./schemas";

/**
 * Page migration test for inspector workspace page.
 *
 * Verifies the data contract between page and action.
 * The inspector page calls getInspectorWorkspace(session.id) and
 * destructures data.inspector, data.metrics, data.requests.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("inspector workspace page — data contract", () => {
  it("getInspectorWorkspaceSchema accepts valid inspectorUuid", () => {
    const r = getInspectorWorkspaceSchema.safeParse({
      inspectorUuid: "abc-123",
    });
    expect(r.success).toBe(true);
  });

  it("getInspectorWorkspaceSchema rejects empty inspectorUuid", () => {
    const r = getInspectorWorkspaceSchema.safeParse({ inspectorUuid: "" });
    expect(r.success).toBe(false);
  });

  it("getInspectorWorkspaceSchema rejects missing inspectorUuid", () => {
    const r = getInspectorWorkspaceSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("getInspectorWorkspaceSchema rejects numeric inspectorUuid", () => {
    const r = getInspectorWorkspaceSchema.safeParse({ inspectorUuid: 123 });
    expect(r.success).toBe(false);
  });

  it("inspectorMetricSchema accepts number value", () => {
    const r = inspectorMetricSchema.safeParse({
      label: "Total Requests",
      value: 42,
      note: "This month",
    });
    expect(r.success).toBe(true);
  });

  it("inspectorMetricSchema accepts string value (Mode metric)", () => {
    const r = inspectorMetricSchema.safeParse({
      label: "Mode",
      value: "Review",
      note: "",
    });
    expect(r.success).toBe(true);
  });

  it("inspectorMetricSchema rejects missing label", () => {
    const r = inspectorMetricSchema.safeParse({
      value: 42,
      note: "",
    });
    expect(r.success).toBe(false);
  });

  it("inspectorMetricSchema rejects missing value", () => {
    const r = inspectorMetricSchema.safeParse({
      label: "Test",
      note: "",
    });
    expect(r.success).toBe(false);
  });

  it("inspectorRequestRowSchema accepts valid request row", () => {
    const r = inspectorRequestRowSchema.safeParse({
      id: "req-1",
      title: "Batch #42",
      subtitle: "5 candidates",
      meta: "Pending",
    });
    expect(r.success).toBe(true);
  });

  it("inspectorRequestRowSchema rejects missing id", () => {
    const r = inspectorRequestRowSchema.safeParse({
      title: "Batch",
      subtitle: "",
      meta: "",
    });
    expect(r.success).toBe(false);
  });

  it("inspectorRequestRowSchema rejects empty id", () => {
    const r = inspectorRequestRowSchema.safeParse({
      id: "",
      title: "Batch",
      subtitle: "",
      meta: "",
    });
    expect(r.success).toBe(false);
  });

  it("inspectorRequestRowSchema accepts empty subtitle", () => {
    const r = inspectorRequestRowSchema.safeParse({
      id: "req-1",
      title: "Batch",
      subtitle: "",
      meta: "Pending",
    });
    expect(r.success).toBe(true);
  });

  it("inspectorObjectOutputSchema accepts valid inspector object", () => {
    const r = inspectorObjectOutputSchema.safeParse({
      inspector_name: "Ahmed Al-Sabah",
      inspector_email: "ahmed@example.com",
    });
    expect(r.success).toBe(true);
  });

  it("inspectorObjectOutputSchema rejects missing inspector_name", () => {
    const r = inspectorObjectOutputSchema.safeParse({
      inspector_email: "ahmed@example.com",
    });
    expect(r.success).toBe(false);
  });

  it("inspectorObjectOutputSchema rejects missing inspector_email", () => {
    const r = inspectorObjectOutputSchema.safeParse({
      inspector_name: "Ahmed",
    });
    expect(r.success).toBe(false);
  });

  it("inspectorWorkspaceOutputSchema accepts full workspace data", () => {
    const r = inspectorWorkspaceOutputSchema.safeParse({
      inspector: {
        inspector_name: "Ahmed Al-Sabah",
        inspector_email: "ahmed@example.com",
      },
      metrics: [
        { label: "Total Requests", value: 150, note: "" },
        { label: "Verified", value: 80, note: "53%" },
        { label: "Pending", value: 50, note: "33%" },
        { label: "Mode", value: "Review", note: "" },
      ],
      requests: [
        {
          id: "req-1",
          title: "Batch #42",
          subtitle: "5 candidates",
          meta: "Pending",
        },
        {
          id: "req-2",
          title: "Batch #43",
          subtitle: "3 candidates",
          meta: "Verified",
        },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("inspectorWorkspaceOutputSchema accepts nullable inspector (no inspector assigned)", () => {
    const r = inspectorWorkspaceOutputSchema.safeParse({
      inspector: null,
      metrics: [
        { label: "A", value: 1, note: "" },
        { label: "B", value: 2, note: "" },
        { label: "C", value: 3, note: "" },
        { label: "D", value: "X", note: "" },
      ],
      requests: [],
    });
    expect(r.success).toBe(true);
  });

  it("inspectorWorkspaceOutputSchema requires exactly 4 metrics", () => {
    const r = inspectorWorkspaceOutputSchema.safeParse({
      inspector: {
        inspector_name: "Ahmed",
        inspector_email: "a@b.com",
      },
      metrics: [
        { label: "A", value: 1, note: "" },
        { label: "B", value: 2, note: "" },
      ],
      requests: [],
    });
    expect(r.success).toBe(false);
  });

  it("inspectorWorkspaceOutputSchema rejects missing requests", () => {
    const r = inspectorWorkspaceOutputSchema.safeParse({
      inspector: {
        inspector_name: "Ahmed",
        inspector_email: "a@b.com",
      },
      metrics: [
        { label: "A", value: 1, note: "" },
        { label: "B", value: 2, note: "" },
        { label: "C", value: 3, note: "" },
        { label: "D", value: "X", note: "" },
      ],
    });
    expect(r.success).toBe(false);
  });
});
