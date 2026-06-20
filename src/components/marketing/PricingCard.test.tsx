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
    // Candidate sees "Completely free for students. Always." as h2
    expect(screen.getByText("Completely free for students. Always.")).toBeInTheDocument();
    // Free tier name
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("renders staff pricing tiers", () => {
    render(<PricingCard persona="staff" />);
    const starter = screen.getAllByText("Starter");
    expect(starter.length).toBeGreaterThanOrEqual(1);
    const professional = screen.getAllByText("Professional");
    expect(professional.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Enterprise")).toBeInTheDocument();
  });

  it("renders company pricing tiers", () => {
    render(<PricingCard persona="company" />);
    const starter = screen.getAllByText("Starter");
    expect(starter.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Professional")).toBeInTheDocument();
    expect(screen.getByText("Enterprise")).toBeInTheDocument();
  });

  it("renders inspector pricing tiers", () => {
    render(<PricingCard persona="inspector" />);
    const starter = screen.getAllByText("Starter");
    expect(starter.length).toBeGreaterThanOrEqual(1);
    const professional = screen.getAllByText("Professional");
    expect(professional.length).toBeGreaterThanOrEqual(1);
  });

  it("renders admin pricing with enterprise tier", () => {
    render(<PricingCard persona="admin" />);
    expect(screen.getByText("Enterprise")).toBeInTheDocument();
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
