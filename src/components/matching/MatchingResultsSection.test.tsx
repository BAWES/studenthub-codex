// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import MatchingResultsSection from "./MatchingResultsSection";

afterEach(() => {
  cleanup();
});

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockJobs = [
  {
    jobListingId: 1,
    title: "Frontend Developer",
    employerName: "Acme Corp",
    location: "Kuwait City",
    employmentType: "full-time",
    salaryRange: "600–800 KWD",
    score: 92,
  },
  {
    jobListingId: 2,
    title: "Data Analyst",
    employerName: "TechCo",
    location: "Hawally",
    employmentType: "part-time",
    salaryRange: null,
    score: 65,
  },
  {
    jobListingId: 3,
    title: "Junior Designer",
    employerName: "Studio XYZ",
    location: null,
    employmentType: null,
    salaryRange: null,
    score: null,
  },
];

describe("MatchingResultsSection", () => {
  it("renders title and description", () => {
    render(<MatchingResultsSection jobs={mockJobs} />);
    expect(screen.getByText("Best matches for you")).toBeInTheDocument();
    expect(
      screen.getByText(/jobs ranked by how well they match/i),
    ).toBeInTheDocument();
  });

  it("renders all job cards", () => {
    render(<MatchingResultsSection jobs={mockJobs} />);
    const cards = screen.getAllByTestId("matched-job-card");
    expect(cards).toHaveLength(3);
  });

  it("shows each job title once", () => {
    render(<MatchingResultsSection jobs={mockJobs} />);
    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    expect(screen.getByText("Data Analyst")).toBeInTheDocument();
    expect(screen.getByText("Junior Designer")).toBeInTheDocument();
  });

  it("shows employer names", () => {
    render(<MatchingResultsSection jobs={mockJobs} />);
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("TechCo")).toBeInTheDocument();
  });

  it("shows employment type and location when available", () => {
    render(<MatchingResultsSection jobs={mockJobs} />);
    expect(screen.getByText("Kuwait City")).toBeInTheDocument();
    expect(screen.getByText("Hawally")).toBeInTheDocument();
  });

  it("shows salary when available", () => {
    render(<MatchingResultsSection jobs={mockJobs} />);
    expect(screen.getByText("600–800 KWD")).toBeInTheDocument();
  });

  it("renders a match score badge for each job", () => {
    render(<MatchingResultsSection jobs={mockJobs} />);
    const badges = screen.getAllByTestId("match-score-badge");
    expect(badges).toHaveLength(3);
  });

  it("returns null when no jobs provided", () => {
    const { container } = render(<MatchingResultsSection jobs={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("links each job card to the job detail page", () => {
    render(<MatchingResultsSection jobs={mockJobs} />);
    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "/candidate/jobs/1");
    expect(links[1]).toHaveAttribute("href", "/candidate/jobs/2");
    expect(links[2]).toHaveAttribute("href", "/candidate/jobs/3");
  });
});
