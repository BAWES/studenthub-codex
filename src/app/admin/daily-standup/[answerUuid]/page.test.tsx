import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({ user: { id: "1" }, role: "admin" }),
}));

vi.mock("@/modules/workspace/ErrorBoundary", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/modules/workspace/WorkspaceShell", () => ({
  WorkspaceShell: ({ children, eyebrow, title, metrics }: {
    children: React.ReactNode; eyebrow: string; title: string;
    metrics: { label: string; value: string | number; note: string }[];
  }) => (
    <div data-testid="workspace-shell">
      <div data-testid="eyebrow">{eyebrow}</div>
      <div data-testid="title">{title}</div>
      {metrics.map((m) => (<span key={m.label} data-testid={`metric-${m.label}`}>{String(m.value)}</span>))}
      {children}
    </div>
  ),
}));

vi.mock("@/modules/workspace/DetailPanels", () => ({
  DetailSection: ({ title, facts }: {
    title: string; facts: { label: string; value: string | React.ReactNode }[];
  }) => (
    <div data-testid="detail-section">
      <div data-testid="section-title">{title}</div>
      {facts.map((f) => (<span key={String(f.label)} data-testid={`fact-${f.label}`}>{String(f.value)}</span>))}
    </div>
  ),
}));

vi.mock("next/navigation", () => ({
  notFound: () => { throw new Error("NEXT_NOT_FOUND"); },
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

const mockAnswer = {
  answer_uuid: "ans-789",
  staff_id: 42,
  question_uuid: "q-1",
  question: "What did you work on today?",
  answer: "Built the admin daily-standup detail page with WorkspaceShell.",
  created_at: new Date("2026-06-20T10:00:00.000Z"),
  updated_at: new Date("2026-06-20T12:00:00.000Z"),
};

const mockGetAnswer = vi.fn();
vi.mock("./actions", () => ({ getDailyStandupAnswer: (...args: unknown[]) => mockGetAnswer(...args) }));

describe("AdminDailyStandupDetailPage", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => { cleanup(); });

  it("renders daily standup answer detail with all fields", async () => {
    mockGetAnswer.mockResolvedValue({ answer: mockAnswer });
    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ answerUuid: "ans-789" }) }));
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Daily Standup Answers");
    expect(screen.getByTestId("title")).toHaveTextContent("What did you work on today?");
    expect(screen.getByTestId("fact-Question")).toHaveTextContent("What did you work on today?");
    expect(screen.getByTestId("fact-Answer")).toHaveTextContent("Built the admin daily-standup detail page");
    expect(screen.getByTestId("fact-Staff ID")).toHaveTextContent("42");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2026-06-20");
  });

  it("renders null fields as em-dash", async () => {
    mockGetAnswer.mockResolvedValue({
      answer: { ...mockAnswer, staff_id: null, question: null, answer: null, created_at: null, updated_at: null },
    });
    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ answerUuid: "sparse" }) }));
    expect(screen.getByTestId("fact-Question")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Answer")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Staff ID")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("—");
  });

  it("calls notFound when answer is null", async () => {
    mockGetAnswer.mockResolvedValue({ answer: null });
    const Page = (await import("./page")).default;
    await expect(Page({ params: Promise.resolve({ answerUuid: "nonexistent" }) })).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("calls notFound when answerUuid is empty", async () => {
    const Page = (await import("./page")).default;
    await expect(Page({ params: Promise.resolve({ answerUuid: "" }) })).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
