import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { InvoiceFilters } from "../_components";

afterEach(() => cleanup());

const defaultProps = {
  filters: { status: "", dateFrom: "", dateTo: "" },
  onFilterChange: vi.fn(),
  onApply: vi.fn(),
  onClear: vi.fn(),
};

describe("InvoiceFilters", () => {
  it("renders status dropdown", () => {
    render(<InvoiceFilters {...defaultProps} />);
    expect(screen.getByLabelText("Status")).toBeDefined();
  });

  it("renders date range inputs", () => {
    render(<InvoiceFilters {...defaultProps} />);
    expect(screen.getByLabelText("From")).toBeDefined();
    expect(screen.getByLabelText("To")).toBeDefined();
  });

  it("renders apply and clear buttons", () => {
    render(<InvoiceFilters {...defaultProps} />);
    expect(screen.getByText("Apply")).toBeDefined();
    expect(screen.getByText("Clear")).toBeDefined();
  });

  it("shows empty result message when filter returns nothing", () => {
    render(<InvoiceFilters {...defaultProps} emptyResult={true} />);
    expect(screen.getByText("No invoices match your filters")).toBeDefined();
  });

  it("renders status options including All, paid, unpaid", () => {
    render(<InvoiceFilters {...defaultProps} />);
    const select = screen.getByLabelText("Status") as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toContain("");
    expect(options).toContain("paid");
    expect(options).toContain("unpaid");
  });
});
