import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

// Mock dependencies
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({ user: { id: "1" }, role: "candidate" }),
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

const mockGetEducationEntry = vi.fn();

vi.mock("./actions", () => ({
  getEducationEntry: (...args: unknown[]) => mockGetEducationEntry(...args),
}));

const mockNotFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("next/navigation", () => ({
  notFound: mockNotFound,
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

const mockEducationData = {
  education_uuid: "edu-123",
  candidate_id: 456,
  university_id: 789,
  university_name_en: "Kuwait University",
  university_name_ar: "جامعة الكويت",
  degree_uuid: "deg-abc",
  degree_name_en: "Bachelor of Science",
  degree_name_ar: "بكالوريوس علوم",
  major_uuid: "maj-xyz",
  major_name_en: "Computer Science",
  major_name_ar: "علوم حاسوب",
  graduation_year: 2024,
  is_currently_studying: false,
  created_at: new Date("2024-01-15"),
  updated_at: new Date("2024-06-01"),
};

describe("CandidateEducationDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders education detail with WorkspaceShell and correct title", async () => {
    mockGetEducationEntry.mockResolvedValue(mockEducationData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "edu-123" }) }));

    expect(screen.getByTestId("workspace-shell")).toBeDefined();
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Candidate / Education");
    expect(screen.getByTestId("title")).toHaveTextContent(
      "Kuwait University · Bachelor of Science"
    );
  });

  it("renders metrics with correct values", async () => {
    mockGetEducationEntry.mockResolvedValue(mockEducationData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "edu-123" }) }));

    expect(screen.getByTestId("metric-Status")).toHaveTextContent("Completed");
    expect(screen.getByTestId("metric-Graduation")).toHaveTextContent("2024");
    expect(screen.getByTestId("metric-Added")).toHaveTextContent("2024-01-15");
    expect(screen.getByTestId("metric-Updated")).toHaveTextContent("2024-06-01");
  });

  it("shows 'Currently Studying' when is_currently_studying is true", async () => {
    mockGetEducationEntry.mockResolvedValue({
      ...mockEducationData,
      is_currently_studying: true,
      graduation_year: null,
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "edu-456" }) }));

    expect(screen.getByTestId("metric-Status")).toHaveTextContent("Currently Studying");
    expect(screen.getByTestId("metric-Graduation")).toHaveTextContent("N/A");
  });

  it("renders DetailSection with education facts", async () => {
    mockGetEducationEntry.mockResolvedValue(mockEducationData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "edu-123" }) }));

    expect(screen.getByTestId("detail-section")).toBeDefined();
    expect(screen.getByTestId("section-title")).toHaveTextContent("Education Details");
    expect(screen.getByTestId("fact-University")).toHaveTextContent("Kuwait University");
    expect(screen.getByTestId("fact-Degree")).toHaveTextContent("Bachelor of Science");
    expect(screen.getByTestId("fact-Major")).toHaveTextContent("Computer Science");
    expect(screen.getByTestId("fact-Graduation Year")).toHaveTextContent("2024");
  });

  it("renders Arabic name fallback when English name is missing", async () => {
    mockGetEducationEntry.mockResolvedValue({
      ...mockEducationData,
      university_name_en: null,
      degree_name_en: null,
      major_name_en: null,
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "edu-789" }) }));

    expect(screen.getByTestId("title")).toHaveTextContent(
      "جامعة الكويت · بكالوريوس علوم"
    );
    expect(screen.getByTestId("fact-University")).toHaveTextContent("جامعة الكويت");
    expect(screen.getByTestId("fact-Degree")).toHaveTextContent("بكالوريوس علوم");
    expect(screen.getByTestId("fact-Major")).toHaveTextContent("علوم حاسوب");
  });

  it("shows em-dash as fallback for missing names", async () => {
    mockGetEducationEntry.mockResolvedValue({
      ...mockEducationData,
      university_name_en: null,
      university_name_ar: null,
      degree_name_en: null,
      degree_name_ar: null,
      major_name_en: null,
      major_name_ar: null,
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "edu-000" }) }));

    // Title should fall back to em-dash
    expect(screen.getByTestId("title")).toHaveTextContent("—");
  });

  it("renders em-dash for missing optional fields", async () => {
    mockGetEducationEntry.mockResolvedValue({
      ...mockEducationData,
      graduation_year: null,
      created_at: null,
      updated_at: null,
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "edu-999" }) }));

    expect(screen.getByTestId("fact-Graduation Year")).toHaveTextContent("—");
    expect(screen.getByTestId("metric-Graduation")).toHaveTextContent("N/A");
    expect(screen.getByTestId("metric-Added")).toHaveTextContent("N/A");
    expect(screen.getByTestId("metric-Updated")).toHaveTextContent("N/A");
  });

  it("calls notFound when getEducationEntry returns null", async () => {
    mockGetEducationEntry.mockResolvedValue(null);

    const Page = (await import("./page")).default;
    await expect(Page({ params: Promise.resolve({ id: "nonexistent" }) })).rejects.toThrow(
      "NEXT_NOT_FOUND"
    );
    expect(mockNotFound).toHaveBeenCalledOnce();
  });
});
