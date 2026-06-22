// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import React from "react";
import { CompanySearchPage } from "./CompanySearchPage";
import type { SessionUser } from "@/modules/auth/types";

afterEach(cleanup);

// ─── Mock navigation ───────────────────────────────────────────────────

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// ─── Fixtures ──────────────────────────────────────────────────────────

const mockSession = { id: "user-123" } as SessionUser;

// The mock search action returns this result so the auto-search on mount
// doesn't override initialData with an empty result.
const sampleResult = {
  query: "acme",
  page: 1,
  matchingCount: 1,
  rows: [
    {
      id: 1,
      name: "Acme Corp",
      email: "acme@example.com",
      status: "Approved",
      type: "company" as const,
      subtitle: "Kuwait",
      meta: "5.000 KWD",
      href: "/company/companies/1",
    },
  ],
  facets: [
    {
      key: "type",
      label: "Type",
      options: [
        { label: "All", value: "all", count: 1, active: false },
        { label: "Companies", value: "companies", count: 1, active: false },
      ],
    },
  ],
};

const mockSearchAction = vi.fn().mockResolvedValue(sampleResult);

// ─── Tests ─────────────────────────────────────────────────────────────

describe("CompanySearchPage — UX", () => {
  it("renders the search form with an input and submit button", () => {
    render(
      React.createElement(CompanySearchPage, {
        session: mockSession,
        searchAction: mockSearchAction,
      }),
    );
    const input = screen.getByPlaceholderText(/search/i) as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.placeholder).toMatch(/search/i);
    expect(screen.getByRole("button", { name: /search/i })).toBeTruthy();
  });

  it("renders result count when initialData is provided", async () => {
    render(
      React.createElement(CompanySearchPage, {
        session: mockSession,
        initialData: sampleResult,
        searchAction: mockSearchAction,
      }),
    );
    await waitFor(() => {
      expect(screen.getByText(/1 result/i)).toBeTruthy();
    });
  });

  it("shows entity names from initialData in result cards", async () => {
    render(
      React.createElement(CompanySearchPage, {
        session: mockSession,
        initialData: sampleResult,
        searchAction: mockSearchAction,
      }),
    );
    // The entity name is rendered in an h3
    await waitFor(() => {
      expect(screen.getByText("Acme Corp")).toBeTruthy();
    });
  });

  it("renders the Type facet section heading", async () => {
    render(
      React.createElement(CompanySearchPage, {
        session: mockSession,
        initialData: sampleResult,
        searchAction: mockSearchAction,
      }),
    );
    await waitFor(() => {
      expect(screen.getByText("Type")).toBeTruthy();
    });
  });

  it("renders facet buttons after auto-search resolves", async () => {
    render(
      React.createElement(CompanySearchPage, {
        session: mockSession,
        initialData: sampleResult,
        searchAction: mockSearchAction,
      }),
    );
    await waitFor(() => {
      expect(screen.getByText(/Companies/)).toBeTruthy();
    });
  });
});
