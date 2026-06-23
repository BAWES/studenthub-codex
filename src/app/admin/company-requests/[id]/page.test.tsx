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
  company_request_uuid: "creq_abc123",
  company_name: "Acme Corp",
  company_email: "info@acme.com",
  contact_name: "John Smith",
  contact_position: "CEO",
  phone_number: "+971501234567",
  requesting_for: "store_access",
  currency_code: "AED",
  country_id: 1,
  country_name_en: "United Arab Emirates",
  status: 0,
  created_at: "2024-03-01T10:00:00.000Z",
  updated_at: "2024-03-15T14:30:00.000Z",
};

const mockGetCompanyRequest = vi.fn();

vi.mock("../actions", () => ({
  getCompanyRequest: (...args: unknown[]) => mockGetCompanyRequest(...args),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

describe("AdminCompanyRequestDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders company request detail with all fields", async () => {
    mockGetCompanyRequest.mockResolvedValue({ request: mockRequest });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "creq_abc123" }),
      }),
    );

    // Check workspace shell
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Company Requests");
    expect(screen.getByTestId("title")).toHaveTextContent("Acme Corp");

    // Check metrics
    expect(screen.getByTestId("metric-Status")).toHaveTextContent("Pending");
    expect(screen.getByTestId("metric-Contact")).toHaveTextContent("John Smith");

    // Check detail fields
    expect(screen.getByTestId("fact-UUID")).toHaveTextContent("creq_abc123");
    expect(screen.getByTestId("fact-Company Name")).toHaveTextContent("Acme Corp");
    expect(screen.getByTestId("fact-Company Email")).toHaveTextContent("info@acme.com");
    expect(screen.getByTestId("fact-Contact Name")).toHaveTextContent("John Smith");
    expect(screen.getByTestId("fact-Contact Position")).toHaveTextContent("CEO");
    expect(screen.getByTestId("fact-Phone")).toHaveTextContent("+971501234567");
    expect(screen.getByTestId("fact-Requesting For")).toHaveTextContent("store_access");
    expect(screen.getByTestId("fact-Currency")).toHaveTextContent("AED");
    expect(screen.getByTestId("fact-Country")).toHaveTextContent("United Arab Emirates");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2024-03-01");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("2024-03-15");

    // Check back button
    expect(screen.getByText("Back to Company Requests")).toBeInTheDocument();
  });

  it("displays Approved status when status is 1", async () => {
    mockGetCompanyRequest.mockResolvedValue({
      request: { ...mockRequest, status: 1 },
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "creq_approved" }),
      }),
    );

    expect(screen.getByTestId("metric-Status")).toHaveTextContent("Approved");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Approved");
  });

  it("renders with null fields as em-dash", async () => {
    mockGetCompanyRequest.mockResolvedValue({
      request: {
        ...mockRequest,
        company_name: null,
        contact_name: null,
        phone_number: null,
        requesting_for: null,
        currency_code: null,
        country_name_en: null,
      },
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "creq_null_fields" }),
      }),
    );

    expect(screen.getByTestId("title")).toHaveTextContent("Company Request");
    expect(screen.getByTestId("metric-Contact")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Company Name")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Contact Name")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Phone")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Currency")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Country")).toHaveTextContent("—");
  });

  it("calls notFound when request is null", async () => {
    mockGetCompanyRequest.mockResolvedValue({ request: null });

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent" }) }),
    ).rejects.toThrow();

    expect(notFound).toHaveBeenCalled();
  });
});
