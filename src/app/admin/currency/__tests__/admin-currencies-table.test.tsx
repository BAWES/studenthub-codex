// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AdminCurrenciesTable } from "../_components";

// Mock next/navigation for WorkspaceNavigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
  usePathname: () => "/admin/currency",
}));

afterEach(() => {
  cleanup();
});

const mockSession = { id: "admin-1", name: "Admin", email: "admin@studenthub.co", role: "admin" } as any;

const sampleCurrencies = [
  {
    currency_id: 1,
    code: "USD",
    title: "US Dollar",
    currency_symbol: "$",
    rate: 1.0,
    status: true,
    sort_order: 1,
    created_at: null,
    updated_at: null,
  },
  {
    currency_id: 2,
    code: "KWD",
    title: "Kuwaiti Dinar",
    currency_symbol: "د.ك",
    rate: 0.308,
    status: true,
    sort_order: 2,
    created_at: null,
    updated_at: null,
  },
  {
    currency_id: 3,
    code: "EUR",
    title: "Euro",
    currency_symbol: "€",
    rate: 0.92,
    status: false,
    sort_order: 3,
    created_at: null,
    updated_at: null,
  },
];

describe("AdminCurrenciesTable", () => {
  it("renders all currencies", () => {
    render(<AdminCurrenciesTable session={mockSession} currencies={sampleCurrencies as any} />);
    expect(screen.getByText("US Dollar")).toBeDefined();
    expect(screen.getByText("Kuwaiti Dinar")).toBeDefined();
    expect(screen.getByText("Euro")).toBeDefined();
  });

  it("shows currency codes", () => {
    render(<AdminCurrenciesTable session={mockSession} currencies={sampleCurrencies as any} />);
    expect(screen.getByText("USD")).toBeDefined();
    expect(screen.getByText("KWD")).toBeDefined();
    expect(screen.getByText("EUR")).toBeDefined();
  });

  it("shows Active/Inactive status labels", () => {
    render(<AdminCurrenciesTable session={mockSession} currencies={sampleCurrencies as any} />);
    expect(screen.getAllByText("Active").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Inactive")).toBeDefined();
  });

  it("renders currency code and status badge without inline style attributes", () => {
    render(<AdminCurrenciesTable session={mockSession} currencies={sampleCurrencies as any} />);
    // Currency codes should use Tailwind class, not inline style
    const codes = screen.getAllByText("USD");
    codes.forEach((el) => {
      expect(el.getAttribute("style")).toBeNull();
    });
    // Status badges should use shadcn Badge, not inline style
    const badges = screen.getAllByText(/Active|Inactive/);
    badges.forEach((el) => {
      expect(el.tagName).toBe("SPAN"); // Badge renders as <span>
    });
  });
});
