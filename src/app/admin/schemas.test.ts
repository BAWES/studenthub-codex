import { describe, it, expect } from "vitest";
import {
  adminCompanyRowSchema,
  adminRequestRowSchema,
  adminTransferRowSchema,
  adminCandidateRowSchema,
  adminMetricSchema,
  adminTransferCandidateSchema,
  adminTransferInvoiceSchema,
  adminTransferFileEntrySchema,
  adminTransferDetailSchema,
  adminCompanyRowListSchema,
  adminRequestRowListSchema,
  adminTransferRowListSchema,
  adminCandidateRowListSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// adminCompanyRowSchema
// ---------------------------------------------------------------------------
describe("adminCompanyRowSchema", () => {
  const validRow = {
    id: 1,
    name: "Acme Corp",
    email: "admin@acme.com",
    owner: "John Doe",
    requests: 5,
    status: "approved",
    rate: "$50/hr",
    updated: "2026-06-15",
  };

  it("accepts a valid company row", () => {
    expect(adminCompanyRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts optional fields with defaults", () => {
    const minimal = { id: 1, name: "Acme", status: "active", rate: "$40", updated: "today" };
    expect(adminCompanyRowSchema.safeParse(minimal).success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validRow;
    expect(adminCompanyRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for id", () => {
    expect(adminCompanyRowSchema.safeParse({ ...validRow, id: "abc" }).success).toBe(false);
  });

  it("rejects negative id", () => {
    expect(adminCompanyRowSchema.safeParse({ ...validRow, id: -1 }).success).toBe(false);
  });

  it("rejects empty name", () => {
    expect(adminCompanyRowSchema.safeParse({ ...validRow, name: "" }).success).toBe(false);
  });

  it("rejects negative requests", () => {
    expect(adminCompanyRowSchema.safeParse({ ...validRow, requests: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// adminRequestRowSchema
// ---------------------------------------------------------------------------
describe("adminRequestRowSchema", () => {
  const validRow = {
    id: "req-123",
    title: "New Hire Request",
    company: "Acme Corp",
    owner: "Jane",
    seats: 3,
    status: "pending",
    updated: "2026-06-15",
  };

  it("accepts a valid request row", () => {
    expect(adminRequestRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts optional fields with defaults", () => {
    const minimal = { id: "r-1", title: "Test Request", updated: "today" };
    expect(adminRequestRowSchema.safeParse(minimal).success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validRow;
    expect(adminRequestRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty id", () => {
    expect(adminRequestRowSchema.safeParse({ ...validRow, id: "" }).success).toBe(false);
  });

  it("rejects empty title", () => {
    expect(adminRequestRowSchema.safeParse({ ...validRow, title: "" }).success).toBe(false);
  });

  it("rejects negative seats", () => {
    expect(adminRequestRowSchema.safeParse({ ...validRow, seats: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// adminTransferRowSchema
// ---------------------------------------------------------------------------
describe("adminTransferRowSchema", () => {
  const validRow = {
    id: 1,
    company: "Acme Corp",
    period: "2026-06",
    status: "completed",
    total: "$5000",
  };

  it("accepts a valid transfer row", () => {
    expect(adminTransferRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts optional company default", () => {
    expect(adminTransferRowSchema.safeParse({ id: 1, period: "2026-06", status: "active", total: "$100" }).success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validRow;
    expect(adminTransferRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for id", () => {
    expect(adminTransferRowSchema.safeParse({ ...validRow, id: "abc" }).success).toBe(false);
  });

  it("rejects negative id", () => {
    expect(adminTransferRowSchema.safeParse({ ...validRow, id: -1 }).success).toBe(false);
  });

  it("rejects empty period", () => {
    expect(adminTransferRowSchema.safeParse({ ...validRow, period: "" }).success).toBe(false);
  });

  it("rejects empty status", () => {
    expect(adminTransferRowSchema.safeParse({ ...validRow, status: "" }).success).toBe(false);
  });

  it("rejects empty total", () => {
    expect(adminTransferRowSchema.safeParse({ ...validRow, total: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// adminCandidateRowSchema
// ---------------------------------------------------------------------------
describe("adminCandidateRowSchema", () => {
  const validRow = {
    id: 1,
    name: "Alice Smith",
    email: "alice@example.com",
    country: "Kuwait",
    status: "active",
    rate: "$30/hr",
    updated: "2026-06-15",
  };

  it("accepts a valid candidate row", () => {
    expect(adminCandidateRowSchema.safeParse(validRow).success).toBe(true);
  });

  it("accepts optional country default", () => {
    const { country: _, ...rest } = validRow;
    expect(adminCandidateRowSchema.safeParse(rest).success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validRow;
    expect(adminCandidateRowSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for id", () => {
    expect(adminCandidateRowSchema.safeParse({ ...validRow, id: "abc" }).success).toBe(false);
  });

  it("rejects negative id", () => {
    expect(adminCandidateRowSchema.safeParse({ ...validRow, id: -1 }).success).toBe(false);
  });

  it("rejects empty name", () => {
    expect(adminCandidateRowSchema.safeParse({ ...validRow, name: "" }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(adminCandidateRowSchema.safeParse({ ...validRow, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects empty status", () => {
    expect(adminCandidateRowSchema.safeParse({ ...validRow, status: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// adminMetricSchema
// ---------------------------------------------------------------------------
describe("adminMetricSchema", () => {
  const validMetric = { label: "Total Revenue", value: 50000, note: "YTD" };

  it("accepts a valid metric with number value", () => {
    expect(adminMetricSchema.safeParse(validMetric).success).toBe(true);
  });

  it("accepts a valid metric with string value", () => {
    expect(adminMetricSchema.safeParse({ ...validMetric, value: "$50k" }).success).toBe(true);
  });

  it("accepts optional note default", () => {
    const { note: _, ...rest } = validMetric;
    expect(adminMetricSchema.safeParse(rest).success).toBe(true);
  });

  it("rejects missing label", () => {
    const { label: _, ...rest } = validMetric;
    expect(adminMetricSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty label", () => {
    expect(adminMetricSchema.safeParse({ ...validMetric, label: "" }).success).toBe(false);
  });

  it("rejects missing value", () => {
    const { value: _, ...rest } = validMetric;
    expect(adminMetricSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// adminTransferCandidateSchema
// ---------------------------------------------------------------------------
describe("adminTransferCandidateSchema", () => {
  const validItem = { id: 1, title: "Bob Jones", subtitle: "Store 5", meta: "Active" };

  it("accepts a valid transfer candidate", () => {
    expect(adminTransferCandidateSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts optional fields with defaults", () => {
    expect(adminTransferCandidateSchema.safeParse({ id: 1, title: "Alice" }).success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validItem;
    expect(adminTransferCandidateSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for id", () => {
    expect(adminTransferCandidateSchema.safeParse({ ...validItem, id: "abc" }).success).toBe(false);
  });

  it("rejects negative id", () => {
    expect(adminTransferCandidateSchema.safeParse({ ...validItem, id: -1 }).success).toBe(false);
  });

  it("rejects empty title", () => {
    expect(adminTransferCandidateSchema.safeParse({ ...validItem, title: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// adminTransferInvoiceSchema
// ---------------------------------------------------------------------------
describe("adminTransferInvoiceSchema", () => {
  const validItem = { id: 1, title: "INV-001", subtitle: "Paid", meta: "2026-06" };

  it("accepts a valid transfer invoice", () => {
    expect(adminTransferInvoiceSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts optional fields with defaults", () => {
    expect(adminTransferInvoiceSchema.safeParse({ id: 1, title: "INV-002" }).success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validItem;
    expect(adminTransferInvoiceSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative id", () => {
    expect(adminTransferInvoiceSchema.safeParse({ ...validItem, id: -1 }).success).toBe(false);
  });

  it("rejects empty title", () => {
    expect(adminTransferInvoiceSchema.safeParse({ ...validItem, title: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// adminTransferFileEntrySchema
// ---------------------------------------------------------------------------
describe("adminTransferFileEntrySchema", () => {
  const validItem = { id: "file-abc", title: "Contract", subtitle: "Signed", meta: "PDF" };

  it("accepts a valid file entry", () => {
    expect(adminTransferFileEntrySchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts optional fields with defaults", () => {
    expect(adminTransferFileEntrySchema.safeParse({ id: "f-1" }).success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = validItem;
    expect(adminTransferFileEntrySchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty id", () => {
    expect(adminTransferFileEntrySchema.safeParse({ ...validItem, id: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// adminTransferDetailSchema
// ---------------------------------------------------------------------------
describe("adminTransferDetailSchema", () => {
  const validDetail = {
    transfer: { id: 1, status: "completed" },
    metrics: [{ label: "Total", value: "$1000", note: "" }],
    candidates: [{ id: 1, title: "Bob" }],
    invoices: [{ id: 1, title: "INV-001" }],
    fileEntries: [{ id: "f-1" }],
  };

  it("accepts a valid transfer detail", () => {
    expect(adminTransferDetailSchema.safeParse(validDetail).success).toBe(true);
  });

  it("accepts null transfer", () => {
    expect(adminTransferDetailSchema.safeParse({ ...validDetail, transfer: null }).success).toBe(true);
  });

  it("accepts empty arrays", () => {
    expect(
      adminTransferDetailSchema.safeParse({
        ...validDetail,
        metrics: [],
        candidates: [],
        invoices: [],
        fileEntries: [],
      }).success,
    ).toBe(true);
  });

  it("rejects missing metrics", () => {
    const { metrics: _, ...rest } = validDetail;
    expect(adminTransferDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing candidates", () => {
    const { candidates: _, ...rest } = validDetail;
    expect(adminTransferDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing invoices", () => {
    const { invoices: _, ...rest } = validDetail;
    expect(adminTransferDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing fileEntries", () => {
    const { fileEntries: _, ...rest } = validDetail;
    expect(adminTransferDetailSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// adminCompanyRowListSchema (array)
// ---------------------------------------------------------------------------
describe("adminCompanyRowListSchema", () => {
  it("accepts a valid list of company rows", () => {
    expect(
      adminCompanyRowListSchema.safeParse([
        { id: 1, name: "Acme", status: "active", rate: "$50", updated: "today" },
      ]).success,
    ).toBe(true);
  });

  it("accepts an empty array", () => {
    expect(adminCompanyRowListSchema.safeParse([]).success).toBe(true);
  });

  it("rejects invalid items", () => {
    expect(adminCompanyRowListSchema.safeParse([{ id: "bad" }]).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// adminRequestRowListSchema (array)
// ---------------------------------------------------------------------------
describe("adminRequestRowListSchema", () => {
  it("accepts a valid list of request rows", () => {
    expect(adminRequestRowListSchema.safeParse([{ id: "r-1", title: "Req", updated: "today" }]).success).toBe(true);
  });

  it("accepts an empty array", () => {
    expect(adminRequestRowListSchema.safeParse([]).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// adminTransferRowListSchema (array)
// ---------------------------------------------------------------------------
describe("adminTransferRowListSchema", () => {
  it("accepts a valid list of transfer rows", () => {
    expect(
      adminTransferRowListSchema.safeParse([
        { id: 1, period: "2026-06", status: "done", total: "$500" },
      ]).success,
    ).toBe(true);
  });

  it("accepts an empty array", () => {
    expect(adminTransferRowListSchema.safeParse([]).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// adminCandidateRowListSchema (array)
// ---------------------------------------------------------------------------
describe("adminCandidateRowListSchema", () => {
  it("accepts a valid list of candidate rows", () => {
    expect(
      adminCandidateRowListSchema.safeParse([
        { id: 1, name: "Alice", email: "alice@test.com", status: "active", rate: "$30", updated: "today" },
      ]).success,
    ).toBe(true);
  });

  it("accepts an empty array", () => {
    expect(adminCandidateRowListSchema.safeParse([]).success).toBe(true);
  });
});
