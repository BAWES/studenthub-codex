import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { InvoiceMetricCards } from "../_components";

afterEach(() => cleanup());

describe("InvoiceMetricCards", () => {
  it("renders all three metric section labels", () => {
    render(<InvoiceMetricCards totalInvoices={42} unpaidCount={10} thisMonthVolume={5} />);
    const labels = screen.getAllByText(/Total Invoices|Unpaid|This Month/);
    expect(labels.length).toBe(3);
  });

  it("renders the correct number of cards", () => {
    const { container } = render(
      <InvoiceMetricCards totalInvoices={42} unpaidCount={10} thisMonthVolume={5} />,
    );
    const cards = container.querySelectorAll('[class*="rounded-lg"]');
    const cardDivs = Array.from(cards).filter(
      (el) => el.tagName === "DIV" && el.classList.contains("border"),
    );
    expect(cardDivs.length).toBe(3);
  });

  it("renders zero values gracefully", () => {
    const { container } = render(
      <InvoiceMetricCards totalInvoices={0} unpaidCount={0} thisMonthVolume={0} />,
    );
    // Check that all three card labels render
    expect(screen.getByText("Total Invoices")).toBeDefined();
    expect(screen.getByText("Unpaid")).toBeDefined();
    expect(screen.getByText("This Month")).toBeDefined();
  });
});
