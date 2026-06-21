import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin",
}));

import { NavTabs } from "./NavTabs";

describe("NavTabs", () => {
  beforeEach(() => {
    cleanup();
  });

  it("renders admin tabs for admin role", () => {
    const { container } = render(<NavTabs role="admin" />);
    const links = container.querySelectorAll("a");
    const labels = Array.from(links).map((l) => l.textContent);
    expect(labels).toContain("Overview");
    expect(labels).toContain("Candidates");
    expect(labels).toContain("Companies");
    expect(labels).toContain("Requests");
    expect(labels).toContain("Transfers");
  });

  it("renders staff tabs for staff role", () => {
    const { container } = render(<NavTabs role="staff" />);
    const links = container.querySelectorAll("a");
    const labels = Array.from(links).map((l) => l.textContent);
    expect(labels).toContain("Overview");
    expect(labels).toContain("Candidates");
    expect(labels).toContain("My Requests");
    expect(labels).toContain("Interviews");
  });

  it("renders candidate tabs for candidate role", () => {
    const { container } = render(<NavTabs role="candidate" />);
    const links = container.querySelectorAll("a");
    const labels = Array.from(links).map((l) => l.textContent);
    expect(labels).toContain("Overview");
    expect(labels).toContain("Invitations");
    expect(labels).toContain("Work Logs");
    expect(labels).toContain("Payments");
  });

  it("renders company tabs for company role", () => {
    const { container } = render(<NavTabs role="company" />);
    const links = container.querySelectorAll("a");
    const labels = Array.from(links).map((l) => l.textContent);
    expect(labels).toContain("Overview");
    expect(labels).toContain("Requests");
    expect(labels).toContain("Companies");
    expect(labels).toContain("Stores");
  });

  it("renders inspector tabs for inspector role", () => {
    const { container } = render(<NavTabs role="inspector" />);
    const links = container.querySelectorAll("a");
    const labels = Array.from(links).map((l) => l.textContent);
    expect(labels).toContain("Overview");
    expect(labels).toContain("ID Requests");
  });

  it("renders nav element with accessible label", () => {
    const { container } = render(<NavTabs role="admin" />);
    const nav = container.querySelector("nav");
    expect(nav).toHaveAttribute("aria-label", "admin navigation");
  });

  it("marks Overview as active when on /admin path", () => {
    const { container } = render(<NavTabs role="admin" />);
    const links = container.querySelectorAll("a");
    const overviewLink = Array.from(links).find(
      (l) => l.textContent === "Overview",
    );
    expect(overviewLink).toHaveClass("shAppHeaderTabActive");
  });

  it("marks Candidates as inactive when on /admin path", () => {
    const { container } = render(<NavTabs role="admin" />);
    const links = container.querySelectorAll("a");
    const candidatesLink = Array.from(links).find(
      (l) => l.textContent === "Candidates",
    );
    expect(candidatesLink).toHaveClass("shAppHeaderTabInactive");
  });
});
