// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CandidateCombobox } from "../candidate-combobox";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockResults = {
  rows: [
    {
      id: 42,
      uid: "C-001",
      name: "Ahmed Al-Sabah",
      email: "ahmed@example.com",
      phone: "+965 5555 1234",
      status: "Active",
      signal: "Ready",
      country: "Kuwait",
      university: "Kuwait University",
      company: "No company",
      store: "No store",
      rate: "5.500 KWD",
      updated: "Jun 10, 2026",
      flags: [],
      skills: ["JavaScript", "React"],
      score: 6,
    },
    {
      id: 7,
      uid: "C-002",
      name: "Fatima Noor",
      email: "fatima@example.com",
      phone: "+965 5555 5678",
      status: "Active",
      signal: "Ready",
      country: "Kuwait",
      university: "GUST",
      company: "No company",
      store: "No store",
      rate: "4.200 KWD",
      updated: "Jun 9, 2026",
      flags: [],
      skills: ["Python"],
      score: 4,
    },
  ],
  matchingCount: 2,
  source: { current: "Typesense", target: "Typesense", note: "" },
  metrics: [],
  facets: [],
  selected: null,
  selectedActions: [],
  openTabs: [],
  selectedId: null,
  selectedBlocked: false,
  assignedCount: null,
  params: {},
  role: "admin",
  query: "ahmed",
  filter: "all",
  visibility: "all",
  page: 1,
  totalPages: 1,
};

let fetchMock: ReturnType<typeof vi.fn>;

const mockRouterPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CandidateCombobox", () => {
  it("renders the trigger button with placeholder text", () => {
    render(<CandidateCombobox basePath="/admin/candidates" />);

    const trigger = screen.getByRole("combobox", { name: /search candidates/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent(/search candidates/i);
  });

  it("opens the popover and shows search input on click", async () => {
    const user = userEvent.setup();
    render(<CandidateCombobox basePath="/admin/candidates" />);

    const trigger = screen.getByRole("combobox", { name: /search candidates/i });
    await user.click(trigger);

    // The CommandInput should be visible
    const searchInput = screen.getByPlaceholderText("Search candidates...");
    expect(searchInput).toBeInTheDocument();
  });

  it("calls the search API when user types with debounce", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResults),
    });

    render(<CandidateCombobox basePath="/admin/candidates" />);

    // Open the popover
    await user.click(screen.getByRole("combobox", { name: /search candidates/i }));
    const searchInput = screen.getByPlaceholderText("Search candidates...");

    // Type a search query
    await user.type(searchInput, "ahmed");

    // Wait for debounce (300ms) + fetch
    await waitFor(
      () => {
        const url = fetchMock.mock.calls[0]?.[0];
        expect(url).toContain("/api/candidates/search");
        expect(url).toContain("q=ahmed");
      },
      { timeout: 1000 },
    );
  });

  it("displays search results from the API", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResults),
    });

    render(<CandidateCombobox basePath="/admin/candidates" />);

    await user.click(screen.getByRole("combobox", { name: /search candidates/i }));
    const searchInput = screen.getByPlaceholderText("Search candidates...");
    await user.type(searchInput, "ahmed");

    // Wait for results to appear
    await waitFor(
      () => {
        expect(screen.getByText("Ahmed Al-Sabah")).toBeInTheDocument();
      },
      { timeout: 1000 },
    );

    expect(screen.getByText(/ahmed@example\.com/)).toBeInTheDocument();
    expect(screen.getByText("Fatima Noor")).toBeInTheDocument();
  });

  it("shows 'No results' when API returns empty", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          ...mockResults,
          rows: [],
          matchingCount: 0,
        }),
    });

    render(<CandidateCombobox basePath="/admin/candidates" />);

    await user.click(screen.getByRole("combobox", { name: /search candidates/i }));
    const searchInput = screen.getByPlaceholderText("Search candidates...");
    await user.type(searchInput, "zzzz");

    await waitFor(
      () => {
        expect(screen.getByText("No candidates found")).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });

  it("navigates to candidate detail on selection", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResults),
    });

    render(<CandidateCombobox basePath="/admin/candidates" />);

    await user.click(screen.getByRole("combobox", { name: /search candidates/i }));
    const searchInput = screen.getByPlaceholderText("Search candidates...");
    await user.type(searchInput, "ahmed");

    // Wait for results
    const candidateItem = await screen.findByText("Ahmed Al-Sabah");
    await user.click(candidateItem);

    expect(mockRouterPush).toHaveBeenCalledWith("/admin/candidates/42");
  });

  it("constructs correct path for staff basePath", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResults),
    });

    render(<CandidateCombobox basePath="/staff/candidates" />);

    await user.click(screen.getByRole("combobox", { name: /search candidates/i }));
    const searchInput = screen.getByPlaceholderText("Search candidates...");
    await user.type(searchInput, "fatima");

    const candidateItem = await screen.findByText("Fatima Noor");
    await user.click(candidateItem);

    expect(mockRouterPush).toHaveBeenCalledWith("/staff/candidates/7");
  });

  it("shows candidate status badge next to each result", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResults),
    });

    render(<CandidateCombobox basePath="/admin/candidates" />);

    await user.click(screen.getByRole("combobox", { name: /search candidates/i }));
    const searchInput = screen.getByPlaceholderText("Search candidates...");
    await user.type(searchInput, "ahmed");

    await waitFor(
      () => {
        const badges = screen.getAllByText("Active");
        expect(badges.length).toBeGreaterThanOrEqual(1);
      },
      { timeout: 1000 },
    );
  });

  it("shows skills tags for each candidate", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResults),
    });

    render(<CandidateCombobox basePath="/admin/candidates" />);

    await user.click(screen.getByRole("combobox", { name: /search candidates/i }));
    const searchInput = screen.getByPlaceholderText("Search candidates...");
    await user.type(searchInput, "ahmed");

    await waitFor(
      () => {
        expect(screen.getByText("JavaScript")).toBeInTheDocument();
        expect(screen.getByText("React")).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });
});
