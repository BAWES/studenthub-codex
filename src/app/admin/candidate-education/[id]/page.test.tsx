import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

// Mock the dependencies
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
          {String(f.value)}
        </span>
      ))}
    </div>
  ),
}));

const mockEducation = {
  education_uuid: "edu-123",
  candidate_id: 42,
  candidate_name: "John Doe",
  university_id: 7,
  university_name: "MIT",
  degree_uuid: "deg-abc",
  degree_name: "Bachelor of Science",
  major_uuid: "maj-xyz",
  major_name: "Computer Science",
  graduation_year: 2024,
  is_currently_studying: false,
  created_at: new Date("2024-01-15T10:00:00.000Z"),
  updated_at: new Date("2024-06-01T14:30:00.000Z"),
};

const mockGetCandidateEducation = vi.fn();

vi.mock("./actions", () => ({
  getCandidateEducation: (...args: unknown[]) => mockGetCandidateEducation(...args),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

describe("AdminCandidateEducationDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders education detail with all fields", async () => {
    mockGetCandidateEducation.mockResolvedValue({
      education: mockEducation,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "edu-123" }),
      }),
    );

    // Check workspace shell
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Candidate Education");
    expect(screen.getByTestId("title")).toHaveTextContent("Education — John Doe");

    // Check metrics
    expect(screen.getByTestId("metric-Candidate")).toHaveTextContent("John Doe");
    expect(screen.getByTestId("metric-University")).toHaveTextContent("MIT");
    expect(screen.getByTestId("metric-Degree")).toHaveTextContent("Bachelor of Science");

    // Check detail fields
    expect(screen.getByTestId("fact-UUID")).toHaveTextContent("edu-123");
    expect(screen.getByTestId("fact-Candidate ID")).toHaveTextContent("42");
    expect(screen.getByTestId("fact-Candidate Name")).toHaveTextContent("John Doe");
    expect(screen.getByTestId("fact-University")).toHaveTextContent("MIT");
    expect(screen.getByTestId("fact-University ID")).toHaveTextContent("7");
    expect(screen.getByTestId("fact-Degree")).toHaveTextContent("Bachelor of Science");
    expect(screen.getByTestId("fact-Degree UUID")).toHaveTextContent("deg-abc");
    expect(screen.getByTestId("fact-Major")).toHaveTextContent("Computer Science");
    expect(screen.getByTestId("fact-Major UUID")).toHaveTextContent("maj-xyz");
    expect(screen.getByTestId("fact-Graduation Year")).toHaveTextContent("2024");
    expect(screen.getByTestId("fact-Currently Studying")).toHaveTextContent("No");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2024-01-15");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("2024-06-01");

    // Check back button
    expect(screen.getByText("Back to Candidate Education")).toBeInTheDocument();
  });

  it("renders with null candidate name and null optional fields", async () => {
    mockGetCandidateEducation.mockResolvedValue({
      education: {
        ...mockEducation,
        candidate_name: null,
        degree_uuid: null,
        degree_name: null,
        major_uuid: null,
        major_name: null,
        graduation_year: null,
      },
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "edu-456" }),
      }),
    );

    expect(screen.getByTestId("metric-Candidate")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Candidate Name")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Degree")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Degree UUID")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Major")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Major UUID")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Graduation Year")).toHaveTextContent("—");
  });

  it("renders with is_currently_studying = true", async () => {
    mockGetCandidateEducation.mockResolvedValue({
      education: { ...mockEducation, is_currently_studying: true },
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "edu-789" }),
      }),
    );

    expect(screen.getByTestId("fact-Currently Studying")).toHaveTextContent("Yes");
  });

  it("renders with empty university name and missing timestamps", async () => {
    mockGetCandidateEducation.mockResolvedValue({
      education: {
        ...mockEducation,
        university_name: "",
        created_at: null,
        updated_at: null,
      },
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "edu-empty" }),
      }),
    );

    expect(screen.getByTestId("metric-University")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-University")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("—");
  });

  it("calls notFound when education is null", async () => {
    mockGetCandidateEducation.mockResolvedValue({
      education: null,
    });

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent" }) }),
    ).rejects.toThrow();

    expect(notFound).toHaveBeenCalled();
  });

  it("renders title with candidate id when candidate_name is null", async () => {
    mockGetCandidateEducation.mockResolvedValue({
      education: { ...mockEducation, candidate_name: null },
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "edu-title-test" }),
      }),
    );

    expect(screen.getByTestId("title")).toHaveTextContent("Candidate #42");
  });
});
