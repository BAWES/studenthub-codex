import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { PaymentMetricCards } from "../_components";

vi.mock("@/components/ui/metric-card", () => ({
  MetricCard: vi.fn(({ label, value, subtitle }: any) => (
    <div data-testid="metric-card" data-label={label}>
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
      <span className="metric-subtitle">{subtitle}</span>
    </div>
  )),
}));

afterEach(() => { cleanup(); });

describe("PaymentMetricCards", () => {
  const defaultMetrics = {
    totalTransactions: 147,
    thisMonthVolume: 38,
    unreconciledCount: 12,
    avgAmount: 450.5,
  };

  it("renders all 4 metric cards", () => {
    render(<PaymentMetricCards {...defaultMetrics} />);
    expect(screen.getAllByTestId("metric-card")).toHaveLength(4);
  });

  it("renders correct labels for all cards", () => {
    render(<PaymentMetricCards {...defaultMetrics} />);
    expect(screen.getByText("Total Transactions")).toBeDefined();
    expect(screen.getByText("This Month")).toBeDefined();
    expect(screen.getByText("Unreconciled")).toBeDefined();
    expect(screen.getByText("Avg Amount")).toBeDefined();
  });

  it("renders with zero values gracefully", () => {
    render(<PaymentMetricCards totalTransactions={0} thisMonthVolume={0} unreconciledCount={0} avgAmount={0} />);
    expect(screen.getAllByTestId("metric-card")).toHaveLength(4);
  });
});
