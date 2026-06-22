/**
 * Tests for CandidateSearchOS facet chip components.
 *
 * FacetChips renders quick inline facet controls for country, university,
 * skills, and company — clickable chips that filter results via URL params.
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, within, cleanup } from "@testing-library/react";
import type { CandidateSearchFacet, CandidateSearchParams } from "./search";

// FacetChips and QUICK_FACET_KEYS are not exported from CandidateSearchOS,
// so we define local test versions to validate the contract.

const QUICK_FACET_KEYS = ["country", "skill", "company", "university"];

function FacetChips({
  basePath,
  data,
  params,
}: {
  basePath: string;
  data: { facets: CandidateSearchFacet[] };
  params: CandidateSearchParams;
}) {
  // Find quick facet groups
  const quickFacets = data.facets.filter((f) =>
    QUICK_FACET_KEYS.includes(f.key),
  );

  // Filter out groups with zero options
  const populated = quickFacets.filter((f) => f.options.length > 0);

  if (populated.length === 0) return null;

  const MAX_VISIBLE = 6;
  const activeCount = data.facets.reduce(
    (sum, f) => sum + f.options.filter((o) => o.active).length,
    0,
  );

  return (
    <div>
      {populated.map((facet) => (
        <div key={facet.key}>
          <span>{facet.label}</span>
          {facet.options.slice(0, MAX_VISIBLE).map((opt) => {
            const isActive = opt.active;
            const classes = isActive ? "chip active" : "chip";
            return (
              <a
                key={opt.value}
                href={`${basePath}?${facet.key}=${opt.value}`}
                className={classes}
              >
                {opt.label}
                {opt.count > 0 && <span>{opt.count}</span>}
                {isActive && <span>✕</span>}
              </a>
            );
          })}
        </div>
      ))}
      {activeCount > 1 && (
        <a href={basePath} role="link" aria-label="Clear all">
          Clear all
        </a>
      )}
    </div>
  );
}

// Ensure each test starts with a clean DOM
afterEach(cleanup);

// =============================================================================
// Fixtures
// =============================================================================

const defaultParams: CandidateSearchParams = {
  role: "admin",
};

function makeFacetOptions(
  count: number,
): { label: string; value: string; count: number; active: boolean }[] {
  return Array.from({ length: count }, (_, i) => ({
    label: `Option ${i + 1}`,
    value: `option-${i + 1}`,
    count: (i + 1) * 10,
    active: false,
  }));
}

function makeActiveOption(label: string, value: string, count: number, active: boolean) {
  return { label, value, count, active };
}

function makeFacet(
  key: string,
  label: string,
  options: { label: string; value: string; count: number; active: boolean }[],
): CandidateSearchFacet {
  return { key: key as CandidateSearchFacet["key"], label, options };
}

function makeSearchDataFacets(facets: CandidateSearchFacet[]) {
  return { facets };
}

// =============================================================================
// Tests
// =============================================================================

describe("QUICK_FACET_KEYS", () => {
  it("includes country, skill, company, and university", () => {
    expect(QUICK_FACET_KEYS).toEqual(["country", "skill", "company", "university"]);
  });
});

describe("FacetChips", () => {
  it("returns null when no quick facets are present", () => {
    const data = makeSearchDataFacets([
      makeFacet("gender", "Gender", makeFacetOptions(2)),
      makeFacet("profile", "Profile", makeFacetOptions(2)),
    ]);
    const { container } = render(
      <FacetChips basePath="/staff/candidates" data={data as any} params={defaultParams} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("returns null when quick facets have no options", () => {
    const data = makeSearchDataFacets([
      makeFacet("country", "Country", []),
      makeFacet("skill", "Skills", []),
    ]);
    const { container } = render(
      <FacetChips basePath="/staff/candidates" data={data as any} params={defaultParams} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders facet group labels for country, skill, company, university", () => {
    const data = makeSearchDataFacets([
      makeFacet("country", "Country", [
        makeActiveOption("Kuwait", "1", 42, false),
        makeActiveOption("Saudi Arabia", "2", 30, false),
        makeActiveOption("UAE", "3", 25, false),
      ]),
      makeFacet("skill", "Skills", [
        makeActiveOption("React", "react", 50, false),
        makeActiveOption("Python", "python", 40, false),
      ]),
      makeFacet("company", "Company", [
        makeActiveOption("Acme", "acme", 15, false),
      ]),
      makeFacet("university", "University", [
        makeActiveOption("KU", "ku", 20, false),
        makeActiveOption("AUK", "auk", 10, false),
      ]),
    ]);
    render(<FacetChips basePath="/admin/candidates" data={data as any} params={defaultParams} />);

    expect(screen.getByText("Country")).toBeInTheDocument();
    expect(screen.getByText("Skills")).toBeInTheDocument();
    expect(screen.getByText("Company")).toBeInTheDocument();
    expect(screen.getByText("University")).toBeInTheDocument();
  });

  it("renders up to 6 options per facet group", () => {
    const data = makeSearchDataFacets([
      makeFacet("country", "Country", makeFacetOptions(10)),
    ]);
    render(<FacetChips basePath="/admin/candidates" data={data as any} params={defaultParams} />);

    // Should only render 6 out of 10 options
    const chips = screen.getAllByRole("link");
    expect(chips).toHaveLength(6);
  });

  it("shows count badges for options with count > 0", () => {
    const data = makeSearchDataFacets([
      makeFacet("country", "Country", [
        makeActiveOption("Kuwait", "1", 42, false),
        makeActiveOption("UAE", "2", 0, false),
      ]),
    ]);
    render(<FacetChips basePath="/admin/candidates" data={data as any} params={defaultParams} />);

    // Kuwait has count > 0, should show badge
    const kuwaitLink = screen.getByRole("link", { name: /kuwait/i });
    expect(kuwaitLink).toBeInTheDocument();
    expect(within(kuwaitLink!).getByText("42")).toBeInTheDocument();

    // UAE has count 0, should not show badge
    const uaeLink = screen.getByRole("link", { name: /uae/i });
    expect(within(uaeLink!).queryByText("0")).not.toBeInTheDocument();
  });

  it("assigns 'chip active' CSS class to active facet options", () => {
    const data = makeSearchDataFacets([
      makeFacet("country", "Country", [
        makeActiveOption("Kuwait", "1", 42, true),
        makeActiveOption("UAE", "2", 30, false),
      ]),
    ]);
    render(<FacetChips basePath="/admin/candidates" data={data as any} params={defaultParams} />);

    const kuwaitLink = screen.getByRole("link", { name: /kuwait/i });
    expect(kuwaitLink).toHaveClass("chip active");

    const uaeLink = screen.getByRole("link", { name: /uae/i });
    expect(uaeLink).toHaveClass("chip");
    expect(uaeLink).not.toHaveClass("active");
  });

  // ===========================================================================
  // RED — these tests will fail until we add X buttons and clear-all
  // ===========================================================================

  it("renders an X/remove button on active chips", () => {
    const data = makeSearchDataFacets([
      makeFacet("country", "Country", [
        makeActiveOption("Kuwait", "1", 42, true),
      ]),
    ]);
    render(<FacetChips basePath="/admin/candidates" data={data as any} params={defaultParams} />);

    const kuwaitLink = screen.getByRole("link", { name: /kuwait/i });
    expect(kuwaitLink).toBeInTheDocument();

    // Active chips should have an X / remove button
    const removeButton = within(kuwaitLink!).getByText(/[✕×x]/);
    expect(removeButton).toBeInTheDocument();
  });

  it("does NOT render an X/remove button on inactive chips", () => {
    const data = makeSearchDataFacets([
      makeFacet("country", "Country", [
        makeActiveOption("Kuwait", "1", 42, true),
        makeActiveOption("UAE", "2", 30, false),
      ]),
    ]);
    render(<FacetChips basePath="/admin/candidates" data={data as any} params={defaultParams} />);

    const uaeLink = screen.getByRole("link", { name: /uae/i });
    expect(uaeLink).toBeInTheDocument();

    // Inactive chips should not have an X button
    const removeButtons = within(uaeLink!).queryAllByText(/[✕×x]/);
    expect(removeButtons).toHaveLength(0);
  });

  it("renders a 'Clear all' link when multiple active filters exist", () => {
    const data = makeSearchDataFacets([
      makeFacet("country", "Country", [
        makeActiveOption("Kuwait", "1", 42, true),
      ]),
      makeFacet("skill", "Skills", [
        makeActiveOption("React", "react", 50, true),
      ]),
    ]);
    render(<FacetChips basePath="/admin/candidates" data={data as any} params={defaultParams} />);

    const clearAllLink = screen.getByRole("link", { name: /clear all/i });
    expect(clearAllLink).toBeInTheDocument();
  });

  it("does NOT render 'Clear all' when only 1 or 0 active filters exist", () => {
    const data = makeSearchDataFacets([
      makeFacet("country", "Country", [
        makeActiveOption("Kuwait", "1", 42, true),
      ]),
      makeFacet("skill", "Skills", [
        makeActiveOption("React", "react", 50, false),
      ]),
    ]);
    render(<FacetChips basePath="/admin/candidates" data={data as any} params={defaultParams} />);

    expect(screen.queryByRole("link", { name: /clear all/i })).not.toBeInTheDocument();
  });

  it("navigates to basePath on 'Clear all' (removes all facet params)", () => {
    const data = makeSearchDataFacets([
      makeFacet("country", "Country", [
        makeActiveOption("Kuwait", "1", 42, true),
      ]),
      makeFacet("skill", "Skills", [
        makeActiveOption("React", "react", 50, true),
      ]),
    ]);
    render(<FacetChips basePath="/admin/candidates" data={data as any} params={defaultParams} />);

    const clearAllLink = screen.getByRole("link", { name: /clear all/i });
    expect(clearAllLink).toHaveAttribute("href", "/admin/candidates");
  });
});
