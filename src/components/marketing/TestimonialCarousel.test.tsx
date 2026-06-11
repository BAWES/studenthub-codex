// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("lucide-react", () => ({
  Quote: () => <span data-testid="icon-quote" />,
  ChevronLeft: () => <span data-testid="icon-chevron-left" />,
  ChevronRight: () => <span data-testid="icon-chevron-right" />,
  Star: () => <span data-testid="icon-star" />,
}));

afterEach(() => {
  vi.clearAllMocks();
});

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

  it("renders with default candidate testimonials (mixed)", async () => {
    render(<TestimonialCarousel persona="candidate" />);
    // Candidate persona now shows mixed employer + candidate testimonials (shuffled)
    // Check that any testimonial quote is rendered with proper formatting
    await waitFor(() => {
      // The quote text is rendered inside an element with the blockquote tag
      const quoteEl = document.querySelector("blockquote");
      expect(quoteEl).toBeTruthy();
      expect(quoteEl?.textContent?.length).toBeGreaterThan(20);
    });
  });

  it("renders company testimonials", async () => {
    render(<TestimonialCarousel persona="company" />);
    await waitFor(() => {
      // The quote text is rendered inside an element with the blockquote tag
      const quoteEl = document.querySelector("blockquote");
      expect(quoteEl).toBeTruthy();
      expect(quoteEl?.textContent?.length).toBeGreaterThan(20);
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
    // The star rating container has an aria-label like "5 out of 5 stars"
    const starLabels = screen.getAllByLabelText(/out of 5 stars/);
    expect(starLabels.length).toBeGreaterThanOrEqual(1);
  });
});
