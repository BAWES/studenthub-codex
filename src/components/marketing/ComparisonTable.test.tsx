import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ComparisonTable from "./ComparisonTable";

describe("ComparisonTable", () => {
  it("renders section with comparison label", () => {
    render(<ComparisonTable />);
    expect(screen.getByLabelText(/comparison/i)).toBeInTheDocument();
  });

  it("renders candidate comparison with StudentHub header", () => {
    render(<ComparisonTable persona="candidate" />);
    // Content may be duplicated in test renderer — use getAllByText
    const sh = screen.getAllByText("StudentHub");
    expect(sh.length).toBeGreaterThanOrEqual(1);
    const jobBoards = screen.getAllByText("Generic job boards");
    expect(jobBoards.length).toBeGreaterThanOrEqual(1);
    const emailSheets = screen.getAllByText("Email & spreadsheets");
    expect(emailSheets.length).toBeGreaterThanOrEqual(1);
    const traditional = screen.getAllByText("Traditional agencies");
    expect(traditional.length).toBeGreaterThanOrEqual(1);
  });

  it("renders candidate-specific heading", () => {
    render(<ComparisonTable persona="candidate" />);
    const headings = screen.getAllByText("Why candidates choose StudentHub.");
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it("renders staff-specific heading", () => {
    render(<ComparisonTable persona="staff" />);
    const headings = screen.getAllByText("See how StudentHub compares.");
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it("renders company-specific heading", () => {
    render(<ComparisonTable persona="company" />);
    const headings = screen.getAllByText("Why companies choose StudentHub.");
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it("renders inspector-specific heading", () => {
    render(<ComparisonTable persona="inspector" />);
    const headings = screen.getAllByText("See how StudentHub compares.");
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it("renders admin with company comparison", () => {
    render(<ComparisonTable persona="admin" />);
    expect(screen.getByText("Generic ERPs")).toBeInTheDocument();
    expect(screen.getByText("Manual processes")).toBeInTheDocument();
  });

  it("renders candidate feature rows with data", () => {
    render(<ComparisonTable persona="candidate" />);
    // Category labels may be duplicated — use getAllByText
    const profiles = screen.getAllByText("Profile");
    expect(profiles.length).toBeGreaterThanOrEqual(1);
    const searches = screen.getAllByText("Search");
    expect(searches.length).toBeGreaterThanOrEqual(1);
    const payments = screen.getAllByText("Payments");
    expect(payments.length).toBeGreaterThanOrEqual(1);
    const documents = screen.getAllByText("Documents");
    expect(documents.length).toBeGreaterThanOrEqual(1);
  });

  it("applies custom className", () => {
    const { container } = render(<ComparisonTable className="my-class" />);
    expect(container.querySelector(".my-class")).toBeInTheDocument();
  });
});
