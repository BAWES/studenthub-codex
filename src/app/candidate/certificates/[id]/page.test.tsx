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

const mockGetCertificate = vi.fn();

vi.mock("./actions", () => ({
  getCertificate: (...args: unknown[]) => mockGetCertificate(...args),
}));

const sampleCertificate = {
  certificate_uuid: "cert-uuid-123",
  certificate_type: true,
  certificate_title: "AWS Solutions Architect",
  certificate_issuer: "Amazon Web Services",
  certificate_url: "https://example.com/cert",
  candidate_id: 42,
  candidate_work_history_id: null,
  exam_uuid: null,
  store_id: null,
  company_id: null,
  parent_company_id: null,
  start_date: "2024-01-15",
  end_date: "2027-01-15",
  staff_id: null,
  created_at: new Date("2024-01-15"),
  updated_at: new Date("2024-01-15"),
};

const nullCertificate = {
  certificate_uuid: "cert-uuid-456",
  certificate_type: false,
  certificate_title: null,
  certificate_issuer: null,
  certificate_url: null,
  candidate_id: 42,
  candidate_work_history_id: null,
  exam_uuid: null,
  store_id: null,
  company_id: null,
  parent_company_id: null,
  start_date: null,
  end_date: null,
  staff_id: null,
  created_at: null,
  updated_at: null,
};

describe("CandidateCertificateDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders certificate detail for a populated certificate", async () => {
    mockGetCertificate.mockResolvedValue(sampleCertificate);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "cert-uuid-123" }),
      }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Candidate / Certificates");
    expect(screen.getByTestId("title")).toHaveTextContent("AWS Solutions Architect");

    // Metrics
    expect(screen.getByTestId("metric-Title")).toHaveTextContent("AWS Solutions Architect");
    expect(screen.getByTestId("metric-Issuer")).toHaveTextContent("Amazon Web Services");
    expect(screen.getByTestId("metric-Period")).toHaveTextContent("Jan 15, 2024 – Jan 15, 2027");

    // Detail fields
    expect(screen.getByTestId("fact-Title")).toHaveTextContent("AWS Solutions Architect");
    expect(screen.getByTestId("fact-Issuer")).toHaveTextContent("Amazon Web Services");
    expect(screen.getByTestId("fact-URL")).toHaveTextContent(sampleCertificate.certificate_url);

    // Back button
    expect(screen.getByText("Back to Certificates")).toBeInTheDocument();
  });

  it("renders certificate detail with null values gracefully", async () => {
    mockGetCertificate.mockResolvedValue(nullCertificate);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "cert-uuid-456" }),
      }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Candidate / Certificates");
    expect(screen.getByTestId("title")).toHaveTextContent("Certificate");

    // Metrics show em-dash for missing values
    expect(screen.getByTestId("metric-Title")).toHaveTextContent("—");
    expect(screen.getByTestId("metric-Issuer")).toHaveTextContent("—");
    expect(screen.getByTestId("metric-Period")).toHaveTextContent("—");

    // Detail fields also show em-dash
    expect(screen.getByTestId("fact-URL")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Start Date")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-End Date")).toHaveTextContent("—");
  });

  it("calls notFound when certificate is null", async () => {
    mockGetCertificate.mockResolvedValue(null);

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "unknown" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
