import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

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
  }: {
    children: React.ReactNode;
    eyebrow: string;
    title: string;
    metrics: { label: string; value: string | number; note: string }[];
  }) => (
    <div data-testid="workspace-shell">
      <div data-testid="eyebrow">{eyebrow}</div>
      <div data-testid="title">{title}</div>
      {children}
    </div>
  ),
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

const mockGetCandidateCertification = vi.fn();

vi.mock("../../actions", () => ({
  getCandidateCertification: (...args: unknown[]) => mockGetCandidateCertification(...args),
}));

const mockNotFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("next/navigation", () => ({
  notFound: mockNotFound,
}));

vi.mock("../CertificationEditForm", () => ({
  CertificationEditForm: ({
    certificationId,
    currentName,
    currentIssuer,
    currentIssueDate,
    currentExpiryDate,
    currentCredentialId,
    currentCredentialUrl,
    currentDescription,
  }: {
    certificationId: number;
    currentName: string | null;
    currentIssuer: string | null;
    currentIssueDate: string | null;
    currentExpiryDate: string | null;
    currentCredentialId: string | null;
    currentCredentialUrl: string | null;
    currentDescription: string | null;
  }) => (
    <div data-testid="certification-edit-form">
      <span data-testid="edit-cert-id">{certificationId}</span>
      <span data-testid="edit-cert-name">{currentName}</span>
      {currentIssuer && <span data-testid="edit-cert-issuer">{currentIssuer}</span>}
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Test Data
// ---------------------------------------------------------------------------

const baseDate = new Date("2023-01-15");
const baseDateStr = baseDate.toISOString().split("T")[0];
const expiryDate = new Date("2026-06-01");
const expiryDateStr = expiryDate.toISOString().split("T")[0];
const issueDate = new Date("2023-01-15");
const issueDateStr = issueDate.toISOString().split("T")[0];

const mockCertification = {
  certification_id: 42,
  certification_name: "AWS Certified Developer",
  issuing_organization: "Amazon Web Services",
  issue_date: issueDate,
  expiry_date: expiryDate,
  credential_id: "AWS-DEV-123",
  credential_url: "https://example.com/credential",
  description: "Cloud developer certification",
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CandidateCertificationEditPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders WorkspaceShell with correct eyebrow and title", async () => {
    mockGetCandidateCertification.mockResolvedValue(mockCertification);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ certificationId: "42" }) }));

    expect(screen.getByTestId("workspace-shell")).toBeDefined();
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Candidate / Certifications / Edit");
    expect(screen.getByTestId("title")).toHaveTextContent("Edit: AWS Certified Developer");
  });

  it("renders the CertificationEditForm with correct props", async () => {
    mockGetCandidateCertification.mockResolvedValue(mockCertification);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ certificationId: "42" }) }));

    expect(screen.getByTestId("certification-edit-form")).toBeDefined();
    expect(screen.getByTestId("edit-cert-id")).toHaveTextContent("42");
    expect(screen.getByTestId("edit-cert-name")).toHaveTextContent("AWS Certified Developer");
    expect(screen.getByTestId("edit-cert-issuer")).toHaveTextContent("Amazon Web Services");
  });

  it("has no metrics on the page", async () => {
    mockGetCandidateCertification.mockResolvedValue(mockCertification);

    const Page = (await import("./page")).default;
    render(await Page({ params: Promise.resolve({ certificationId: "42" }) }));

    expect(screen.queryByTestId(/^metric-/)).toBeNull();
  });

  it("calls notFound when certification is null", async () => {
    mockGetCandidateCertification.mockResolvedValue(null);

    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ certificationId: "999" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalledOnce();
  });
});
