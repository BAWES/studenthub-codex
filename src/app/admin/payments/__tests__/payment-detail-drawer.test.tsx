import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { PaymentDetailDrawer } from "../_components";

afterEach(() => { cleanup(); });

const samplePayment = {
  bank_transaction_id: "txn-1", reference: "INV-001", status: "AUTHORISED", type: "RECEIVE",
  total: 4500, sub_total: 4000, total_tax: 500, currency_rate: 1, currency_code: "KWD",
  line_amount_types: "Inclusive", has_attachments: false, is_reconciled: true,
  date: "2026-06-10T00:00:00.000Z", created_at: "2026-06-05T00:00:00.000Z", updated_at: "2026-06-10T00:00:00.000Z",
  contact: { contact_id: "c-123", name: "Al-Saleh Ent." },
};

const sampleLineItems = [
  { line_item_id: "li-1", account_code: "200", description: "Service fee", line_amount: 3000, quantity: 1, unit_amount: 3000 },
  { line_item_id: "li-2", account_code: "201", description: "Processing", line_amount: 1000, quantity: 1, unit_amount: 1000 },
];

describe("PaymentDetailDrawer", () => {
  it("renders payment details when loaded", () => {
    render(<PaymentDetailDrawer payment={samplePayment} lineItems={sampleLineItems} loading={false} open={true} onClose={vi.fn()} />);
    expect(screen.getByText("INV-001")).toBeDefined();
    expect(screen.getByText("AUTHORISED")).toBeDefined();
    expect(screen.getByText("Al-Saleh Ent.")).toBeDefined();
  });

  it("shows line items", () => {
    render(<PaymentDetailDrawer payment={samplePayment} lineItems={sampleLineItems} loading={false} open={true} onClose={vi.fn()} />);
    expect(screen.getByText("Service fee")).toBeDefined();
    expect(screen.getByText("Processing")).toBeDefined();
  });

  it("shows not found state when payment is null", () => {
    render(<PaymentDetailDrawer payment={null} lineItems={[]} loading={false} open={true} onClose={vi.fn()} />);
    expect(screen.getByText(/Payment not found/)).toBeDefined();
  });

  it("does not render when open is false", () => {
    render(<PaymentDetailDrawer payment={samplePayment} lineItems={sampleLineItems} loading={false} open={false} onClose={vi.fn()} />);
    expect(screen.queryByText("INV-001")).toBeNull();
  });
});
