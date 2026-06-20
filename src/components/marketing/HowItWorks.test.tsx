// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("lucide-react", () => ({
  UserRound: () => <span data-testid="icon-user" />,
  Search: () => <span data-testid="icon-search" />,
  Briefcase: () => <span data-testid="icon-briefcase" />,
  ArrowRight: () => <span data-testid="icon-arrow-right" />,
  Building2: () => <span data-testid="icon-building" />,
  Sparkles: () => <span data-testid="icon-sparkles" />,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

import HowItWorks from "./HowItWorks";

describe("HowItWorks", () => {
  it("renders the section heading", () => {
    render(<HowItWorks />);
    expect(screen.getByText("How it works")).toBeTruthy();
  });

  it("renders the main title", () => {
    render(<HowItWorks />);
    expect(
      screen.getByText("From profile to placement in three steps."),
    ).toBeTruthy();
  });

  it("renders all 3 steps for students", () => {
    render(<HowItWorks />);
    expect(screen.getByText("Create your profile")).toBeTruthy();
    expect(screen.getByText("Get matched")).toBeTruthy();
    expect(screen.getByText("Get hired")).toBeTruthy();
  });

  it("renders step numbers 1, 2, 3", () => {
    const { container } = render(<HowItWorks />);
    expect(container.textContent).toContain("1");
    expect(container.textContent).toContain("2");
    expect(container.textContent).toContain("3");
  });

  it("renders body content for all steps", () => {
    render(<HowItWorks />);
    expect(
      screen.getByText(/tell us about your skills/i),
    ).toBeTruthy();
    expect(
      screen.getAllByText(/staff.*match/i).length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText(/one-click apply/i),
    ).toBeTruthy();
  });

  it("renders description about connecting students and employers", () => {
    render(<HowItWorks />);
    expect(
      screen.getByText(/our staff recruiters match students/i),
    ).toBeTruthy();
  });
});
