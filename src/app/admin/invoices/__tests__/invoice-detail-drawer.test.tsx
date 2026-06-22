import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { InvoiceDetailDrawer } from "../_components";

afterEach(() => cleanup());

const mockDetail = {
  invoice: {
    invoice_id: 101,
    transfer_id: 5,
    invoice_date: "2026-06-01T00:00:00.000Z",
    invoice_status: "paid",
    total: "5000.00",
    company_total: "4500.00",
    currency_code: "KWD",
    payment_received_on: "2026-06-10T00:00:00.000Z",
    company: { company_name: "Acme Corp", company_email: "billing@acme.com" },
  },
  candidate_payouts: [
    { tc_id: 1, candidate_name: "Ahmed", hours: 120, amount: "2400.00", paid: 1 },
    { tc_id: 2, candidate_name: "Sara", hours: 80, amount: "1600.00", paid: 0 },
  ],
  metrics: [
    { label: "Candidate Payouts", value: 2, note: "Line items" },
    { label: "Paid", value: 1, note: "1 remaining" },
    { label: "Total", value: "5000.00", note: "KWD" },
    { label: "Status", value: "paid", note: "" },
  ],
};

const defaultProps = {
  detail: null as typeof mockDetail | null,
  loading: false,
  open: false,
  onClose: vi.fn(),
};

describe("InvoiceDetailDrawer", () => {
  it("renders nothing when closed", () => {
    const { container } = render(<InvoiceDetailDrawer {...defaultProps} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders invoice detail header when open", () => {
    render(<InvoiceDetailDrawer {...defaultProps} open={true} detail={mockDetail} />);
    expect(screen.getByText("Invoice #101")).toBeDefined();
    expect(screen.getByText("Acme Corp")).toBeDefined();
  });

  it("renders metrics overview section", () => {
    render(<InvoiceDetailDrawer {...defaultProps} open={true} detail={mockDetail} />);
    expect(screen.getByText("Overview")).toBeDefined();
  });

  it("renders candidate payout section heading", () => {
    render(<InvoiceDetailDrawer {...defaultProps} open={true} detail={mockDetail} />);
    // Appears in metrics cards AND section heading
    const headings = screen.getAllByText(/Candidate Payouts/);
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it("renders candidate payout names", () => {
    render(<InvoiceDetailDrawer {...defaultProps} open={true} detail={mockDetail} />);
    expect(screen.getByText("Ahmed")).toBeDefined();
    expect(screen.getByText("Sara")).toBeDefined();
  });

  it("shows loading state", () => {
    render(<InvoiceDetailDrawer {...defaultProps} open={true} loading={true} />);
    expect(screen.getByText("Loading...")).toBeDefined();
  });

  it("handles null invoice gracefully", () => {
    render(
      <InvoiceDetailDrawer
        {...defaultProps}
        open={true}
        detail={{ invoice: null, candidate_payouts: [], metrics: [] }}
      />,
    );
    expect(screen.getByText("Invoice not found")).toBeDefined();
  });
});
