import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({
    id: "contact-uuid-42",
    user: { id: "42" },
    role: "company",
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
    primary: { title: string; rows: { id: string; title: string; subtitle: string; meta: string }[] };
    secondary: { title: string; rows: { id: string; title: string; subtitle: string; meta: string }[] };
  }) => (
    <div data-testid="workspace-shell">
      <div data-testid="eyebrow">{eyebrow}</div>
      <div data-testid="title">{title}</div>
      {metrics.map((m) => (
        <span key={m.label} data-testid={`metric-${m.label}`}>
          {m.value}
        </span>
      ))}
      <div data-testid="primary-title">{primary.title}</div>
      {primary.rows.map((r) => (
        <span key={r.id} data-testid={`primary-${r.id}`}>
          {r.title}
        </span>
      ))}
      <div data-testid="secondary-title">{secondary.title}</div>
      {secondary.rows.map((r) => (
        <span key={r.id} data-testid={`secondary-${r.id}`}>
          {r.title}
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
  type,
  }: {
  title: string;
  facts?: { label: string; value: string | React.ReactNode }[];
  type?: string;
  }) => (
  <div data-testid={`detail-section${type ? `-${type}` : ""}`}>
    <div data-testid="section-title">{title}</div>
    {facts?.map((f) => {
      const v =
        f.value === null || f.value === undefined
          ? ""
          : typeof f.value === "string"
            ? f.value
            : "node";
      return (
        <span key={String(f.label)} data-testid={`fact-${f.label}`}>
          {v}
        </span>
      );
    })}
  </div>
  ),
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date | null) =>
    d ? d.toISOString().split("T")[0] : "N/A",
}));

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

const mockGetCompanyAccountDetail = vi.fn();

vi.mock("./actions", () => ({
  getCompanyAccountDetail: (...args: unknown[]) =>
    mockGetCompanyAccountDetail(...args),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const fullCompanyDetail = {
  company: {
    company_id: 1,
    company_name: "Alshaya Group",
    company_email: "info@alshaya.com",
    company_common_name_en: "Alshaya",
    company_website: "https://alshaya.com",
    country: { country_name_en: "Kuwait" },
    company_created_at: new Date("2020-01-01T00:00:00Z"),
    company_updated_at: new Date("2026-06-01T00:00:00Z"),
  },
  metrics: [
    { label: "Requests", value: "12", note: "Open requests" },
    { label: "Stores", value: "45", note: "Active stores" },
    { label: "Contacts", value: "6", note: "Linked contacts" },
    { label: "Notes", value: "23", note: "Total notes" },
  ],
  requests: [
    {
      id: "req-1",
      title: "Store Manager - The Avenues",
      subtitle: "Active",
      meta: "3 candidates",
    },
  ],
  contacts: [
    {
      id: "cont-1",
      title: "Ahmed Al-Mutawa",
      subtitle: "CEO",
      meta: "Access allowed",
    },
  ],
  stores: [
    { id: "store-1", title: "Zara - Avenues", subtitle: "Active", meta: "Floor 2" },
  ],
  notes: [
    { id: "note-1", title: "Follow-up call", subtitle: "2026-05-15", meta: "Alice" },
  ],
};

const nullCompanyDetail = {
  company: null,
  metrics: [],
  requests: [],
  contacts: [],
  stores: [],
  notes: [],
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CompanyAccountDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders company account detail with full data", async () => {
    mockGetCompanyAccountDetail.mockResolvedValue(fullCompanyDetail);

    const Page = (await import("./page")).default;
    render(
      await Page({ params: Promise.resolve({ id: "1" }) }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Company / Account");
    expect(screen.getByTestId("title")).toHaveTextContent("Alshaya Group");

    // Account detail section (first detail-section, no type)
    const shellSections = screen.getAllByTestId("section-title");
    expect(shellSections[0]).toHaveTextContent("Account");

    expect(screen.getByTestId("fact-Email")).toHaveTextContent("info@alshaya.com");
    expect(screen.getByTestId("fact-Common Name")).toHaveTextContent("Alshaya");
    expect(screen.getByTestId("fact-Website")).toHaveTextContent("https://alshaya.com");
    expect(screen.getByTestId("fact-Country")).toHaveTextContent("Kuwait");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2020-01-01");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("2026-06-01");

    // Metrics
    expect(screen.getByTestId("metric-Requests")).toHaveTextContent("12");
    expect(screen.getByTestId("metric-Stores")).toHaveTextContent("45");

    // Primary list (Requests)
    expect(screen.getByTestId("primary-title")).toHaveTextContent("Requests");
    expect(screen.getByTestId("primary-req-1")).toHaveTextContent("Store Manager - The Avenues");

    // Secondary list (Contacts)
    expect(screen.getByTestId("secondary-title")).toHaveTextContent("Contacts");
    expect(screen.getByTestId("secondary-cont-1")).toHaveTextContent("Ahmed Al-Mutawa");

    // Detail Section lists — Account is the first
    const detailSections = screen.getAllByTestId("section-title");
    expect(detailSections[0]).toHaveTextContent("Account");
  });

  it("renders with null optional company fields gracefully", async () => {
    const nullFields = {
      ...fullCompanyDetail,
      company: {
        ...fullCompanyDetail.company,
        company_email: null,
        company_common_name_en: null,
        company_website: null,
        country: null,
        company_created_at: null,
        company_updated_at: null,
      },
    };
    mockGetCompanyAccountDetail.mockResolvedValue(nullFields);

    const Page = (await import("./page")).default;
    render(
      await Page({ params: Promise.resolve({ id: "1" }) }),
    );

    // Account detail section shown, not list
    const nullSections = screen.getAllByTestId("section-title");
    expect(nullSections[0]).toHaveTextContent("Account");

    // Null fields should render empty
    expect(screen.getByTestId("fact-Email")).toBeEmptyDOMElement();
    expect(screen.getByTestId("fact-Common Name")).toBeEmptyDOMElement();
    expect(screen.getByTestId("fact-Website")).toBeEmptyDOMElement();
    expect(screen.getByTestId("fact-Country")).toBeEmptyDOMElement();
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("N/A");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("N/A");
  });

  it("calls getCompanyAccountDetail with session ID and company ID", async () => {
    mockGetCompanyAccountDetail.mockResolvedValue(fullCompanyDetail);

    const Page = (await import("./page")).default;
    render(
      await Page({ params: Promise.resolve({ id: "99" }) }),
    );

    expect(mockGetCompanyAccountDetail).toHaveBeenCalledWith("contact-uuid-42", 99);
  });

  it("calls notFound when company is null", async () => {
    mockGetCompanyAccountDetail.mockResolvedValue(nullCompanyDetail);

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "999" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("calls notFound when data is null", async () => {
    mockGetCompanyAccountDetail.mockResolvedValue(null);

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "999" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
