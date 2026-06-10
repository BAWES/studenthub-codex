// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("lucide-react", () => ({
  Check: () => <span data-testid="icon-check" />,
  X: () => <span data-testid="icon-x" />,
  Minus: () => <span data-testid="icon-minus" />,
  Sparkles: () => <span data-testid="icon-sparkles" />,
  ChevronRight: () => <span data-testid="icon-chevron-right" />,
  Star: () => <span data-testid="icon-star" />,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

import ComparisonTable from "./ComparisonTable";

describe("ComparisonTable (visual redesign)", () => {
  it("renders section with comparison label", () => {
    render(<ComparisonTable />);
    expect(
      screen.getByLabelText("Feature comparison"),
    ).toBeInTheDocument();
  });

  it("renders column headers instead of competitor names", () => {
    render(<ComparisonTable />);
    // StudentHub column should be visually prominent — appears in both table + mobile cards
    const headers = screen.getAllByText("StudentHub");
    expect(headers.length).toBeGreaterThanOrEqual(1);
  });

  it("renders feature rows with data", () => {
    render(<ComparisonTable />);
    // Feature text appears in both desktop table and mobile cards
    const features = screen.getAllByText("Unified profile visible to all employers");
    expect(features.length).toBeGreaterThanOrEqual(1);
  });

  it("renders category labels as badges", () => {
    render(<ComparisonTable persona="candidate" />);
    // Categories appear in both desktop table header rows and mobile card headers
    expect(screen.getAllByText("Profile").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Search").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Matching").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Payments").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Documents").length).toBeGreaterThanOrEqual(1);
  });

  it("applies custom className", () => {
    const { container } = render(
      <ComparisonTable className="custom-class" />,
    );
    const section = container.querySelector("[class*='custom-class']");
    expect(section).toBeTruthy();
  });

  it("renders candidate-specific heading", () => {
    render(<ComparisonTable persona="candidate" />);
    expect(
      screen.getByText("Why candidates choose StudentHub."),
    ).toBeInTheDocument();
  });

  it("renders company-specific heading", () => {
    render(<ComparisonTable persona="company" />);
    expect(
      screen.getByText("Why companies choose StudentHub."),
    ).toBeInTheDocument();
  });

  it("renders company feature rows for company persona", () => {
    render(<ComparisonTable persona="company" />);
    // Feature appears in both desktop table and mobile cards
    const features = screen.getAllByText("AI-matched candidate suggestions");
    expect(features.length).toBeGreaterThanOrEqual(1);
  });

  it("renders check icons for StudentHub features", () => {
    const { container } = render(<ComparisonTable persona="candidate" />);
    const checks = container.querySelectorAll('[data-testid="icon-check"]');
    expect(checks.length).toBeGreaterThan(0);
  });

  it("renders comparison cards in a responsive grid on mobile", () => {
    const { container } = render(<ComparisonTable persona="candidate" />);
    // Mobile card layout uses a grid with gap-4
    const mobileSection = container.querySelector(".md\\:hidden.grid");
    expect(mobileSection).toBeTruthy();
  });

  it("renders score summary badge", () => {
    render(<ComparisonTable persona="candidate" />);
    // Score summary shows StudentHub's feature count
    const badges = screen.getAllByText(/StudentHub wins on/i);
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it("renders a fallback subtitle for non-standard personas", () => {
    render(<ComparisonTable persona="staff" />);
    expect(
      screen.getByText("See how StudentHub compares."),
    ).toBeInTheDocument();
  });
});
