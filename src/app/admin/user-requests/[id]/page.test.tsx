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

const mockRequest = {
  sar_uuid: "sar_abc123",
  candidate_id: 42,
  candidate_name: "Ahmed Khan",
  store_id: 7,
  store_name: "Dubai Mall Store",
  currency_code: "AED",
  status: 0,
  created_at: "2024-03-01T10:00:00.000Z",
  updated_at: "2024-03-15T14:30:00.000Z",
};

const mockGetStoreAssignmentRequest = vi.fn();

vi.mock("../actions", () => ({
  getStoreAssignmentRequest: (...args: unknown[]) => mockGetStoreAssignmentRequest(...args),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

describe("AdminUserRequestDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders store assignment request detail with all fields", async () => {
    mockGetStoreAssignmentRequest.mockResolvedValue({ request: mockRequest });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "sar_abc123" }),
      }),
    );

    // Check workspace shell
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / User Requests");
    expect(screen.getByTestId("title")).toHaveTextContent("Ahmed Khan");

    // Check metrics
    expect(screen.getByTestId("metric-Status")).toHaveTextContent("Pending");
    expect(screen.getByTestId("metric-Store")).toHaveTextContent("Dubai Mall Store");

    // Check detail fields
    expect(screen.getByTestId("fact-UUID")).toHaveTextContent("sar_abc123");
    expect(screen.getByTestId("fact-Candidate")).toHaveTextContent("Ahmed Khan");
    expect(screen.getByTestId("fact-Store")).toHaveTextContent("Dubai Mall Store");
    expect(screen.getByTestId("fact-Currency")).toHaveTextContent("AED");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2024-03-01");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("2024-03-15");

    // Check back button
    expect(screen.getByText("Back to User Requests")).toBeInTheDocument();
  });

  it("displays Approved status when status is 1", async () => {
    mockGetStoreAssignmentRequest.mockResolvedValue({
      request: { ...mockRequest, status: 1 },
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "sar_approved" }),
      }),
    );

    expect(screen.getByTestId("metric-Status")).toHaveTextContent("Approved");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Approved");
  });

  it("renders with null fields as em-dash", async () => {
    mockGetStoreAssignmentRequest.mockResolvedValue({
      request: {
        ...mockRequest,
        candidate_name: null,
        store_name: null,
        currency_code: null,
      },
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "sar_null_fields" }),
      }),
    );

    expect(screen.getByTestId("title")).toHaveTextContent("Store Assignment Request");
    expect(screen.getByTestId("metric-Store")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Candidate")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Currency")).toHaveTextContent("—");
  });

  it("calls notFound when request is null", async () => {
    mockGetStoreAssignmentRequest.mockResolvedValue({ request: null });

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent" }) }),
    ).rejects.toThrow();

    expect(notFound).toHaveBeenCalled();
  });
});
