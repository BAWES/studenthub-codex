import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { PaymentDataTable } from "../_components";

afterEach(() => { cleanup(); });

const samplePayments = [
  { bank_transaction_id: "txn-1", date: "2026-06-10T00:00:00.000Z", reference: "INV-001", contact_name: "Al-Saleh Ent.", type: "RECEIVE", total: 4500, currency_code: "KWD", status: "AUTHORISED", is_reconciled: true, line_items_count: 3 },
  { bank_transaction_id: "txn-2", date: "2026-06-09T00:00:00.000Z", reference: "INV-002", contact_name: "Al-Jazeera Co.", type: "SPEND", total: 1200, currency_code: "KWD", status: "PAID", is_reconciled: false, line_items_count: 1 },
  { bank_transaction_id: "txn-3", date: "2026-06-08T00:00:00.000Z", reference: "INV-003", contact_name: "Gulf Group", type: "RECEIVE", total: 7800, currency_code: "KWD", status: "VOIDED", is_reconciled: true, line_items_count: 5 },
];

const baseProps = { loading: false, error: null, onRowClick: vi.fn(), onRetry: vi.fn() };

describe("PaymentDataTable", () => {
  it("renders all payment rows", () => {
    render(<PaymentDataTable payments={samplePayments} total={samplePayments.length} page={1} totalPages={1} {...baseProps} />);
    expect(screen.getByText("INV-001")).toBeDefined();
    expect(screen.getByText("INV-002")).toBeDefined();
    expect(screen.getByText("INV-003")).toBeDefined();
  });

  it("shows column headers", () => {
    render(<PaymentDataTable payments={samplePayments} total={samplePayments.length} page={1} totalPages={1} {...baseProps} />);
    expect(screen.getByText("Date")).toBeDefined();
    expect(screen.getByText("Reference")).toBeDefined();
    expect(screen.getByText("Contact")).toBeDefined();
    expect(screen.getByText("Status")).toBeDefined();
  });

  it("shows loading skeleton when loading", () => {
    const { container } = render(<PaymentDataTable payments={[]} total={0} page={1} totalPages={0} loading={true} error={null} onRowClick={vi.fn()} onRetry={vi.fn()} />);
    // DataTablePage renders DataTableSkeleton when loading
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("uses standard empty state when no payments", () => {
    render(<PaymentDataTable payments={[]} total={0} page={1} totalPages={0} {...baseProps} />);
    expect(screen.getByText(/No records found/)).toBeDefined();
  });

  it("shows error state when error is present", () => {
    render(<PaymentDataTable payments={[]} total={0} page={1} totalPages={0} loading={false} error="Failed to load" onRowClick={vi.fn()} onRetry={vi.fn()} />);
    expect(screen.getByText(/Error loading data/)).toBeDefined();
    expect(screen.getByText("Failed to load")).toBeDefined();
  });

  it("shows status badges for payment statuses", () => {
    render(<PaymentDataTable payments={samplePayments} total={samplePayments.length} page={1} totalPages={1} {...baseProps} />);
    expect(screen.getByText("AUTHORISED")).toBeDefined();
    expect(screen.getByText("PAID")).toBeDefined();
    expect(screen.getByText("VOIDED")).toBeDefined();
  });

  it("shows reconciled check indicators", () => {
    render(<PaymentDataTable payments={samplePayments} total={samplePayments.length} page={1} totalPages={1} {...baseProps} />);
    expect(screen.getAllByLabelText("Reconciled").length).toBe(2);
    expect(screen.getAllByLabelText("Not reconciled").length).toBe(1);
  });

  it("formats dates in readable format", () => {
    render(<PaymentDataTable payments={samplePayments} total={samplePayments.length} page={1} totalPages={1} {...baseProps} />);
    // Jun 10, 2026 format
    expect(screen.getByText("Jun 10, 2026")).toBeDefined();
    expect(screen.getByText("Jun 9, 2026")).toBeDefined();
    expect(screen.getByText("Jun 8, 2026")).toBeDefined();
  });

  it("formats amounts with currency", () => {
    render(<PaymentDataTable payments={samplePayments} total={samplePayments.length} page={1} totalPages={1} {...baseProps} />);
    expect(screen.getByText(/4,500\s*KWD/)).toBeDefined();
    expect(screen.getByText(/1,200\s*KWD/)).toBeDefined();
    expect(screen.getByText(/7,800\s*KWD/)).toBeDefined();
  });

  it("renders rows with data-os-navigable for j/k keyboard nav", () => {
    render(<PaymentDataTable payments={samplePayments} total={samplePayments.length} page={1} totalPages={1} {...baseProps} />);
    const rows = document.querySelectorAll('[data-os-navigable]');
    expect(rows.length).toBe(3);
  });
});
