import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CandidateCard, type CandidateCardData } from "./CandidateCard";

afterEach(() => {
  cleanup();
});

const baseData: CandidateCardData = {
  id: 42,
  uid: "STU-007",
  name: "Ahmed Al-Sabah",
  email: "ahmed@example.com",
  company: "KIPCO",
  store: "Salmiya Branch",
  status: "Active",
  signal: "🟢",
  rate: "3.500 KD/hr",
  updated: "2 hours ago",
  flags: [],
};

describe("CandidateCard", () => {
  it("renders candidate name, email, company, store", () => {
    render(<CandidateCard data={baseData} href="/candidate/42" />);
    expect(screen.getByText("Ahmed Al-Sabah")).toBeInTheDocument();
    expect(screen.getByText("ahmed@example.com")).toBeInTheDocument();
    expect(screen.getByText("KIPCO")).toBeInTheDocument();
    expect(screen.getByText("Salmiya Branch")).toBeInTheDocument();
  });

  it("renders rate and last updated", () => {
    render(<CandidateCard data={baseData} href="/candidate/42" />);
    expect(screen.getByText("2 hours ago")).toBeInTheDocument();
    // Rate renders once under the card
    const rates = screen.getAllByText("3.500 KD/hr");
    expect(rates.length).toBeGreaterThanOrEqual(1);
  });

  it("renders status and signal", () => {
    render(<CandidateCard data={baseData} href="/candidate/42" />);
    expect(screen.getByText("🟢")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("applies selected shadow when isSelected is true", () => {
    const { container } = render(
      <CandidateCard data={baseData} href="/candidate/42" isSelected />
    );
    const link = container.querySelector("a");
    // Selected cards get an inset box-shadow and active border color
    expect(link?.className).toContain("shadow-[inset");
    expect(link?.className).toContain("border-[#9dbde8]");
  });

  it("does not apply selected shadow when isSelected is false", () => {
    const { container } = render(
      <CandidateCard data={baseData} href="/candidate/42" isSelected={false} />
    );
    const link = container.querySelector("a");
    expect(link?.className).not.toContain("shadow-[inset");
  });

  it("renders flag pills when flags exist", () => {
    const withFlags = { ...baseData, flags: ["Needs review", "Incomplete", "Civil ID review"] };
    render(<CandidateCard data={withFlags} href="/candidate/42" />);
    expect(screen.getByText("Needs review")).toBeInTheDocument();
    expect(screen.getByText("Incomplete")).toBeInTheDocument();
    expect(screen.getByText("Civil ID review")).toBeInTheDocument();
  });

  it("renders no flags section when flags is empty", () => {
    render(<CandidateCard data={baseData} href="/candidate/42" />);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("limits flags to first 3", () => {
    const withManyFlags = {
      ...baseData,
      flags: ["A", "B", "C", "D", "E"],
    };
    render(<CandidateCard data={withManyFlags} href="/candidate/42" />);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
    expect(screen.queryByText("D")).not.toBeInTheDocument();
    expect(screen.queryByText("E")).not.toBeInTheDocument();
  });

  it("supports role=staff showing all fields", () => {
    const { container } = render(<CandidateCard data={baseData} href="/candidate/42" role="staff" />);
    const rates = screen.getAllByText("3.500 KD/hr");
    expect(rates.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("ahmed@example.com")).toBeInTheDocument();
  });

  it("supports role=company hiding sensitive data", () => {
    const { container } = render(<CandidateCard data={baseData} href="/candidate/42" role="company" />);
    // Company should not see rate or email
    expect(screen.queryAllByText("3.500 KD/hr").length).toBe(0);
    expect(screen.queryAllByText("ahmed@example.com").length).toBe(0);
    // But should see name, company, store
    expect(screen.getByText("Ahmed Al-Sabah")).toBeInTheDocument();
    expect(screen.getByText("KIPCO")).toBeInTheDocument();
  });
});
