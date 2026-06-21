import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

// Mock the dependencies
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({ user: { id: "1" }, role: "staff" }),
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

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date | null) => (d ? d.toISOString().split("T")[0] : "—"),
}));

const mockGetContractDetail = vi.fn();

vi.mock("../actions", () => ({
  getContractDetail: (...args: unknown[]) => mockGetContractDetail(...args),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockFullContract = {
  contract: {
    contract_uuid: "550e8400-e29b-41d4-a716-446655440000",
    type: "Hourly",
    detail: "Standard hourly contract for retail staff",
    status: 1,
    status_label: "active",
    start_date: "2024-01-01T00:00:00.000Z",
    end_date: "2024-12-31T00:00:00.000Z",
    transfer_cost: "500.00",
    currency_code: "KWD",
    auto_generate: true,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-06-15T00:00:00.000Z",
    candidate: { candidate_name: "Alice Johnson" },
    company: { company_name: "Tech Corp" },
  },
};

describe("StaffContractDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders contract detail with all fields", async () => {
    mockGetContractDetail.mockResolvedValue(mockFullContract);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "550e8400-e29b-41d4-a716-446655440000" }),
      }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Staff / Contracts");
    expect(screen.getByTestId("title")).toHaveTextContent("Hourly Contract");

    expect(screen.getByTestId("fact-Type")).toHaveTextContent("Hourly");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("active");
    expect(screen.getByTestId("fact-Transfer Cost")).toHaveTextContent("500.00 KWD");

    // Candidate section
    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    // Company section
    expect(screen.getByText("Tech Corp")).toBeInTheDocument();

    // Additional details section
    expect(screen.getByText("Standard hourly contract for retail staff")).toBeInTheDocument();
  });

  it("renders with null candidate, company, and detail", async () => {
    mockGetContractDetail.mockResolvedValue({
      contract: {
        contract_uuid: "550e8400-e29b-41d4-a716-446655440001",
        type: "Monthly",
        detail: null,
        status: 1,
        status_label: "active",
        start_date: null,
        end_date: null,
        transfer_cost: null,
        currency_code: null,
        auto_generate: false,
        created_at: null,
        updated_at: null,
        candidate: null,
        company: null,
      },
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "550e8400-e29b-41d4-a716-446655440001" }),
      }),
    );

    expect(screen.getByTestId("title")).toHaveTextContent("Monthly Contract");
    expect(screen.getByTestId("fact-Transfer Cost")).toHaveTextContent("N/A");

    // Candidate and company sections should not render
    expect(screen.queryByText("Alice Johnson")).not.toBeInTheDocument();
    expect(screen.queryByText("Tech Corp")).not.toBeInTheDocument();

    // Additional details section should not render
    expect(screen.queryByText("Notes")).not.toBeInTheDocument();
  });

  it("renders with transfer cost as N/A when null", async () => {
    mockGetContractDetail.mockResolvedValue({
      contract: {
        ...mockFullContract.contract,
        transfer_cost: null,
      },
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "no-cost" }),
      }),
    );

    expect(screen.getByTestId("fact-Transfer Cost")).toHaveTextContent("N/A");
  });

  it("renders auto_generate as Yes/No", async () => {
    mockGetContractDetail.mockResolvedValue({
      contract: {
        ...mockFullContract.contract,
        auto_generate: false,
      },
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "no-auto" }),
      }),
    );

    expect(screen.getByTestId("fact-Auto Generate")).toHaveTextContent("No");
  });

  it("renders different contract types", async () => {
    mockGetContractDetail.mockResolvedValue({
      contract: {
        ...mockFullContract.contract,
        type: "Fixed Price",
      },
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "fixed-price" }),
      }),
    );

    expect(screen.getByTestId("title")).toHaveTextContent("Fixed Price Contract");
  });

  it("renders different status labels", async () => {
    mockGetContractDetail.mockResolvedValue({
      contract: {
        ...mockFullContract.contract,
        status_label: "terminated",
      },
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "terminated" }),
      }),
    );

    expect(screen.getByTestId("fact-Status")).toHaveTextContent("terminated");
  });

  it("calls notFound when contract is null", async () => {
    mockGetContractDetail.mockResolvedValue({ contract: null });

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent" }) }),
    ).rejects.toThrow();

    expect(notFound).toHaveBeenCalled();
  });
});
