import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
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

// ---------------------------------------------------------------------------
// Default variant tests (kept from before, with minor adjustments)
// ---------------------------------------------------------------------------

describe("CandidateCard (default variant)", () => {
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
      <CandidateCard data={baseData} href="/candidate/42" isSelected />,
    );
    const link = container.querySelector("a");
    expect(link?.className).toContain("shadow-[inset");
    expect(link?.className).toContain("border-[var(--blue)]");
  });

  it("respects `selected` alias alongside `isSelected`", () => {
    const { container } = render(
      <CandidateCard data={baseData} href="/candidate/42" selected />,
    );
    const link = container.querySelector("a");
    expect(link?.className).toContain("shadow-[inset");
  });

  it("does not apply selected shadow when not selected", () => {
    const { container } = render(
      <CandidateCard data={baseData} href="/candidate/42" isSelected={false} />,
    );
    const link = container.querySelector("a");
    expect(link?.className).not.toContain("shadow-[inset");
  });

  it("renders flag pills when flags exist", () => {
    const withFlags = {
      ...baseData,
      flags: ["Needs review", "Incomplete", "Civil ID review"],
    };
    render(<CandidateCard data={withFlags} href="/candidate/42" />);
    expect(screen.getByText("Needs review")).toBeInTheDocument();
    expect(screen.getByText("Incomplete")).toBeInTheDocument();
    expect(screen.getByText("Civil ID review")).toBeInTheDocument();
  });

  it("renders no flags section when flags is empty", () => {
    render(<CandidateCard data={baseData} href="/candidate/42" />);
    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
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
    render(
      <CandidateCard data={baseData} href="/candidate/42" role="staff" />,
    );
    const rates = screen.getAllByText("3.500 KD/hr");
    expect(rates.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("ahmed@example.com")).toBeInTheDocument();
  });

  it("supports role=company hiding sensitive data", () => {
    render(
      <CandidateCard data={baseData} href="/candidate/42" role="company" />,
    );
    expect(screen.queryAllByText("3.500 KD/hr").length).toBe(0);
    expect(screen.queryAllByText("ahmed@example.com").length).toBe(0);
    expect(screen.getByText("Ahmed Al-Sabah")).toBeInTheDocument();
    expect(screen.getByText("KIPCO")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Admin role specific tests
// ---------------------------------------------------------------------------

describe("CandidateCard (admin role)", () => {
  const adminData: CandidateCardData = {
    ...baseData,
    civilIdStatus: "Verified",
    salaryBreakdown: "3.500 KD/hr + 0.250 KD margin",
    phone: "+965 5000 1234",
  };

  it("shows civil ID status for admin", () => {
    render(
      <CandidateCard data={adminData} href="/candidate/42" role="admin" />,
    );
    expect(screen.getByText("Civil ID:")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });

  it("shows salary breakdown for admin", () => {
    render(
      <CandidateCard data={adminData} href="/candidate/42" role="admin" />,
    );
    expect(screen.getByText("3.500 KD/hr + 0.250 KD margin")).toBeInTheDocument();
  });

  it("shows phone for admin", () => {
    render(
      <CandidateCard data={adminData} href="/candidate/42" role="admin" />,
    );
    expect(screen.getByText("+965 5000 1234")).toBeInTheDocument();
  });

  it("hides civil ID status for staff", () => {
    render(
      <CandidateCard data={adminData} href="/candidate/42" role="staff" />,
    );
    // staff sees rate and email but NOT civilId or salary breakdown
    expect(screen.getByText("3.500 KD/hr")).toBeInTheDocument();
    expect(screen.getByText("ahmed@example.com")).toBeInTheDocument();
    expect(screen.queryByText("Civil ID:")).not.toBeInTheDocument();
  });

  it("hides civil ID status for company", () => {
    render(
      <CandidateCard data={adminData} href="/candidate/42" role="company" />,
    );
    expect(screen.queryByText("Civil ID:")).not.toBeInTheDocument();
    expect(screen.queryByText("3.500 KD/hr")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// showSensitiveData override
// ---------------------------------------------------------------------------

describe("CandidateCard (showSensitiveData override)", () => {
  it("forces sensitive data visible when showSensitiveData=true with company role", () => {
    render(
      <CandidateCard
        data={baseData}
        href="/candidate/42"
        role="company"
        showSensitiveData
      />,
    );
    expect(screen.getByText("3.500 KD/hr")).toBeInTheDocument();
    expect(screen.getByText("ahmed@example.com")).toBeInTheDocument();
  });

  it("hides sensitive data when showSensitiveData=false with staff role", () => {
    render(
      <CandidateCard
        data={baseData}
        href="/candidate/42"
        role="staff"
        showSensitiveData={false}
      />,
    );
    expect(screen.queryAllByText("3.500 KD/hr").length).toBe(0);
    expect(screen.queryAllByText("ahmed@example.com").length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Compact variant
// ---------------------------------------------------------------------------

describe("CandidateCard (compact variant)", () => {
  it("renders name, signal/status, and company only", () => {
    render(
      <CandidateCard data={baseData} href="/candidate/42" variant="compact" />,
    );
    expect(screen.getByText("Ahmed Al-Sabah")).toBeInTheDocument();
    expect(screen.getByText("KIPCO")).toBeInTheDocument();
    // Compact hides email, rate, store, updated, flags
    expect(screen.queryByText("ahmed@example.com")).not.toBeInTheDocument();
    expect(screen.queryByText("Salmiya Branch")).not.toBeInTheDocument();
  });

  it("applies selected styling when selected", () => {
    const { container } = render(
      <CandidateCard
        data={baseData}
        href="/candidate/42"
        variant="compact"
        isSelected
      />,
    );
    const link = container.querySelector("a");
    expect(link?.className).toContain("shadow-[inset");
  });
});

// ---------------------------------------------------------------------------
// Detailed variant
// ---------------------------------------------------------------------------

describe("CandidateCard (detailed variant)", () => {
  const detailedData: CandidateCardData = {
    ...baseData,
    civilIdStatus: "Pending",
    salaryBreakdown: "2.800 KD/hr",
    phone: "+965 5555 6789",
    flags: ["Flag A", "Flag B"],
  };

  it("renders all standard info plus extra fields for admin", () => {
    render(
      <CandidateCard
        data={detailedData}
        href="/candidate/42"
        role="admin"
        variant="detailed"
      />,
    );
    expect(screen.getByText("Ahmed Al-Sabah")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("2.800 KD/hr")).toBeInTheDocument();
    expect(screen.getByText("+965 5555 6789")).toBeInTheDocument();
    expect(screen.getByText("Flag A")).toBeInTheDocument();
    expect(screen.getByText("Flag B")).toBeInTheDocument();
  });

  it("shows checkable checkbox when onSelect is provided", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <CandidateCard
        data={baseData}
        href="/candidate/42"
        variant="detailed"
        onSelect={onSelect}
      />,
    );
    const checkbox = container.querySelector("button");
    expect(checkbox).toBeInTheDocument();
    if (checkbox) {
      fireEvent.click(checkbox);
    }
    expect(onSelect).toHaveBeenCalledWith(42);
  });

  it("renders with selected checked state", () => {
    const { container } = render(
      <CandidateCard
        data={baseData}
        href="/candidate/42"
        variant="detailed"
        selected
        onSelect={vi.fn()}
      />,
    );
    const checkbox = container.querySelector("button");
    expect(checkbox?.textContent).toBe("✓");
  });
});

// ---------------------------------------------------------------------------
// onSelect interaction on compact variant (clickable card)
// ---------------------------------------------------------------------------

describe("CandidateCard onSelect (compact)", () => {
  it("calls onSelect when compact card is clicked", () => {
    const onSelect = vi.fn();
    render(
      <CandidateCard
        data={baseData}
        href="/candidate/42"
        variant="compact"
        onSelect={onSelect}
      />,
    );
    const link = screen.getByText("Ahmed Al-Sabah").closest("a");
    expect(link).toBeInTheDocument();
    if (link) {
      fireEvent.click(link);
    }
    expect(onSelect).toHaveBeenCalledWith(42);
  });
});
