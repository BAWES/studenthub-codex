import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Star } from "lucide-react";
import { MetricCard } from "./metric-card";

describe("MetricCard", () => {
  it("renders label and value", () => {
    render(<MetricCard label="Active candidates" value={142} />);
    expect(screen.getByText("Active candidates")).toBeInTheDocument();
    expect(screen.getByText("142")).toBeInTheDocument();
  });

  it("renders string value as-is", () => {
    render(<MetricCard label="Status" value="Live" />);
    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  it("renders note when provided", () => {
    render(<MetricCard label="Requests" value={89} note="Pending review" />);
    expect(screen.getByText("Pending review")).toBeInTheDocument();
  });

  it("renders trend when provided", () => {
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

  it("renders icon when provided", () => {
    render(<MetricCard label="With icon" value={5} icon={Star} />);
    const svg = document.querySelector("svg.lucide-star");
    expect(svg).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <MetricCard label="Clickable" value={1} onClick={onClick} />,
    );
    const card = container.querySelector('[data-slot="glass-panel"]') as HTMLElement;
    await user.click(card);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies custom entrance delay as animationDelay style", () => {
    const { container } = render(
      <MetricCard label="Delayed" value={10} entranceDelay={300} />,
    );
    const card = container.querySelector('[data-slot="glass-panel"]') as HTMLElement;
    expect(card).toHaveStyle({ animationDelay: "300ms" });
  });

  it("does not set animationDelay when entranceDelay is omitted", () => {
    const { container } = render(
      <MetricCard label="No delay" value={5} />,
    );
    const card = container.querySelector('[data-slot="glass-panel"]') as HTMLElement;
    expect(card.style.animationDelay).toBe("");
  });
});
