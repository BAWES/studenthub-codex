import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

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

const mockSettings = {
  company_id: 1,
  company_name: "StudentHub Inc.",
  company_common_name_en: "StudentHub",
  company_common_name_ar: "ستودنت هب",
  company_description_en: "An education platform",
  company_description_ar: "منصة تعليمية",
  company_website: "https://studenthub.co",
  company_email: "info@studenthub.co",
  company_hourly_rate: 15.5,
  company_bonus_commission: 500,
  company_followup: true,
  company_followup_interval_weeks: 2,
  company_approved_to_hire: true,
  currency_code: "KWD",
  currency_name: "Kuwaiti Dinar",
  currency_id: 1,
};

const mockGetAdminCompanySettings = vi.fn();

vi.mock("@/app/admin/company-settings/actions", () => ({
  getAdminCompanySettings: (...args: unknown[]) => mockGetAdminCompanySettings(...args),
}));

vi.mock("./_components/admin-company-settings-edit-form", () => ({
  AdminCompanySettingsEditForm: ({ settings }: { settings: unknown }) => (
    <div data-testid="edit-form">Edit Form for {JSON.stringify(settings)}</div>
  ),
}));

describe("AdminCompanySettingsDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders company settings detail with all fields", async () => {
    mockGetAdminCompanySettings.mockResolvedValue(mockSettings);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "1" }),
      }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Company Settings");
    expect(screen.getByTestId("title")).toHaveTextContent("StudentHub Inc.");

    expect(screen.getByTestId("metric-Company ID")).toHaveTextContent("1");
    expect(screen.getByTestId("metric-Currency")).toHaveTextContent("KWD");

    expect(screen.getByTestId("fact-Company name")).toHaveTextContent("StudentHub Inc.");
    expect(screen.getByTestId("fact-Common name (EN)")).toHaveTextContent("StudentHub");
    expect(screen.getByTestId("fact-Common name (AR)")).toHaveTextContent("ستودنت هب");
    expect(screen.getByTestId("fact-Description (EN)")).toHaveTextContent("An education platform");
    expect(screen.getByTestId("fact-Description (AR)")).toHaveTextContent("منصة تعليمية");
    expect(screen.getByTestId("fact-Website")).toHaveTextContent("https://studenthub.co");
    expect(screen.getByTestId("fact-Email")).toHaveTextContent("info@studenthub.co");
    expect(screen.getByTestId("fact-Hourly rate")).toHaveTextContent("15.5");
    expect(screen.getByTestId("fact-Bonus commission")).toHaveTextContent("500");
    expect(screen.getByTestId("fact-Followup")).toHaveTextContent("Yes");
    expect(screen.getByTestId("fact-Followup interval (weeks)")).toHaveTextContent("2");
    expect(screen.getByTestId("fact-Approved to hire")).toHaveTextContent("Yes");
    expect(screen.getByTestId("edit-form")).toBeInTheDocument();
  });

  it("renders null/missing fields as em-dash and No", async () => {
    mockGetAdminCompanySettings.mockResolvedValue({
      ...mockSettings,
      company_name: null,
      company_common_name_en: null,
      company_common_name_ar: null,
      company_description_en: null,
      company_description_ar: null,
      company_website: null,
      company_email: null,
      company_hourly_rate: null,
      company_bonus_commission: null,
      company_followup: false,
      company_followup_interval_weeks: null,
      company_approved_to_hire: false,
      currency_code: null,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "1" }),
      }),
    );

    expect(screen.getByTestId("title")).toHaveTextContent("Company #1");
    expect(screen.getByTestId("metric-Currency")).toHaveTextContent("—");

    expect(screen.getByTestId("fact-Company name")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Followup")).toHaveTextContent("No");
    expect(screen.getByTestId("fact-Approved to hire")).toHaveTextContent("No");
  });

  it("calls notFound when settings is null", async () => {
    mockGetAdminCompanySettings.mockResolvedValue(null);

    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ id: "999" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
