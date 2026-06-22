import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

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
      {facts?.map((f) => (
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

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

const mockCompany = {
  company_name: "Acme Corp",
  company_email: "info@acme.com",
};

const mockInvoice = {
  invoice_id: 1001,
  transfer_id: 501,
  invoice_status: "AUTHORISED",
  total: "1500.000",
  company_total: "1725.000",
  currency_code: "KWD",
  invoice_date: "2024-03-15",
  payment_received_on: "2024-04-01",
  company: mockCompany,
};

const mockInvoiceNoCompany = {
  invoice_id: 1002,
  transfer_id: null,
  invoice_status: null,
  total: null,
  company_total: null,
  currency_code: null,
  invoice_date: null,
  payment_received_on: null,
  company: null,
};

const mockGetInvoice = vi.fn();

vi.mock("./actions", () => ({
  getInvoice: (...args: unknown[]) => mockGetInvoice(...args),
}));

describe("AdminInvoiceDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders invoice detail with all fields including company and payouts", async () => {
    mockGetInvoice.mockResolvedValue({
      invoice: mockInvoice,
      candidate_payouts: [
        { tc_id: 42, candidate_name: "Ahmed Khan", amount: "750.000", paid: true },
        { tc_id: 55, candidate_name: "Sara Ali", amount: "500.000", paid: false },
      ],
      metrics: [
        { label: "Total", value: "1500.000", note: "" },
        { label: "Status", value: "AUTHORISED", note: "" },
      ],
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "1001" }),
      }),
    );

    // Check workspace shell
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Invoices");
    expect(screen.getByTestId("title")).toHaveTextContent("Invoice #1001");

    // Check metrics
    expect(screen.getByTestId("metric-Total")).toHaveTextContent("1500.000");
    expect(screen.getByTestId("metric-Status")).toHaveTextContent("AUTHORISED");

    // Check invoice detail fields
    expect(screen.getByTestId("fact-Invoice ID")).toHaveTextContent("1001");
    expect(screen.getByTestId("fact-Transfer ID")).toHaveTextContent("501");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("AUTHORISED");
    expect(screen.getByTestId("fact-Total")).toHaveTextContent("1500.000");
    expect(screen.getByTestId("fact-Company Total")).toHaveTextContent("1725.000");
    expect(screen.getByTestId("fact-Currency")).toHaveTextContent("KWD");
    expect(screen.getByTestId("fact-Invoice Date")).toHaveTextContent("2024-03-15");
    expect(screen.getByTestId("fact-Payment Received")).toHaveTextContent("2024-04-01");

    // Check company section
    expect(screen.getByText("Company")).toBeInTheDocument();

    // Check payout section
    expect(screen.getByText("Candidate Payouts (2)")).toBeInTheDocument();

    // Check back button
    expect(screen.getByText("Back to Invoices")).toBeInTheDocument();
  });

  it("renders null fields as em-dash and no company when absent", async () => {
    mockGetInvoice.mockResolvedValue({
      invoice: mockInvoiceNoCompany,
      candidate_payouts: [],
      metrics: [
        { label: "Total", value: "—", note: "" },
        { label: "Status", value: "—", note: "" },
      ],
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "1002" }),
      }),
    );

    expect(screen.getByTestId("fact-Transfer ID")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Total")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Company Total")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Currency")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Invoice Date")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Payment Received")).toHaveTextContent("—");

    // Company and payout sections should not render
    expect(screen.queryByText("Company")).not.toBeInTheDocument();
    expect(screen.queryByText("Candidate Payouts")).not.toBeInTheDocument();
  });

  it("calls notFound when invoiceId is NaN", async () => {
    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "not-a-number" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("calls notFound when invoice is null", async () => {
    mockGetInvoice.mockResolvedValue({ invoice: null, candidate_payouts: [], metrics: [] });

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "999" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
