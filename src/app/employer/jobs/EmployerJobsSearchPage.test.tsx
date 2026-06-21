import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import type { SessionUser } from "@/modules/auth/types";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(""),
}));

const mockAction = vi.fn();

import { EmployerJobsSearchPage } from "./EmployerJobsSearchPage";

const mockSession = {
  id: "42",
  name: "Test Employer",
  email: "employer@test.com",
  role: "company",
  issuedAt: Date.now(),
} as SessionUser;

function makeResult(overrides: Record<string, unknown> = {}) {
  return {
    query: "",
    page: 1,
    matchingCount: 2,
    rows: [
      {
        jobListingId: 1,
        title: "Software Engineer Intern",
        description: "Build cool stuff",
        location: "Remote",
        employmentType: "Full-time",
        salaryRange: "$50k-$70k",
        status: "active",
        companyName: "Acme Inc",
        createdAt: "2026-06-01",
      },
      {
        jobListingId: 2,
        title: "Data Science Intern",
        description: "Analyze data",
        location: "New York",
        employmentType: "Part-time",
        salaryRange: null,
        status: "draft",
        companyName: "Beta Corp",
        createdAt: "2026-06-15",
      },
    ],
    source: { current: "MySQL", target: "Typesense" },
    ...overrides,
  };
}

describe("EmployerJobsSearchPage shadcn", () => {
  beforeEach(() => {
    mockAction.mockResolvedValue(makeResult());
  });

  it("renders search input and button", () => {
    const html = renderToString(
      <EmployerJobsSearchPage
        session={mockSession}
        searchAction={mockAction}
      />,
    );

    // Should have an input with search placeholder
    expect(html).toContain("Search job postings by title");
    // Should have a submit button saying "Search"
    expect(html).toContain(">Search<");
  });

  it("renders shadcn Input component (uiInput class)", () => {
    const html = renderToString(
      <EmployerJobsSearchPage
        session={mockSession}
        searchAction={mockAction}
      />,
    );

    // shadcn Input adds the uiInput CSS class
    expect(html).toContain('class="uiInput');
  });

  it("renders shadcn Button component (uiButton class)", () => {
    const html = renderToString(
      <EmployerJobsSearchPage
        session={mockSession}
        searchAction={mockAction}
      />,
    );

    // shadcn Button adds the uiButton CSS class
    expect(html).toContain('class="uiButton');
  });

  it("renders job result cards with shadcn Card component", () => {
    const html = renderToString(
      <EmployerJobsSearchPage
        session={mockSession}
        initialData={makeResult()}
        searchAction={mockAction}
      />,
    );

    // Both job titles should appear
    expect(html).toContain("Software Engineer Intern");
    expect(html).toContain("Data Science Intern");
    // Result cards use shadcn Card (uiCard class)
    expect(html).toContain('class="uiCard');
  });

  it("renders status with shadcn Badge component", () => {
    const html = renderToString(
      <EmployerJobsSearchPage
        session={mockSession}
        initialData={makeResult()}
        searchAction={mockAction}
      />,
    );

    // Badges should have uiBadge class
    const badgeMatches = html.match(/class="[^"]*uiBadge[^"]*"/g);
    expect(badgeMatches).not.toBeNull();
    expect(badgeMatches!.length).toBeGreaterThanOrEqual(2);
  });

  it("renders source indicator as shadcn Badge", () => {
    const html = renderToString(
      <EmployerJobsSearchPage
        session={mockSession}
        initialData={makeResult()}
        searchAction={mockAction}
      />,
    );

    // The source badge shows "MySQL"
    expect(html).toContain("MySQL");
    // It should have the uiBadge class
    const sourceBadge = html.match(/uiBadge[^<]*MySQL/);
    expect(sourceBadge).not.toBeNull();
  });

  it("renders pagination with shadcn Button when multiple pages exist", () => {
    const html = renderToString(
      <EmployerJobsSearchPage
        session={mockSession}
        initialData={makeResult({ matchingCount: 40 })}
        searchAction={mockAction}
      />,
    );

    // Previous/Next should be buttons with uiButton
    expect(html).toContain(">Previous<");
    expect(html).toContain(">Next<");
    // Should have uiButton classes on pagination buttons
    const buttonCount = (html.match(/uiButton/g) || []).length;
    // At least the search button + Previous + Next + some page buttons
    expect(buttonCount).toBeGreaterThan(3);
  });
});
