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
    facts?: { label: string; value: string | React.ReactNode }[];
  }) => (
    <div data-testid="detail-section">
      <div data-testid="section-title">{title}</div>
      {facts?.map((f) => (
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
  useRouter: () => ({ refresh: vi.fn() }),
}));

const mockListSettings = vi.fn();
vi.mock("@/app/admin/company-settings/actions", () => ({
  listAdminCompanySettings: (...args: unknown[]) => mockListSettings(...args),
  getAdminCompanySettings: vi.fn(),
  updateAdminCompanySettings: vi.fn(),
}));

vi.mock("./[id]/_components/admin-company-settings-edit-form", () => ({
  AdminCompanySettingsEditForm: () => <div data-testid="edit-form" />,
}));

const mockSettings = {
  company_id: 1,
  company_name: "Acme Corp",
  company_common_name_en: "Acme",
  company_common_name_ar: null,
  company_description_en: "A company",
  company_description_ar: null,
  company_website: "https://acme.com",
  company_email: "info@acme.com",
  company_hourly_rate: 50,
  company_bonus_commission: 10,
  company_followup: true,
  company_followup_interval_weeks: 4,
  company_approved_to_hire: true,
  currency_code: "KWD",
};

describe("AdminCompanySettingsListPage", () => {
  const mockItems = [
    mockSettings,
    {
      ...mockSettings,
      company_id: 2,
      company_name: "Beta Corp",
      company_email: "info@beta.com",
      company_hourly_rate: null,
      company_approved_to_hire: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders list with company names and metrics", async () => {
    mockListSettings.mockResolvedValue({ items: mockItems });

    const { AdminCompanySettingsTable } = await import("./_components");

    render(<AdminCompanySettingsTable session={{ user: { id: "1" } } as any} items={mockItems} />);

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin");
    expect(screen.getByTestId("title")).toHaveTextContent("Company Settings");
    expect(screen.getByTestId("metric-Total companies")).toHaveTextContent("2");
  });
});

describe("AdminCompanySettingsDetailPage", () => {
  const mockGetSettings = vi.fn();
  let Page: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Re-mock the getAdminCompanySettings import
    const actions = await import("@/app/admin/company-settings/actions");
    vi.mocked(actions.getAdminCompanySettings).mockImplementation((...args) => mockGetSettings(...args));
  });

  afterEach(() => {
    cleanup();
  });

  it("renders detail page with all settings fields", async () => {
    mockGetSettings.mockResolvedValue(mockSettings);

    Page = (await import("./[id]/page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "1" }),
      }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Company Settings");
    expect(screen.getByTestId("title")).toHaveTextContent("Acme Corp");
    expect(screen.getByTestId("fact-Email")).toHaveTextContent("info@acme.com");
    expect(screen.getByTestId("fact-Hourly rate")).toHaveTextContent("50");
    expect(screen.getByTestId("fact-Approved to hire")).toHaveTextContent("Yes");
  });

  it("returns notFound when settings are null", async () => {
    mockGetSettings.mockResolvedValue(null);

    Page = (await import("./[id]/page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "999" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
