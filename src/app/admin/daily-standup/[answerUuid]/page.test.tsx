import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    daily_standup_answer: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock session
vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { getDailyStandupAnswer } from "./actions";

describe("getDailyStandupAnswer (detail)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireCapability).mockResolvedValue(undefined);
  });

  it("returns answer with all fields", async () => {
    const mockRow = {
      answer_uuid: "uuid-1",
      staff_id: 42,
      question_uuid: "q-1",
      question: "What's your progress?",
      answer: "Almost done",
      created_at: new Date("2026-06-21T10:00:00Z"),
      updated_at: new Date("2026-06-21T12:00:00Z"),
    };

    vi.mocked(prisma.daily_standup_answer.findUnique).mockResolvedValue(mockRow);

    const result = await getDailyStandupAnswer("uuid-1");
    expect(result.answer).toBeDefined();
    expect(result.answer!.staff_id).toBe(42);
    expect(result.answer!.question).toBe("What's your progress?");
    expect(result.answer!.answer).toBe("Almost done");
  });

  it("requires admin.system capability", async () => {
    await getDailyStandupAnswer("uuid-1");
    expect(requireCapability).toHaveBeenCalledWith("admin.system");
  });
});
