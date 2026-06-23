import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

// Mock dependencies
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({
    user: { id: "1" },
    role: "candidate",
  }),
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
    rows,
    type,
  }: {
    title: string;
    facts?: { label: string; value: string | React.ReactNode }[];
    rows?: { id: string | number; title: string; subtitle: string; meta: string }[];
    type?: string;
  }) => (
    <div data-testid="detail-section">
      <div data-testid="section-title">{title}</div>
      {facts?.map((f) => (
        <span key={String(f.label)} data-testid={`fact-${f.label}`}>
          {String(f.value)}
        </span>
      ))}
      {type === "list" &&
        rows?.map((r) => (
          <div key={r.id} data-testid={`row-${r.id}`}>
            <span data-testid={`row-title-${r.id}`}>{r.title}</span>
            <span data-testid={`row-subtitle-${r.id}`}>{r.subtitle}</span>
            <span data-testid={`row-meta-${r.id}`}>{r.meta}</span>
          </div>
        ))}
    </div>
  ),
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

const mockGetCandidatePaymentDetail = vi.fn();

vi.mock("../actions", () => ({
  getCandidatePaymentDetail: (...args: unknown[]) =>
    mockGetCandidatePaymentDetail(...args),
}));

const mockNotFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("next/navigation", () => ({
  notFound: mockNotFound,
}));

const mockPaymentData = {
  transferCandidate: {
    id: 42,
    transferId: 100,
    company: "Tech Corp Kuwait",
    store: "Downtown Branch",
    hours: "40h 30m",
    hourlyRate: "5.000 KWD",
    candidateTotal: "200.000 KWD",
    companyTotal: "300.000 KWD",
    cost: "50.000 KWD",
    bonus: "10.000 KWD",
    paid: "Paid",
    beneficiary: "Ahmed Al-Sabah",
    iban: "KW1234567890",
    bank: "NBK",
    created: "2025-01-10",
    updated: "2025-02-15",
  },
  transfer: {
    id: 100,
    period: "2025-01-01 to 2025-01-31",
    paymentReceived: "2025-02-01",
  },
  invoices: [
    { id: 1, date: new Date("2025-01-15"), status: "paid" },
    { id: 2, date: new Date("2025-01-20"), status: "paid" },
  ],
};

describe("CandidatePaymentDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders payment detail with WorkspaceShell and correct eyebrow", async () => {
    mockGetCandidatePaymentDetail.mockResolvedValue(mockPaymentData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "42" }) }));

    expect(screen.getByTestId("workspace-shell")).toBeDefined();
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Candidate / Payments");
    expect(screen.getByTestId("title")).toHaveTextContent("Payment #42");
  });

  it("renders metrics correctly", async () => {
    mockGetCandidatePaymentDetail.mockResolvedValue(mockPaymentData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "42" }) }));

    expect(screen.getByTestId("metric-Total")).toHaveTextContent("200.000 KWD");
    expect(screen.getByTestId("metric-Status")).toHaveTextContent("Paid");
    expect(screen.getByTestId("metric-Hours")).toHaveTextContent("40h 30m");
  });

  it("renders Payment Breakdown DetailSection with all facts", async () => {
    mockGetCandidatePaymentDetail.mockResolvedValue(mockPaymentData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "42" }) }));

    const sections = screen.getAllByTestId("section-title");
    expect(sections[0]).toHaveTextContent("Payment Breakdown");
    expect(screen.getByTestId("fact-Hours")).toHaveTextContent("40h 30m");
    expect(screen.getByTestId("fact-Hourly Rate")).toHaveTextContent("5.000 KWD");
    expect(screen.getByTestId("fact-Bonus")).toHaveTextContent("10.000 KWD");
    expect(screen.getByTestId("fact-Your Total")).toHaveTextContent("200.000 KWD");
    expect(screen.getByTestId("fact-Company Total")).toHaveTextContent("300.000 KWD");
    expect(screen.getByTestId("fact-Transfer Cost")).toHaveTextContent("50.000 KWD");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Paid");
    expect(screen.getByTestId("fact-Store")).toHaveTextContent("Downtown Branch");
    expect(screen.getByTestId("fact-Beneficiary")).toHaveTextContent("Ahmed Al-Sabah");
    expect(screen.getByTestId("fact-IBAN")).toHaveTextContent("KW1234567890");
    expect(screen.getByTestId("fact-Bank")).toHaveTextContent("NBK");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2025-01-10");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("2025-02-15");
  });

  it("renders Transfer Run section when transfer is present", async () => {
    mockGetCandidatePaymentDetail.mockResolvedValue(mockPaymentData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "42" }) }));

    // There should be 2 detail sections: Payment Breakdown + Transfer Run
    const sections = screen.getAllByTestId("section-title");
    expect(sections[0]).toHaveTextContent("Payment Breakdown");
    expect(sections[1]).toHaveTextContent("Transfer Run");
    expect(screen.getByTestId("fact-Company")).toHaveTextContent("Tech Corp Kuwait");
    expect(screen.getByTestId("fact-Period")).toHaveTextContent("2025-01-01 to 2025-01-31");
    expect(screen.getByTestId("fact-Payment Received")).toHaveTextContent("2025-02-01");
  });

  it("renders invoices list when invoices exist", async () => {
    mockGetCandidatePaymentDetail.mockResolvedValue(mockPaymentData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "42" }) }));

    expect(screen.getByText("Receipts & Invoices")).toBeDefined();
    expect(screen.getByTestId("row-title-1")).toHaveTextContent("Invoice #1");
    expect(screen.getByTestId("row-title-2")).toHaveTextContent("Invoice #2");
    expect(screen.getByTestId("row-meta-1")).toHaveTextContent("paid");
  });

  it("does not render invoices section when invoices is empty", async () => {
    mockGetCandidatePaymentDetail.mockResolvedValue({
      ...mockPaymentData,
      invoices: [],
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "42" }) }));

    expect(screen.queryByText("Receipts & Invoices")).toBeNull();
  });

  it("does not render Transfer Run section when transfer is null", async () => {
    mockGetCandidatePaymentDetail.mockResolvedValue({
      ...mockPaymentData,
      transfer: null,
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "42" }) }));

    const sections = screen.getAllByTestId("section-title");
    expect(sections[0]).toHaveTextContent("Payment Breakdown");
    // When transfer is null, only Payment Breakdown + Invoices sections exist
    expect(sections).toHaveLength(2);
    expect(screen.queryByTestId("fact-Period")).toBeNull();
  });

  it("handles null store, beneficiary, iban, bank gracefully", async () => {
    mockGetCandidatePaymentDetail.mockResolvedValue({
      ...mockPaymentData,
      transferCandidate: {
        ...mockPaymentData.transferCandidate,
        store: null,
        beneficiary: null,
        iban: null,
        bank: null,
      },
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "42" }) }));

    // In the mock, String(null) renders as "null"
    expect(screen.getByTestId("fact-Store")).toHaveTextContent("null");
    expect(screen.getByTestId("fact-Beneficiary")).toHaveTextContent("null");
    expect(screen.getByTestId("fact-IBAN")).toHaveTextContent("null");
    expect(screen.getByTestId("fact-Bank")).toHaveTextContent("null");
  });

  it("calls notFound when getCandidatePaymentDetail returns null", async () => {
    mockGetCandidatePaymentDetail.mockResolvedValue(null);

    const Page = (await import("./page")).default;
    await expect(Page({ params: Promise.resolve({ id: "999" }) })).rejects.toThrow(
      "NEXT_NOT_FOUND"
    );
    expect(mockNotFound).toHaveBeenCalledOnce();
  });
});
