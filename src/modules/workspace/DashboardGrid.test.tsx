// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { DashboardGrid } from "./DashboardGrid";

afterEach(() => { cleanup(); });

const testCards = [
  { label: "Active Candidates", value: 143, change: "+12%", trend: "up" as const },
  { label: "Open Requests", value: 28, change: "-3", trend: "down" as const },
  { label: "Placements", value: 56, change: "+8%", trend: "up" as const },
];

describe("DashboardGrid", () => {
  it("renders stat cards with labels and values", () => {
    render(
      <DashboardGrid statCards={testCards} />
    );
    expect(screen.getByText("Active Candidates")).toBeDefined();
    expect(screen.getByText("143")).toBeDefined();
    expect(screen.getByText("Open Requests")).toBeDefined();
    expect(screen.getByText("28")).toBeDefined();
  });

  it("renders trend indicators", () => {
    render(
      <DashboardGrid statCards={testCards} />
    );
    expect(screen.getByText("+12%")).toBeDefined();
    expect(screen.getByText("-3")).toBeDefined();
  });

  it("renders chart containers when provided", () => {
    render(
      <DashboardGrid
        statCards={testCards}
        charts={
          <div data-testid="chart-area">
            <canvas />
          </div>
        }
      />
    );
    expect(screen.getByTestId("chart-area")).toBeDefined();
  });

  it("renders activity feed items", () => {
    const activities = [
      { id: "1", text: "New candidate registered", time: "2 min ago" },
      { id: "2", text: "Request #1001 fulfilled", time: "15 min ago" },
    ];
    render(
      <DashboardGrid
        statCards={testCards}
        activityFeed={{ title: "Recent Activity", items: activities }}
      />
    );
    expect(screen.getByText("Recent Activity")).toBeDefined();
    expect(screen.getByText("New candidate registered")).toBeDefined();
    expect(screen.getByText("2 min ago")).toBeDefined();
  });

  it("shows loading skeleton when loading is true", () => {
    const { container } = render(
      <DashboardGrid statCards={[]} loading />
    );
    expect(container.querySelector('[data-slot="skeleton"]')).toBeTruthy();
  });

  it("renders chart section title when charts have a title", () => {
    render(
      <DashboardGrid
        statCards={testCards}
        charts={<div>Chart Content</div>}
        chartTitle="Monthly Overview"
      />
    );
    expect(screen.getByText("Monthly Overview")).toBeDefined();
  });
});
