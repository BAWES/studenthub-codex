// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── Mock registerAction (must use vi.hoisted to avoid hoisting issues) ──
const mockRegisterAction = vi.hoisted(() => vi.fn());
vi.mock("@/modules/auth/registration", () => ({
  registerAction: mockRegisterAction,
}));

// ── Mock lucide-react icons ──────────────────────────────
vi.mock("lucide-react", () => ({
  UserRound: () => <span data-testid="icon-user-round" />,
  Building2: () => <span data-testid="icon-building" />,
  ArrowLeft: () => <span data-testid="icon-arrow-left" />,
  ArrowRight: () => <span data-testid="icon-arrow-right" />,
  UserPlus: () => <span data-testid="icon-user-plus" />,
}));

// ── Mock Button ──────────────────────────────────────────
vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    disabled,
    ...props
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    [key: string]: unknown;
  }) => (
    <button disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

// ── Mock Input ───────────────────────────────────────────
vi.mock("@/components/ui/input", () => ({
  Input: (props: { [key: string]: unknown }) => <input {...props} />,
}));

// ── Mock Label ────────────────────────────────────────────
vi.mock("@/components/ui/label", () => ({
  Label: ({
    children,
    htmlFor,
    className,
  }: {
    children: React.ReactNode;
    htmlFor?: string;
    className?: string;
  }) => (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  ),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

import { SignupForm } from "../SignupForm";

describe("SignupForm — role param pre-selection", () => {
  describe("when defaultRole is provided", () => {
    it("skips role selection and renders form for 'candidate'", () => {
      render(<SignupForm defaultRole="candidate" />);

      // Should NOT show role selection heading
      expect(
        screen.queryByText(/create your studenthub account/i),
      ).not.toBeInTheDocument();

      // Should show the registration form
      expect(screen.getByLabelText(/^full name$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^email address$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^confirm password$/i)).toBeInTheDocument();

      // Should show the correct heading
      expect(
        screen.getByText(/start your career journey/i),
      ).toBeInTheDocument();
    });

    it("skips role selection and renders form for 'company'", () => {
      render(<SignupForm defaultRole="company" />);

      expect(
        screen.queryByText(/create your studenthub account/i),
      ).not.toBeInTheDocument();

      // Should show the employer heading
      expect(
        screen.getByText(/start hiring with studenthub/i),
      ).toBeInTheDocument();
    });

    it("renders a hidden input with the selected role", () => {
      render(<SignupForm defaultRole="candidate" />);

      const hiddenRoleInput = document.querySelector(
        'input[name="role"][type="hidden"]',
      );
      expect(hiddenRoleInput).toBeInTheDocument();
      expect(hiddenRoleInput).toHaveValue("candidate");
    });

    it("shows back button to return to role selection", async () => {
      const user = userEvent.setup();
      render(<SignupForm defaultRole="company" />);

      const backButton = screen.getByRole("button", {
        name: /back to role selection/i,
      });
      expect(backButton).toBeInTheDocument();

      // Click back — should show role selection again
      await user.click(backButton);

      expect(
        screen.getByText(/create your studenthub account/i),
      ).toBeInTheDocument();
    });
  });

  describe("when defaultRole is NOT provided", () => {
    it("shows the role selection step", () => {
      render(<SignupForm />);

      expect(
        screen.getByText(/create your studenthub account/i),
      ).toBeInTheDocument();

      // Should show both role options
      expect(
        screen.getByText(/i want to work/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/i want to hire staff/i),
      ).toBeInTheDocument();
    });

    it("proceeds to form when a role is selected", async () => {
      const user = userEvent.setup();
      render(<SignupForm />);

      // Click the candidate role button
      await user.click(screen.getByText(/i want to work/i));

      // Should now show the form
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();

      // Should show correct heading
      expect(
        screen.getByText(/start your career journey/i),
      ).toBeInTheDocument();
    });
  });

  describe("when defaultRole is an invalid role", () => {
    it("falls back to role selection for unknown role", () => {
      // Invalid role treated as undefined
      render(<SignupForm defaultRole={"invalid" as never} />);

      expect(
        screen.getByText(/create your studenthub account/i),
      ).toBeInTheDocument();

      // Both role options should be visible
      expect(
        screen.getByText(/i want to work/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/i want to hire staff/i),
      ).toBeInTheDocument();
    });

    it("shows invite-only message for 'admin' role (not a self-registration role)", () => {
      render(<SignupForm defaultRole={"admin" as never} />);

      // Should NOT show role selection heading
      expect(
        screen.queryByText(/create your studenthub account/i),
      ).not.toBeInTheDocument();

      // Should show the invite-only message for admin
      expect(
        screen.getByText(/Admin accounts are managed by your organisation/i),
      ).toBeInTheDocument();
    });
  });
});
