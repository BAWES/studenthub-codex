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
  company_contact_uuid: "cc_abc123",
  contact_uuid: "contact_uuid_1",
  company_id: 1,
  contact_position: "CEO",
  allow_access: true,
  created_at: new Date("2024-03-01T10:00:00.000Z"),
  updated_at: new Date("2024-03-15T14:30:00.000Z"),
  contact_name: "John Smith",
  contact_email: "john@acme.com",
  company_name: "Acme Corp",
};

const mockGetCompanyContact = vi.fn();

vi.mock("./actions", () => ({
  getCompanyContact: (...args: unknown[]) => mockGetCompanyContact(...args),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    variant,
  }: {
    children: React.ReactNode;
    variant: string;
  }) => <button data-variant={variant}>{children}</button>,
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
        params: Promise.resolve({ contactUuid: "cc_abc123" }),
      }),
    );

    // Check workspace shell
    expect(screen.getByTestId("eyebrow")).toHaveTextContent(
      "Company / Contacts",
    );
    expect(screen.getByTestId("title")).toHaveTextContent("John Smith");

    // Check detail fields
    expect(screen.getByTestId("fact-Name")).toHaveTextContent("John Smith");
    expect(screen.getByTestId("fact-Email")).toHaveTextContent("john@acme.com");
    expect(screen.getByTestId("fact-Position")).toHaveTextContent("CEO");
    expect(screen.getByTestId("fact-Company")).toHaveTextContent("Acme Corp");
    expect(screen.getByTestId("fact-Allow Access")).toHaveTextContent("Yes");

    // Check back button
    expect(screen.getByText("Back to Contacts")).toBeInTheDocument();
  });

  it("displays No when allow_access is false", async () => {
    mockGetCompanyContact.mockResolvedValue({
      ...mockContact,
      allow_access: false,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ contactUuid: "cc_no_access" }),
      }),
    );

    expect(screen.getByTestId("fact-Allow Access")).toHaveTextContent("No");
  });

  it("displays em-dash when allow_access is null", async () => {
    mockGetCompanyContact.mockResolvedValue({
      ...mockContact,
      allow_access: null,
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ contactUuid: "cc_null_access" }),
      }),
    );

    expect(screen.getByTestId("fact-Allow Access")).toHaveTextContent("—");
  });

  it("renders with null fields as em-dash", async () => {
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
        params: Promise.resolve({ contactUuid: "cc_null_fields" }),
      }),
    );

    expect(screen.getByTestId("title")).toHaveTextContent("Contact Detail");
    expect(screen.getByTestId("fact-Name")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Email")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Position")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Company")).toHaveTextContent("—");
  });

  it("calls notFound when data is null", async () => {
    mockGetCompanyContact.mockResolvedValue(null);

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ contactUuid: "nonexistent" }) }),
    ).rejects.toThrow();

    expect(notFound).toHaveBeenCalled();
  });
});
