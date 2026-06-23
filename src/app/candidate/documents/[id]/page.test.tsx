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

const mockGetCandidateDocument = vi.fn();

vi.mock("./actions", () => ({
  getCandidateDocument: (...args: unknown[]) => mockGetCandidateDocument(...args),
}));

const uploadedPhoto = {
  type: "photo",
  label: "Personal Photo",
  filePath: "/uploads/candidates/42/photo_abc.jpg",
  fileUrl: "/uploads/candidates/42/photo_abc.jpg",
};

const notUploadedCv = {
  type: "cv",
  label: "CV / Resume",
  filePath: null,
  fileUrl: null,
};

describe("CandidateDocumentDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders document detail for an uploaded photo", async () => {
    mockGetCandidateDocument.mockResolvedValue(uploadedPhoto);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "photo" }),
      }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Candidate / Documents");
    expect(screen.getByTestId("title")).toHaveTextContent("Personal Photo");

    // Metrics
    expect(screen.getByTestId("metric-Status")).toHaveTextContent("Uploaded");
    expect(screen.getByTestId("metric-Type")).toHaveTextContent("Personal Photo");

    // Detail fields
    expect(screen.getByTestId("fact-Type")).toHaveTextContent("Personal Photo");
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Uploaded");
    expect(screen.getByTestId("fact-File Path")).toHaveTextContent(uploadedPhoto.filePath);

    // Back button
    expect(screen.getByText("Back to Documents")).toBeInTheDocument();
    // Open File button
    expect(screen.getByText("Open File")).toBeInTheDocument();
  });

  it("renders document detail for a not-uploaded cv", async () => {
    mockGetCandidateDocument.mockResolvedValue(notUploadedCv);

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ id: "cv" }),
      }),
    );

    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Candidate / Documents");
    expect(screen.getByTestId("title")).toHaveTextContent("CV / Resume");

    // Metrics
    expect(screen.getByTestId("metric-Status")).toHaveTextContent("Not Uploaded");
    expect(screen.getByTestId("metric-Type")).toHaveTextContent("CV / Resume");

    // Detail fields
    expect(screen.getByTestId("fact-Status")).toHaveTextContent("Not Uploaded");
    expect(screen.getByTestId("fact-File Path")).toHaveTextContent("—");

    // Open File button should not exist for un-uploaded docs
    expect(screen.queryByText("Open File")).not.toBeInTheDocument();
  });

  it("calls notFound when document is null", async () => {
    mockGetCandidateDocument.mockResolvedValue(null);

    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "photo" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("calls notFound with an invalid document type", async () => {
    const Page = (await import("./page")).default;

    await expect(
      Page({ params: Promise.resolve({ id: "invalidType" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    // getCandidateDocument should not have been called for an invalid type
    expect(mockGetCandidateDocument).not.toHaveBeenCalled();
  });
});
