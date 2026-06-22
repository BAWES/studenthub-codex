import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({
    user: { id: "42" },
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
  useRouter: () => ({ push: vi.fn() }),
}));

const mockGetCandidateSkill = vi.fn();

vi.mock("../actions", () => ({
  getCandidateSkill: (...args: unknown[]) => mockGetCandidateSkill(...args),
  deleteCandidateSkill: vi.fn(),
}));

vi.mock("./DeleteSkillButton", () => ({
  DeleteSkillButton: ({ skillId }: { skillId: number }) => (
    <button data-testid="delete-skill-btn" data-skillid={skillId}>
      Delete
    </button>
  ),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const fullSkillItem = {
  candidate_skill_id: 1,
  skill: "React",
  created_at: new Date("2024-01-15"),
};

const noDateSkillItem = {
  candidate_skill_id: 2,
  skill: "TypeScript",
  created_at: null,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CandidateSkillDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders detail for a skill with created_at date", async () => {
    mockGetCandidateSkill.mockResolvedValue(fullSkillItem);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ skillId: "1" }),
      }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Candidate / Skills");
    expect(screen.getByTestId("title")).toHaveTextContent("React");

    // Metrics
    expect(screen.getByTestId("metric-Skill")).toHaveTextContent("React");
    expect(screen.getByTestId("metric-Added")).toBeInTheDocument();

    // Detail fields
    expect(screen.getByTestId("fact-Skill Name")).toHaveTextContent("React");
    expect(screen.getByTestId("fact-Added On")).toBeInTheDocument();

    // Action buttons
    expect(screen.getByText("Edit Skill")).toBeInTheDocument();
    expect(screen.getByTestId("delete-skill-btn")).toBeInTheDocument();
    expect(screen.getByText("Back to Skills")).toBeInTheDocument();
  });

  it("renders detail for a skill with null created_at", async () => {
    mockGetCandidateSkill.mockResolvedValue(noDateSkillItem);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ skillId: "2" }),
      }),
    );

    expect(screen.getByTestId("title")).toHaveTextContent("TypeScript");
    expect(screen.getByTestId("metric-Added")).toHaveTextContent("N/A");
    expect(screen.getByTestId("fact-Added On")).toHaveTextContent("N/A");
  });

  it("calls getCandidateSkill with the numeric ID from params", async () => {
    mockGetCandidateSkill.mockResolvedValue(fullSkillItem);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ skillId: "99" }),
      }),
    );

    expect(mockGetCandidateSkill).toHaveBeenCalledWith({ skillId: 99 });
  });

  it("calls notFound when skill is null", async () => {
    mockGetCandidateSkill.mockResolvedValue(null);

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ skillId: "999" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
