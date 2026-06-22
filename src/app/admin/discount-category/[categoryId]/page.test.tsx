// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

const mockGetDiscountCategory = vi.fn();

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: vi.fn().mockResolvedValue({ user: { id: "1" }, role: "admin" }),
  requireCapability: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/modules/workspace/WorkspaceShell", () => ({
  WorkspaceShell: ({
    children,
    eyebrow,
    title,
    metrics,
  }: {
    children: React.ReactNode;
    eyebrow: string;
    title: string;
    metrics: { label: string; value: string | number; note: string }[];
  }) => (
    <div data-testid="workspace-shell">
      <div data-testid="eyebrow">{eyebrow}</div>
      <div data-testid="title">{title}</div>
      {metrics.map((m) => (
        <span key={m.label} data-testid={`metric-${m.label}`}>
          {m.value}
        </span>
      ))}
      {children}
    </div>
  ),
}));

const mockRouter = { push: vi.fn(), refresh: vi.fn() };

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
  useRouter: () => mockRouter,
}));

vi.mock("@/modules/admin/discount-category/[categoryId]/actions", () => ({
  getDiscountCategory: (...args: unknown[]) => mockGetDiscountCategory(...args),
}));

const mockCategory = {
  category_id: 1,
  name_en: "Early Bird",
  name_ar: "تسجيل مبكر",
  image: "https://example.com/discounts/early-bird.png",
  created_at: new Date("2026-01-01T00:00:00Z"),
  updated_at: new Date("2026-06-01T00:00:00Z"),
};

describe("AdminDiscountCategoryDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders discount category detail with edit form", async () => {
    mockGetDiscountCategory.mockResolvedValue({ category: mockCategory });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ categoryId: "1" }),
      }),
    );

    expect(screen.getByTestId("eyebrow").textContent).toBe("Admin / Discount Category");
    expect(screen.getByTestId("title").textContent).toBe("Early Bird");
    // The edit form should render with the category name in the input
    expect(screen.getByDisplayValue("Early Bird")).toBeTruthy();
    expect(screen.getByDisplayValue("تسجيل مبكر")).toBeTruthy();
  });

  it("renders null fields as em-dash in metrics", async () => {
    mockGetDiscountCategory.mockResolvedValue({
      category: {
        ...mockCategory,
        name_ar: null,
        image: null,
        created_at: null,
        updated_at: null,
      },
    });

    const Page = (await import("./page")).default;
    render(
      await Page({
        params: Promise.resolve({ categoryId: "2" }),
      }),
    );

    expect(screen.getByTestId("metric-Created").textContent).toBe("—");
    expect(screen.getByTestId("metric-Updated").textContent).toBe("—");
  });

  it("calls notFound when category is null", async () => {
    mockGetDiscountCategory.mockResolvedValue({ category: null });

    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ categoryId: "999" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("calls notFound when categoryId is NaN", async () => {
    const Page = (await import("./page")).default;
    await expect(
      Page({ params: Promise.resolve({ categoryId: "not-a-number" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
