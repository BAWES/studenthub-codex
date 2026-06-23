/**
 * Tests for CandidateSearchOS facet chip components.
 *
 * FacetChips renders quick inline facet controls for country, university,
 * skills, and company — clickable chips that filter results via URL params.
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, within, cleanup } from "@testing-library/react";
import { FacetChips, FacetGroup, QUICK_FACET_KEYS } from "./CandidateSearchOS";
import type { CandidateSearchFacet, CandidateSearchParams } from "./search";

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

describe("FacetGroup", () => {
  it("calls onNavigate with correct facet key when clicking an option", () => {
    const onNavigate = vi.fn();
    const facet = makeFacet("gender", "Gender", [
      makeActiveOption("Male", "male", 42, false),
      makeActiveOption("Female", "female", 30, false),
    ]);
    const { container } = render(
      <FacetGroup
        basePath="/admin/candidates"
        facet={facet}
        params={defaultParams}
        onNavigate={onNavigate}
      />,
    );

    const maleLink = container.querySelector('a[href*="gender=male"]')!;
    maleLink.click();

    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith({ gender: "male", candidate: "" });
  });

  it("removes facet when clicking an already-active option", () => {
    const onNavigate = vi.fn();
    const facet = makeFacet("country", "Country", [
      makeActiveOption("Kuwait", "1", 42, true),
    ]);
    render(
      <FacetGroup
        basePath="/admin/candidates"
        facet={facet}
        params={defaultParams}
        onNavigate={onNavigate}
      />,
    );

    const kuwaitLink = screen.getByRole("link", { name: /kuwait/i });
    kuwaitLink.click();

    // Clicking an active option removes it
    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith({ country: "", candidate: "" });
  });

  it("does not trigger full page navigation (prevents default)", () => {
    const onNavigate = vi.fn();
    const facet = makeFacet("skill", "Skills", [
      makeActiveOption("React", "react", 50, false),
    ]);
    render(
      <FacetGroup
        basePath="/admin/candidates"
        facet={facet}
        params={defaultParams}
        onNavigate={onNavigate}
      />,
    );

    const reactLink = screen.getByRole("link", { name: /react/i });
    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    const defaultPrevented = !reactLink.dispatchEvent(clickEvent);

    expect(defaultPrevented).toBe(true);
    expect(onNavigate).toHaveBeenCalledTimes(1);
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

    expect(screen.getByText("Country:")).toBeInTheDocument();
    expect(screen.getByText("Skills:")).toBeInTheDocument();
    expect(screen.getByText("Company:")).toBeInTheDocument();
    expect(screen.getByText("University:")).toBeInTheDocument();
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
    expect(kuwaitLink).toHaveClass("bg-primary");
    expect(kuwaitLink).toHaveClass("text-primary-foreground");

    const uaeLink = screen.getByRole("link", { name: /uae/i });
    expect(uaeLink).toHaveClass("bg-muted");
    expect(uaeLink).toHaveClass("text-muted-foreground");
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
    const onNavigate = vi.fn();
    const data = makeSearchDataFacets([
      makeFacet("country", "Country", [
        makeActiveOption("Kuwait", "1", 42, true),
      ]),
      makeFacet("skill", "Skills", [
        makeActiveOption("React", "react", 50, true),
      ]),
    ]);
    render(<FacetChips basePath="/admin/candidates" data={data as any} params={defaultParams} onNavigate={onNavigate} />);

    const clearAllLink = screen.getByRole("link", { name: /clear all/i });
    clearAllLink.click();

    // onNavigate is called with all filter reset params
    expect(onNavigate).toHaveBeenCalledTimes(1);
    const callArgs = onNavigate.mock.calls[0][0];
    expect(callArgs.q).toBe("");
  });
});
