// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MobileFAB } from "../mobile-fab";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPrimary = vi.fn();
const mockSpeedDialAction1 = vi.fn();
const mockSpeedDialAction2 = vi.fn();

const speedDialItems = [
  { label: "New Request", icon: "Plus", onAction: mockSpeedDialAction1 },
  { label: "Add User", icon: "UserPlus", onAction: mockSpeedDialAction2 },
];

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("MobileFAB", () => {
  it("renders the FAB button with a plus icon", () => {
    render(<MobileFAB role="candidate" primaryAction={mockPrimary} />);

    const fab = document.querySelector(".shMobileFAB");
    expect(fab).toBeInTheDocument();
    expect(fab!.textContent).toBe("+");
  });

  it("calls primaryAction when clicked", () => {
    render(<MobileFAB role="candidate" primaryAction={mockPrimary} />);

    const fab = document.querySelector(".shMobileFAB");
    fireEvent.click(fab!);
    expect(mockPrimary).toHaveBeenCalledTimes(1);
  });

  it("does not show speed dial by default", () => {
    render(
      <MobileFAB
        role="admin"
        primaryAction={mockPrimary}
        speedDial={speedDialItems}
      />,
    );

    expect(screen.queryByText("New Request")).not.toBeInTheDocument();
    expect(screen.queryByText("Add User")).not.toBeInTheDocument();
  });

  it("shows speed dial items when speedDialOpen is true", () => {
    render(
      <MobileFAB
        role="admin"
        primaryAction={mockPrimary}
        speedDial={speedDialItems}
        speedDialOpen
      />,
    );

    expect(screen.getByText("New Request")).toBeInTheDocument();
    expect(screen.getByText("Add User")).toBeInTheDocument();
  });

  it("calls speed dial action when a speed dial item is clicked", () => {
    render(
      <MobileFAB
        role="admin"
        primaryAction={mockPrimary}
        speedDial={speedDialItems}
        speedDialOpen
      />,
    );

    fireEvent.click(screen.getByText("New Request"));
    expect(mockSpeedDialAction1).toHaveBeenCalledTimes(1);
    expect(mockPrimary).not.toHaveBeenCalled();
  });

  it("applies hidden class when hidden prop is true", () => {
    const { container } = render(
      <MobileFAB role="candidate" primaryAction={mockPrimary} hidden />,
    );

    const fab = container.firstElementChild;
    expect(fab!.className).toContain("shMobileFABHidden");
  });

  it("does not have hidden class when hidden prop is false", () => {
    const { container } = render(
      <MobileFAB role="candidate" primaryAction={mockPrimary} />,
    );

    const fab = container.firstElementChild;
    expect(fab!.className).not.toContain("shMobileFABHidden");
  });

  it("renders role-appropriate aria-label", () => {
    render(<MobileFAB role="staff" primaryAction={mockPrimary} />);

    const fab = document.querySelector(".shMobileFAB");
    expect(fab).toHaveAttribute("aria-label", "staff quick action");
  });
});
