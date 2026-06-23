import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { notFound } from "next/navigation";

// Mock dependencies
vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({ user: { id: "1" }, role: "admin" }),
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

const mockGetComplianceRecord = vi.fn();

vi.mock("./actions", () => ({
  getComplianceRecord: (...args: unknown[]) => mockGetComplianceRecord(...args),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date) => d.toISOString().split("T")[0],
}));

const companyRecord = {
  type: "company" as const,
  company: {
    company_id: 42,
    company_name: "Acme Corp",
    company_email: "admin@acme.com",
    company_approved_to_hire: true,
    company_created_at: new Date("2026-01-01"),
    company_updated_at: new Date("2026-06-01"),
    staff_name: "John Doe",
    country_name_en: "Kuwait",
    no_of_active_requests: 5,
  },
  metrics: [
    { label: "Approved to Hire", value: "Yes", note: "Company compliance status" },
    { label: "Active Requests", value: 5, note: "Current hiring activity" },
    { label: "Country", value: "Kuwait", note: "Registered country" },
  ],
  idRequests: [
    { id: "idr-001", status: "pending", rejection_reason: null, created_at: new Date("2026-06-10") },
  ],
};

const idRequestRecord = {
  type: "id_request" as const,
  record: {
    cir_uuid: "cir-abc-123-def",
    candidate_ids: "cand-001,cand-002",
    status: "pending",
    rejection_reason: null,
    created_at: new Date("2026-06-10"),
    updated_at: new Date("2026-06-12"),
  },
  metrics: [
    { label: "Status", value: "pending", note: "Current ID request status" },
    { label: "Candidates", value: 2, note: "Candidates in this batch" },
    { label: "Created", value: "2026-06-10", note: "Request creation date" },
  ],
};

describe("AdminComplianceDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("company type", () => {
    it("renders company compliance detail with all fields", async () => {
      mockGetComplianceRecord.mockResolvedValue(companyRecord);

      const Page = (await import("./page")).default;
      render(
        await Page({
          params: Promise.resolve({ id: "company-42" }),
        }),
      );

      expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Compliance");
      expect(screen.getByTestId("title")).toHaveTextContent("Acme Corp");
      expect(screen.getByTestId("metric-Approved to Hire")).toHaveTextContent("Yes");
      expect(screen.getByTestId("fact-Company ID")).toHaveTextContent("42");
      expect(screen.getByTestId("fact-Name")).toHaveTextContent("Acme Corp");
      expect(screen.getByTestId("fact-Email")).toHaveTextContent("admin@acme.com");
      expect(screen.getByText("Back to Compliance")).toBeInTheDocument();
    });

    it("renders company with null fields gracefully", async () => {
      mockGetComplianceRecord.mockResolvedValue({
        ...companyRecord,
        company: { ...companyRecord.company, company_email: null, company_approved_to_hire: null, staff_name: null, country_name_en: null },
      });

      const Page = (await import("./page")).default;
      render(
        await Page({
          params: Promise.resolve({ id: "company-99" }),
        }),
      );

      expect(screen.getByTestId("fact-Email")).toHaveTextContent("—");
      expect(screen.getByTestId("fact-Staff Name")).toHaveTextContent("—");
      expect(screen.getByTestId("fact-Country")).toHaveTextContent("—");
    });

    it("renders recent ID requests section", async () => {
      mockGetComplianceRecord.mockResolvedValue(companyRecord);

      const Page = (await import("./page")).default;
      render(
        await Page({
          params: Promise.resolve({ id: "company-42" }),
        }),
      );

      const sections = screen.getAllByTestId("section-title");
      expect(sections).toHaveLength(2);
      expect(sections[1]).toHaveTextContent("Recent ID Requests");
    });

    it("calls notFound when company data is null", async () => {
      mockGetComplianceRecord.mockResolvedValue({
        ...companyRecord,
        company: null,
      });

      const Page = (await import("./page")).default;

      await expect(
        Page({ params: Promise.resolve({ id: "company-42" }) }),
      ).rejects.toThrow();

      expect(notFound).toHaveBeenCalled();
    });
  });

  describe("id_request type", () => {
    it("renders ID request detail with all fields", async () => {
      mockGetComplianceRecord.mockResolvedValue(idRequestRecord);

      const Page = (await import("./page")).default;
      render(
        await Page({
          params: Promise.resolve({ id: "id_request-cir-abc-123-def" }),
        }),
      );

      expect(screen.getByTestId("eyebrow")).toHaveTextContent("Admin / Compliance");
      expect(screen.getByTestId("title")).toHaveTextContent(/ID Request/);
      expect(screen.getByTestId("fact-UUID")).toHaveTextContent("cir-abc-123-def");
      expect(screen.getByTestId("fact-Status")).toHaveTextContent("pending");
      expect(screen.getByTestId("metric-Status")).toHaveTextContent("pending");
      expect(screen.getByText("Back to Compliance")).toBeInTheDocument();
    });

    it("renders ID request with rejection reason", async () => {
      mockGetComplianceRecord.mockResolvedValue({
        ...idRequestRecord,
        record: { ...idRequestRecord.record, status: "denied", rejection_reason: "Missing documents" },
      });

      const Page = (await import("./page")).default;
      render(
        await Page({
          params: Promise.resolve({ id: "id_request-cir-denied" }),
        }),
      );

      expect(screen.getByTestId("fact-Status")).toHaveTextContent("denied");
      expect(screen.getByTestId("fact-Rejection Reason")).toHaveTextContent("Missing documents");
    });

    it("renders ID request with null fields", async () => {
      mockGetComplianceRecord.mockResolvedValue({
        ...idRequestRecord,
        record: { ...idRequestRecord.record, candidate_ids: null, status: null, rejection_reason: null, created_at: null, updated_at: null },
      });

      const Page = (await import("./page")).default;
      render(
        await Page({
          params: Promise.resolve({ id: "id_request-cir-null" }),
        }),
      );

      expect(screen.getByTestId("fact-Candidate IDs")).toHaveTextContent("—");
      expect(screen.getByTestId("fact-Status")).toHaveTextContent("—");
      expect(screen.getByTestId("fact-Rejection Reason")).toHaveTextContent("—");
      expect(screen.getByTestId("fact-Created")).toHaveTextContent("—");
      expect(screen.getByTestId("fact-Updated")).toHaveTextContent("—");
    });

    it("calls notFound when ID request record is null", async () => {
      mockGetComplianceRecord.mockResolvedValue({
        ...idRequestRecord,
        record: null,
      });

      const Page = (await import("./page")).default;

      await expect(
        Page({ params: Promise.resolve({ id: "id_request-cir-null" }) }),
      ).rejects.toThrow();

      expect(notFound).toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("calls notFound for unparseable ID", async () => {
      const Page = (await import("./page")).default;

      await expect(
        Page({ params: Promise.resolve({ id: "invalid-id-format" }) }),
      ).rejects.toThrow();

      expect(notFound).toHaveBeenCalled();
    });

    it("calls notFound when null is returned", async () => {
      mockGetComplianceRecord.mockResolvedValue(null);

      const Page = (await import("./page")).default;

      await expect(
        Page({ params: Promise.resolve({ id: "company-999" }) }),
      ).rejects.toThrow();

      expect(notFound).toHaveBeenCalled();
    });
  });
});
