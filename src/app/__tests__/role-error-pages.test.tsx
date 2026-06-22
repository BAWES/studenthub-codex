// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

// ── Fixtures ────────────────────────────────────────────────────

const testError = new Error("Test error message");
const mockReset = () => {};

// ── Dynamic import helpers ──────────────────────────────────────
// We test each role error page by importing its default export.
// Vitest resolves these relative to the project root.

async function importErrorPage(role: string) {
  const mod = await import(`../${role}/error`);
  return mod.default;
}

// ── Tests ────────────────────────────────────────────────────────

const ROLES = ["admin", "candidate", "company", "inspector", "staff"] as const;

for (const role of ROLES) {
  describe(`${role}/error.tsx`, () => {
    it("renders a role-appropriate heading", async () => {
      const ErrorPage = await importErrorPage(role);
      render(<ErrorPage error={testError} reset={mockReset} />);
      // Each page should include the role name or a role-specific descriptor
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading.textContent).toBeTruthy();
      expect(heading.textContent!.toLowerCase()).toContain("error");
    });

    it("renders the error message", async () => {
      const ErrorPage = await importErrorPage(role);
      render(<ErrorPage error={testError} reset={mockReset} />);
      expect(screen.getByText("Test error message")).toBeTruthy();
    });

    it("renders error digest when present", async () => {
      const ErrorPage = await importErrorPage(role);
      const errorWithDigest = new Error("Digest test") as Error & { digest?: string };
      errorWithDigest.digest = "abc123";
      render(<ErrorPage error={errorWithDigest} reset={mockReset} />);
      expect(screen.getByText(/abc123/)).toBeTruthy();
    });

    it("renders a Try Again button that calls reset on click", async () => {
      const ErrorPage = await importErrorPage(role);
      const reset = vi.fn();
      render(<ErrorPage error={testError} reset={reset} />);
      const button = screen.getByRole("button", { name: /try again/i });
      button.click();
      expect(reset).toHaveBeenCalledOnce();
    });
  });
}
