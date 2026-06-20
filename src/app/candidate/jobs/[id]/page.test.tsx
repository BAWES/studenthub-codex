import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

// Mock dependencies
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({
    user: { id: "1" },
    role: "candidate",
  }),
}));

vi.mock("@/components/matching", () => ({
  MatchScoreBadge: ({ score, label }: { score: number; label: string }) => (
    <span data-testid="match-score-badge" data-score={score}>
      {label}: {score}%
    </span>
  ),
}));

const mockGetCandidateJob = vi.fn();

vi.mock("../actions", () => ({
  getCandidateJob: (...args: unknown[]) => mockGetCandidateJob(...args),
}));

const mockNotFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("next/navigation", () => ({
  notFound: mockNotFound,
}));

const baseJob = {
  jobListingId: 1001,
  title: "Software Engineer",
  description: "Build and maintain web applications.",
  requirements: "3+ years of React experience",
  location: "Kuwait City",
  employmentType: "Full-time",
  salaryRange: "1,200 - 1,800 KWD/month",
  employerName: "Tech Corp Kuwait",
  matchScore: 85,
  skillScore: 90,
  educationScore: 80,
  locationScore: 75,
  breakdown: [],
  status: "active",
  hasApplied: false,
  applicationStatus: null,
  createdAt: new Date("2025-01-15"),
  updatedAt: new Date("2025-02-01"),
};

describe("CandidateJobDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders job title and employer name", async () => {
    mockGetCandidateJob.mockResolvedValue({ success: true, job: baseJob });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "1001" }) }));

    expect(screen.getByText("Software Engineer")).toBeDefined();
    expect(screen.getByText("Tech Corp Kuwait")).toBeDefined();
  });

  it("renders back link to /candidate/jobs", async () => {
    mockGetCandidateJob.mockResolvedValue({ success: true, job: baseJob });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "1001" }) }));

    const backLink = screen.getByText("← Back to Jobs");
    expect(backLink).toBeDefined();
    expect(backLink.closest("a")).toHaveAttribute("href", "/candidate/jobs");
  });

  it("renders match score badge", async () => {
    mockGetCandidateJob.mockResolvedValue({ success: true, job: baseJob });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "1001" }) }));

    expect(screen.getByTestId("match-score-badge")).toBeDefined();
    expect(screen.getByTestId("match-score-badge")).toHaveAttribute("data-score", "85");
    expect(screen.getByTestId("match-score-badge")).toHaveTextContent("Match: 85%");
  });

  it("renders score breakdown badges", async () => {
    mockGetCandidateJob.mockResolvedValue({ success: true, job: baseJob });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "1001" }) }));

    expect(screen.getByText("Skills: 90%")).toBeDefined();
    expect(screen.getByText("Education: 80%")).toBeDefined();
    expect(screen.getByText("Location: 75%")).toBeDefined();
  });

  it("does not render match score or breakdown when matchScore is null", async () => {
    mockGetCandidateJob.mockResolvedValue({
      success: true,
      job: { ...baseJob, matchScore: null, skillScore: null, educationScore: null, locationScore: null },
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "1002" }) }));

    expect(screen.queryByTestId("match-score-badge")).toBeNull();
    expect(screen.queryByText(/Skills:/)).toBeNull();
    expect(screen.queryByText(/Education:/)).toBeNull();
    expect(screen.queryByText(/Location:/)).toBeNull();
  });

  it("renders detail grid fields", async () => {
    mockGetCandidateJob.mockResolvedValue({ success: true, job: baseJob });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "1001" }) }));

    expect(screen.getByText("Full-time")).toBeDefined();
    expect(screen.getByText("Kuwait City")).toBeDefined();
    expect(screen.getByText("1,200 - 1,800 KWD/month")).toBeDefined();
    expect(screen.getByText("2025-01-15")).toBeDefined();
  });

  it("renders description section", async () => {
    mockGetCandidateJob.mockResolvedValue({ success: true, job: baseJob });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "1001" }) }));

    expect(screen.getByText("Build and maintain web applications.")).toBeDefined();
  });

  it("renders requirements section when present", async () => {
    mockGetCandidateJob.mockResolvedValue({ success: true, job: baseJob });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "1001" }) }));

    expect(screen.getByText("3+ years of React experience")).toBeDefined();
  });

  it("does not render requirements section when missing", async () => {
    mockGetCandidateJob.mockResolvedValue({
      success: true,
      job: { ...baseJob, requirements: null },
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "1003" }) }));

    expect(screen.queryByText("Requirements")).toBeNull();
  });

  it("renders Apply button when has not applied", async () => {
    mockGetCandidateJob.mockResolvedValue({ success: true, job: baseJob });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "1001" }) }));

    expect(screen.getByText("Apply Now")).toBeDefined();
  });

  it("renders applied status when has applied", async () => {
    mockGetCandidateJob.mockResolvedValue({
      success: true,
      job: { ...baseJob, hasApplied: true, applicationStatus: "pending_review" },
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ id: "1004" }) }));

    expect(screen.getByText(/Applied.*pending_review/)).toBeDefined();
    expect(screen.queryByText("Apply Now")).toBeNull();
  });

  it("calls notFound when getCandidateJob throws", async () => {
    mockGetCandidateJob.mockRejectedValue(new Error("Job not found"));

    const Page = (await import("./page")).default;
    await expect(Page({ params: Promise.resolve({ id: "nonexistent" }) })).rejects.toThrow(
      "NEXT_NOT_FOUND"
    );
    expect(mockNotFound).toHaveBeenCalledOnce();
  });
});
