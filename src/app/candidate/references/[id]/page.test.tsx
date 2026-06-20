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

const mockGetReferenceEntry = vi.fn();

vi.mock("./actions", () => ({
  getReferenceEntry: (...args: unknown[]) => mockGetReferenceEntry(...args),
}));

vi.mock("./DeleteReferenceButton", () => ({
  DeleteReferenceButton: ({ referenceUuid }: { referenceUuid: string }) => (
    <div data-testid="delete-reference-button" data-uuid={referenceUuid} />
  ),
}));

const mockNotFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("next/navigation", () => ({
  notFound: mockNotFound,
}));

const mockReferenceData = {
  reference_uuid: "ref-abc-123",
  candidate_id: 1,
  name: "Dr. Fatima Al-Mutawa",
  company: "Kuwait University",
  position: "Professor",
  phone: "+965 99887766",
  email: "fatima@ku.edu.kw",
  relationship: "Academic Advisor",
  created_at: new Date("2025-01-15"),
  updated_at: new Date("2025-02-20"),
};

describe("CandidateReferenceDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders reference detail with WorkspaceShell and correct eyebrow", async () => {
    mockGetReferenceEntry.mockResolvedValue(mockReferenceData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "ref-abc-123" }) }));

    expect(screen.getByTestId("workspace-shell")).toBeDefined();
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Candidate / References");
    expect(screen.getByTestId("title")).toHaveTextContent("Dr. Fatima Al-Mutawa");
  });

  it("renders metrics correctly", async () => {
    mockGetReferenceEntry.mockResolvedValue(mockReferenceData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "ref-abc-123" }) }));

    expect(screen.getByTestId("metric-Name")).toHaveTextContent("Dr. Fatima Al-Mutawa");
    expect(screen.getByTestId("metric-Company")).toHaveTextContent("Kuwait University");
  });

  it("renders Reference Details section with all facts", async () => {
    mockGetReferenceEntry.mockResolvedValue(mockReferenceData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "ref-abc-123" }) }));

    expect(screen.getByTestId("section-title")).toHaveTextContent("Reference Details");
    expect(screen.getByTestId("fact-Name")).toHaveTextContent("Dr. Fatima Al-Mutawa");
    expect(screen.getByTestId("fact-Company")).toHaveTextContent("Kuwait University");
    expect(screen.getByTestId("fact-Position")).toHaveTextContent("Professor");
    expect(screen.getByTestId("fact-Phone")).toHaveTextContent("+965 99887766");
    expect(screen.getByTestId("fact-Email")).toHaveTextContent("fatima@ku.edu.kw");
    expect(screen.getByTestId("fact-Relationship")).toHaveTextContent("Academic Advisor");
    expect(screen.getByTestId("fact-Added On")).toHaveTextContent("2025-01-15");
  });

  it("renders DeleteReferenceButton with correct uuid", async () => {
    mockGetReferenceEntry.mockResolvedValue(mockReferenceData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "ref-abc-123" }) }));

    expect(screen.getByTestId("delete-reference-button")).toBeDefined();
    expect(screen.getByTestId("delete-reference-button")).toHaveAttribute(
      "data-uuid",
      "ref-abc-123"
    );
  });

  it("renders Back to References link", async () => {
    mockGetReferenceEntry.mockResolvedValue(mockReferenceData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "ref-abc-123" }) }));

    const backLink = screen.getByText("Back to References");
    expect(backLink).toBeDefined();
    expect(backLink.closest("a")).toHaveAttribute("href", "/candidate/references");
  });

  it("shows '—' fallback for null company, position, phone, email, relationship", async () => {
    mockGetReferenceEntry.mockResolvedValue({
      ...mockReferenceData,
      company: null,
      position: null,
      phone: null,
      email: null,
      relationship: null,
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "ref-null" }) }));

    expect(screen.getByTestId("fact-Company")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Position")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Phone")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Email")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Relationship")).toHaveTextContent("—");
  });

  it("shows 'N/A' for Added On when created_at is null", async () => {
    mockGetReferenceEntry.mockResolvedValue({
      ...mockReferenceData,
      created_at: null,
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "ref-null-date" }) }));

    expect(screen.getByTestId("fact-Added On")).toHaveTextContent("N/A");
  });

  it("shows '—' for Company metric when company is null", async () => {
    mockGetReferenceEntry.mockResolvedValue({
      ...mockReferenceData,
      company: null,
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "ref-no-company" }) }));

    expect(screen.getByTestId("metric-Company")).toHaveTextContent("—");
  });

  it("calls notFound when getReferenceEntry returns null", async () => {
    mockGetReferenceEntry.mockResolvedValue(null);

    const Page = (await import("./page")).default;
    await expect(Page({ params: Promise.resolve({ id: "nonexistent" }) })).rejects.toThrow(
      "NEXT_NOT_FOUND"
    );
    expect(mockNotFound).toHaveBeenCalledOnce();
  });
});
