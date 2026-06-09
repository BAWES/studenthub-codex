import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MetricCard } from "./metric-card";

describe("MetricCard", () => {
  it("renders label and value", () => {
    render(<MetricCard label="Active candidates" value={142} />);
    expect(screen.getByText("Active candidates")).toBeInTheDocument();
    expect(screen.getByText("142")).toBeInTheDocument();
  });

  it("renders formatted large number", () => {
    render(<MetricCard label="Total revenue" value={1234567} />);
    expect(screen.getByText("1,234,567")).toBeInTheDocument();
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
        trend={{ direction: "up", label: "+12% this week" }}
      />,
    );
    expect(screen.getByText("+12% this week")).toBeInTheDocument();
  });

  it("renders default aria-label", () => {
    render(<MetricCard label="Candidates" value={42} />);
    expect(screen.getByLabelText("Candidates: 42")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<MetricCard label="Clickable" value={1} onClick={onClick} />);
    await user.click(screen.getByLabelText("Clickable: 1"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders as link when href is provided", () => {
    render(<MetricCard label="Linked" value={7} href="/admin" />);
    const link = screen.getByLabelText("Linked: 7");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/admin");
  });

  it("starts hidden then becomes visible with entrance animation", async () => {
    render(<MetricCard label="Animated" value={99} delay={0} />);
    // Starts hidden before useEffect runs
    expect(screen.getByLabelText("Animated: 99")).toHaveClass(
      "metricCard--hidden",
    );
    // After effect fires (mock triggers immediately), becomes visible
    await vi.waitFor(() => {
      expect(screen.getByLabelText("Animated: 99")).toHaveClass(
        "metricCard--visible",
      );
    });
  });

  it("renders icon when provided", () => {
    render(
      <MetricCard label="With icon" value={5} icon={<span data-testid="test-icon">★</span>} />,
    );
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("applies interactive class when onClick provided", () => {
    render(<MetricCard label="Interactive" value={3} onClick={() => {}} />);
    expect(screen.getByLabelText("Interactive: 3")).toHaveClass(
      "metricCard--interactive",
    );
  });

  it("applies custom delay via CSS variable", () => {
    render(<MetricCard label="Delayed" value={10} delay={300} />);
    expect(screen.getByLabelText("Delayed: 10")).toHaveStyle({
      "--metric-delay": "300ms",
    });
  });
});
