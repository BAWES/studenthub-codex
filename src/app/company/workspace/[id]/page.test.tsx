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
      {primary ? <div data-testid="primary-{primary.title}">{primary.title} ({primary.rows.length})</div> : null}
      {secondary ? <div data-testid="secondary-{secondary.title}">{secondary.title} ({secondary.rows.length})</div> : null}
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
  contact: {
    contact_name: "Ahmed Al-Sabah",
    contact_email: "ahmed@company.kw",
  },
  metrics: [
    { label: "Companies", value: 3, note: "Linked companies" },
    { label: "Requests", value: 12, note: "Active requests" },
  ],
  companies: [
    { id: "1", title: "Tech Corp", subtitle: "IT Services", meta: "Active" },
    { id: "2", title: "BuildCo", subtitle: "Construction", meta: "Active" },
    { id: "3", title: "LogiTrans", subtitle: "Logistics", meta: "Inactive" },
  ],
  requests: [
    { id: "req-1", title: "Senior Developer", subtitle: "IT", meta: "Open" },
    { id: "req-2", title: "Project Manager", subtitle: "PMO", meta: "In Progress" },
  ],
};

describe("CompanyWorkspaceDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders workspace detail with correct eyebrow and title", async () => {
    mockGetWorkspace.mockResolvedValue(mockWorkspaceData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "contact-uuid-abc" }) }));

    expect(screen.getByTestId("workspace-shell")).toBeDefined();
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Company / Workspace");
    expect(screen.getByTestId("title")).toHaveTextContent("Ahmed Al-Sabah");
  });

  it("renders metrics correctly", async () => {
    mockGetWorkspace.mockResolvedValue(mockWorkspaceData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "contact-uuid-abc" }) }));

    expect(screen.getByTestId("metric-Companies")).toHaveTextContent("3");
    expect(screen.getByTestId("metric-Requests")).toHaveTextContent("12");
  });

  it("renders DetailSection with Contact facts", async () => {
    mockGetWorkspace.mockResolvedValue(mockWorkspaceData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "contact-uuid-abc" }) }));

    expect(screen.getByTestId("detail-section")).toBeDefined();
    expect(screen.getByTestId("section-title")).toHaveTextContent("Contact");
    expect(screen.getByTestId("fact-Name")).toHaveTextContent("Ahmed Al-Sabah");
    expect(screen.getByTestId("fact-Email")).toHaveTextContent("ahmed@company.kw");
  });

  it("calls notFound when getWorkspace returns nullish data", async () => {
    mockGetWorkspace.mockResolvedValue(null);

    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalledOnce();
  });

  it("calls notFound when contact is null", async () => {
    mockGetWorkspace.mockResolvedValue({ ...mockWorkspaceData, contact: null });

    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ id: "no-contact" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalledOnce();
  });
});
