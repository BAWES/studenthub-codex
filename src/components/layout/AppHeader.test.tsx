import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin",
}));

const mockSession = {
  role: "admin" as const,
  name: "Admin User",
  email: "admin@test.com",
};

vi.mock("@/modules/workspace/WorkspaceOSContext", () => ({
  useWorkspaceOS: () => ({ session: mockSession }),
}));

import { AppHeader } from "./AppHeader";

describe("AppHeader", () => {
  beforeEach(() => {
    cleanup();
  });

  it("renders the StudentHub brand name", () => {
    const { container } = render(<AppHeader />);
    expect(container.textContent).toContain("StudentHub");
  });

  it("renders role-aware navigation tabs", () => {
    const { container } = render(<AppHeader />);
    expect(container.textContent).toContain("Overview");
    expect(container.textContent).toContain("Candidates");
  });

  it("renders notification bell", () => {
    const { container } = render(<AppHeader />);
    const buttons = container.querySelectorAll("button");
    const bellButton = Array.from(buttons).find(
      (b) => b.getAttribute("aria-label")?.includes("Notifications"),
    );
    expect(bellButton).toBeInTheDocument();
  });

  it("renders the sticky header container", () => {
    const { container } = render(<AppHeader />);
    expect(container.querySelector(".shAppHeader")).toBeInTheDocument();
  });

  it("renders the glass backdrop element", () => {
    const { container } = render(<AppHeader />);
    expect(container.querySelector(".shAppHeaderGlass")).toBeInTheDocument();
  });

  it("brand logo links to /app", () => {
    const { container } = render(<AppHeader />);
    const links = container.querySelectorAll("a");
    const logoLink = Array.from(links).find(
      (l) => l.getAttribute("aria-label") === "StudentHub app",
    );
    expect(logoLink).toHaveAttribute("href", "/app");
  });
});
