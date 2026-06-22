import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SlidePanel } from "./SlidePanel";

function renderPanel(props: Record<string, unknown> = {}) {
  return render(
    <SlidePanel open side="right" {...props}>
      <p>panel body</p>
    </SlidePanel>,
  );
}

describe("SlidePanel accessibility (WCAG 4.1.2)", () => {
  it("uses the title text as dialog name when title is provided", () => {
    renderPanel({ title: "Edit Profile" });
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAccessibleName("Edit Profile");
  });

  it("uses sr-only 'Dialog' when title is omitted but eyebrow exists", () => {
    renderPanel({ eyebrow: "Settings" });
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAccessibleName("Dialog");
  });

  it("uses sr-only 'Dialog' when title is omitted but description exists", () => {
    renderPanel({ description: "Configure your preferences" });
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAccessibleName("Dialog");
  });

  it("uses aria-label='Dialog' when title, eyebrow, and description are all omitted", () => {
    renderPanel();
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAccessibleName("Dialog");
  });

  it("does not have an empty accessible name in any case", () => {
    const { rerender } = render(
      <SlidePanel open side="right">
        <p>no props</p>
      </SlidePanel>,
    );
    expect(screen.getByRole("dialog")).toHaveAccessibleName("Dialog");

    rerender(
      <SlidePanel open side="right" title="Test">
        <p>with title</p>
      </SlidePanel>,
    );
    expect(screen.getByRole("dialog")).toHaveAccessibleName("Test");

    rerender(
      <SlidePanel open side="right" eyebrow="Meta">
        <p>with eyebrow only</p>
      </SlidePanel>,
    );
    expect(screen.getByRole("dialog")).toHaveAccessibleName("Dialog");
  });
});
