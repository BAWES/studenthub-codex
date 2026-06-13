import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { PaymentFilters } from "../_components";

afterEach(() => { cleanup(); });

describe("PaymentFilters", () => {
  const defaultFilters = { status: "", type: "", dateFrom: "", dateTo: "" };

  it("renders filter inputs", () => {
    render(<PaymentFilters filters={defaultFilters} onFilterChange={vi.fn()} onApply={vi.fn()} onClear={vi.fn()} />);
    expect(screen.getByLabelText(/status/i)).toBeDefined();
    expect(screen.getByLabelText(/type/i)).toBeDefined();
    expect(screen.getByText("Apply")).toBeDefined();
    expect(screen.getByText("Clear")).toBeDefined();
  });

  it("calls onApply when Apply button is clicked", () => {
    const onApply = vi.fn();
    render(<PaymentFilters filters={defaultFilters} onFilterChange={vi.fn()} onApply={onApply} onClear={vi.fn()} />);
    fireEvent.click(screen.getByText("Apply"));
    expect(onApply).toHaveBeenCalledOnce();
  });

  it("calls onClear when Clear button is clicked", () => {
    const onClear = vi.fn();
    render(<PaymentFilters filters={defaultFilters} onFilterChange={vi.fn()} onApply={vi.fn()} onClear={onClear} />);
    fireEvent.click(screen.getByText("Clear"));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it("shows no-results empty state when emptyResult is true", () => {
    render(<PaymentFilters filters={{ status: "PAID", type: "RECEIVE", dateFrom: "", dateTo: "" }} onFilterChange={vi.fn()} onApply={vi.fn()} onClear={vi.fn()} emptyResult={true} />);
    expect(screen.getByText(/No payments match your filters/)).toBeDefined();
  });
});
