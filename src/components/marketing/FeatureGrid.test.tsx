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
    // Content may appear in multiple mount points — use getAllByText
    const headings = screen.getAllByText("Your career, powered by one platform.");
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it("renders candidate features when persona is candidate", () => {
    render(<FeatureGrid persona="candidate" />);
    const srDiscovery = screen.getAllByText("Smart role discovery");
    expect(srDiscovery.length).toBeGreaterThanOrEqual(1);
    const timesheets = screen.getAllByText("Seamless timesheets & pay");
    expect(timesheets.length).toBeGreaterThanOrEqual(1);
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
    const multiBranch = screen.getAllByText("Multi-branch management");
    expect(multiBranch.length).toBeGreaterThanOrEqual(1);
  });

  it("applies custom className", () => {
    const { container } = render(<FeatureGrid className="my-custom-class" />);
    expect(container.querySelector(".my-custom-class")).toBeInTheDocument();
  });

  it("renders stat badges on features that have them", () => {
    render(<FeatureGrid persona="candidate" />);
    // Text may appear in multiple mount points — use getAllByText
    const statBadges = screen.getAllByText("60+ employers on the platform");
    expect(statBadges.length).toBeGreaterThanOrEqual(1);
    const paymentStats = screen.getAllByText("99% on-time payment rate");
    expect(paymentStats.length).toBeGreaterThanOrEqual(1);
  });
});
