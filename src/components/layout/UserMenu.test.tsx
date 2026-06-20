import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import { UserMenu } from "./UserMenu";

// Minimal mock for dropdown-menu components
vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-label">{children}</div>,
  DropdownMenuSeparator: () => <div data-testid="dropdown-separator" />,
  DropdownMenuItem: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dropdown-item" className={className}>{children}</div>
  ),
}));

describe("UserMenu", () => {
  const defaultUser = {
    name: "John Doe",
    email: "john@example.com",
  };

  it("renders user initials in avatar", () => {
    render(<UserMenu name={defaultUser.name} email={defaultUser.email} />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("renders user name in dropdown label", () => {
    const { container } = render(
      <UserMenu name={defaultUser.name} email={defaultUser.email} />,
    );
    // Only check within dropdown content to avoid matching the trigger's aria-label
    const content = container.querySelector('[data-testid="dropdown-label"]');
    expect(content).toHaveTextContent("John Doe");
  });

  it("renders user email in dropdown label", () => {
    const { container } = render(
      <UserMenu name={defaultUser.name} email={defaultUser.email} />,
    );
    const content = container.querySelector('[data-testid="dropdown-label"]');
    expect(content).toHaveTextContent("john@example.com");
  });

  it("renders sign out as a destructive menu item", () => {
    const { container } = render(
      <UserMenu name={defaultUser.name} email={defaultUser.email} />,
    );
    const items = container.querySelectorAll('[data-testid="dropdown-item"]');
    const signOut = Array.from(items).find((item) => item.textContent === "Sign Out");
    expect(signOut).toHaveClass("text-rose");
  });

  it("renders Profile menu item", () => {
    const { container } = render(
      <UserMenu name={defaultUser.name} email={defaultUser.email} />,
    );
    const items = container.querySelectorAll('[data-testid="dropdown-item"]');
    expect(Array.from(items).some((item) => item.textContent === "Profile")).toBe(true);
  });

  it("renders Settings menu item", () => {
    const { container } = render(
      <UserMenu name={defaultUser.name} email={defaultUser.email} />,
    );
    const items = container.querySelectorAll('[data-testid="dropdown-item"]');
    expect(Array.from(items).some((item) => item.textContent === "Settings")).toBe(true);
  });

  it("renders Help & Feedback menu item", () => {
    const { container } = render(
      <UserMenu name={defaultUser.name} email={defaultUser.email} />,
    );
    const items = container.querySelectorAll('[data-testid="dropdown-item"]');
    expect(Array.from(items).some((item) => item.textContent === "Help & Feedback")).toBe(true);
  });
});
