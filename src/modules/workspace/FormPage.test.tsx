// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormPage } from "./FormPage";

afterEach(() => { cleanup(); });

describe("FormPage", () => {
  it("renders the title and description", () => {
    render(
      <FormPage
        title="Create Candidate"
        description="Fill in the candidate details"
        sections={[]}
      />
    );
    expect(screen.getByText("Create Candidate")).toBeDefined();
    expect(screen.getByText("Fill in the candidate details")).toBeDefined();
  });

  it("renders form sections", () => {
    const sections = [
      { title: "Personal Info", content: <input placeholder="Name" /> },
      { title: "Contact", content: <input placeholder="Email" /> },
    ];
    render(
      <FormPage title="Create Candidate" sections={sections} />
    );
    expect(screen.getByText("Personal Info")).toBeDefined();
    expect(screen.getByText("Contact")).toBeDefined();
    expect(screen.getByPlaceholderText("Name")).toBeDefined();
    expect(screen.getByPlaceholderText("Email")).toBeDefined();
  });

  it("renders save and cancel buttons by default", () => {
    render(
      <FormPage title="Create Candidate" sections={[]} />
    );
    expect(screen.getByText("Save")).toBeDefined();
    expect(screen.getByText("Cancel")).toBeDefined();
  });

  it("shows loading state", () => {
    render(
      <FormPage title="Create" sections={[]} loading />
    );
    expect(screen.getByText("Saving...")).toBeDefined();
    expect(screen.getByText("Saving...").closest("button")?.disabled).toBe(true);
    expect(screen.getByText("Cancel").closest("button")?.disabled).toBe(true);
  });

  it("disables save when isSubmitting is true", () => {
    render(
      <FormPage title="Create" sections={[]} isSubmitting />
    );
    expect(screen.getByText("Save").closest("button")?.disabled).toBe(true);
  });

  it("calls onSave when save button is clicked", async () => {
    const onSave = vi.fn();
    render(
      <FormPage title="Create" sections={[]} onSave={onSave} />
    );
    await userEvent.click(screen.getByText("Save"));
    expect(onSave).toHaveBeenCalledOnce();
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const onCancel = vi.fn();
    render(
      <FormPage title="Create" sections={[]} onCancel={onCancel} />
    );
    await userEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("shows dirty state indicator when isDirty is true", () => {
    render(
      <FormPage title="Create" sections={[]} isDirty />
    );
    expect(screen.getByText("Unsaved changes")).toBeDefined();
  });

  it("shows validation errors when provided", () => {
    render(
      <FormPage title="Create" sections={[]} errors={["Name is required", "Email is invalid"]} />
    );
    expect(screen.getByText("Name is required")).toBeDefined();
    expect(screen.getByText("Email is invalid")).toBeDefined();
  });

  it("renders custom footer actions", () => {
    render(
      <FormPage
        title="Create"
        sections={[]}
        footerActions={<button>Draft</button>}
      />
    );
    expect(screen.getByText("Draft")).toBeDefined();
  });
});
