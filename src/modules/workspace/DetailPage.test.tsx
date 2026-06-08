// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { DetailPage } from "./DetailPage";

afterEach(() => { cleanup(); });

const testFacts = {
  "Basic Info": [
    { label: "Name", value: "Alice Johnson" },
    { label: "Email", value: "alice@test.com" },
    { label: "Phone", value: "+965 5555 1234" },
  ],
  "Employment": [
    { label: "Role", value: "Software Engineer" },
    { label: "Status", value: "Active" },
  ],
};

const testRelated = [
  { id: 1, title: "Request #1001", subtitle: "Frontend Developer", meta: "Active" },
  { id: 2, title: "Request #1002", subtitle: "Backend Developer", meta: "Pending" },
];

describe("DetailPage", () => {
  it("renders the title and eyebrow", () => {
    render(
      <DetailPage title="Alice Johnson" eyebrow="Candidate" factSections={testFacts} />
    );
    // Title appears in h1 and may also appear in fact values
    const titles = screen.getAllByText("Alice Johnson");
    expect(titles.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Candidate")).toBeDefined();
  });

  it("renders fact panels with labels and values", () => {
    render(
      <DetailPage title="Alice Johnson" eyebrow="Candidate" factSections={testFacts} />
    );
    expect(screen.getByText("Basic Info")).toBeDefined();
    expect(screen.getByText("Employment")).toBeDefined();
    expect(screen.getByText("Software Engineer")).toBeDefined();
    expect(screen.getByText("+965 5555 1234")).toBeDefined();
  });

  it("renders related records section when provided", () => {
    render(
      <DetailPage
        title="Alice Johnson"
        eyebrow="Candidate"
        factSections={testFacts}
        relatedRecords={{ title: "Related Requests", rows: testRelated }}
      />
    );
    expect(screen.getByText("Related Requests")).toBeDefined();
    expect(screen.getByText("Request #1001")).toBeDefined();
  });

  it("renders action toolbar when provided", () => {
    render(
      <DetailPage
        title="Alice Johnson"
        eyebrow="Candidate"
        factSections={testFacts}
        actions={<button>Edit</button>}
      />
    );
    expect(screen.getByText("Edit")).toBeDefined();
  });

  it("shows loading skeleton when loading is true", () => {
    const { container } = render(
      <DetailPage title="Loading..." factSections={{}} loading />
    );
    expect(container.querySelector('[data-slot="skeleton"]')).toBeTruthy();
  });

  it("shows error state when error is provided", () => {
    render(
      <DetailPage
        title="Error"
        factSections={{}}
        error="Record not found"
      />
    );
    expect(screen.getByText("Record not found")).toBeDefined();
  });

  it("shows 'Not set' for null/undefined values", () => {
    render(
      <DetailPage
        title="Test"
        factSections={{
          Details: [
            { label: "Phone", value: null },
            { label: "Bio", value: undefined },
          ],
        }}
      />
    );
    const notSetElements = screen.getAllByText("Not set");
    expect(notSetElements.length).toBe(2);
  });
});
