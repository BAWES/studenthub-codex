import { describe, it, expect, vi, beforeEach } from "vitest";
import { getHubDataSchema } from "./schemas";
import { getHubData } from "./actions";

// Mock the module-level action before importing it
vi.mock("@/modules/app/actions", () => ({
  getUnifiedHubAction: vi.fn(),
}));

import { getUnifiedHubAction } from "@/modules/app/actions";
const mockGetUnifiedHubAction = vi.mocked(getUnifiedHubAction);

describe("getHubDataSchema", () => {
  it("accepts empty input", () => {
    const result = getHubDataSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts query string", () => {
    const result = getHubDataSchema.safeParse({ query: "Ahmed" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.query).toBe("Ahmed");
  });

  it("accepts valid scope", () => {
    const result = getHubDataSchema.safeParse({ scope: "people" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.scope).toBe("people");
  });

  it("rejects invalid scope", () => {
    const result = getHubDataSchema.safeParse({ scope: "invalid" });
    expect(result.success).toBe(false);
  });

  it("accepts record", () => {
    const result = getHubDataSchema.safeParse({ record: "abc-123" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.record).toBe("abc-123");
  });
});

describe("getHubData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUnifiedHubAction.mockResolvedValue({
      welcome: "Welcome!",
      queues: [],
      scopes: [],
      navigation: [],
    });
  });

  it("delegates to getUnifiedHubAction with empty input", async () => {
    await getHubData({});
    expect(mockGetUnifiedHubAction).toHaveBeenCalledWith({
      query: undefined,
      scope: undefined,
      record: undefined,
    });
  });

  it("delegates with query", async () => {
    await getHubData({ query: "Ahmed" });
    expect(mockGetUnifiedHubAction).toHaveBeenCalledWith({
      query: "Ahmed",
      scope: undefined,
      record: undefined,
    });
  });

  it("delegates with scope", async () => {
    await getHubData({ scope: "money" });
    expect(mockGetUnifiedHubAction).toHaveBeenCalledWith({
      query: undefined,
      scope: "money",
      record: undefined,
    });
  });

  it("throws on invalid input", async () => {
    await expect(getHubData({ scope: "bogus" } as any)).rejects.toThrow("Invalid enum value");
  });
});
