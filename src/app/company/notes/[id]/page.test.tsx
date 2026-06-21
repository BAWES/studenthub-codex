import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({
    user: { id: "42" },
    role: "company",
  }),
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

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date | null) => (d ? d.toISOString().split("T")[0] : "N/A"),
}));

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
  useRouter: () => ({ push: vi.fn() }),
}));

const mockGetNoteEntry = vi.fn();

vi.mock("./actions", () => ({
  getNoteEntry: (...args: unknown[]) => mockGetNoteEntry(...args),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const fullNoteItem = {
  note_uuid: "note-uuid-1",
  company_id: 1,
  request_uuid: null,
  story_uuid: null,
  note_type: "general",
  note_text: "Followed up with the client about the new requirements.",
  created_by: 10,
  updated_by: 10,
  note_created_datetime: new Date("2025-01-15T10:00:00Z"),
  note_updated_datetime: new Date("2025-01-16T14:30:00Z"),
  staff_created: { staff_name: "Alice" },
  staff_updated: { staff_name: "Alice" },
};

const nullStaffNoteItem = {
  note_uuid: "note-uuid-2",
  company_id: 1,
  request_uuid: null,
  story_uuid: null,
  note_type: null,
  note_text: null,
  created_by: null,
  updated_by: null,
  note_created_datetime: null,
  note_updated_datetime: null,
  staff_created: null,
  staff_updated: null,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CompanyNoteDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders note detail with full staff info", async () => {
    mockGetNoteEntry.mockResolvedValue(fullNoteItem);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "note-uuid-1" }),
      }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Company / Note");
    expect(screen.getByTestId("title")).toHaveTextContent("general");

    // Detail fields
    expect(screen.getByTestId("section-title")).toHaveTextContent("Note Details");
    expect(screen.getByTestId("fact-Type")).toHaveTextContent("general");
    expect(screen.getByTestId("fact-Content")).toHaveTextContent(
      "Followed up with the client about the new requirements.",
    );
    expect(screen.getByTestId("fact-Created by")).toHaveTextContent("Alice");
    expect(screen.getByTestId("fact-Updated by")).toHaveTextContent("Alice");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2025-01-15");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("2025-01-16");
  });

  it("renders note detail with null fields handled gracefully", async () => {
    mockGetNoteEntry.mockResolvedValue(nullStaffNoteItem);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "note-uuid-2" }),
      }),
    );

    expect(screen.getByTestId("title")).toHaveTextContent("Note"); // fallback when note_type is null
    expect(screen.getByTestId("fact-Type")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Content")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Created by")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Updated by")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("N/A");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("N/A");
  });

  it("calls getNoteEntry with the UUID from params", async () => {
    mockGetNoteEntry.mockResolvedValue(fullNoteItem);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "custom-note-id" }),
      }),
    );

    expect(mockGetNoteEntry).toHaveBeenCalledWith("custom-note-id");
  });

  it("calls notFound when note is null", async () => {
    mockGetNoteEntry.mockResolvedValue(null);

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
