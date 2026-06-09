import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import PricingCard from "./PricingCard";

afterEach(() => {
  cleanup();
});

describe("PricingCard", () => {
  it("renders section with pricing aria label", () => {
    render(<PricingCard />);
    expect(screen.getByLabelText("Pricing plans")).toBeInTheDocument();
  });

  it("renders candidate pricing (free)", () => {
    render(<PricingCard persona="candidate" />);
    expect(screen.getByText("Free profile, no commitments.")).toBeInTheDocument();
  });

  it("renders staff pricing tiers", () => {
    render(<PricingCard persona="staff" />);
    expect(screen.getByText("Starter")).toBeInTheDocument();
    const professional = screen.getAllByText("Professional");
    expect(professional.length).toBeGreaterThanOrEqual(1);
    const enterprise = screen.getAllByText("Enterprise");
    expect(enterprise.length).toBeGreaterThanOrEqual(1);
  });

  it("renders company pricing tiers", () => {
    render(<PricingCard persona="company" />);
    expect(screen.getByText("Starter")).toBeInTheDocument();
    const professional = screen.getAllByText("Professional");
    expect(professional.length).toBeGreaterThanOrEqual(1);
    const enterprise = screen.getAllByText("Enterprise");
    expect(enterprise.length).toBeGreaterThanOrEqual(1);
  });

  it("renders inspector pricing tiers", () => {
    render(<PricingCard persona="inspector" />);
    expect(screen.getByText("Starter")).toBeInTheDocument();
    const professional = screen.getAllByText("Professional");
    expect(professional.length).toBeGreaterThanOrEqual(1);
  });

  it("renders admin pricing with enterprise tier", () => {
    render(<PricingCard persona="admin" />);
    const enterprise = screen.getAllByText("Enterprise");
    expect(enterprise.length).toBeGreaterThanOrEqual(1);
  });

  it("renders popular badge on Professional tier", () => {
    render(<PricingCard persona="staff" />);
    const popularBadges = screen.getAllByText(/popular/i);
    expect(popularBadges.length).toBeGreaterThan(0);
  });

  it("applies custom className", () => {
    const { container } = render(<PricingCard className="my-class" />);
    expect(container.querySelector(".my-class")).toBeInTheDocument();
  });
});
