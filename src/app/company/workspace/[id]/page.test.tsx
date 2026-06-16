import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({
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
  }: {
    title: string;
    facts: { label: string; value: string | React.ReactNode }[];
  }) => (
    <div data-testid="detail-section">
      <div data-testid="section-title">{title}</div>
      {facts.map((f) => (
        <span key={String(f.label)} data-testid={`fact-${f.label}`}>
          {typeof f.value === "string" ? f.value : "node"}
        </span>
      ))}
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

const mockGetWorkspace = vi.fn();

vi.mock("./actions", () => ({
  getWorkspace: (...args: unknown[]) => mockGetWorkspace(...args),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const fullWorkspace = {
  contact: {
    contact_name: "Fatima Al-Sabah",
    contact_email: "fatima@example.com",
  },
  metrics: [
    { label: "Companies", value: 3, note: "Companies linked to this contact" },
    { label: "Requests", value: 5, note: "Hiring requests across linked companies" },
    { label: "Stores", value: 8, note: "Active stores in the account" },
    { label: "Notes", value: 12, note: "Internal/customer notes connected to account" },
  ],
  companies: [
    { id: "link-1", title: "Alshaya Group", subtitle: "CEO", meta: "Access allowed" },
    { id: "link-2", title: "M.H. Alshaya", subtitle: "Board Member", meta: "Access allowed" },
  ],
  requests: [
    { id: "req-1", title: "Store Manager", subtitle: "Alshaya Group", meta: "Active · 3 seats" },
  ],
};

const nullContactWorkspace = {
  contact: null,
  metrics: [
    { label: "Companies", value: 0, note: "Companies linked to this contact" },
    { label: "Requests", value: 0, note: "Hiring requests across linked companies" },
    { label: "Stores", value: 0, note: "Active stores in the account" },
    { label: "Notes", value: 0, note: "Internal/customer notes connected to account" },
  ],
  companies: [],
  requests: [],
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CompanyWorkspaceDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders workspace detail with full data", async () => {
    mockGetWorkspace.mockResolvedValue(fullWorkspace);

    const Page = (await import("./page")).default;
    render(
      await Page({ params: Promise.resolve({ id: "contact-uuid-1" }) }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Company / Workspace");
    expect(screen.getByTestId("title")).toHaveTextContent("Fatima Al-Sabah");
    expect(screen.getByTestId("section-title")).toHaveTextContent("Contact");

    expect(screen.getByTestId("fact-Name")).toHaveTextContent("Fatima Al-Sabah");
    expect(screen.getByTestId("fact-Email")).toHaveTextContent("fatima@example.com");

    // Metrics
    expect(screen.getByTestId("metric-Companies")).toHaveTextContent("3");
    expect(screen.getByTestId("metric-Requests")).toHaveTextContent("5");

    // Primary rows
    expect(screen.getByTestId("primary-title")).toHaveTextContent("Companies");
    expect(screen.getByTestId("primary-link-1")).toHaveTextContent("Alshaya Group");

    // Secondary rows
    expect(screen.getByTestId("secondary-title")).toHaveTextContent("Requests");
    expect(screen.getByTestId("secondary-req-1")).toHaveTextContent("Store Manager");
  });

  it("calls getWorkspace with the UUID from params", async () => {
    mockGetWorkspace.mockResolvedValue(fullWorkspace);

    const Page = (await import("./page")).default;
    render(
      await Page({ params: Promise.resolve({ id: "custom-uuid-42" }) }),
    );

    expect(mockGetWorkspace).toHaveBeenCalledWith("custom-uuid-42");
  });

  it("calls notFound when contact is null", async () => {
    mockGetWorkspace.mockResolvedValue(nullContactWorkspace);

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
