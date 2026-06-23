import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AdminPaymentsPage } from "../_components";

afterEach(() => { cleanup(); });

vi.mock("../_components/payment-metric-cards", () => ({ PaymentMetricCards: vi.fn(() => <div data-testid="payment-metric-cards" />) }));
vi.mock("../_components/payment-filters", () => ({ PaymentFilters: vi.fn(() => <div data-testid="payment-filters" />) }));
vi.mock("../_components/payment-data-table", () => ({ PaymentDataTable: vi.fn(() => <div data-testid="payment-data-table" />) }));
vi.mock("../_components/payment-detail-drawer", () => ({ PaymentDetailDrawer: vi.fn(() => <div data-testid="payment-detail-drawer" />) }));
vi.mock("../actions", () => ({
  listPayments: vi.fn().mockResolvedValue({ items: [], total: 0, page: 1, limit: 20, totalPages: 0 }),
  getPayment: vi.fn().mockResolvedValue({ payment: null, line_items: [], metrics: [] }),
}));

const mockSession = { id: "admin-1", name: "Admin User", email: "admin@studenthub.co", role: "admin" as const } as any;

describe("AdminPaymentsPage", () => {
  it("renders metric cards section", () => {
    render(<AdminPaymentsPage session={mockSession} />);
    expect(screen.getByTestId("payment-metric-cards")).toBeDefined();
  });

  it("renders filters section", () => {
    render(<AdminPaymentsPage session={mockSession} />);
    expect(screen.getByTestId("payment-filters")).toBeDefined();
  });

  it("renders data table section", () => {
    render(<AdminPaymentsPage session={mockSession} />);
    expect(screen.getByTestId("payment-data-table")).toBeDefined();
  });
});
