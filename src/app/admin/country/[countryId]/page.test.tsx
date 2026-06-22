import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

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

const mockCountry = {
  country_id: 1,
  country_name_en: "Kuwait",
  country_name_ar: "الكويت",
  country_nationality_name_en: "Kuwaiti",
  country_nationality_name_ar: "كويتي",
  iso: "KWT",
  emoji: "🇰🇼",
  country_code: 965,
  currency_code: "KWD",
};

const mockGetCountry = vi.fn();

vi.mock("./actions", () => ({
  getCountry: (...args: unknown[]) => mockGetCountry(...args),
}));

describe("AdminCountryDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders country detail with all fields", async () => {
    mockGetCountry.mockResolvedValue({ country: mockCountry });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ countryId: "1" }),
      }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Countries");
    expect(screen.getByTestId("title")).toHaveTextContent("🇰🇼 Kuwait");

    expect(screen.getByTestId("fact-Name (EN)")).toHaveTextContent("Kuwait");
    expect(screen.getByTestId("fact-Name (AR)")).toHaveTextContent("الكويت");
    expect(screen.getByTestId("fact-Nationality (EN)")).toHaveTextContent("Kuwaiti");
    expect(screen.getByTestId("fact-ISO Code")).toHaveTextContent("KWT");
    expect(screen.getByTestId("fact-Country Code")).toHaveTextContent("+965");
    expect(screen.getByTestId("fact-Currency")).toHaveTextContent("KWD");
  });

  it("renders null fields as em-dash", async () => {
    mockGetCountry.mockResolvedValue({
      country: {
        ...mockCountry,
        country_name_ar: null,
        country_nationality_name_ar: null,
        iso: null,
        country_code: null,
        currency_code: null,
      },
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ countryId: "2" }),
      }),
    );

    expect(screen.getByTestId("fact-Name (AR)")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-ISO Code")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Country Code")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Currency")).toHaveTextContent("—");
  });

  it("calls notFound when country is null", async () => {
    mockGetCountry.mockResolvedValue({ country: null });

    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ countryId: "999" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("calls notFound when countryId is NaN", async () => {
    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ countryId: "not-a-number" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
