import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FeatureGrid from "./FeatureGrid";

describe("FeatureGrid", () => {
  it("renders section with aria label", () => {
    render(<FeatureGrid />);
    expect(screen.getByLabelText("Key features")).toBeInTheDocument();
  });

  it("renders default candidate heading", () => {
    render(<FeatureGrid />);
    expect(screen.getByText("Your career, powered by one platform.")).toBeInTheDocument();
  });

  it("renders candidate features when persona is candidate", () => {
    render(<FeatureGrid persona="candidate" />);
    expect(screen.getByText("Smart role discovery")).toBeInTheDocument();
    expect(screen.getByText("Seamless timesheets & pay")).toBeInTheDocument();
  });

  it("renders staff features when persona is staff", () => {
    render(<FeatureGrid persona="staff" />);
    expect(screen.getByText("Typo-tolerant search")).toBeInTheDocument();
    expect(screen.getByText("Place people faster. Less paperwork.")).toBeInTheDocument();
  });

  it("renders company features when persona is company", () => {
    render(<FeatureGrid persona="company" />);
    expect(screen.getByText("AI-matched candidates")).toBeInTheDocument();
    expect(screen.getByText("Hiring infrastructure that actually works.")).toBeInTheDocument();
  });

  it("renders inspector features when persona is inspector", () => {
    render(<FeatureGrid persona="inspector" />);
    expect(screen.getByText("Batch document review")).toBeInTheDocument();
    expect(screen.getByText("Clear the queue. Stay compliant.")).toBeInTheDocument();
  });

  it("renders admin with company/company features", () => {
    render(<FeatureGrid persona="admin" />);
    expect(screen.getByText("Full control across every operation.")).toBeInTheDocument();
    expect(screen.getByText("Multi-branch management")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<FeatureGrid className="my-custom-class" />);
    expect(container.querySelector(".my-custom-class")).toBeInTheDocument();
  });

  it("renders stat badges on features that have them", () => {
    render(<FeatureGrid persona="candidate" />);
    expect(screen.getByText("60+ employers on the platform")).toBeInTheDocument();
    expect(screen.getByText("99% on-time payment rate")).toBeInTheDocument();
  });
});
