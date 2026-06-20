import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { InvoiceDataTable } from "../_components";

afterEach(() => cleanup());

const mockRows = [
  {
    invoice_id: 101,
    transfer_id: 5,
    company_name: "Acme Corp",
    invoice_date: "2026-06-01T00:00:00.000Z",
    invoice_status: "paid",
    total: "5000.00",
    currency_code: "KWD",
  },
  {
    invoice_id: 102,
    transfer_id: 6,
    company_name: "Beta LLC",
    invoice_date: "2026-06-15T00:00:00.000Z",
    invoice_status: "unpaid",
    total: "3200.00",
    currency_code: "KWD",
  },
];

const defaultProps = {
  invoices: [] as typeof mockRows,
  total: 0,
  page: 1,
  totalPages: 0,
  loading: false,
  error: null as string | null,
  onRowClick: vi.fn(),
  onRetry: vi.fn(),
  onPageChange: vi.fn(),
};

describe("InvoiceDataTable", () => {
  it("renders column headers", () => {
    render(<InvoiceDataTable {...defaultProps} />);
    expect(screen.getByText("Company")).toBeDefined();
    expect(screen.getByText("Date")).toBeDefined();
    expect(screen.getByText("Amount")).toBeDefined();
    expect(screen.getByText("Status")).toBeDefined();
  });

  it("renders empty state when no rows", () => {
    render(<InvoiceDataTable {...defaultProps} />);
    expect(screen.getByText("No invoices yet")).toBeDefined();
  });

  it("renders invoice rows", () => {
    render(
      <InvoiceDataTable
        {...defaultProps}
        invoices={mockRows}
        total={2}
        totalPages={1}
      />,
    );
    expect(screen.getByText("Acme Corp")).toBeDefined();
    expect(screen.getByText("Beta LLC")).toBeDefined();
  });

  it("renders skeleton loading rows", () => {
    render(<InvoiceDataTable {...defaultProps} loading={true} />);
    const elements = document.querySelectorAll('[aria-hidden="true"]');
    expect(elements.length).toBeGreaterThan(0);
  });

  it("renders error state with retry button", () => {
    render(
      <InvoiceDataTable
        {...defaultProps}
        error="Failed to load invoices"
      />,
    );
    expect(screen.getByText("Could not load invoices")).toBeDefined();
    expect(screen.getByText("Retry")).toBeDefined();
  });

  it("renders pagination when total exceeds 20", () => {
    const rows25 = Array.from({ length: 25 }, (_, i) => ({
      invoice_id: i + 1,
      transfer_id: i + 1,
      company_name: `Company ${i + 1}`,
      invoice_date: "2026-06-01T00:00:00.000Z",
      invoice_status: "paid",
      total: "1000.00",
      currency_code: "KWD",
    }));
    render(
      <InvoiceDataTable
        {...defaultProps}
        invoices={rows25}
        total={25}
        page={1}
        totalPages={2}
      />,
    );
    expect(screen.getByText(/Page 1 of 2/)).toBeDefined();
    expect(screen.getByText("Next →")).toBeDefined();
  });

  it("disables prev button on first page", () => {
    const rows25 = Array.from({ length: 25 }, (_, i) => ({
      invoice_id: i + 1,
      transfer_id: i + 1,
      company_name: `Company ${i + 1}`,
      invoice_date: "2026-06-01T00:00:00.000Z",
      invoice_status: "paid",
      total: "1000.00",
      currency_code: "KWD",
    }));
    render(
      <InvoiceDataTable
        {...defaultProps}
        invoices={rows25}
        total={25}
        page={1}
        totalPages={2}
      />,
    );
    expect(screen.getByLabelText("Previous page")).toBeDisabled();
  });
});
