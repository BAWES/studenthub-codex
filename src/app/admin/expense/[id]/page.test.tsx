// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Mock dependencies
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
          {String(m.value)}
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

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
  redirect: vi.fn(),
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

const mockExpense = {
  expense_uuid: "550e8400-e29b-41d4-a716-446655440000",
  title: "Office supplies",
  type: "operations",
  detail: "Printer paper and ink cartridges",
  amount: "125.500",
  transaction_datetime: new Date("2026-06-15T10:00:00Z"),
  created_by: 42,
  updated_by: 42,
  created_at: new Date("2026-06-15T10:00:00Z"),
  updated_at: new Date("2026-06-15T12:00:00Z"),
};

const mockGetExpense = vi.fn();
const mockDeleteExpense = vi.fn();

vi.mock("./actions", () => ({
  getExpense: (...args: unknown[]) => mockGetExpense(...args),
  deleteExpense: (...args: unknown[]) => mockDeleteExpense(...args),
}));

describe("AdminExpenseDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders expense detail with all fields", async () => {
    mockGetExpense.mockResolvedValue(mockExpense);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "550e8400-e29b-41d4-a716-446655440000" }),
      }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Expenses");
    expect(screen.getByTestId("title")).toHaveTextContent("550e8400...");

    expect(screen.getByTestId("fact-UUID")).toHaveTextContent(
      "550e8400-e29b-41d4-a716-446655440000",
    );
    expect(screen.getByTestId("fact-Title")).toHaveTextContent("Office supplies");
    expect(screen.getByTestId("fact-Type")).toHaveTextContent("operations");
    expect(screen.getByTestId("fact-Amount")).toHaveTextContent("125.500");
    expect(screen.getByTestId("fact-Detail")).toHaveTextContent(
      "Printer paper and ink cartridges",
    );
    expect(screen.getByTestId("fact-Transaction Date")).toHaveTextContent("2026-06-15");
    expect(screen.getByTestId("fact-Created by")).toHaveTextContent("42");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2026-06-15");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("2026-06-15");
  });

  it("renders null fields as em-dash", async () => {
    mockGetExpense.mockResolvedValue({
      ...mockExpense,
      type: null,
      amount: null,
      detail: null,
      transaction_datetime: null,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "550e8400-e29b-41d4-a716-446655440001" }),
      }),
    );

    expect(screen.getByTestId("fact-Type")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Amount")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Detail")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Transaction Date")).toHaveTextContent("—");
  });

  it("calls notFound when expense is null", async () => {
    mockGetExpense.mockResolvedValue(null);

    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent-uuid" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("renders delete button", async () => {
    mockGetExpense.mockResolvedValue(mockExpense);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "550e8400-e29b-41d4-a716-446655440000" }),
      }),
    );

    expect(
      screen.getByRole("button", { name: /delete expense/i }),
    ).toBeInTheDocument();
  });
});
