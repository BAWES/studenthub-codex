import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({
    user: { id: "1" },
    role: "candidate",
  }),
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

vi.mock("./CertificationNewForm", () => ({
  CertificationNewForm: () => <div data-testid="certification-new-form" />,
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CandidateCertificationNewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders WorkspaceShell with correct eyebrow and title", async () => {
    const Page = (await import("./page")).default;
    render(await Page());

    expect(screen.getByTestId("workspace-shell")).toBeDefined();
    expect(screen.getByTestId("eyebrow")).toHaveTextContent("Candidate / Certifications");
    expect(screen.getByTestId("title")).toHaveTextContent("Add a New Certification");
  });

  it("renders the CertificationNewForm component", async () => {
    const Page = (await import("./page")).default;
    render(await Page());

    expect(screen.getByTestId("certification-new-form")).toBeDefined();
  });

  it("has no metrics on the page", async () => {
    const Page = (await import("./page")).default;
    render(await Page());

    // Verify no metric elements are rendered
    expect(screen.queryByTestId(/^metric-/)).toBeNull();
  });
});
