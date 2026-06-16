import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

// Mock dependencies
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({
    user: { id: "contact-uuid-123" },
    role: "company",
  }),
}));

vi.mock("@/modules/workspace/ErrorBoundary", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/modules/workspace/WorkspaceShell", () => {
  type Row = { id: string; title: string; subtitle: string; meta?: string };
  type Metric = { label: string; value: string | number; note: string };
  return {
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
      metrics: Metric[];
      primary?: { title: string; rows: Row[] };
      secondary?: { title: string; rows: Row[] };
    }) => (
      <div data-testid="workspace-shell">
        <div data-testid="eyebrow">{eyebrow}</div>
        <div data-testid="title">{title}</div>
        {metrics.map((m) => (
          <span key={m.label} data-testid={`metric-${m.label}`}>
            {m.value}
          </span>
        ))}
        {primary ? (
          <div data-testid="primary-section">
            <div data-testid="primary-title">{primary.title}</div>
            {primary.rows.map((r) => (
              <span key={r.id} data-testid={`primary-row-${r.id}`}>
                {r.title}
              </span>
            ))}
          </div>
        ) : null}
        {secondary ? (
          <div data-testid="secondary-section">
            <div data-testid="secondary-title">{secondary.title}</div>
            {secondary.rows.map((r) => (
              <span key={r.id} data-testid={`secondary-row-${r.id}`}>
                {r.title}
              </span>
            ))}
          </div>
        ) : null}
        {children}
      </div>
    ),
  };
});

vi.mock("@/modules/workspace/DetailPanels", () => ({
  DetailSection: ({
    title,
    facts,
    type,
    rows,
  }: {
    title: string;
    facts?: { label: string; value: string | React.ReactNode }[];
    type?: "list";
    rows?: { id: string; title: string; subtitle: string; meta?: string }[];
  }) => {
    if (type === "list" && rows) {
      return (
        <div data-testid="list-section">
          <div data-testid={`list-title-${title}`}>{title}</div>
          {rows.map((r) => (
            <span key={r.id} data-testid={`list-row-${title}-${r.id}`}>
              {r.title}
            </span>
          ))}
        </div>
      );
    }
    return (
      <div data-testid="detail-section">
        <div data-testid="section-title">{title}</div>
        {facts?.map((f) => (
          <span key={String(f.label)} data-testid={`fact-${f.label}`}>
            {String(f.value)}
          </span>
        ))}
      </div>
    );
  },
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

const baseDate = new Date("2024-06-01");
const updatedDate = new Date("2025-03-15");

const mockAccountData = {
  company: {
    company_id: 10,
    company_name: "Tech Corp",
    company_email: "info@techcorp.kw",
    company_common_name_en: "Tech Corp",
    company_website: "https://techcorp.kw",
    company_created_at: baseDate,
    company_updated_at: updatedDate,
    country: { country_name_en: "Kuwait" },
  },
  metrics: [
    { label: "Requests", value: 5, note: "Active hiring requests" },
    { label: "Stores", value: 3, note: "Active stores" },
    { label: "Contacts", value: 2, note: "Linked contacts" },
  ],
  requests: [
    { id: "req-1", title: "Software Engineer", subtitle: "Open", meta: "Priority 1" },
  ],
  contacts: [
    { id: "cont-1", title: "John Doe", subtitle: "Manager", meta: "john@techcorp.kw" },
  ],
  stores: [
    { id: "store-1", title: "Main Branch", subtitle: "Kuwait City", meta: "Active" },
  ],
  notes: [
    { id: "note-1", title: "VIP Client Note", subtitle: "Priority onboarding", meta: "2025-01-10" },
  ],
};

describe("CompanyAccountDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders account detail with WorkspaceShell and correct eyebrow/title", async () => {
    mockGetCompanyAccountDetail.mockResolvedValue(mockAccountData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "10" }) }));

    expect(screen.getByTestId("workspace-shell")).toBeDefined();
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Company / Account");
    expect(screen.getByTestId("title")).toHaveTextContent("Tech Corp");
  });

  it("renders metrics correctly", async () => {
    mockGetCompanyAccountDetail.mockResolvedValue(mockAccountData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "10" }) }));

    expect(screen.getByTestId("metric-Requests")).toHaveTextContent("5");
    expect(screen.getByTestId("metric-Stores")).toHaveTextContent("3");
    expect(screen.getByTestId("metric-Contacts")).toHaveTextContent("2");
  });

  it("renders primary (Requests) and secondary (Contacts) sections", async () => {
    mockGetCompanyAccountDetail.mockResolvedValue(mockAccountData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "10" }) }));

    expect(screen.getByTestId("primary-title")).toHaveTextContent("Requests");
    expect(screen.getByTestId("primary-row-req-1")).toHaveTextContent("Software Engineer");
    expect(screen.getByTestId("secondary-title")).toHaveTextContent("Contacts");
    expect(screen.getByTestId("secondary-row-cont-1")).toHaveTextContent("John Doe");
  });

  it("renders DetailSection with Account facts", async () => {
    mockGetCompanyAccountDetail.mockResolvedValue(mockAccountData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "10" }) }));

    expect(screen.getByTestId("section-title")).toHaveTextContent("Account");
    expect(screen.getByTestId("fact-Email")).toHaveTextContent("info@techcorp.kw");
    expect(screen.getByTestId("fact-Common Name")).toHaveTextContent("Tech Corp");
    expect(screen.getByTestId("fact-Website")).toHaveTextContent("https://techcorp.kw");
    expect(screen.getByTestId("fact-Country")).toHaveTextContent("Kuwait");
    expect(screen.getByTestId("fact-Created")).toBeDefined();
    expect(screen.getByTestId("fact-Updated")).toBeDefined();
  });

  it("renders list sections for Stores and Notes", async () => {
    mockGetCompanyAccountDetail.mockResolvedValue(mockAccountData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "10" }) }));

    expect(screen.getByTestId("list-title-Stores")).toHaveTextContent("Stores");
    expect(screen.getByTestId("list-row-Stores-store-1")).toHaveTextContent("Main Branch");
    expect(screen.getByTestId("list-title-Notes")).toHaveTextContent("Notes");
    expect(screen.getByTestId("list-row-Notes-note-1")).toHaveTextContent("VIP Client Note");
  });

  it("handles null country gracefully", async () => {
    mockGetCompanyAccountDetail.mockResolvedValue({
      ...mockAccountData,
      company: { ...mockAccountData.company, country: null },
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "10" }) }));

    // undefined value renders as "undefined" via String() in the mock
    expect(screen.getByTestId("fact-Country")).toHaveTextContent("undefined");
  });

  it("calls notFound when data.company is null", async () => {
    mockGetCompanyAccountDetail.mockResolvedValue({ ...mockAccountData, company: null });

    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalledOnce();
  });

  it("calls notFound when data is null", async () => {
    mockGetCompanyAccountDetail.mockResolvedValue(null);

    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalledOnce();
  });
});
