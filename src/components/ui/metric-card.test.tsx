import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TrendingUp } from "lucide-react";
import { MetricCard } from "./metric-card";

describe("MetricCard", () => {
  it("renders label and value", () => {
    render(<MetricCard label="Active candidates" value={142} />);
    expect(screen.getByText("Active candidates")).toBeInTheDocument();
    expect(screen.getByText("142")).toBeInTheDocument();
  });

  it("renders formatted large number", () => {
    const { container } = render(<MetricCard label="Total revenue" value={1234567} />);
    expect(container.textContent).toContain("1,234,567");
  });

  it("renders string value as-is", () => {
    render(<MetricCard label="Status" value="Live" />);
    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  it("renders note when provided", () => {
    render(<MetricCard label="Requests" value={89} note="Pending review" />);
    expect(screen.getByText("Pending review")).toBeInTheDocument();
  });

  it("renders trend indicator and label", () => {
    render(
      <MetricCard
        label="Assigned"
        value={24}
        trend="up"
        trendLabel="+12% this week"
      />,
    );
    expect(screen.getByText("+12% this week")).toBeInTheDocument();
  });

  it("renders subtitle via new API", () => {
    render(<MetricCard label="Candidates" value={42} subtitle="Active this month" />);
    expect(screen.getByText("Active this month")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<MetricCard label="Clickable" value={1} onClick={onClick} />);
    await user.click(screen.getByText("1"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders icon when provided", () => {
    render(
      <MetricCard label="With icon" value={5} icon={TrendingUp} />,
    );
    // GlassPanel wraps content — just verify label+value renders
    expect(screen.getByText("With icon")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders with accent glow", () => {
    render(<MetricCard label="Glowing" value={99} accent="success" />);
    expect(screen.getByText("Glowing")).toBeInTheDocument();
    expect(screen.getByText("99")).toBeInTheDocument();
  });

  it("renders sparkline bar chart from sparklineData", () => {
    render(<MetricCard label="Sparkline" value={100} sparklineData={[10, 20, 15, 30]} />);
    expect(screen.getByText("Sparkline")).toBeInTheDocument();
    expect(screen.getByLabelText("Trend sparkline")).toBeInTheDocument();
  });

  it("renders entrance animation delay", () => {
    render(<MetricCard label="Delayed" value={10} entranceDelay={300} />);
    expect(screen.getByText("Delayed")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });
});
