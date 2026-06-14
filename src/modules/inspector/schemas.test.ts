import { describe, it, expect } from "vitest";
import {
  idRequestListItemSchema,
  idRequestDetailSchema,
  listRequestsResultSchema,
  getRequestResultSchema,
  inspectorActionResultSchema,
  inspectorAccountItemSchema,
  getInspectorResultSchema,
  listInspectorsResultSchema,
  inspectorMetricSchema,
  inspectorRequestRowSchema,
  inspectorObjectOutputSchema,
  inspectorWorkspaceOutputSchema,
} from "./schemas";

const validIdRequestItem = () => ({
  cir_uuid: "cir-001",
  candidate_count: 3,
  status: "pending",
  rejection_reason: null,
  created_at: null,
  updated_at: null,
  created_by_name: "Staff User",
});

const validIdRequestDetail = () => ({
  cir_uuid: "cir-001",
  status: "pending",
  rejection_reason: null,
  created_at: null,
  updated_at: null,
  created_by_name: "Staff User",
  updated_by_name: null,
});

const validInspectorAccount = () => ({
  inspector_uuid: "insp-001",
  inspector_name: "Inspector A",
  inspector_email: "inspector@example.com",
  inspector_status: 1,
  inspector_created_at: new Date("2026-01-01"),
  inspector_updated_at: new Date("2026-06-01"),
});

// ---------------------------------------------------------------------------
// idRequestListItemSchema
// ---------------------------------------------------------------------------

describe("idRequestListItemSchema", () => {
  it("accepts a valid item", () => {
    const r = idRequestListItemSchema.safeParse(validIdRequestItem());
    expect(r.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const r = idRequestListItemSchema.safeParse({
      ...validIdRequestItem(),
      status: null,
      rejection_reason: null,
      created_at: null,
      updated_at: null,
      created_by_name: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing cir_uuid", () => {
    const { cir_uuid: _, ...rest } = validIdRequestItem();
    expect(idRequestListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative candidate_count", () => {
    expect(idRequestListItemSchema.safeParse({ ...validIdRequestItem(), candidate_count: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// idRequestDetailSchema
// ---------------------------------------------------------------------------

describe("idRequestDetailSchema", () => {
  it("accepts a valid detail", () => {
    const r = idRequestDetailSchema.safeParse(validIdRequestDetail());
    expect(r.success).toBe(true);
  });

  it("rejects missing cir_uuid", () => {
    const { cir_uuid: _, ...rest } = validIdRequestDetail();
    expect(idRequestDetailSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listRequestsResultSchema
// ---------------------------------------------------------------------------

describe("listRequestsResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const r = listRequestsResultSchema.safeParse({
      requests: [validIdRequestItem()],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("accepts empty requests array", () => {
    expect(
      listRequestsResultSchema.safeParse({ requests: [], total: 0, page: 1, limit: 20, totalPages: 0 }).success,
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getRequestResultSchema
// ---------------------------------------------------------------------------

describe("getRequestResultSchema", () => {
  it("accepts a valid detail object", () => {
    const r = getRequestResultSchema.safeParse(validIdRequestDetail());
    expect(r.success).toBe(true);
  });

  it("accepts null", () => {
    expect(getRequestResultSchema.safeParse(null).success).toBe(true);
  });

  it("rejects undefined", () => {
    expect(getRequestResultSchema.safeParse(undefined).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// inspectorActionResultSchema
// ---------------------------------------------------------------------------

describe("inspectorActionResultSchema", () => {
  it("accepts success: true", () => {
    expect(inspectorActionResultSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("accepts success: false", () => {
    expect(inspectorActionResultSchema.safeParse({ success: false }).success).toBe(true);
  });

  it("rejects missing success", () => {
    expect(inspectorActionResultSchema.safeParse({}).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// inspectorAccountItemSchema
// ---------------------------------------------------------------------------

describe("inspectorAccountItemSchema", () => {
  it("accepts a valid account item", () => {
    const r = inspectorAccountItemSchema.safeParse(validInspectorAccount());
    expect(r.success).toBe(true);
  });

  it("rejects non-string inspector_name", () => {
    expect(inspectorAccountItemSchema.safeParse({ ...validInspectorAccount(), inspector_name: 42 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getInspectorResultSchema
// ---------------------------------------------------------------------------

describe("getInspectorResultSchema", () => {
  it("accepts a valid inspector", () => {
    const r = getInspectorResultSchema.safeParse(validInspectorAccount());
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// listInspectorsResultSchema
// ---------------------------------------------------------------------------

describe("listInspectorsResultSchema", () => {
  it("accepts a valid paginated result", () => {
    const r = listInspectorsResultSchema.safeParse({
      inspectors: [validInspectorAccount()],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// inspectorMetricSchema
// ---------------------------------------------------------------------------

describe("inspectorMetricSchema", () => {
  it("accepts numeric value", () => {
    expect(inspectorMetricSchema.safeParse({ label: "Total", value: 42, note: "" }).success).toBe(true);
  });

  it("accepts string value (for 'Mode' metric)", () => {
    expect(inspectorMetricSchema.safeParse({ label: "Mode", value: "Review", note: "" }).success).toBe(true);
  });

  it("rejects missing label", () => {
    expect(inspectorMetricSchema.safeParse({ value: 42, note: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// inspectorRequestRowSchema
// ---------------------------------------------------------------------------

describe("inspectorRequestRowSchema", () => {
  it("accepts a valid row", () => {
    const r = inspectorRequestRowSchema.safeParse({
      id: "req-001",
      title: "ID Request",
      subtitle: "Pending approval",
      meta: "2026-06-14",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    expect(inspectorRequestRowSchema.safeParse({ title: "Test", subtitle: "", meta: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// inspectorObjectOutputSchema
// ---------------------------------------------------------------------------

describe("inspectorObjectOutputSchema", () => {
  it("accepts a valid inspector object", () => {
    const r = inspectorObjectOutputSchema.safeParse({ inspector_name: "Ali", inspector_email: "ali@test.com" });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// inspectorWorkspaceOutputSchema
// ---------------------------------------------------------------------------

describe("inspectorWorkspaceOutputSchema", () => {
  it("accepts a valid workspace output", () => {
    const r = inspectorWorkspaceOutputSchema.safeParse({
      inspector: { inspector_name: "Ali", inspector_email: "ali@test.com" },
      metrics: [
        { label: "Total", value: 42, note: "" },
        { label: "Pending", value: 10, note: "" },
        { label: "Completed", value: 30, note: "" },
        { label: "Mode", value: "Review", note: "" },
      ],
      requests: [{ id: "r1", title: "Request 1", subtitle: "", meta: "" }],
    });
    expect(r.success).toBe(true);
  });

  it("accepts null inspector", () => {
    const r = inspectorWorkspaceOutputSchema.safeParse({
      inspector: null,
      metrics: [
        { label: "A", value: 0, note: "" },
        { label: "B", value: 0, note: "" },
        { label: "C", value: 0, note: "" },
        { label: "D", value: 0, note: "" },
      ],
      requests: [],
    });
    expect(r.success).toBe(true);
  });

  it("rejects wrong metrics length", () => {
    expect(
      inspectorWorkspaceOutputSchema.safeParse({
        inspector: null,
        metrics: [{ label: "A", value: 0, note: "" }],
        requests: [],
      }).success,
    ).toBe(false);
  });
});
