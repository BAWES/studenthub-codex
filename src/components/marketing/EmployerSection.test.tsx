// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("lucide-react", () => ({
  Search: () => <span data-testid="icon-search" />,
  Shield: () => <span data-testid="icon-shield" />,
  FileText: () => <span data-testid="icon-file-text" />,
  BarChart3: () => <span data-testid="icon-bar-chart" />,
  Clock: () => <span data-testid="icon-clock" />,
  CreditCard: () => <span data-testid="icon-credit-card" />,
  Sparkles: () => <span data-testid="icon-sparkles" />,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

import EmployerSection from "./EmployerSection";

describe("EmployerSection", () => {
  it("renders section label", () => {
    render(<EmployerSection />);
    expect(screen.getByText("For employers")).toBeTruthy();
  });

  it("renders the main title", () => {
    render(<EmployerSection />);
    expect(
      screen.getByText("Hire student talent without the runaround."),
    ).toBeTruthy();
  });

  it("renders all 6 feature cards by title", () => {
    render(<EmployerSection />);
    expect(screen.getByText("Staff-matched candidates")).toBeTruthy();
    expect(screen.getByText("Vetted talent pool")).toBeTruthy();
    expect(screen.getByText("Timesheet approvals")).toBeTruthy();
    expect(screen.getByText("Consolidated invoicing")).toBeTruthy();
    expect(screen.getByText("Hiring analytics")).toBeTruthy();
    expect(screen.getByText("Multi-branch management")).toBeTruthy();
  });

  it("renders the CTA button", () => {
    render(<EmployerSection />);
    const cta = screen.getByText("Start hiring today");
    expect(cta).toBeTruthy();
    expect(cta.getAttribute("href")).toBe("/signup?role=company");
  });

  it("renders stat labels in feature cards", () => {
    render(<EmployerSection />);
    expect(screen.getByText("48h avg time-to-match")).toBeTruthy();
    expect(screen.getByText("Real-time dashboard")).toBeTruthy();
  });
});
