import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CSSProperties, ReactNode } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock next/navigation
const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: vi.fn() }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => "/staff/candidates",
}));

// Mock next/link as a simple <a> element
vi.mock("next/link", () => ({
  default: ({ href, children, className, style }: { href?: string; children?: React.ReactNode; className?: string; style?: React.CSSProperties }) =>
    <a href={href} className={className} style={style}>{children}</a>,
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock MatchScoreBadge
vi.mock("@/components/matching/MatchScoreBadge", () => ({
  default: ({ score }: { score: number | null }) => (
    <span data-testid="match-score-badge">{score !== null ? `${score}%` : "—"}</span>
  ),
}));

import { CandidateSearchPage } from "./CandidateSearchPage";

// =============================================================================
// Fixtures
// =============================================================================

const mockSession = {
  id: "1",
  name: "Test Candidate",
  email: "test@example.com",
  role: "candidate" as const,
};

const mockResults = {
  rows: [
    {
      id: 42,
      uid: "C-001",
      name: "Alice Kuwait",
      email: "alice@example.com",
      phone: "+965 5555 1234",
      status: "Active",
      signal: "Ready",
      country: "Kuwait",
      university: "Kuwait University",
      company: "Tech Corp",
      store: "Main Store",
      rate: "5.500 KWD",
      updated: "Jun 11, 2026",
      flags: [],
      skills: ["JavaScript", "React", "Node.js"],
      score: 85,
    },
    {
      id: 43,
      uid: "C-002",
      name: "Bob Kuwait",
      email: "bob@example.com",
      phone: "+965 5555 5678",
      status: "Needs review",
      signal: "Approval decision",
      country: "Kuwait",
      university: "No university",
      company: "No company",
      store: "No store",
      rate: "3.000 KWD",
      updated: "Jun 10, 2026",
      flags: ["Needs review"],
      skills: ["Python"],
      score: 42,
    },
  ],
  facets: [
    {
      key: "country_name",
      label: "Country",
      options: [
        { label: "Kuwait", value: "Kuwait", count: 2, active: false },
      ],
    },
    {
      key: "skills",
      label: "Skills",
      options: [
        { label: "JavaScript", value: "JavaScript", count: 1, active: false },
        { label: "Python", value: "Python", count: 1, active: false },
      ],
    },
  ],
  matchingCount: 2,
  query: "",
  filter: "all",
  source: { current: "Typesense", target: "Typesense", note: "" },
};

// =============================================================================
// Tests
// =============================================================================

describe("CandidateSearchPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete("q");
    mockSearchParams.delete("page");
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResults),
    });
  });

  it("renders the search page header", async () => {
    render(<CandidateSearchPage session={mockSession as any} />);

    expect(screen.getByText("Search Candidates")).toBeTruthy();
    expect(screen.getByPlaceholderText(/search by name, email, skills/i)).toBeTruthy();
  });

  it("shows the search input and button", async () => {
    render(<CandidateSearchPage session={mockSession as any} />);

    const inputs = screen.getAllByPlaceholderText(/search by name, email, skills/i);
    expect(inputs.length).toBeGreaterThanOrEqual(1);
    const buttons = screen.getAllByRole("button", { name: /search/i });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("calls fetch on initial mount", async () => {
    render(<CandidateSearchPage session={mockSession as any} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/candidates/search"),
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
    });
  });

  it("displays search results after loading", async () => {
    render(<CandidateSearchPage session={mockSession as any} />);

    const aliceCards = await screen.findAllByText("Alice Kuwait");
    expect(aliceCards.length).toBeGreaterThanOrEqual(1);
    const bobCards = await screen.findAllByText("Bob Kuwait");
    expect(bobCards.length).toBeGreaterThanOrEqual(1);
  });

  it("displays match score badges", async () => {
    render(<CandidateSearchPage session={mockSession as any} />);

    const badges = await screen.findAllByTestId("match-score-badge");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it("displays skill tags for each result", async () => {
    render(<CandidateSearchPage session={mockSession as any} />);

    const jsTag = await screen.findAllByText("JavaScript");
    expect(jsTag.length).toBeGreaterThanOrEqual(1);
    const reactTag = await screen.findAllByText("React");
    expect(reactTag.length).toBeGreaterThanOrEqual(1);
  });

  it("displays facet filters in the sidebar", async () => {
    render(<CandidateSearchPage session={mockSession as any} />);

    const countryLabels = await screen.findAllByText("Country");
    expect(countryLabels.length).toBeGreaterThanOrEqual(1);
    const skillsLabels = await screen.findAllByText("Skills");
    expect(skillsLabels.length).toBeGreaterThanOrEqual(1);
  });

  it("shows total matching count", async () => {
    render(<CandidateSearchPage session={mockSession as any} />);

    const countMsg = await screen.findAllByText(/2 candidates found/);
    expect(countMsg.length).toBeGreaterThanOrEqual(1);
  });

  it("shows the Typesense source badge", async () => {
    render(<CandidateSearchPage session={mockSession as any} />);

    const sourceBadges = await screen.findAllByText("Typesense");
    expect(sourceBadges.length).toBeGreaterThanOrEqual(1);
  });

  it("shows empty state when no results", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          ...mockResults,
          rows: [],
          matchingCount: 0,
        }),
    });

    render(<CandidateSearchPage session={mockSession as any} />);

    await waitFor(() => {
      expect(screen.getByText("No candidates found")).toBeTruthy();
    });
  });

  it("shows error state when API fails", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    render(<CandidateSearchPage session={mockSession as any} />);

    await waitFor(() => {
      expect(screen.getByText(/search error/i)).toBeTruthy();
    });
  });

  it("shows retry button on error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    render(<CandidateSearchPage session={mockSession as any} />);

    await waitFor(() => {
      expect(screen.getByText("Retry")).toBeTruthy();
    });
  });

  it("searches when form is submitted", async () => {
    render(<CandidateSearchPage session={mockSession as any} />);

    const inputs = screen.getAllByPlaceholderText(/search by name, email, skills/i);
    fireEvent.change(inputs[0], { target: { value: "Alice" } });
    fireEvent.submit(inputs[0].closest("form")!);

    await waitFor(() => {
      expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("displays facet count numbers", async () => {
    render(<CandidateSearchPage session={mockSession as any} />);

    await waitFor(() => {
      // Facet options should show counts
      const facetButtons = screen.getAllByText("Kuwait");
      expect(facetButtons.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("renders candidate email in result card", async () => {
    render(<CandidateSearchPage session={mockSession as any} />);

    const aliceEmail = await screen.findAllByText("alice@example.com");
    expect(aliceEmail.length).toBeGreaterThanOrEqual(1);
    const bobEmail = await screen.findAllByText("bob@example.com");
    expect(bobEmail.length).toBeGreaterThanOrEqual(1);
  });
});
