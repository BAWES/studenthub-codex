import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

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
  }: {
    children: React.ReactNode;
    eyebrow: string;
    title: string;
    metrics: { label: string; value: string | number; note: string }[];
  }) => (
    <div data-testid="workspace-shell">
      <div data-testid="eyebrow">{eyebrow}</div>
      <div data-testid="title">{title}</div>
      {children}
    </div>
  ),
}));

const mockGetCandidateSkill = vi.fn();

vi.mock("../../actions", () => ({
  getCandidateSkill: (...args: unknown[]) => mockGetCandidateSkill(...args),
}));

const mockNotFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("next/navigation", () => ({
  notFound: mockNotFound,
}));

vi.mock("../SkillEditForm", () => ({
  SkillEditForm: ({
    skillId,
    currentName,
  }: {
    skillId: number;
    currentName: string;
  }) => (
    <div data-testid="skill-edit-form">
      <span data-testid="edit-skill-id">{skillId}</span>
      <span data-testid="edit-skill-name">{currentName}</span>
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Test Data
// ---------------------------------------------------------------------------

const mockSkill = {
  candidate_skill_id: 15,
  skill: "TypeScript",
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CandidateSkillEditPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders WorkspaceShell with correct eyebrow and title", async () => {
    mockGetCandidateSkill.mockResolvedValue(mockSkill);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ skillId: "15" }) }));

    expect(screen.getByTestId("workspace-shell")).toBeDefined();
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Candidate / Skills / Edit");
    expect(screen.getByTestId("title")).toHaveTextContent("Edit: TypeScript");
  });

  it("renders the SkillEditForm with correct props", async () => {
    mockGetCandidateSkill.mockResolvedValue(mockSkill);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ skillId: "15" }) }));

    expect(screen.getByTestId("skill-edit-form")).toBeDefined();
    expect(screen.getByTestId("edit-skill-id")).toHaveTextContent("15");
    expect(screen.getByTestId("edit-skill-name")).toHaveTextContent("TypeScript");
  });

  it("has no metrics on the page", async () => {
    mockGetCandidateSkill.mockResolvedValue(mockSkill);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ skillId: "15" }) }));

    expect(screen.queryByTestId(/^metric-/)).toBeNull();
  });

  it("calls notFound when skill is null", async () => {
    mockGetCandidateSkill.mockResolvedValue(null);

    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ skillId: "999" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalledOnce();
  });
});
