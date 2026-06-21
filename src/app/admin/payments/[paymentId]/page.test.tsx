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
          {f.value}
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

const mockPayment = {
  bank_transaction_id: "btxn-001234",
  reference: "Payment for services",
  status: "AUTHORISED",
  type: "SPEND",
  total: 1500.0,
  sub_total: 1200.0,
  total_tax: 300.0,
  currency_rate: 1.0,
  currency_code: "KWD",
  line_amount_types: "Inclusive",
  has_attachments: true,
  is_reconciled: true,
  date: "2024-03-15",
  created_at: "2024-03-10T08:00:00.000Z",
  updated_at: "2024-03-15T12:00:00.000Z",
  contact: { contact_id: "c-001", name: "Ahmed Co." },
};

const mockPaymentNullFields = {
  bank_transaction_id: "btxn-009999",
  reference: null,
  status: null,
  type: null,
  total: null,
  sub_total: null,
  total_tax: null,
  currency_rate: null,
  currency_code: null,
  line_amount_types: null,
  has_attachments: null,
  is_reconciled: null,
  date: null,
  created_at: null,
  updated_at: null,
  contact: null,
};

const mockLineItems = [
  {
    line_item_id: "li-001",
    account_code: "ACC-500",
    description: "Consulting services",
    line_amount: 800.0,
    quantity: 1,
    unit_amount: 800.0,
  },
  {
    line_item_id: "li-002",
    account_code: "ACC-600",
    description: "Software license",
    line_amount: 400.0,
    quantity: 1,
    unit_amount: 400.0,
  },
];

const mockGetPayment = vi.fn();

vi.mock("./actions", () => ({
  getPayment: (...args: unknown[]) => mockGetPayment(...args),
}));

describe("AdminPaymentDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders payment detail with all fields, contact, and line items", async () => {
    mockGetPayment.mockResolvedValue({
      payment: mockPayment,
      line_items: mockLineItems,
      metrics: [
        { label: "Total", value: "1500.000", note: "" },
        { label: "Status", value: "AUTHORISED", note: "" },
        { label: "Type", value: "SPEND", note: "" },
      ],
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ paymentId: "btxn-001234" }),
      }),
    );

    // Check workspace shell
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Payments");
    expect(screen.getByTestId("title")).toHaveTextContent("btxn-001…");

    // Check metrics
    expect(screen.getByTestId("metric-Total")).toHaveTextContent("1500.000");
    expect(screen.getByTestId("metric-Status")).toHaveTextContent("AUTHORISED");
    expect(screen.getByTestId("metric-Type")).toHaveTextContent("SPEND");

    // Check payment detail fields
    expect(screen.getByTestId("fact-Transaction ID")).toHaveTextContent("btxn-001234");
    expect(screen.getByTestId("fact-Reference")).toHaveTextContent("Payment for services");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("AUTHORISED");
    expect(screen.getByTestId("fact-Type")).toHaveTextContent("Spend");
    expect(screen.getByTestId("fact-Total")).toHaveTextContent("1500.000 KWD");
    expect(screen.getByTestId("fact-Sub Total")).toHaveTextContent("1200.000 KWD");
    expect(screen.getByTestId("fact-Total Tax")).toHaveTextContent("300.000 KWD");
    expect(screen.getByTestId("fact-Currency Rate")).toHaveTextContent("1");
    expect(screen.getByTestId("fact-Line Amount Types")).toHaveTextContent("Inclusive");
    expect(screen.getByTestId("fact-Has Attachments")).toHaveTextContent("Yes");
    expect(screen.getByTestId("fact-Reconciled")).toHaveTextContent("Yes");
    expect(screen.getByTestId("fact-Date")).toHaveTextContent("2024-03-15");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2024-03-10");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("2024-03-15");

    // Check contact section
    expect(screen.getByText("Contact")).toBeInTheDocument();
    expect(screen.getByTestId("fact-Contact ID")).toHaveTextContent("c-001");
    expect(screen.getByTestId("fact-Name")).toHaveTextContent("Ahmed Co.");

    // Check line items section
    expect(screen.getByText("Line Items (2)")).toBeInTheDocument();

    // Check back button
    expect(screen.getByText("Back to Payments")).toBeInTheDocument();
  });

  it("renders null fields as em-dash and no contact when absent", async () => {
    mockGetPayment.mockResolvedValue({
      payment: mockPaymentNullFields,
      line_items: [],
      metrics: [
        { label: "Total", value: "—", note: "" },
        { label: "Status", value: "—", note: "" },
      ],
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ paymentId: "btxn-009999" }),
      }),
    );

    expect(screen.getByTestId("fact-Reference")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Unknown");
    expect(screen.getByTestId("fact-Type")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Total")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Sub Total")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Total Tax")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Currency Rate")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Line Amount Types")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Has Attachments")).toHaveTextContent("No");
    expect(screen.getByTestId("fact-Reconciled")).toHaveTextContent("No");
    expect(screen.getByTestId("fact-Date")).toHaveTextContent("—");

    // Contact and line items sections should not render
    expect(screen.queryByText("Contact")).not.toBeInTheDocument();
    expect(screen.queryByText("Line Items")).not.toBeInTheDocument();
  });

  it("calls notFound when payment is null", async () => {
    mockGetPayment.mockResolvedValue({ payment: null, line_items: [], metrics: [] });

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ paymentId: "nonexistent" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
