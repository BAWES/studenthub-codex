import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    daily_standup_answer: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
  },
}));

// Mock session
vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/modules/auth/session";
import { listDailyStandups, getDailyStandupAnswer } from "./actions";

describe("listDailyStandups", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireCapability).mockResolvedValue(undefined);
  });

  it("returns paginated daily standup answers", async () => {
    const mockRows = [
      {
        answer_uuid: "uuid-1",
        staff_id: 1,
        question_uuid: "q-1",
        question: "What did you do?",
        answer: "Worked on OS Launch",
        created_at: new Date("2026-06-21"),
        updated_at: new Date("2026-06-21"),
      },
    ];

    vi.mocked(prisma.daily_standup_answer.findMany).mockResolvedValue(mockRows);
    vi.mocked(prisma.daily_standup_answer.count).mockResolvedValue(1);

    const result = await listDailyStandups({ limit: 50, page: 1 });

    expect(result.answers).toHaveLength(1);
    expect(result.answers[0].answer_uuid).toBe("uuid-1");
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("requires admin.system capability", async () => {
    await listDailyStandups();
    expect(requireCapability).toHaveBeenCalledWith("admin.system");
  });
});

describe("getDailyStandupAnswer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireCapability).mockResolvedValue(undefined);
  });

  it("returns an answer by uuid", async () => {
    const mockRow = {
      answer_uuid: "uuid-1",
      staff_id: 1,
      question_uuid: "q-1",
      question: "What did you do?",
      answer: "Worked on OS Launch",
      created_at: new Date("2026-06-21"),
      updated_at: new Date("2026-06-21"),
    };

    vi.mocked(prisma.daily_standup_answer.findUnique).mockResolvedValue(mockRow);

    const result = await getDailyStandupAnswer("uuid-1");
    expect(result.answer).toBeDefined();
    expect(result.answer!.answer_uuid).toBe("uuid-1");
  });

  it("returns null for missing answer", async () => {
    vi.mocked(prisma.daily_standup_answer.findUnique).mockResolvedValue(null);
    const result = await getDailyStandupAnswer("nonexistent");
    expect(result.answer).toBeNull();
  });
});
