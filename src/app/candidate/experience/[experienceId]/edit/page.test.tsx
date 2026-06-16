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

const mockGetExperienceEntry = vi.fn();

vi.mock("../actions", () => ({
  getExperienceEntry: (...args: unknown[]) => mockGetExperienceEntry(...args),
}));

const mockNotFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("next/navigation", () => ({
  notFound: mockNotFound,
}));

vi.mock("../ExperienceEditForm", () => ({
  ExperienceEditForm: ({
    experienceId,
    currentExperience,
    currentEmployer,
    currentStartYear,
    currentEndYear,
  }: {
    experienceId: number;
    currentExperience: string | null;
    currentEmployer: string;
    currentStartYear: number | null;
    currentEndYear: number | null;
  }) => (
    <div data-testid="experience-edit-form">
      <span data-testid="edit-exp-id">{experienceId}</span>
      <span data-testid="edit-exp-name">{currentExperience}</span>
      {currentEmployer && <span data-testid="edit-exp-employer">{currentEmployer}</span>}
      <span data-testid="edit-exp-start">{currentStartYear}</span>
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Test Data
// ---------------------------------------------------------------------------

const mockExperienceEntry = {
  candidate_experience_id: 7,
  experience: "Senior Developer",
  employer: "Tech Corp",
  start_year: 2018,
  end_year: 2023,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CandidateExperienceEditPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders WorkspaceShell with correct eyebrow and title", async () => {
    mockGetExperienceEntry.mockResolvedValue(mockExperienceEntry);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ experienceId: "7" }) }));

    expect(screen.getByTestId("workspace-shell")).toBeDefined();
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Candidate / Experience / Edit");
    expect(screen.getByTestId("title")).toHaveTextContent("Edit: Senior Developer");
  });

  it("renders the ExperienceEditForm with correct props", async () => {
    mockGetExperienceEntry.mockResolvedValue(mockExperienceEntry);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ experienceId: "7" }) }));

    expect(screen.getByTestId("experience-edit-form")).toBeDefined();
    expect(screen.getByTestId("edit-exp-id")).toHaveTextContent("7");
    expect(screen.getByTestId("edit-exp-name")).toHaveTextContent("Senior Developer");
    expect(screen.getByTestId("edit-exp-employer")).toHaveTextContent("Tech Corp");
    expect(screen.getByTestId("edit-exp-start")).toHaveTextContent("2018");
  });

  it("has no metrics on the page", async () => {
    mockGetExperienceEntry.mockResolvedValue(mockExperienceEntry);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ experienceId: "7" }) }));

    expect(screen.queryByTestId(/^metric-/)).toBeNull();
  });

  it("calls notFound when experience entry is null", async () => {
    mockGetExperienceEntry.mockResolvedValue(null);

    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ experienceId: "999" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalledOnce();
  });
});
