import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

// Mock the dependencies
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi
    .fn()
    .mockResolvedValue({ user: { id: "1" }, role: "company" }),
  requireCapability: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/modules/workspace/ErrorBoundary", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
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
          {String(f.value)}
        </span>
      ))}
    </div>
  ),
}));

const mockContact = {
  company_contact_uuid: "contact-123",
  contact_uuid: "uuid-abc",
  company_id: 42,
  contact_position: "CEO",
  allow_access: true,
  created_at: new Date("2024-01-15T10:00:00.000Z"),
  updated_at: new Date("2024-06-01T14:30:00.000Z"),
  contact_name: "Alice Johnson",
  contact_email: "alice@example.com",
  company_name: "Acme Corp",
};

const mockGetCompanyContact = vi.fn();

vi.mock("./actions", () => ({
  getCompanyContact: (...args: unknown[]) => mockGetCompanyContact(...args),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

describe("CompanyContactDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders contact detail with all fields", async () => {
    mockGetCompanyContact.mockResolvedValue(mockContact);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ contactUuid: "contact-123" }),
      }),
    );

    // Check workspace shell
    expect(screen.getByTestId("eyebrow")).toHaveTextContent(
      "Company / Contacts",
    );
    expect(screen.getByTestId("title")).toHaveTextContent("Alice Johnson");

    // Check detail fields
    expect(screen.getByTestId("fact-UUID")).toHaveTextContent("contact-123");
    expect(screen.getByTestId("fact-Name")).toHaveTextContent("Alice Johnson");
    expect(screen.getByTestId("fact-Email")).toHaveTextContent(
      "alice@example.com",
    );
    expect(screen.getByTestId("fact-Position")).toHaveTextContent("CEO");
    expect(screen.getByTestId("fact-Company")).toHaveTextContent("Acme Corp");
    expect(screen.getByTestId("fact-Allow Access")).toHaveTextContent("Yes");
    expect(screen.getByTestId("fact-Created")).toHaveTextContent("2024-01-15");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("2024-06-01");

    // Check back button
    expect(screen.getByText("Back to Contacts")).toBeInTheDocument();
  });

  it("renders with null optional fields as em-dash", async () => {
    mockGetCompanyContact.mockResolvedValue({
      ...mockContact,
      contact_name: null,
      contact_email: null,
      contact_position: null,
      company_name: null,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ contactUuid: "contact-null" }),
      }),
    );

    expect(screen.getByTestId("fact-Name")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Email")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Position")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Company")).toHaveTextContent("—");
  });

  it("renders Allow Access as No when false", async () => {
    mockGetCompanyContact.mockResolvedValue({
      ...mockContact,
      allow_access: false,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ contactUuid: "contact-no-access" }),
      }),
    );

    expect(screen.getByTestId("fact-Allow Access")).toHaveTextContent("No");
  });

  it("renders Allow Access as em-dash when null", async () => {
    mockGetCompanyContact.mockResolvedValue({
      ...mockContact,
      allow_access: null,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ contactUuid: "contact-null-access" }),
      }),
    );

    expect(screen.getByTestId("fact-Allow Access")).toHaveTextContent("—");
  });

  it("renders with null timestamps as em-dash", async () => {
    mockGetCompanyContact.mockResolvedValue({
      ...mockContact,
      created_at: null,
      updated_at: null,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ contactUuid: "contact-no-dates" }),
      }),
    );

    expect(screen.getByTestId("fact-Created")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Updated")).toHaveTextContent("—");
  });

  it("calls notFound when contact data is null", async () => {
    mockGetCompanyContact.mockResolvedValue(null);

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ contactUuid: "nonexistent" }) }),
    ).rejects.toThrow();

    expect(notFound).toHaveBeenCalled();
  });

  it("renders title fallback when contact_name is null", async () => {
    mockGetCompanyContact.mockResolvedValue({
      ...mockContact,
      contact_name: null,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ contactUuid: "contact-no-name" }),
      }),
    );

    expect(screen.getByTestId("title")).toHaveTextContent("Contact Detail");
  });
});
