import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { WorkLogAppealForm } from "./WorkLogAppealForm";

afterEach(() => {
  cleanup();
});

describe("WorkLogAppealForm", () => {
  it("renders form heading", () => {
    render(<WorkLogAppealForm workLogUuid="wl-001" />);
    expect(screen.getByText("Appeal this Work Log")).toBeInTheDocument();
  });

  it("renders reason textarea", () => {
    render(<WorkLogAppealForm workLogUuid="wl-001" />);
    const textarea = screen.getByPlaceholderText(
      "Explain why this work log needs review..."
    );
    expect(textarea).toBeInTheDocument();
    expect(textarea).toBeRequired();
  });

  it("renders submit button with label", () => {
    render(<WorkLogAppealForm workLogUuid="wl-001" />);
    expect(screen.getByText("Submit appeal")).toBeInTheDocument();
  });

  it("renders hidden workLogUuid input", () => {
    render(<WorkLogAppealForm workLogUuid="wl-001" />);
    const hiddenInput = document.querySelector(
      'input[type="hidden"][name="workLogUuid"]'
    ) as HTMLInputElement;
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput?.value).toBe("wl-001");
  });

  it("does not show error state on initial render", () => {
    render(<WorkLogAppealForm workLogUuid="wl-001" />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
