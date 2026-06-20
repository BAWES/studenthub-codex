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
  it("accepts a valid company row", () => {
    const r = adminCompanyRowSchema.safeParse({
      id: 1,
      name: "Test Company",
      email: "test@company.com",
      owner: "John",
      requests: 5,
      status: "Approved",
      rate: "10.000 KWD",
      updated: "Jun 10, 2026",
    });
    expect(r.success).toBe(true);
  });

  it("accepts minimal fields with defaults", () => {
    const r = adminCompanyRowSchema.safeParse({
      id: 1,
      name: "Test Company",
      status: "Approved",
      rate: "10 KWD",
      updated: "Jun 10, 2026",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.email).toBe("No email");
      expect(r.data.owner).toBe("Unassigned");
      expect(r.data.requests).toBe(0);
    }
  });

  it("rejects missing required id", () => {
    expect(
      adminCompanyRowSchema.safeParse({
        name: "Test",
        status: "OK",
        rate: "10 KWD",
        updated: "Jun 10",
      }).success,
    ).toBe(false);
  });

  it("rejects negative id", () => {
    expect(
      adminCompanyRowSchema.safeParse({
        id: -1,
        name: "Test",
        status: "OK",
        rate: "10 KWD",
        updated: "Jun 10",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// adminRequestRowSchema
// ---------------------------------------------------------------------------

describe("adminRequestRowSchema", () => {
  it("accepts a valid request row", () => {
    const r = adminRequestRowSchema.safeParse({
      id: "req-uuid-123",
      title: "Software Engineer",
      company: "Tech Co",
      owner: "Sarah",
      seats: 3,
      status: "open",
      updated: "Jun 10, 2026",
    });
    expect(r.success).toBe(true);
  });

  it("accepts minimal fields with defaults", () => {
    const r = adminRequestRowSchema.safeParse({
      id: "req-uuid-456",
      title: "Designer",
      updated: "Jun 9, 2026",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.company).toBe("No company");
      expect(r.data.owner).toBe("Unassigned");
      expect(r.data.seats).toBe(0);
      expect(r.data.status).toBe("No status");
    }
  });

  it("rejects empty id", () => {
    expect(
      adminRequestRowSchema.safeParse({
        id: "",
        title: "Test",
        updated: "Jun 10",
      }).success,
    ).toBe(false);
  });

  it("rejects negative seats", () => {
    expect(
      adminRequestRowSchema.safeParse({
        id: "uuid",
        title: "Test",
        seats: -1,
        updated: "Jun 10",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// adminTransferRowSchema
// ---------------------------------------------------------------------------

describe("adminTransferRowSchema", () => {
  it("accepts a valid transfer row", () => {
    const r = adminTransferRowSchema.safeParse({
      id: 1,
      company: "Test Company",
      period: "Jun 1 to Jun 30",
      status: "Status 5",
      total: "1.000 KWD",
    });
    expect(r.success).toBe(true);
  });

  it("accepts minimal fields with defaults", () => {
    const r = adminTransferRowSchema.safeParse({
      id: 42,
      period: "May 1 to May 31",
      status: "Status 10",
      total: "500 KWD",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.company).toBe("No company");
    }
  });

  it("rejects missing total", () => {
    expect(
      adminTransferRowSchema.safeParse({
        id: 1,
        period: "Jun 1 to Jun 30",
        status: "Status 5",
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// adminCandidateRowSchema
// ---------------------------------------------------------------------------

describe("adminCandidateRowSchema", () => {
  it("accepts a valid candidate row", () => {
    const r = adminCandidateRowSchema.safeParse({
      id: 1,
      name: "Alice Smith",
      email: "alice@example.com",
      country: "Kuwait",
      status: "Active",
      rate: "5.000 KWD",
      updated: "Jun 10, 2026",
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(
      adminCandidateRowSchema.safeParse({
        id: 1,
        name: "Alice",
        email: "not-an-email",
        status: "Active",
        rate: "5 KWD",
        updated: "Jun 10",
      }).success,
    ).toBe(false);
  });

  it("provides default country", () => {
    const r = adminCandidateRowSchema.safeParse({
      id: 1,
      name: "Bob",
      email: "bob@example.com",
      status: "Active",
      rate: "5 KWD",
      updated: "Jun 10",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.country).toBe("No country");
    }
  });
});

// ---------------------------------------------------------------------------
// adminMetricSchema
// ---------------------------------------------------------------------------

describe("adminMetricSchema", () => {
  it("accepts a valid metric", () => {
    const r = adminMetricSchema.safeParse({
      label: "Total",
      value: "1.234 KWD",
      note: "Transfer total",
    });
    expect(r.success).toBe(true);
  });

  it("accepts metric without note", () => {
    const r = adminMetricSchema.safeParse({
      label: "Total",
      value: "1.234 KWD",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.note).toBe("");
    }
  });

  it("rejects missing value", () => {
    expect(
      adminMetricSchema.safeParse({ label: "Total" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// adminTransferCandidateSchema
// ---------------------------------------------------------------------------

describe("adminTransferCandidateSchema", () => {
  it("accepts a valid transfer candidate", () => {
    const r = adminTransferCandidateSchema.safeParse({
      id: 1,
      title: "Alice Smith",
      subtitle: "Store A",
      meta: "40h · Paid · 500 KWD",
    });
    expect(r.success).toBe(true);
  });

  it("provides defaults for optional fields", () => {
    const r = adminTransferCandidateSchema.safeParse({
      id: 1,
      title: "Alice Smith",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.subtitle).toBe("No store");
      expect(r.data.meta).toBe("");
    }
  });
});

// ---------------------------------------------------------------------------
// adminTransferInvoiceSchema
// ---------------------------------------------------------------------------

describe("adminTransferInvoiceSchema", () => {
  it("accepts a valid invoice", () => {
    const r = adminTransferInvoiceSchema.safeParse({
      id: 1,
      title: "Invoice #1",
      subtitle: "Paid",
      meta: "Jun 10, 2026",
    });
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// adminTransferFileEntrySchema
// ---------------------------------------------------------------------------

describe("adminTransferFileEntrySchema", () => {
  it("accepts a valid file entry", () => {
    const r = adminTransferFileEntrySchema.safeParse({
      id: "uuid-file-entry",
      title: "Beneficiary Name",
      subtitle: "Completed",
      meta: "1.000 KWD",
    });
    expect(r.success).toBe(true);
  });

  it("provides defaults", () => {
    const r = adminTransferFileEntrySchema.safeParse({
      id: "uuid-123",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.title).toBe("Transfer file entry");
      expect(r.data.subtitle).toBe("No status");
      expect(r.data.meta).toBe("");
    }
  });
});

// ---------------------------------------------------------------------------
// adminTransferDetailSchema
// ---------------------------------------------------------------------------

describe("adminTransferDetailSchema", () => {
  it("accepts a valid transfer detail payload", () => {
    const r = adminTransferDetailSchema.safeParse({
      transfer: { transfer_id: 1, total: 1000 },
      metrics: [{ label: "Total", value: "1.000 KWD" }],
      candidates: [{ id: 1, title: "Alice" }],
      invoices: [{ id: 1, title: "Invoice #1" }],
      fileEntries: [{ id: "uuid-1" }],
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing candidates array", () => {
    expect(
      adminTransferDetailSchema.safeParse({
        transfer: null,
        metrics: [],
        invoices: [],
        fileEntries: [],
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output validation — adminCompanyRowListSchema
// ---------------------------------------------------------------------------

describe("adminCompanyRowListSchema (output validation)", () => {
  it("accepts a valid companies array", () => {
    const r = adminCompanyRowListSchema.safeParse([
      {
        id: 1,
        name: "Test Company",
        email: "test@co.com",
        owner: "Owner",
        requests: 3,
        status: "Approved",
        rate: "10.000 KWD",
        updated: "Jun 10, 2026",
      },
    ]);
    expect(r.success).toBe(true);
  });

  it("accepts an empty array", () => {
    const r = adminCompanyRowListSchema.safeParse([]);
    expect(r.success).toBe(true);
  });

  it("rejects an array with an invalid row", () => {
    const r = adminCompanyRowListSchema.safeParse([
      { id: "not-a-number", name: "Bad" },
    ]);
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output validation — adminRequestRowListSchema
// ---------------------------------------------------------------------------

describe("adminRequestRowListSchema (output validation)", () => {
  it("accepts a valid requests array", () => {
    const r = adminRequestRowListSchema.safeParse([
      {
        id: "req-uuid-1",
        title: "Engineer",
        company: "Acme",
        owner: "Sarah",
        seats: 2,
        status: "open",
        updated: "Jun 10, 2026",
      },
    ]);
    expect(r.success).toBe(true);
  });

  it("accepts an empty array", () => {
    const r = adminRequestRowListSchema.safeParse([]);
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Output validation — adminTransferRowListSchema
// ---------------------------------------------------------------------------

describe("adminTransferRowListSchema (output validation)", () => {
  it("accepts a valid transfers array", () => {
    const r = adminTransferRowListSchema.safeParse([
      {
        id: 1,
        company: "Acme",
        period: "Jun 1 to Jun 30",
        status: "Status 5",
        total: "1.000 KWD",
      },
    ]);
    expect(r.success).toBe(true);
  });

  it("accepts an empty array", () => {
    const r = adminTransferRowListSchema.safeParse([]);
    expect(r.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Output validation — adminCandidateRowListSchema
// ---------------------------------------------------------------------------

describe("adminCandidateRowListSchema (output validation)", () => {
  it("accepts a valid candidates array", () => {
    const r = adminCandidateRowListSchema.safeParse([
      {
        id: 1,
        name: "Alice Smith",
        email: "alice@example.com",
        country: "Kuwait",
        status: "Active",
        rate: "5.000 KWD",
        updated: "Jun 10, 2026",
      },
    ]);
    expect(r.success).toBe(true);
  });

  it("accepts an empty array", () => {
    const r = adminCandidateRowListSchema.safeParse([]);
    expect(r.success).toBe(true);
  });
});
