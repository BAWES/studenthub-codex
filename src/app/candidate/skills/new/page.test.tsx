import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({
    user: { id: "1" },
    role: "candidate",
  }),
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

vi.mock("./SkillNewForm", () => ({
  SkillNewForm: () => <div data-testid="skill-new-form" />,
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CandidateSkillNewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders WorkspaceShell with correct eyebrow and title", async () => {
    const Page = (await import("./page")).default;
    render(await Page());

    expect(screen.getByTestId("workspace-shell")).toBeDefined();
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Candidate / Skills");
    expect(screen.getByTestId("title")).toHaveTextContent("Add a New Skill");
  });

  it("renders the SkillNewForm component", async () => {
    const Page = (await import("./page")).default;
    render(await Page());

    expect(screen.getByTestId("skill-new-form")).toBeDefined();
  });

  it("has no metrics on the page", async () => {
    const Page = (await import("./page")).default;
    render(await Page());

    expect(screen.queryByTestId(/^metric-/)).toBeNull();
  });
});
