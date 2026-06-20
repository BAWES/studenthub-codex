import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

// Mock the dependencies
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({ user: { id: "1" }, role: "admin" }),
  requireCapability: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/modules/workspace/ErrorBoundary", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/modules/workspace/WorkspaceShell", () => ({
  WorkspaceShell: ({
    children,
    eyebrow,
    title,
    metrics,
  }: {
    children: React.ReactNode;
    eyebrow: string;
    title: string;
    metrics: { label: string; value: string | number; note: string }[];
  }) => (
    <div data-testid="workspace-shell">
      <div data-testid="eyebrow">{eyebrow}</div>
      <div data-testid="title">{title}</div>
      {metrics.map((m) => (
        <span key={m.label} data-testid={`metric-${m.label}`}>
          {m.value}
        </span>
      ))}
      {children}
    </div>
  ),
}));

vi.mock("@/modules/workspace/DetailPanels", () => ({
  DetailSection: ({
    title,
    facts,
  }: {
    title: string;
    facts: { label: string; value: string | React.ReactNode }[];
  }) => (
    <div data-testid="detail-section">
      <div data-testid="section-title">{title}</div>
      {facts.map((f) => (
        <span key={String(f.label)} data-testid={`fact-${f.label}`}>
          {String(f.value)}
        </span>
      ))}
    </div>
  ),
}));

const mockCurrency = {
  currency_id: 1,
  title: "Kuwaiti Dinar",
  code: "KWD",
  currency_symbol: "KD",
  rate: 0.305,
  decimal_place: false,
  sort_order: 1,
  status: true,
  datetime: new Date("2024-03-01T10:00:00.000Z"),
};

const mockGetCurrency = vi.fn();

vi.mock("./actions", () => ({
  getCurrency: (...args: unknown[]) => mockGetCurrency(...args),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

describe("AdminCurrencyDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders currency detail with all fields", async () => {
    mockGetCurrency.mockResolvedValue(mockCurrency);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "1" }),
      }),
    );

    // Check workspace shell
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Currency");
    expect(screen.getByTestId("title")).toHaveTextContent("Currency — Kuwaiti Dinar");

    // Check metrics
    expect(screen.getByTestId("metric-Title")).toHaveTextContent("Kuwaiti Dinar");
    expect(screen.getByTestId("metric-Code")).toHaveTextContent("KWD");
    expect(screen.getByTestId("metric-Symbol")).toHaveTextContent("KD");

    // Check detail fields
    expect(screen.getByTestId("fact-Currency ID")).toHaveTextContent("1");
    expect(screen.getByTestId("fact-Title")).toHaveTextContent("Kuwaiti Dinar");
    expect(screen.getByTestId("fact-Code")).toHaveTextContent("KWD");
    expect(screen.getByTestId("fact-Symbol")).toHaveTextContent("KD");
    expect(screen.getByTestId("fact-Rate")).toHaveTextContent("0.305");
    expect(screen.getByTestId("fact-Decimal Place")).toHaveTextContent("false");
    expect(screen.getByTestId("fact-Sort Order")).toHaveTextContent("1");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Active");
    expect(screen.getByTestId("fact-Last Updated")).toHaveTextContent("2024-03-01");

    // Check back button
    expect(screen.getByText("Back to Currency")).toBeInTheDocument();
  });

  it("renders with nullable fields as dash", async () => {
    mockGetCurrency.mockResolvedValue({
      ...mockCurrency,
      currency_symbol: null,
      rate: null,
      decimal_place: null,
      sort_order: null,
      status: null,
      datetime: null,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "2" }),
      }),
    );

    expect(screen.getByTestId("metric-Symbol")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Symbol")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Rate")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Decimal Place")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Sort Order")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Inactive");
    expect(screen.getByTestId("fact-Last Updated")).toHaveTextContent("—");
  });

  it("calls notFound when currency is null (getCurrency throws)", async () => {
    mockGetCurrency.mockRejectedValue(new Error("Currency with ID 99 not found"));

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "99" }) }),
    ).rejects.toThrow();

    expect(notFound).toHaveBeenCalled();
  });
});
