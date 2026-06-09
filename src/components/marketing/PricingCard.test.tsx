import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PricingCard from "./PricingCard";

describe("PricingCard", () => {
  it("renders section with pricing aria label", () => {
    render(<PricingCard />);
    expect(screen.getByLabelText("Pricing plans")).toBeInTheDocument();
  });

  it("renders candidate pricing (free)", () => {
    render(<PricingCard persona="candidate" />);
    expect(screen.getByText(/free/i)).toBeInTheDocument();
    expect(screen.getByText("Free profile, no commitments.")).toBeInTheDocument();
  });

  it("renders staff pricing tiers", () => {
    render(<PricingCard persona="staff" />);
    expect(screen.getByText("Starter")).toBeInTheDocument();
    expect(screen.getByText("Professional")).toBeInTheDocument();
    expect(screen.getByText("Enterprise")).toBeInTheDocument();
  });

  it("renders company pricing tiers", () => {
    render(<PricingCard persona="company" />);
    expect(screen.getByText("Starter")).toBeInTheDocument();
    expect(screen.getByText("Professional")).toBeInTheDocument();
    expect(screen.getByText("Enterprise")).toBeInTheDocument();
  });

  it("renders inspector pricing tiers", () => {
    render(<PricingCard persona="inspector" />);
    expect(screen.getByText("Starter")).toBeInTheDocument();
    expect(screen.getByText("Professional")).toBeInTheDocument();
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
