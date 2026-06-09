import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ComparisonTable from "./ComparisonTable";

describe("ComparisonTable", () => {
  it("renders section with alternatives label", () => {
    render(<ComparisonTable />);
    expect(screen.getByLabelText(/comparison/i)).toBeInTheDocument();
  });

  it("renders candidate comparison with free tier", () => {
    render(<ComparisonTable persona="candidate" />);
    expect(screen.getByText(/compare alternatives/i)).toBeInTheDocument();
    expect(screen.getByText("StudentHub")).toBeInTheDocument();
  });

  it("renders competitor names for candidate", () => {
    render(<ComparisonTable persona="candidate" />);
    expect(screen.getByText("Indeed")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByText("Reed")).toBeInTheDocument();
  });

  it("renders expandable rows with toggle buttons", async () => {
    const user = userEvent.setup();
    render(<ComparisonTable persona="candidate" />);
    const expandBtns = screen.getAllByRole("button", { name: /expand/i });
    expect(expandBtns.length).toBeGreaterThan(0);

    // Click expand — content should appear
    await user.click(expandBtns[0]);
    // The expanded content will have text
    expect(screen.getByText(/expand/i)).toBeInTheDocument();
  });

  it("renders staff comparison with different competitors", () => {
    render(<ComparisonTable persona="staff" />);
    expect(screen.getByText("Bullhorn")).toBeInTheDocument();
  });

  it("renders company comparison", () => {
    render(<ComparisonTable persona="company" />);
    expect(screen.getByText("Workable")).toBeInTheDocument();
  });

  it("renders inspector comparison", () => {
    render(<ComparisonTable persona="inspector" />);
    expect(screen.getByText("Qualtrax")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<ComparisonTable className="my-class" />);
    expect(container.querySelector(".my-class")).toBeInTheDocument();
  });
});
