import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

// Mock dependencies
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({
    user: { id: "1" },
    role: "candidate",
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
          {String(f.value)}
        </span>
      ))}
    </div>
  ),
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

vi.mock("./DeleteCertificationButton", () => ({
  DeleteCertificationButton: ({ certificationId }: { certificationId: number }) => (
    <div data-testid="delete-certification-button" data-certid={certificationId} />
  ),
}));

const mockGetCandidateCertification = vi.fn();

vi.mock("../actions", () => ({
  getCandidateCertification: (...args: unknown[]) =>
    mockGetCandidateCertification(...args),
  deleteCandidateCertification: vi.fn(),
}));

const mockNotFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("next/navigation", () => ({
  notFound: mockNotFound,
}));

const mockCertificationData = {
  certification_id: 1,
  certification_name: "AWS Certified Developer",
  issuing_organization: "Amazon Web Services",
  issue_date: new Date("2024-03-15"),
  expiry_date: new Date("2027-03-15"),
  credential_id: "AWS-DEV-12345",
  credential_url: "https://aws.amazon.com/verify/abc",
  description: "Professional certification for AWS development",
};

describe("CandidateCertificationDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders certification detail with WorkspaceShell and correct eyebrow", async () => {
    mockGetCandidateCertification.mockResolvedValue(mockCertificationData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ certificationId: "1" }) }));

    expect(screen.getByTestId("workspace-shell")).toBeDefined();
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Candidate / Certifications");
    expect(screen.getByTestId("title")).toHaveTextContent("AWS Certified Developer");
  });

  it("renders metrics correctly", async () => {
    mockGetCandidateCertification.mockResolvedValue(mockCertificationData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ certificationId: "1" }) }));

    expect(screen.getByTestId("metric-Certification")).toHaveTextContent(
      "AWS Certified Developer"
    );
    expect(screen.getByTestId("metric-Issuer")).toHaveTextContent(
      "Amazon Web Services"
    );
  });

  it("renders DetailSection with Certification Details facts", async () => {
    mockGetCandidateCertification.mockResolvedValue(mockCertificationData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ certificationId: "1" }) }));

    expect(screen.getByTestId("detail-section")).toBeDefined();
    expect(screen.getByTestId("section-title")).toHaveTextContent(
      "Certification Details"
    );
    expect(screen.getByTestId("fact-Certification Name")).toHaveTextContent(
      "AWS Certified Developer"
    );
    expect(screen.getByTestId("fact-Issuing Organization")).toHaveTextContent(
      "Amazon Web Services"
    );
    expect(screen.getByTestId("fact-Issue Date")).toHaveTextContent("2024-03-15");
    expect(screen.getByTestId("fact-Expiry Date")).toHaveTextContent("2027-03-15");
    expect(screen.getByTestId("fact-Credential ID")).toHaveTextContent(
      "AWS-DEV-12345"
    );
    expect(screen.getByTestId("fact-Description")).toHaveTextContent(
      "Professional certification for AWS development"
    );
  });

  it("renders Edit and Back links", async () => {
    mockGetCandidateCertification.mockResolvedValue(mockCertificationData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ certificationId: "1" }) }));

    expect(screen.getByText("Edit Certification")).toBeDefined();
    expect(screen.getByText("Back to Certifications")).toBeDefined();
  });

  it("renders DeleteCertificationButton with correct cert ID", async () => {
    mockGetCandidateCertification.mockResolvedValue(mockCertificationData);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ certificationId: "1" }) }));

    expect(screen.getByTestId("delete-certification-button")).toBeDefined();
    expect(screen.getByTestId("delete-certification-button")).toHaveAttribute(
      "data-certid",
      "1"
    );
  });

  it("shows fallback values for null optional fields", async () => {
    mockGetCandidateCertification.mockResolvedValue({
      certification_id: 2,
      certification_name: "Minimal Cert",
      issuing_organization: "Org",
      issue_date: null,
      expiry_date: null,
      credential_id: null,
      credential_url: null,
      description: null,
    });

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ certificationId: "2" }) }));

    expect(screen.getByTestId("fact-Issue Date")).toHaveTextContent("N/A");
    expect(screen.getByTestId("fact-Expiry Date")).toHaveTextContent("N/A");
    expect(screen.getByTestId("fact-Credential ID")).toHaveTextContent("—");
    expect(screen.getByTestId("fact-Description")).toHaveTextContent("—");
  });

  it("calls notFound when getCandidateCertification returns null", async () => {
    mockGetCandidateCertification.mockResolvedValue(null);

    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ certificationId: "999" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalledOnce();
  });
});
