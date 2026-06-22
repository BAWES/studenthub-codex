import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

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

const mockGetExperienceEntry = vi.fn();

vi.mock("./actions", () => ({
  getExperienceEntry: (...args: unknown[]) => mockGetExperienceEntry(...args),
  deleteExperienceEntry: vi.fn(),
}));

vi.mock("./DeleteExperienceButton", () => ({
  DeleteExperienceButton: ({ experienceId }: { experienceId: number }) => (
    <button data-testid="delete-experience-btn" data-experienceid={experienceId}>
      Delete
    </button>
  ),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const fullExperienceItem = {
  candidate_experience_id: 1,
  candidate_id: 42,
  experience: "Software Engineer",
  employer: "Tech Corp",
  start_year: 2020,
  end_year: 2023,
  created_at: new Date("2024-01-01"),
};

const minimalExperienceItem = {
  candidate_experience_id: 2,
  candidate_id: null,
  experience: "Freelancer",
  employer: null,
  start_year: null,
  end_year: null,
  created_at: null,
};

const ongoingExperienceItem = {
  candidate_experience_id: 3,
  candidate_id: 42,
  experience: "Developer",
  employer: "Startup Inc",
  start_year: 2021,
  end_year: null,
  created_at: new Date("2023-06-15"),
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CandidateExperienceDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders detail for a full experience entry", async () => {
    mockGetExperienceEntry.mockResolvedValue(fullExperienceItem);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ experienceId: "1" }),
      }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Candidate / Experience");
    expect(screen.getByTestId("title")).toHaveTextContent("Software Engineer");

    // Metrics
    expect(screen.getByTestId("metric-Position")).toHaveTextContent("Software Engineer");
    expect(screen.getByTestId("metric-Employer")).toHaveTextContent("Tech Corp");
    expect(screen.getByTestId("metric-Period")).toHaveTextContent("2020 – 2023");

    // Detail fields
    expect(screen.getByTestId("fact-Position / Title")).toHaveTextContent("Software Engineer");
    expect(screen.getByTestId("fact-Employer")).toHaveTextContent("Tech Corp");
    expect(screen.getByTestId("fact-Start Year")).toHaveTextContent("2020");
    expect(screen.getByTestId("fact-End Year")).toHaveTextContent("2023");
    expect(screen.getByTestId("fact-Added On")).toBeInTheDocument();

    // Action buttons
    expect(screen.getByText("Edit Experience")).toBeInTheDocument();
    expect(screen.getByTestId("delete-experience-btn")).toBeInTheDocument();
    expect(screen.getByText("Back to Experience")).toBeInTheDocument();
  });

  it("renders detail for minimal experience entry (nullable fields null)", async () => {
    mockGetExperienceEntry.mockResolvedValue(minimalExperienceItem);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ experienceId: "2" }),
      }),
    );

    expect(screen.getByTestId("title")).toHaveTextContent("Freelancer");

    // Null employer shows "—" in metrics, "Not specified" in facts
    expect(screen.getByTestId("metric-Employer")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Employer")).toHaveTextContent("Not specified");

    // Null years show "Not specified"
    expect(screen.getByTestId("metric-Period")).toHaveTextContent("Not specified");
    expect(screen.getByTestId("fact-Start Year")).toHaveTextContent("Not specified");
    expect(screen.getByTestId("fact-End Year")).toHaveTextContent("Not specified");
    expect(screen.getByTestId("fact-Added On")).toHaveTextContent("N/A");
  });

  it("renders detail with only start_year (end_year null)", async () => {
    mockGetExperienceEntry.mockResolvedValue(ongoingExperienceItem);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ experienceId: "3" }),
      }),
    );

    expect(screen.getByTestId("title")).toHaveTextContent("Developer");
    expect(screen.getByTestId("metric-Period")).toHaveTextContent("From 2021");
    expect(screen.getByTestId("fact-Start Year")).toHaveTextContent("2021");
    expect(screen.getByTestId("fact-End Year")).toHaveTextContent("Not specified");
  });

  it("calls getExperienceEntry with the numeric ID from params", async () => {
    mockGetExperienceEntry.mockResolvedValue(fullExperienceItem);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ experienceId: "42" }),
      }),
    );

    expect(mockGetExperienceEntry).toHaveBeenCalledWith(42);
  });

  it("calls notFound when experience entry is null", async () => {
    mockGetExperienceEntry.mockResolvedValue(null);

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ experienceId: "999" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
