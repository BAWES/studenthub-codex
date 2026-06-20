import { afterEach, describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import FeatureGrid from "./FeatureGrid";

describe("FeatureGrid", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders section with aria label", () => {
    render(<FeatureGrid />);
    expect(screen.getByLabelText("Key features")).toBeInTheDocument();
  });

  it("renders default candidate heading", () => {
    render(<FeatureGrid />);
    // Use getAllByText to be robust against duplicate elements
    const headings = screen.getAllByText("Your career, powered by one platform.");
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it("renders candidate features when persona is candidate", () => {
    render(<FeatureGrid persona="candidate" />);
    expect(screen.getAllByText("Smart role discovery").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Seamless timesheets & pay").length).toBeGreaterThanOrEqual(1);
  });

  it("renders staff features when persona is staff", () => {
    render(<FeatureGrid persona="staff" />);
    expect(screen.getAllByText("Typo-tolerant search").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Place people faster. Less paperwork.").length).toBeGreaterThanOrEqual(1);
  });

  it("renders company features when persona is company", () => {
    render(<FeatureGrid persona="company" />);
    expect(screen.getAllByText("Staff-matched candidates").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Hiring infrastructure that actually works.").length).toBeGreaterThanOrEqual(1);
  });

  it("renders inspector features when persona is inspector", () => {
    render(<FeatureGrid persona="inspector" />);
    expect(screen.getAllByText("Batch document review").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Clear the queue. Stay compliant.").length).toBeGreaterThanOrEqual(1);
  });

  it("renders admin features when persona is admin", () => {
    render(<FeatureGrid persona="admin" />);
    expect(screen.getAllByText("Full control across every operation.").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Role-based access control").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Compliance dashboard").length).toBeGreaterThanOrEqual(1);
  });

  it("applies custom className", () => {
    const { container } = render(<FeatureGrid className="my-custom-class" />);
    expect(container.querySelector(".my-custom-class")).toBeInTheDocument();
  });

  it("renders stat badges on features that have them", () => {
    render(<FeatureGrid persona="candidate" />);
    expect(screen.getAllByText("60+ employers on the platform").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("99% on-time payment rate").length).toBeGreaterThanOrEqual(1);
  });
});
