import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

// Mock dependencies
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({ user: { id: "42" }, role: "candidate" }),
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
          {typeof f.value === "string" ? f.value : "node"}
        </span>
      ))}
    </div>
  ),
}));

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

const mockGetLanguageEntry = vi.fn();

vi.mock("./actions", () => ({
  getLanguageEntry: (...args: unknown[]) => mockGetLanguageEntry(...args),
}));

const sampleLanguage = {
  candidate_language_id: 1,
  language: "English",
  proficiency: "fluent",
  candidate_language_created_at: new Date("2024-01-15"),
};

describe("CandidateLanguageDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders language detail for a populated entry", async () => {
    mockGetLanguageEntry.mockResolvedValue(sampleLanguage);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "1" }),
      }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Candidate / Languages");
    expect(screen.getByTestId("title")).toHaveTextContent("English");

    // Metrics - proficiency is capitalized
    expect(screen.getByTestId("metric-Proficiency")).toHaveTextContent("Fluent");
    expect(screen.getByTestId("metric-Added")).toHaveTextContent("Jan 15, 2024");

    // Detail fields
    expect(screen.getByTestId("fact-Language")).toHaveTextContent("English");
    expect(screen.getByTestId("fact-Proficiency")).toHaveTextContent("Fluent");
  });

  it("renders language detail with null created_at", async () => {
    mockGetLanguageEntry.mockResolvedValue({
      ...sampleLanguage,
      candidate_language_created_at: null,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "1" }),
      }),
    );

    expect(screen.getByTestId("metric-Added")).toHaveTextContent("N/A");
    expect(screen.getByTestId("fact-Added")).toHaveTextContent("N/A");
  });

  it("calls notFound when language entry is null", async () => {
    mockGetLanguageEntry.mockResolvedValue(null);

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "999" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
