import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AdminAwsTable } from "../_components";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
  usePathname: () => "/admin/aws",
}));

const mockSession = {
  user_uuid: "u-001",
  role: "admin",
  email: "admin@test.com",
  name: "Admin",
} as any;

const mockConfigEntries = [
  { key: "aws_region", value: "us-east-1" },
  { key: "aws_bucket", value: "studenthub-uploads" },
  { key: "aws_temp_access_key_id", value: "AKIAXXXX" },
  { key: "aws_temp_secret_access_key", value: "••••••••XXXX" },
];

const mockAwsResult = {
  region: "us-east-1",
  bucket: "studenthub-uploads",
  key: "AKIAXXXX",
};

function renderComponent(
  entries = mockConfigEntries,
  awsResult = mockAwsResult
) {
  return render(
    <AdminAwsTable session={mockSession} entries={entries} awsResult={awsResult} />
  );
}

describe("AdminAwsTable", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders eyebrow and title", () => {
    renderComponent();
    expect(screen.getByText("Admin settings")).toBeDefined();
    const titleMatches = screen.getAllByText(/AWS S3 configuration/i);
    expect(titleMatches.length).toBeGreaterThanOrEqual(1);
  });

  it("displays the connection summary labels", () => {
    renderComponent();
    expect(screen.getByText("Connection summary")).toBeDefined();
    expect(screen.getByText("Region")).toBeDefined();
    expect(screen.getByText("S3 Bucket")).toBeDefined();
    expect(screen.getByText("Access Key")).toBeDefined();
  });

  it("renders the config keys table with correct headers", () => {
    renderComponent();
    expect(screen.getByText("Config key")).toBeDefined();
    expect(screen.getByText("Value")).toBeDefined();
  });

  it("renders all config keys in the rendered output", () => {
    renderComponent();
    // Check that the full rendered text contains all expected keys
    const body = document.body.textContent || "";
    expect(body).toContain("aws_region");
    expect(body).toContain("aws_bucket");
    expect(body).toContain("aws_temp_access_key_id");
    expect(body).toContain("aws_temp_secret_access_key");
  });

  it("shows masked secret key values in rendered output", () => {
    renderComponent();
    const body = document.body.textContent || "";
    expect(body).toContain("••••••••XXXX");
    expect(body).toContain("us-east-1");
    expect(body).toContain("AKIAXXXX");
  });

  it("shows empty state when no entries", () => {
    renderComponent([], { region: "", bucket: "", key: "" });
    expect(screen.getByText(/No AWS config keys found/i)).toBeDefined();
  });

  it("shows not configured for missing summary values", () => {
    renderComponent([], { region: "", bucket: "", key: "" });
    const body = document.body.textContent || "";
    expect(body).toContain("Not configured");
  });
});
