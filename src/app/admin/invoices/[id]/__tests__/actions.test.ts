import { describe, it, expect, vi, beforeEach } from "vitest";
import { getInvoice } from "../actions";

// ---------------------------------------------------------------------------
// getInvoice — detail page server action
// ---------------------------------------------------------------------------

const mockInvoiceData = {
  invoice: {
    invoice_id: 42,
    transfer_id: 101,
    invoice_date: "2026-06-01T00:00:00.000Z",
    invoice_status: "paid",
    total: "1250.00",
    company_total: "1500.00",
    currency_code: "KWD",
    payment_received_on: "2026-06-15T00:00:00.000Z",
    company: {
      company_name: "Test Company",
      company_email: "test@company.com",
    },
  },
  candidate_payouts: [
    {
      tc_id: 1,
      candidate_name: "Ahmed Ali",
      hours: 40,
      amount: "500.00",
      paid: 1,
    },
    {
      tc_id: 2,
      candidate_name: "Sara Khalid",
      hours: 20,
      amount: "250.00",
      paid: 0,
    },
  ],
  metrics: [
    { label: "Candidate Payouts", value: 2, note: "Line items" },
    { label: "Paid", value: 1, note: "1 remaining" },
    { label: "Total", value: "1250.00", note: "KWD" },
    { label: "Status", value: "paid", note: "" },
  ],
};

vi.mock("@/modules/admin/invoices/actions", () => ({
  getInvoice: vi.fn(),
}));

const mockGetInvoice = vi.mocked(
  (await import("@/modules/admin/invoices/actions")).getInvoice,
);

describe("getInvoice (detail page wrapper)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns full invoice detail for valid ID", async () => {
    mockGetInvoice.mockResolvedValue(mockInvoiceData);

    const result = await getInvoice(42);

    expect(mockGetInvoice).toHaveBeenCalledWith(42);
    expect(result.invoice?.invoice_id).toBe(42);
    expect(result.invoice?.invoice_status).toBe("paid");
    expect(result.candidate_payouts).toHaveLength(2);
    expect(result.metrics).toHaveLength(4);
  });

  it("returns null invoice when not found", async () => {
    mockGetInvoice.mockResolvedValue({
      invoice: null,
      candidate_payouts: [],
      metrics: [],
    });

    const result = await getInvoice(999);

    expect(result.invoice).toBeNull();
    expect(result.candidate_payouts).toHaveLength(0);
  });

  it("throws on negative invoice ID (schema validation)", async () => {
    mockGetInvoice.mockRejectedValue(new Error("Invalid invoice ID"));

    await expect(getInvoice(-1)).rejects.toThrow("Invalid invoice ID");
  });

  it("formats candidate payout data correctly", async () => {
    mockGetInvoice.mockResolvedValue(mockInvoiceData);

    const result = await getInvoice(42);

    expect(result.candidate_payouts[0]).toMatchObject({
      tc_id: 1,
      candidate_name: "Ahmed Ali",
      hours: 40,
      amount: "500.00",
      paid: 1,
    });
  });
});
