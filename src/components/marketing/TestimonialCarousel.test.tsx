import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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
  it("renders section with aria label", async () => {
    render(<TestimonialCarousel />);
    await waitFor(() => {
      expect(screen.getByLabelText("Customer testimonials")).toBeInTheDocument();
    });
  });

  it("renders with default candidate testimonials", async () => {
    render(<TestimonialCarousel persona="candidate" />);
    await waitFor(() => {
      const quotes = screen.getAllByText(/StudentHub matched me/);
      expect(quotes.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("renders staff testimonials", async () => {
    render(<TestimonialCarousel persona="staff" />);
    await waitFor(() => {
      expect(screen.getByText(/We went from paper files/)).toBeInTheDocument();
    });
  });

  it("renders company testimonials", async () => {
    render(<TestimonialCarousel persona="company" />);
    await waitFor(() => {
      expect(screen.getByText(/Posting openings on StudentHub/)).toBeInTheDocument();
    });
  });

  it("renders admin testimonials", async () => {
    render(<TestimonialCarousel persona="admin" />);
    await waitFor(() => {
      expect(screen.getByText(/manage permissions across/)).toBeInTheDocument();
    });
  });

  it("renders custom testimonials when provided", async () => {
    render(<TestimonialCarousel testimonials={customTestimonials} />);
    await waitFor(() => {
      const quotes = screen.getAllByText(/Great product!/);
      expect(quotes.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("renders testimonial author details", async () => {
    render(<TestimonialCarousel testimonials={customTestimonials} />);
    await waitFor(() => {
      const alices = screen.getAllByText("Alice");
      expect(alices.length).toBeGreaterThanOrEqual(1);
    });
    // "Manager, Acme" is the title—company format
    const details = screen.getAllByText(/Manager.*Acme/);
    expect(details.length).toBeGreaterThanOrEqual(1);
  });

  it("renders navigation dots", () => {
    render(<TestimonialCarousel testimonials={customTestimonials} />);
    const dots = screen.getAllByRole("button").filter(
      (btn) => btn.getAttribute("aria-label")?.startsWith("Go to testimonial")
    );
    expect(dots.length).toBeGreaterThanOrEqual(1);
  });

  it("renders prev and next navigation buttons", () => {
    render(<TestimonialCarousel testimonials={customTestimonials} />);
    const nextBtns = screen.getAllByLabelText("Next testimonial");
    expect(nextBtns.length).toBeGreaterThanOrEqual(1);
    const prevBtns = screen.getAllByLabelText("Previous testimonial");
    expect(prevBtns.length).toBeGreaterThanOrEqual(1);
  });

  it("renders star ratings", () => {
    render(<TestimonialCarousel testimonials={customTestimonials} />);
    const stars = document.querySelectorAll('[aria-hidden="true"]');
    expect(stars.length).toBeGreaterThan(0);
  });
});
