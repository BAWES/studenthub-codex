// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── Mock server actions ──────────────────────────────────────────────
const mockValidateResetTokenAction = vi.hoisted(() => vi.fn());
const mockResetPasswordAction = vi.hoisted(() => vi.fn());
vi.mock("@/modules/auth/forgotPasswordActions", () => ({
  validateResetTokenAction: mockValidateResetTokenAction,
  resetPasswordAction: mockResetPasswordAction,
}));

// ── Mock lucide-react icons ─────────────────────────────────────────
vi.mock("lucide-react", () => ({
  ShieldCheck: () => <span data-testid="icon-shield-check" />,
  ArrowLeft: () => <span data-testid="icon-arrow-left" />,
  Check: () => <span data-testid="icon-check" />,
  X: () => <span data-testid="icon-x" />,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

import { ResetPasswordForm } from "../ResetPasswordForm";

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    // Default mock: valid token
    mockValidateResetTokenAction.mockResolvedValue({
      valid: true,
      email: "user@example.com",
    });
  });

  it("shows skeleton while validating token", () => {
    // Don't resolve the mock immediately
    mockValidateResetTokenAction.mockReturnValue(new Promise(() => {}));

    render(<ResetPasswordForm token="valid-token" />);

    // Skeleton shows pulsing animation while validating
    const skeleton = document.querySelectorAll(".animate-pulse");
    expect(skeleton.length).toBeGreaterThan(0);
  });

  it("shows invalid link state when token is invalid", async () => {
    mockValidateResetTokenAction.mockResolvedValue({
      error: "Invalid or missing reset link.",
    });

    render(<ResetPasswordForm token="bad-token" />);

    await waitFor(() => {
      expect(screen.getByText(/invalid link/i)).toBeInTheDocument();
    });

    expect(
      screen.getByRole("link", { name: /request a new link/i })
    ).toBeInTheDocument();
  });

  it("shows expired link state when token is expired", async () => {
    mockValidateResetTokenAction.mockResolvedValue({
      expired: true,
      email: "user@example.com",
    });

    render(<ResetPasswordForm token="expired-token" />);

    await waitFor(() => {
      expect(screen.getByText(/link expired/i)).toBeInTheDocument();
    });

    expect(
      screen.getByRole("link", { name: /request a new link/i })
    ).toBeInTheDocument();
  });

  it("shows password form when token is valid", async () => {
    render(<ResetPasswordForm token="valid-token" />);

    await waitFor(() => {
      expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
    });

    expect(
      screen.getByLabelText(/confirm new password/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reset password/i })
    ).toBeInTheDocument();
  });

  it("shows user email context when token is valid", async () => {
    render(<ResetPasswordForm token="valid-token" />);

    await waitFor(() => {
      expect(screen.getByText(/user@example.com/i)).toBeInTheDocument();
    });
  });

  it("shows back to sign in link", async () => {
    render(<ResetPasswordForm token="valid-token" />);

    await waitFor(() => {
      expect(
        screen.getByRole("link", { name: /back to sign in/i })
      ).toBeInTheDocument();
    });
  });
});