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

    // Candidate nav items: App, Overview, Invitations, Work Logs, Payments
    expect(screen.getByText("App")).toBeInTheDocument();
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Invitations")).toBeInTheDocument();
    expect(screen.getByText("Work Logs")).toBeInTheDocument();
    expect(screen.getByText("Payments")).toBeInTheDocument();
  });

  it("marks the active tab based on current pathname", () => {
    // pathname = /candidate, Overview has href="/candidate"
    render(<MobileNavBar role="candidate" />);

    const tabs = screen.getAllByRole("link");
    const overviewTab = tabs.find((t) => t.textContent?.includes("Overview"));
    expect(overviewTab).toBeDefined();
    expect(overviewTab!.className).toContain("shMobileNavTabActive");
  });

  it("does not mark inactive tabs with active class", () => {
    render(<MobileNavBar role="candidate" />);

    const tabs = screen.getAllByRole("link");
    const paymentsTab = tabs.find((t) => t.textContent?.includes("Payments"));
    expect(paymentsTab).toBeDefined();
    expect(paymentsTab!.className).not.toContain("shMobileNavTabActive");
  });

  it("renders unread badges when provided", () => {
    render(
      <MobileNavBar
        role="candidate"
        unreadBadges={{ invitations: 3, "work-logs": 1 }}
      />,
    );

    const badges = document.querySelectorAll(".shMobileNavBadge");
    expect(badges.length).toBe(2);
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
});
