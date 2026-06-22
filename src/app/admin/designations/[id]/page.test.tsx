import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

// Mock dependencies
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({ user: { id: "1" }, role: "admin" }),
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
          {String(m.value)}
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
          {String(f.value)}
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

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

const mockDesignation = {
  designation_uuid: "desig_uuid_abc",
  designation_name_en: "Senior Engineer",
  designation_name_ar: "مهندس أول",
  designation_created_at: new Date("2024-02-01T10:00:00.000Z"),
  designation_updated_at: new Date("2024-05-15T14:00:00.000Z"),
};

const mockGetDesignation = vi.fn();

vi.mock("./actions", () => ({
  getDesignation: (...args: unknown[]) => mockGetDesignation(...args),
}));

describe("AdminDesignationDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders designation detail with all fields", async () => {
    mockGetDesignation.mockResolvedValue({ designation: mockDesignation });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "desig_uuid_abc" }),
      }),
    );

    // Check workspace shell
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Designations");
    expect(screen.getByTestId("title")).toHaveTextContent("Senior Engineer");

    // Check detail fields
    expect(screen.getByTestId("fact-Name (EN)")).toHaveTextContent("Senior Engineer");
    expect(screen.getByTestId("fact-Name (AR)")).toHaveTextContent("مهندس أول");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2024-02-01");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("2024-05-15");
  });

  it("renders null Arabic name as em-dash", async () => {
    mockGetDesignation.mockResolvedValue({
      designation: {
        ...mockDesignation,
        designation_name_ar: null,
        designation_created_at: null,
        designation_updated_at: null,
      },
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "desig_null" }),
      }),
    );

    expect(screen.getByTestId("fact-Name (AR)")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("—");
  });

  it("calls notFound when designation is null", async () => {
    mockGetDesignation.mockResolvedValue({ designation: null });

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "nonexistent" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
