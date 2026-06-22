import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LayoutDashboard } from "lucide-react";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/admin",
}));

// Import after mocks
import { NavTab } from "./NavTab";

describe("NavTab", () => {
  it("renders label and icon", () => {
    render(
      <NavTab href="/admin" label="Dashboard" icon={LayoutDashboard} active={false} />,
    );
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("sets aria-current=page when active", () => {
    const { container } = render(
      <NavTab href="/admin" label="Dashboard" icon={LayoutDashboard} active={true} />,
    );
    const links = container.querySelectorAll("a");
    const dashboardLink = Array.from(links).find(
      (l) => l.textContent === "Dashboard",
    );
    expect(dashboardLink).toHaveAttribute("aria-current", "page");
  });

  it("does not set aria-current when inactive", () => {
    const { container } = render(
      <NavTab href="/admin/candidates" label="Candidates" icon={LayoutDashboard} active={false} />,
    );
    const links = container.querySelectorAll("a");
    const candidatesLink = Array.from(links).find(
      (l) => l.textContent === "Candidates",
    );
    expect(candidatesLink).not.toHaveAttribute("aria-current");
  });

  it("renders active indicator when active", () => {
    const { container } = render(
      <NavTab href="/admin" label="Dashboard" icon={LayoutDashboard} active={true} />,
    );
    expect(container.querySelector(".shAppHeaderTabActiveIndicator")).toBeInTheDocument();
  });

  it("does not render active indicator when inactive", () => {
    const { container } = render(
      <NavTab href="/admin/candidates" label="Candidates" icon={LayoutDashboard} active={false} />,
    );
    expect(container.querySelector(".shAppHeaderTabActiveIndicator")).not.toBeInTheDocument();
  });

  it("links to the provided href", () => {
    const { container } = render(
      <NavTab href="/admin" label="Dashboard" icon={LayoutDashboard} active={false} />,
    );
    const links = container.querySelectorAll("a");
    const dashboardLink = Array.from(links).find(
      (l) => l.textContent === "Dashboard",
    );
    expect(dashboardLink).toHaveAttribute("href", "/admin");
  });

  it("applies active class when active", () => {
    const { container } = render(
      <NavTab href="/admin" label="Dashboard" icon={LayoutDashboard} active={true} />,
    );
    const links = container.querySelectorAll("a");
    const dashboardLink = Array.from(links).find(
      (l) => l.textContent === "Dashboard",
    );
    expect(dashboardLink).toHaveClass("shAppHeaderTabActive");
  });

  it("applies inactive class when not active", () => {
    const { container } = render(
      <NavTab href="/admin/candidates" label="Candidates" icon={LayoutDashboard} active={false} />,
    );
    const links = container.querySelectorAll("a");
    const candidatesLink = Array.from(links).find(
      (l) => l.textContent === "Candidates",
    );
    expect(candidatesLink).toHaveClass("shAppHeaderTabInactive");
  });
});
