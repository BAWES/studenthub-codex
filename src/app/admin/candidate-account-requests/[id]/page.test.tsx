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
          {typeof m.value === "string" ? m.value : String(m.value)}
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

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

const mockRequest = {
  cir_uuid: "cir_abc123def456",
  candidate_ids: "42, 55, 78",
  status: "pending",
  rejection_reason: null,
  created_by_name: "Staff Admin",
  updated_by_name: "Staff Admin",
  created_at: "2024-03-01T10:00:00.000Z",
  updated_at: "2024-03-15T14:30:00.000Z",
};

const mockGetCandidateIdRequest = vi.fn();

vi.mock("./actions", () => ({
  getCandidateIdRequest: (...args: unknown[]) => mockGetCandidateIdRequest(...args),
}));

describe("AdminCandidateAccountRequestDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders candidate account request detail with all fields", async () => {
    mockGetCandidateIdRequest.mockResolvedValue({ request: mockRequest });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "cir_abc123def456" }),
      }),
    );

    // Check workspace shell
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Candidate Account Requests");
    expect(screen.getByTestId("title")).toHaveTextContent("Request — cir_abc123de…");

    // Check detail fields
    expect(screen.getByTestId("fact-CIR UUID")).toHaveTextContent("cir_abc123def456");
    expect(screen.getByTestId("fact-Candidate IDs")).toHaveTextContent("42, 55, 78");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Pending");
    expect(screen.getByTestId("fact-Rejection Reason")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Created By")).toHaveTextContent("Staff Admin");
    expect(screen.getByTestId("fact-Updated By")).toHaveTextContent("Staff Admin");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2024-03-01");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("2024-03-15");
  });

  it("displays Approved status when status is approved", async () => {
    mockGetCandidateIdRequest.mockResolvedValue({
      request: { ...mockRequest, status: "approved" },
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "cir_approved" }),
      }),
    );

    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Approved");
  });

  it("renders null fields as em-dash", async () => {
    mockGetCandidateIdRequest.mockResolvedValue({
      request: {
        ...mockRequest,
        candidate_ids: null,
        rejection_reason: null,
        created_by_name: null,
        updated_by_name: null,
        created_at: null,
        updated_at: null,
      },
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "cir_null" }),
      }),
    );

    expect(screen.getByTestId("fact-Candidate IDs")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Rejection Reason")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Created By")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Updated By")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("—");
  });

  it("calls notFound when request is null", async () => {
    mockGetCandidateIdRequest.mockResolvedValue({ request: null });

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
