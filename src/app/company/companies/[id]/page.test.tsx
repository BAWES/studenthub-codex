import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({
    user: { id: "1" },
    role: "company",
    id: 1,
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
    primary,
    secondary,
  }: {
    children: React.ReactNode;
    eyebrow: string;
    title: string;
    metrics: { label: string; value: string | number; note: string }[];
    primary?: { title: string; rows: unknown[] };
    secondary?: { title: string; rows: unknown[] };
  }) => (
    <div data-testid="workspace-shell">
      <div data-testid="eyebrow">{eyebrow}</div>
      <div data-testid="title">{title}</div>
      {metrics.map((m) => (
        <span key={m.label} data-testid={`metric-${m.label}`}>
          {m.value}
        </span>
      ))}
      {primary ? <div data-testid="primary-section">{primary.title} ({primary.rows.length})</div> : null}
      {secondary ? <div data-testid="secondary-section">{secondary.title} ({secondary.rows.length})</div> : null}
      {children}
    </div>
  ),
}));

vi.mock("@/modules/workspace/DetailPanels", () => ({
  DetailSection: ({
    title,
    facts,
    type,
    rows,
  }: {
    title: string;
    facts?: { label: string; value: string | React.ReactNode }[];
    type?: string;
    rows?: unknown[];
  }) => (
    <div data-testid={`detail-section${type ? `-${type}` : ""}`}>
      <div data-testid="section-title">{title}</div>
      {facts?.map((f) => (
        <span key={String(f.label)} data-testid={`fact-${f.label}`}>
          {String(f.value)}
        </span>
      ))}
      {type === "list" && rows ? (
        <span data-testid={`list-rows-${title}`}>{rows.length} items</span>
      ) : null}
    </div>
  ),
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

const mockGetCompanyAccountDetail = vi.fn();
vi.mock("./actions", () => ({
  getCompanyAccountDetail: (...args: unknown[]) => mockGetCompanyAccountDetail(...args),
}));

const mockNotFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("next/navigation", () => ({
  notFound: mockNotFound,
}));

const mockCompanyData = {
  company: {
    company_id: 42,
    company_name: "Tech Corp Kuwait",
    company_common_name_en: "Tech Corp",
    company_common_name_ar: null,
    company_email: "info@techcorp.kw",
    company_website: "https://techcorp.kw",
    company_logo: null,
    commercial_licence: "LIC-2024-042",
    company_hourly_rate: 15.5,
    company_bonus_commission: 5,
    company_followup: true,
    total_candidate: 120,
    no_of_active_requests: 8,
    is_request_updates_in_30_days: true,
    company_approved_to_hire: true,
    company_status_override: false,
    company_created_at: new Date("2024-01-01"),
    company_updated_at: new Date("2026-06-14"),
    last_request_datetime: new Date("2026-05-20"),
    last_payment_datetime: new Date("2026-04-15"),
    country_id: 1,
    currency_code: "KWD",
    country_name: "Kuwait",
    parent_company_name: null,
    staff_name: "Staff Manager",
  },
  metrics: [
    { label: "Active Requests", value: 8, note: "Open positions" },
    { label: "Candidates", value: 120, note: "Total candidates" },
  ],
  requests: [
    { id: "req-1", title: "Senior Developer", subtitle: "IT", meta: "Open" },
  ],
  contacts: [
    { id: "contact-1", title: "Ahmed Al-Sabah", subtitle: "CEO", meta: "ahmed@techcorp.kw" },
  ],
  stores: [
    { id: 1, title: "Kuwait City Flagship", subtitle: "The Avenues", meta: "Active" },
  ],
  notes: [
    { id: "note-1", title: "Initial meeting notes", subtitle: "2026-01-15", meta: "General" },
  ],
};

describe("CompanyAccountDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders company account detail with correct eyebrow and title", async () => {
    mockGetCompanyAccountDetail.mockResolvedValue(mockCompanyData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "42" }) }));

    expect(screen.getByTestId("workspace-shell")).toBeDefined();
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Company / Account");
    expect(screen.getByTestId("title")).toHaveTextContent("Tech Corp Kuwait");
  });

  it("renders metrics correctly", async () => {
    mockGetCompanyAccountDetail.mockResolvedValue(mockCompanyData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "42" }) }));

    expect(screen.getByTestId("metric-Active Requests")).toHaveTextContent("8");
    expect(screen.getByTestId("metric-Candidates")).toHaveTextContent("120");
  });

  it("renders primary and secondary sections", async () => {
    mockGetCompanyAccountDetail.mockResolvedValue(mockCompanyData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "42" }) }));

    expect(screen.getByTestId("primary-section")).toHaveTextContent("Requests (1)");
    expect(screen.getByTestId("secondary-section")).toHaveTextContent("Contacts (1)");
  });

  it("renders Account detail section with facts", async () => {
    mockGetCompanyAccountDetail.mockResolvedValue(mockCompanyData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "42" }) }));

    const sections = screen.getAllByTestId("section-title");
    expect(sections[0]).toHaveTextContent("Account");
    expect(screen.getByTestId("fact-Email")).toHaveTextContent("info@techcorp.kw");
    expect(screen.getByTestId("fact-Common Name")).toHaveTextContent("Tech Corp");
    expect(screen.getByTestId("fact-Website")).toHaveTextContent("https://techcorp.kw");
  });

  it("renders list-type detail sections for stores and notes", async () => {
    mockGetCompanyAccountDetail.mockResolvedValue(mockCompanyData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "42" }) }));

    expect(screen.getByTestId("list-rows-Stores")).toHaveTextContent("1 items");
    expect(screen.getByTestId("list-rows-Notes")).toHaveTextContent("1 items");
  });

  it("calls notFound when company data is null", async () => {
    mockGetCompanyAccountDetail.mockResolvedValue(null);

    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ id: "999" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalledOnce();
  });

  it("calls notFound when company field is null", async () => {
    mockGetCompanyAccountDetail.mockResolvedValue({ ...mockCompanyData, company: null });

    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ id: "999" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalledOnce();
  });
});
