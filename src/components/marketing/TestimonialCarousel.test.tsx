import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TestimonialCarousel from "./TestimonialCarousel";

const customTestimonials = [
  {
    quote: "Great product!",
    name: "Alice",
    title: "Manager",
    company: "Acme",
    avatar: "A",
    rating: 5,
  },
  {
    quote: "Works well.",
    name: "Bob",
    title: "Dev",
    company: "Beta",
    avatar: "B",
    rating: 4,
  },
];

describe("TestimonialCarousel", () => {
  it("renders section with aria label", () => {
    render(<TestimonialCarousel />);
    expect(screen.getByLabelText("Testimonials")).toBeInTheDocument();
  });

  it("renders with default candidate testimonials", () => {
    render(<TestimonialCarousel persona="candidate" />);
    expect(screen.getByText(/StudentHub matched me/)).toBeInTheDocument();
  });

  it("renders staff testimonials", () => {
    render(<TestimonialCarousel persona="staff" />);
    expect(screen.getByText(/50 candidates/)).toBeInTheDocument();
  });

  it("renders company testimonials", () => {
    render(<TestimonialCarousel persona="company" />);
    expect(screen.getByText(/reduced our time-to-hire/)).toBeInTheDocument();
  });

  it("renders custom testimonials when provided", () => {
    render(<TestimonialCarousel testimonials={customTestimonials} />);
    expect(screen.getByText("Great product!")).toBeInTheDocument();
  });

  it("renders testimonial author details", () => {
    render(<TestimonialCarousel testimonials={customTestimonials} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Manager, Acme")).toBeInTheDocument();
  });

  it("renders navigation dots", () => {
    render(<TestimonialCarousel testimonials={customTestimonials} />);
    const dots = document.querySelectorAll('[role="tab"]');
    expect(dots.length).toBeGreaterThanOrEqual(1);
  });

  it("navigates to next testimonial on next button click", async () => {
    const user = userEvent.setup();
    render(<TestimonialCarousel testimonials={customTestimonials} />);
    expect(screen.getByText("Great product!")).toBeInTheDocument();
    const nextBtn = screen.getByLabelText("Next testimonial");
    await user.click(nextBtn);
    expect(screen.getByText("Works well.")).toBeInTheDocument();
  });

  it("navigates to previous testimonial on prev button click", async () => {
    const user = userEvent.setup();
    render(<TestimonialCarousel testimonials={customTestimonials} />);
    const nextBtn = screen.getByLabelText("Next testimonial");
    await user.click(nextBtn);
    expect(screen.getByText("Works well.")).toBeInTheDocument();
    const prevBtn = screen.getByLabelText("Previous testimonial");
    await user.click(prevBtn);
    expect(screen.getByText("Great product!")).toBeInTheDocument();
  });

  it("renders star ratings", () => {
    render(<TestimonialCarousel testimonials={customTestimonials} />);
    // Each rating star has aria-hidden
    const stars = document.querySelectorAll('[aria-hidden="true"]');
    expect(stars.length).toBeGreaterThan(0);
  });
});
