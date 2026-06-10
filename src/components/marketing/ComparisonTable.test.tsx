import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ComparisonTable from "./ComparisonTable";

describe("ComparisonTable", () => {
  it("renders section with comparison label", () => {
    render(<ComparisonTable />);
    expect(screen.getByLabelText(/comparison/i)).toBeInTheDocument();
  });

  it("renders column headers instead of competitor names", () => {
    render(<ComparisonTable persona="candidate" />);
    const headers = screen.getAllByRole("columnheader");
    const headerTexts = headers.map((h) => h.textContent);
    expect(headerTexts).toContain("StudentHub");
    expect(headerTexts).toContain("Generic job boards");
    expect(headerTexts).toContain("Email & spreadsheets");
    expect(headerTexts).toContain("Traditional agencies");
  });

  it("renders feature rows with data", () => {
    render(<ComparisonTable persona="candidate" />);
    expect(screen.getByText("Smart role discovery")).toBeInTheDocument();
    expect(screen.getByText("Profile that works for you")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<ComparisonTable className="my-class" />);
    expect(container.querySelector(".my-class")).toBeInTheDocument();
  });
});
