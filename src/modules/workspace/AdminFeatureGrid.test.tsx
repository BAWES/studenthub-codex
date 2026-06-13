// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AdminFeatureGrid } from "./AdminFeatureGrid";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("./navigation", () => ({
  navForRole: (role: string) => {
    if (role === "admin") {
      return [
        { label: "App", href: "/app", icon: () => <svg data-testid="icon-app" /> },
        { label: "Overview", href: "/admin", icon: () => <svg data-testid="icon-overview" /> },
        { label: "Candidates", href: "/admin/candidates", icon: () => <svg data-testid="icon-candidates" /> },
        { label: "Companies", href: "/admin/companies", icon: () => <svg data-testid="icon-companies" /> },
        { label: "Requests", href: "/admin/requests", icon: () => <svg data-testid="icon-requests" /> },
      ];
    }
    return [];
  },
}));

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AdminFeatureGrid", () => {
  it("renders a section with aria-label 'Workspace features'", () => {
    render(<AdminFeatureGrid />);
    const section = screen.getByLabelText("Workspace features");
    expect(section).toBeInTheDocument();
  });

  it("renders items from navForRole('admin') excluding /admin (Overview)", () => {
    render(<AdminFeatureGrid />);
    // Overview (/admin) should be filtered out
    expect(screen.queryByText("Overview")).not.toBeInTheDocument();
    // These should be present
    expect(screen.getByText("App")).toBeInTheDocument();
    expect(screen.getByText("Candidates")).toBeInTheDocument();
    expect(screen.getByText("Companies")).toBeInTheDocument();
    expect(screen.getByText("Requests")).toBeInTheDocument();
  });

  it("renders each item as a link with correct href", () => {
    render(<AdminFeatureGrid />);
    expect(screen.getByText("App").closest("a")).toHaveAttribute("href", "/app");
    expect(screen.getByText("Candidates").closest("a")).toHaveAttribute("href", "/admin/candidates");
    expect(screen.getByText("Companies").closest("a")).toHaveAttribute("href", "/admin/companies");
    expect(screen.getByText("Requests").closest("a")).toHaveAttribute("href", "/admin/requests");
  });

  it("renders icons inside each feature card", () => {
    render(<AdminFeatureGrid />);
    const cards = document.querySelectorAll(".featureCard");
    expect(cards.length).toBeGreaterThan(0);
    cards.forEach((card) => {
      expect(card.querySelector("svg")).toBeInTheDocument();
    });
  });

  it("shows a contextual description for each feature card", () => {
    render(<AdminFeatureGrid />);
    // FeatureGrid injects descriptions via getDescription()
    // Candidates href /admin/candidates — first segment after /admin is "candidates"
    const description = screen.getByText(/search, review, and manage candidates/i);
    expect(description).toBeInTheDocument();
  });
});
