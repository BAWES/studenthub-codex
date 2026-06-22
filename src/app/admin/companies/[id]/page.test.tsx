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
    rows,
  }: {
    title: string;
    facts?: { label: string; value: string | React.ReactNode }[];
    rows?: { label: string; value: string }[];
  }) => (
    <div data-testid="detail-section">
      <div data-testid="section-title">{title}</div>
      {facts?.map((f) => (
        <span key={String(f.label)} data-testid={`fact-${f.label}`}>
          {String(f.value)}
        </span>
      ))}
      {rows?.map((r) => (
        <span key={r.label} data-testid={`row-${r.label}`}>
          {r.value}
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

const mockCompanyData = {
  company: {
    company_id: 42,
    company_name: "Acme Corp",
    company_email: "info@acme.com",
    company_common_name_en: "Acme",
    company_website: "https://acme.com",
    country_name_en: "Kuwait",
    company_created_at: new Date("2024-01-15T08:00:00.000Z"),
    company_updated_at: new Date("2024-06-01T12:00:00.000Z"),
  },
  metrics: [
    { label: "Stores", value: "5", note: "" },
    { label: "Candidates", value: "120", note: "" },
  ],
  requests: [
    { label: "Store Access", value: "Pending" },
  ],
  contacts: [
    { label: "John Smith", value: "john@acme.com" },
  ],
  stores: [
    { store_name: "Dubai Mall Store", store_status: "Active" },
  ],
  notes: [
    { note: "Key account" },
  ],
};

const mockGetAdminCompanyDetail = vi.fn();

vi.mock("./actions", () => ({
  getAdminCompanyDetail: (...args: unknown[]) => mockGetAdminCompanyDetail(...args),
}));

describe("AdminCompanyDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders company detail with all fields", async () => {
    mockGetAdminCompanyDetail.mockResolvedValue(mockCompanyData);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "42" }),
      }),
    );

    // Check workspace shell
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Company");
    expect(screen.getByTestId("title")).toHaveTextContent("Acme Corp");

    // Check metrics
    expect(screen.getByTestId("metric-Stores")).toHaveTextContent("5");
    expect(screen.getByTestId("metric-Candidates")).toHaveTextContent("120");

    // Check account detail fields
    expect(screen.getByTestId("fact-Email")).toHaveTextContent("info@acme.com");
    expect(screen.getByTestId("fact-Common Name")).toHaveTextContent("Acme");
    expect(screen.getByTestId("fact-Website")).toHaveTextContent("https://acme.com");
    expect(screen.getByTestId("fact-Country")).toHaveTextContent("Kuwait");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2024-01-15");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("2024-06-01");

    // Check section titles
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByText("Stores")).toBeInTheDocument();
    expect(screen.getByText("Notes")).toBeInTheDocument();
  });

  it("calls notFound when company is null", async () => {
    mockGetAdminCompanyDetail.mockResolvedValue({ ...mockCompanyData, company: null });

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "999" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
