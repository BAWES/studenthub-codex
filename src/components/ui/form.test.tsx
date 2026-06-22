/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "./form";
import { Input } from "./input";

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// Test schema
// ---------------------------------------------------------------------------

const testSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
});

type TestFormValues = z.infer<typeof testSchema>;

// ---------------------------------------------------------------------------
// Test harness
// ---------------------------------------------------------------------------

function TestForm({
  onSubmit = () => {},
}: {
  onSubmit?: (values: TestFormValues) => void;
}) {
  const form = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: { username: "", email: "" },
  });

  return (
    <Form {...(form as any)}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormDescription>Your public display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Form", () => {
  it("renders form fields with labels", () => {
    render(<TestForm />);
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("renders form description", () => {
    render(<TestForm />);
    expect(screen.getByText("Your public display name.")).toBeInTheDocument();
  });

  it("shows no error messages on initial render", () => {
    render(<TestForm />);
    expect(screen.queryByText("Username must be at least 2 characters.")).toBeNull();
    expect(screen.queryByText("Invalid email address.")).toBeNull();
  });

  it("does not render FormMessage DOM node when there is no error and no children", () => {
    render(<TestForm />);
    const messages = document.querySelectorAll('[data-slot="form-message"]');
    expect(messages.length).toBe(0);
  });
});

describe("FormMessage", () => {
  it("renders error messages with data-slot attribute after validation failure", async () => {
    const user = userEvent.setup();
    render(<TestForm />);

    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      const messages = document.querySelectorAll('[data-slot="form-message"]');
      expect(messages.length).toBeGreaterThan(0);
      messages.forEach((el) => {
        expect(el.textContent).toBeTruthy();
      });
    });
  });
});

describe("FormControl", () => {
  it("sets aria-invalid on input when field has error", async () => {
    const user = userEvent.setup();
    render(<TestForm />);

    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      const inputs = screen.getAllByRole("textbox");
      inputs.forEach((input) => {
        expect(input.getAttribute("aria-invalid")).toBe("true");
      });
    });
  });
});

describe("zod + react-hook-form integration", () => {
  it("validates successfully with correct data", () => {
    const result = testSchema.safeParse({
      username: "john",
      email: "john@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("returns error messages for invalid data", () => {
    const result = testSchema.safeParse({ username: "a", email: "bad" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain("Username must be at least 2 characters.");
      expect(messages).toContain("Invalid email address.");
    }
  });
});
