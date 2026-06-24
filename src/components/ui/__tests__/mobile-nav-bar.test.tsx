// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MobileNavBar } from "../mobile-nav-bar";

// ---------------------------------------------------------------------------
// Mocks — dynamically changeable pathname
// ---------------------------------------------------------------------------

let mockPathname = "/candidate";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------

afterEach(() => {
  cleanup();
  mockPathname = "/candidate"; // reset
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("MobileNavBar", () => {
  it("renders all nav tabs for the candidate role", () => {
    render(<MobileNavBar role="candidate" />);

    // Candidate nav items: App, Overview, Jobs, My Applications, Invitations, Work Logs, Chat, Payments
    expect(screen.getByText("App")).toBeInTheDocument();
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Invitations")).toBeInTheDocument();
    expect(screen.getByText("Work Logs")).toBeInTheDocument();
    expect(screen.getByText("Payments")).toBeInTheDocument();
  });

  it("marks the active tab with coral color when on current pathname", () => {
    render(<MobileNavBar role="candidate" />);

    const tabs = screen.getAllByRole("link");
    const overviewTab = tabs.find((t) => t.textContent?.includes("Overview"));
    expect(overviewTab).toBeDefined();
    // Active tabs get the coral color (text-coral)
    expect(overviewTab!.className).toContain("eb6651");
  });

  it("does not set coral color on inactive tabs", () => {
    render(<MobileNavBar role="candidate" />);

    const tabs = screen.getAllByRole("link");
    const paymentsTab = tabs.find((t) => t.textContent?.includes("Payments"));
    expect(paymentsTab).toBeDefined();
    // Inactive tabs use muted foreground, not coral
    expect(paymentsTab!.className).toContain("text-muted-foreground");
    expect(paymentsTab!.className).not.toContain("eb6651");
  });

  it("renders unread badges when provided", () => {
    render(
      <MobileNavBar
        role="candidate"
        unreadBadges={{ invitations: 3, "work-logs": 1 }}
      />,
    );

    // Badges use data-testid attributes
    const badge1 = screen.getByTestId("badge-invitations");
    expect(badge1).toBeInTheDocument();
    expect(badge1).toHaveTextContent("3");

    const badge2 = screen.getByTestId("badge-work-logs");
    expect(badge2).toBeInTheDocument();
    expect(badge2).toHaveTextContent("1");
  });

  it("renders admin nav items", () => {
    mockPathname = "/admin";
    render(<MobileNavBar role="admin" />);

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Companies")).toBeInTheDocument();
    expect(screen.getByText("Transfers")).toBeInTheDocument();
  });

  it("applies role-specific aria-label to the nav element", () => {
    render(<MobileNavBar role="staff" />);

    const nav = screen.getByRole("navigation");
    expect(nav).toHaveAttribute("aria-label", "staff mobile navigation");
  });

  it("renders company role tabs", () => {
    mockPathname = "/company";
    render(<MobileNavBar role="company" />);

    expect(screen.getByText("Requests")).toBeInTheDocument();
    expect(screen.getByText("Stores")).toBeInTheDocument();
  });

  it("shows 99+ badge for large counts", () => {
    render(
      <MobileNavBar
        role="candidate"
        unreadBadges={{ invitations: 100 }}
      />,
    );

    const badge = screen.getByTestId("badge-invitations");
    expect(badge).toHaveTextContent("99+");
  });
});
