import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { InvitationRespondForm } from "./InvitationRespondForm";

afterEach(() => {
  cleanup();
});

describe("InvitationRespondForm", () => {
  describe("pending invitation (currentStatus = 0)", () => {
    it("renders respond heading", () => {
      render(<InvitationRespondForm invitationUuid="inv-001" currentStatus={0} />);
      expect(screen.getByText("Respond to Invitation")).toBeInTheDocument();
    });

    it("renders accept button", () => {
      render(<InvitationRespondForm invitationUuid="inv-001" currentStatus={0} />);
      const acceptBtn = screen.getByText("Accept invitation");
      expect(acceptBtn).toBeInTheDocument();
      expect(acceptBtn.tagName).toBe("BUTTON");
    });

    it("renders reject button", () => {
      render(<InvitationRespondForm invitationUuid="inv-001" currentStatus={0} />);
      const rejectBtn = screen.getByText("Reject invitation");
      expect(rejectBtn).toBeInTheDocument();
      expect(rejectBtn.tagName).toBe("BUTTON");
    });

    it("renders both accept and reject buttons", () => {
      render(<InvitationRespondForm invitationUuid="inv-001" currentStatus={0} />);
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBe(2);
    });

    it("renders hidden invitationUuid input", () => {
      render(<InvitationRespondForm invitationUuid="inv-001" currentStatus={0} />);
      const hiddenInput = document.querySelector(
        'input[type="hidden"][name="invitationUuid"]'
      ) as HTMLInputElement;
      expect(hiddenInput).toBeInTheDocument();
      expect(hiddenInput?.value).toBe("inv-001");
    });
  });

  describe("already accepted (currentStatus = 1)", () => {
    it("shows already accepted message instead of form", () => {
      render(<InvitationRespondForm invitationUuid="inv-001" currentStatus={1} />);
      expect(screen.getByText("Response")).toBeInTheDocument();
      expect(
        screen.getByText("You have already accepted this invitation.")
      ).toBeInTheDocument();
    });

    it("does not render accept/reject buttons when already accepted", () => {
      render(<InvitationRespondForm invitationUuid="inv-001" currentStatus={1} />);
      expect(screen.queryByText("Accept invitation")).not.toBeInTheDocument();
      expect(screen.queryByText("Reject invitation")).not.toBeInTheDocument();
    });
  });

  describe("already rejected (currentStatus = 2)", () => {
    it("shows already rejected message instead of form", () => {
      render(<InvitationRespondForm invitationUuid="inv-001" currentStatus={2} />);
      expect(screen.getByText("Response")).toBeInTheDocument();
      expect(
        screen.getByText("You have already rejected this invitation.")
      ).toBeInTheDocument();
    });

    it("does not render accept/reject buttons when already rejected", () => {
      render(<InvitationRespondForm invitationUuid="inv-001" currentStatus={2} />);
      expect(screen.queryByText("Accept invitation")).not.toBeInTheDocument();
      expect(screen.queryByText("Reject invitation")).not.toBeInTheDocument();
    });
  });
});
