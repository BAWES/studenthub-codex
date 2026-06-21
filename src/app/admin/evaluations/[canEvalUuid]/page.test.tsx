import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

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
          {typeof f.value === "string" ? f.value : "node"}
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

const mockEvaluation = {
  can_eval_uuid: "eval-uuid-123",
  candidate_id: 42,
  candidate_name: "John Doe",
  dept_id: 5,
  start_date: "2024-01-15T00:00:00.000Z",
  end_date: "2024-03-15T00:00:00.000Z",
  staff_id: 10,
  staff_name: "Jane Smith",
  created_at: new Date("2024-01-01T00:00:00.000Z"),
  updated_at: new Date("2024-03-15T12:00:00.000Z"),
};

const mockGetEvaluation = vi.fn();

vi.mock("@/modules/admin/evaluations/actions", () => ({
  getEvaluation: (...args: unknown[]) => mockGetEvaluation(...args),
}));

describe("AdminEvaluationDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders evaluation detail with all fields", async () => {
    mockGetEvaluation.mockResolvedValue({ evaluation: mockEvaluation });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ canEvalUuid: "eval-uuid-123" }),
      }),
    );

    // Check workspace shell
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Evaluations");
    expect(screen.getByTestId("title")).toHaveTextContent("Evaluation — John Doe");

    // Check metrics
    expect(screen.getByTestId("metric-Candidate ID")).toHaveTextContent("42");
    expect(screen.getByTestId("metric-Staff Evaluator")).toHaveTextContent("Jane Smith");

    // Check detail section
    expect(screen.getByText("Evaluation Details")).toBeInTheDocument();

    // Check all detail fields
    expect(screen.getByTestId("fact-UUID")).toHaveTextContent("eval-uuid-123");
    expect(screen.getByTestId("fact-Candidate")).toHaveTextContent("John Doe");
    expect(screen.getByTestId("fact-Candidate ID")).toHaveTextContent("42");
    expect(screen.getByTestId("fact-Department ID")).toHaveTextContent("5");
    expect(screen.getByTestId("fact-Staff Evaluator")).toHaveTextContent("Jane Smith");
    expect(screen.getByTestId("fact-Staff ID")).toHaveTextContent("10");
  });

  it("renders null optional fields as em-dash", async () => {
    mockGetEvaluation.mockResolvedValue({
      evaluation: {
        ...mockEvaluation,
        candidate_name: null,
        staff_name: null,
        start_date: null,
        end_date: null,
        created_at: null,
        updated_at: null,
      },
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ canEvalUuid: "eval-uuid-null" }),
      }),
    );

    expect(screen.getByTestId("fact-Candidate")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Staff Evaluator")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Start Date")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-End Date")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("—");
  });

  it("calls notFound when evaluation is null", async () => {
    mockGetEvaluation.mockResolvedValue({ evaluation: null });

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ canEvalUuid: "nonexistent" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("renders a download PDF link with correct href", async () => {
    mockGetEvaluation.mockResolvedValue({ evaluation: mockEvaluation });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ canEvalUuid: "eval-uuid-123" }),
      }),
    );

    const downloadLink = screen.getByTestId("download-pdf");
    expect(downloadLink).toBeInTheDocument();
    expect(downloadLink).toHaveAttribute(
      "href",
      "/api/evaluations/eval-uuid-123/pdf?format=pdf",
    );
    expect(downloadLink).toHaveAttribute("download");
    expect(downloadLink).toHaveTextContent("Download PDF Report");
  });

  it("shows 'Unknown Candidate' when candidate_name is null in title", async () => {
    mockGetEvaluation.mockResolvedValue({
      evaluation: { ...mockEvaluation, candidate_name: null },
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ canEvalUuid: "eval-uuid-456" }),
      }),
    );

    expect(screen.getByTestId("title")).toHaveTextContent("Evaluation — Unknown Candidate");
  });
});
