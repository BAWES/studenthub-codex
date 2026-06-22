// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import MatchScoreBadge from "./MatchScoreBadge";

afterEach(() => {
  cleanup();
});

describe("MatchScoreBadge", () => {
  it("renders score percentage when provided", () => {
    render(<MatchScoreBadge score={85} />);
    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("Strong match")).toBeInTheDocument();
  });

  it("renders null score as dash", () => {
    render(<MatchScoreBadge score={null} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("shows correct label for each tier", () => {
    const { rerender } = render(<MatchScoreBadge score={85} />);
    expect(screen.getByText("Strong match")).toBeInTheDocument();

    rerender(<MatchScoreBadge score={55} />);
    expect(screen.getByText("Moderate")).toBeInTheDocument();

    rerender(<MatchScoreBadge score={35} />);
    expect(screen.getByText("Low")).toBeInTheDocument();

    rerender(<MatchScoreBadge score={15} />);
    expect(screen.getByText("Weak")).toBeInTheDocument();
  });

  it("renders progress bar when showBar is true", () => {
    const { container } = render(<MatchScoreBadge score={60} showBar />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("hides progress bar when showBar is false", () => {
    const { container } = render(<MatchScoreBadge score={60} showBar={false} />);
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("has a data-testid attribute", () => {
    render(<MatchScoreBadge score={42} />);
    expect(screen.getByTestId("match-score-badge")).toBeInTheDocument();
  });
});
