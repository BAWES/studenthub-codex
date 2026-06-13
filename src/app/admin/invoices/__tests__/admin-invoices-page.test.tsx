import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AdminInvoicesPage } from "../_components";

afterEach(() => { cleanup(); });

vi.mock("../_components/invoice-metric-cards", () => ({ InvoiceMetricCards: vi.fn(() => <div data-testid="invoice-metric-cards" />) }));
vi.mock("../_components/invoice-filters", () => ({ InvoiceFilters: vi.fn(() => <div data-testid="invoice-filters" />) }));
vi.mock("../_components/invoice-data-table", () => ({ InvoiceDataTable: vi.fn(() => <div data-testid="invoice-data-table" />) }));
vi.mock("../_components/invoice-detail-drawer", () => ({ InvoiceDetailDrawer: vi.fn(() => <div data-testid="invoice-detail-drawer" />) }));
vi.mock("../actions", () => ({
  listInvoices: vi.fn().mockResolvedValue({ items: [], total: 0, page: 1, limit: 20, totalPages: 0 }),
  getInvoice: vi.fn().mockResolvedValue({ invoice: null, candidate_payouts: [], metrics: [] }),
}));

const mockSession = { id: "admin-1", name: "Admin User", email: "admin@studenthub.co", role: "admin" as const } as any;

describe("AdminInvoicesPage", () => {
  it("renders metric cards section", () => {
    render(<AdminInvoicesPage session={mockSession} />);
    expect(screen.getByTestId("invoice-metric-cards")).toBeDefined();
  });

  it("renders filters section", () => {
    render(<AdminInvoicesPage session={mockSession} />);
    expect(screen.getByTestId("invoice-filters")).toBeDefined();
  });

  it("renders data table section", () => {
    render(<AdminInvoicesPage session={mockSession} />);
    expect(screen.getByTestId("invoice-data-table")).toBeDefined();
  });

  it("renders detail drawer section", () => {
    render(<AdminInvoicesPage session={mockSession} />);
    expect(screen.getByTestId("invoice-detail-drawer")).toBeDefined();
  });
});
