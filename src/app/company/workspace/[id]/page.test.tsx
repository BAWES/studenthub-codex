import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

// Mock dependencies
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({
    user: { id: "1" },
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
            {primary.rows.length > 0 ? (
              primary.rows.map((r) => (
                <span key={r.id} data-testid={`primary-row-${r.id}`}>
                  {r.title}
                </span>
              ))
            ) : (
              <span data-testid="primary-empty">No items</span>
            )}
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

const mockGetWorkspace = vi.fn();

vi.mock("./actions", () => ({
  getWorkspace: (...args: unknown[]) => mockGetWorkspace(...args),
}));

const mockNotFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("next/navigation", () => ({
  notFound: mockNotFound,
}));

const mockWorkspaceData = {
  contact: { contact_name: "John Doe", contact_email: "john@example.com" },
  metrics: [
    { label: "Companies", value: 3, note: "Companies linked to this contact" },
    { label: "Requests", value: 5, note: "Hiring requests across linked companies" },
    { label: "Stores", value: 12, note: "Active stores in the account" },
    { label: "Notes", value: 8, note: "Internal/customer notes connected to account" },
  ],
  companies: [
    { id: "comp-1", title: "Company A", subtitle: "Manager", meta: "Access allowed" },
    { id: "comp-2", title: "Company B", subtitle: "Director", meta: "Access disabled" },
  ],
  requests: [
    { id: "req-1", title: "Software Engineer", subtitle: "Company A", meta: "Open · 3 seats" },
    { id: "req-2", title: "Sales Manager", subtitle: "Company B", meta: "In Progress · 1 seat" },
  ],
};

describe("CompanyWorkspaceDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders workspace detail with WorkspaceShell and correct eyebrow", async () => {
    mockGetWorkspace.mockResolvedValue(mockWorkspaceData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "contact-uuid-123" }) }));

    expect(screen.getByTestId("workspace-shell")).toBeDefined();
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Company / Workspace");
    expect(screen.getByTestId("title")).toHaveTextContent("John Doe");
  });

  it("renders metrics correctly", async () => {
    mockGetWorkspace.mockResolvedValue(mockWorkspaceData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "contact-uuid-123" }) }));

    expect(screen.getByTestId("metric-Companies")).toHaveTextContent("3");
    expect(screen.getByTestId("metric-Requests")).toHaveTextContent("5");
    expect(screen.getByTestId("metric-Stores")).toHaveTextContent("12");
    expect(screen.getByTestId("metric-Notes")).toHaveTextContent("8");
  });

  it("renders primary (Companies) and secondary (Requests) sections", async () => {
    mockGetWorkspace.mockResolvedValue(mockWorkspaceData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "contact-uuid-123" }) }));

    expect(screen.getByTestId("primary-title")).toHaveTextContent("Companies");
    expect(screen.getByTestId("primary-row-comp-1")).toHaveTextContent("Company A");
    expect(screen.getByTestId("secondary-title")).toHaveTextContent("Requests");
    expect(screen.getByTestId("secondary-row-req-1")).toHaveTextContent("Software Engineer");
  });

  it("renders DetailSection with Contact facts", async () => {
    mockGetWorkspace.mockResolvedValue(mockWorkspaceData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "contact-uuid-123" }) }));

    expect(screen.getByTestId("detail-section")).toBeDefined();
    expect(screen.getByTestId("section-title")).toHaveTextContent("Contact");
    expect(screen.getByTestId("fact-Name")).toHaveTextContent("John Doe");
    expect(screen.getByTestId("fact-Email")).toHaveTextContent("john@example.com");
  });

  it("calls notFound when getWorkspace returns null contact", async () => {
    mockGetWorkspace.mockResolvedValue({ ...mockWorkspaceData, contact: null });

    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalledOnce();
  });
});
