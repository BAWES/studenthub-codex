import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

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

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

const mockBank = {
  bank_id: 1,
  bank_name: "National Bank of Kuwait",
  bank_iban_code: "KW1234567890",
  bank_swift_code: "NBOKKWKW",
  bank_code_abk: 123,
  bank_address: "Kuwait City, Sharq",
  bank_transfer_type: "wire",
};

const mockGetBank = vi.fn();

vi.mock("./actions", () => ({
  getBank: (...args: unknown[]) => mockGetBank(...args),
}));

describe("AdminBankDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders bank detail with all fields", async () => {
    mockGetBank.mockResolvedValue({ bank: mockBank, candidate_count: 15 });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ bankId: "1" }),
      }),
    );

    // Check workspace shell
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Banks");
    expect(screen.getByTestId("title")).toHaveTextContent("National Bank of Kuwait");

    // Check metrics
    expect(screen.getByTestId("metric-Candidates")).toHaveTextContent("15");

    // Check detail fields
    expect(screen.getByTestId("fact-Name")).toHaveTextContent("National Bank of Kuwait");
    expect(screen.getByTestId("fact-IBAN Code")).toHaveTextContent("KW1234567890");
    expect(screen.getByTestId("fact-SWIFT Code")).toHaveTextContent("NBOKKWKW");
    expect(screen.getByTestId("fact-ABK Code")).toHaveTextContent("123");
    expect(screen.getByTestId("fact-Address")).toHaveTextContent("Kuwait City, Sharq");
    expect(screen.getByTestId("fact-Transfer Type")).toHaveTextContent("wire");
  });

  it("renders null bank fields as em-dash", async () => {
    mockGetBank.mockResolvedValue({
      bank: {
        ...mockBank,
        bank_name: null,
        bank_iban_code: null,
        bank_swift_code: null,
        bank_code_abk: null,
        bank_address: null,
        bank_transfer_type: null,
      },
      candidate_count: 0,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ bankId: "99" }),
      }),
    );

    expect(screen.getByTestId("title")).toHaveTextContent("Bank Details");
    expect(screen.getByTestId("fact-Name")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-IBAN Code")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-SWIFT Code")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-ABK Code")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Address")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Transfer Type")).toHaveTextContent("—");
  });

  it("calls notFound when bankId is NaN", async () => {
    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ bankId: "not-a-number" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("calls notFound when bank is null", async () => {
    mockGetBank.mockResolvedValue({ bank: null, candidate_count: 0 });

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ bankId: "999" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
