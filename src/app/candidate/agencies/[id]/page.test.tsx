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
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

const mockGetAgency = vi.fn();

vi.mock("./actions", () => ({
  getAgency: (...args: unknown[]) => mockGetAgency(...args),
}));

const mockNotFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("next/navigation", () => ({
  notFound: mockNotFound,
}));

const mockAgencyData = {
  company_name: "Recruitment Plus",
  company_common_name_en: "Recruitment Plus",
  company_common_name_ar: "بلس توظيف",
  company_email: "info@recruitmentplus.kw",
  company_website: "https://recruitmentplus.kw",
  commercial_licence: "LIC-2024-001",
  total_candidate: 150,
  no_of_active_requests: 12,
  company_created_at: new Date("2024-01-15"),
  company_updated_at: new Date("2025-03-10"),
};

describe("CandidateAgencyDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders agency detail with WorkspaceShell and correct eyebrow", async () => {
    mockGetAgency.mockResolvedValue(mockAgencyData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "42" }) }));

    expect(screen.getByTestId("workspace-shell")).toBeDefined();
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Candidate / Agencies");
    expect(screen.getByTestId("title")).toHaveTextContent("Recruitment Plus");
  });

  it("renders metrics correctly", async () => {
    mockGetAgency.mockResolvedValue(mockAgencyData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "42" }) }));

    expect(screen.getByTestId("metric-Name")).toHaveTextContent("Recruitment Plus");
    expect(screen.getByTestId("metric-Candidates")).toHaveTextContent("150");
    expect(screen.getByTestId("metric-Active Requests")).toHaveTextContent("12");
  });

  it("renders DetailSection with Agency Details facts", async () => {
    mockGetAgency.mockResolvedValue(mockAgencyData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "42" }) }));

    expect(screen.getByTestId("detail-section")).toBeDefined();
    expect(screen.getByTestId("section-title")).toHaveTextContent("Agency Details");
    expect(screen.getByTestId("fact-Company Name")).toHaveTextContent("Recruitment Plus");
    expect(screen.getByTestId("fact-Common Name (EN)")).toHaveTextContent("Recruitment Plus");
    expect(screen.getByTestId("fact-Common Name (AR)")).toHaveTextContent("بلس توظيف");
    expect(screen.getByTestId("fact-Email")).toHaveTextContent("info@recruitmentplus.kw");
    expect(screen.getByTestId("fact-Website")).toHaveTextContent("https://recruitmentplus.kw");
    expect(screen.getByTestId("fact-Commercial Licence")).toHaveTextContent("LIC-2024-001");
    expect(screen.getByTestId("fact-Total Candidates")).toHaveTextContent("150");
    expect(screen.getByTestId("fact-Active Requests")).toHaveTextContent("12");
  });

  it("shows fallback values for null optional fields", async () => {
    mockGetAgency.mockResolvedValue({
      company_name: "Minimal Agency",
      total_candidate: null,
      no_of_active_requests: null,
      company_created_at: null,
      company_updated_at: null,
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "99" }) }));

    expect(screen.getByTestId("metric-Name")).toHaveTextContent("Minimal Agency");
    expect(screen.getByTestId("metric-Candidates")).toHaveTextContent("—");
    expect(screen.getByTestId("metric-Active Requests")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("N/A");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("N/A");
  });

  it("renders Back to Agencies link", async () => {
    mockGetAgency.mockResolvedValue(mockAgencyData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "42" }) }));

    expect(screen.getByText("Back to Agencies")).toBeDefined();
  });

  it("calls notFound when getAgency returns null", async () => {
    mockGetAgency.mockResolvedValue(null);

    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalledOnce();
  });
});
