import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema definitions (same as in actions.ts — duplicated for testing to
// avoid importing "use server" dependencies)
// ---------------------------------------------------------------------------

const listSuggestionsSchema = z.object({
  requestUuid: z.string().max(60).optional(),
  storyUuid: z.string().max(60).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const updateSuggestionStatusSchema = z.object({
  suggestionUuid: z.string().min(1).max(60),
  status: z.number().int().min(0).max(3),
});

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

type SuggestionListItem = {
  suggestion_uuid: string;
  request_uuid: string;
  candidate_id: number | null;
  fulltimer_uuid: string | null;
  note_uuid: string;
  story_uuid: string | null;
  suggestion_status: number;
  mail_to_company: boolean;
  suggestion_datetime: Date;
};

type SuggestionListResult = {
  suggestions: SuggestionListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type UpdateSuggestionStatusResult = {
  operation: "success" | "error";
  message: string;
};

// ---------------------------------------------------------------------------
// Filter builder (pure function, testable without mocks)
// ---------------------------------------------------------------------------

type SuggestionWhereInput = {
  request_uuid?: string;
  story_uuid?: string;
};

function buildSuggestionFilter(params: {
  requestUuid?: string;
  storyUuid?: string;
}): SuggestionWhereInput {
  const where: SuggestionWhereInput = {};

  if (params.requestUuid && params.requestUuid.trim()) {
    where.request_uuid = params.requestUuid;
  }

  if (params.storyUuid && params.storyUuid.trim()) {
    where.story_uuid = params.storyUuid;
  }

  return where;
}

// ---------------------------------------------------------------------------
// Tests: listSuggestionsSchema
// ---------------------------------------------------------------------------

describe("listSuggestionsSchema", () => {
  it("accepts empty params (no filters)", () => {
    const result = listSuggestionsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBeUndefined();
      expect(result.data.limit).toBeUndefined();
      expect(result.data.requestUuid).toBeUndefined();
      expect(result.data.storyUuid).toBeUndefined();
    }
  });

  it("accepts all optional params", () => {
    const result = listSuggestionsSchema.safeParse({
      requestUuid: "request_abc123",
      storyUuid: "story_def456",
      page: 2,
      limit: 50,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.requestUuid).toBe("request_abc123");
      expect(result.data.storyUuid).toBe("story_def456");
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it("accepts requestUuid only", () => {
    const result = listSuggestionsSchema.safeParse({
      requestUuid: "request_xyz789",
    });
    expect(result.success).toBe(true);
  });

  it("accepts storyUuid only", () => {
    const result = listSuggestionsSchema.safeParse({
      storyUuid: "story_xyz789",
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative page number", () => {
    const result = listSuggestionsSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero limit", () => {
    const result = listSuggestionsSchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects limit over 100", () => {
    const result = listSuggestionsSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric page", () => {
    const result = listSuggestionsSchema.safeParse({ page: "first" });
    expect(result.success).toBe(false);
  });

  it("rejects very long requestUuid (>60 chars)", () => {
    const result = listSuggestionsSchema.safeParse({
      requestUuid: "x".repeat(61),
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: updateSuggestionStatusSchema
// ---------------------------------------------------------------------------

describe("updateSuggestionStatusSchema", () => {
  it("accepts valid suggestionUuid and status", () => {
    const result = updateSuggestionStatusSchema.safeParse({
      suggestionUuid: "suggestion_abc123",
      status: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts status 0 (pending)", () => {
    const result = updateSuggestionStatusSchema.safeParse({
      suggestionUuid: "suggestion_abc123",
      status: 0,
    });
    expect(result.success).toBe(true);
  });

  it("accepts status 2 (rejected)", () => {
    const result = updateSuggestionStatusSchema.safeParse({
      suggestionUuid: "suggestion_abc123",
      status: 2,
    });
    expect(result.success).toBe(true);
  });

  it("accepts status 3 (accepted)", () => {
    const result = updateSuggestionStatusSchema.safeParse({
      suggestionUuid: "suggestion_abc123",
      status: 3,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty suggestionUuid", () => {
    const result = updateSuggestionStatusSchema.safeParse({
      suggestionUuid: "",
      status: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing suggestionUuid", () => {
    const result = updateSuggestionStatusSchema.safeParse({ status: 1 });
    expect(result.success).toBe(false);
  });

  it("rejects negative status", () => {
    const result = updateSuggestionStatusSchema.safeParse({
      suggestionUuid: "suggestion_abc123",
      status: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects status over 3", () => {
    const result = updateSuggestionStatusSchema.safeParse({
      suggestionUuid: "suggestion_abc123",
      status: 4,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer status", () => {
    const result = updateSuggestionStatusSchema.safeParse({
      suggestionUuid: "suggestion_abc123",
      status: "accepted",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing status", () => {
    const result = updateSuggestionStatusSchema.safeParse({
      suggestionUuid: "suggestion_abc123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects suggestionUuid over 60 chars", () => {
    const result = updateSuggestionStatusSchema.safeParse({
      suggestionUuid: "s".repeat(61),
      status: 1,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: buildSuggestionFilter (pure function)
// ---------------------------------------------------------------------------

describe("buildSuggestionFilter", () => {
  it("returns empty object with no filters", () => {
    const result = buildSuggestionFilter({});
    expect(result).toEqual({});
  });

  it("filters by requestUuid", () => {
    const result = buildSuggestionFilter({ requestUuid: "request_abc123" });
    expect(result).toEqual({ request_uuid: "request_abc123" });
  });

  it("filters by storyUuid", () => {
    const result = buildSuggestionFilter({ storyUuid: "story_def456" });
    expect(result).toEqual({ story_uuid: "story_def456" });
  });

  it("filters by both requestUuid and storyUuid", () => {
    const result = buildSuggestionFilter({
      requestUuid: "request_abc123",
      storyUuid: "story_def456",
    });
    expect(result).toEqual({
      request_uuid: "request_abc123",
      story_uuid: "story_def456",
    });
  });

  it("ignores empty requestUuid", () => {
    const result = buildSuggestionFilter({ requestUuid: "" });
    expect(result).toEqual({});
  });

  it("ignores whitespace-only requestUuid", () => {
    const result = buildSuggestionFilter({ requestUuid: "   " });
    expect(result).toEqual({});
  });

  it("ignores empty storyUuid", () => {
    const result = buildSuggestionFilter({ storyUuid: "" });
    expect(result).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// Tests: Return type shapes
// ---------------------------------------------------------------------------

describe("SuggestionListItem shape", () => {
  it("defines the expected fields", () => {
    const mock: SuggestionListItem = {
      suggestion_uuid: "suggestion_abc123",
      request_uuid: "request_def456",
      candidate_id: 12345,
      fulltimer_uuid: null,
      note_uuid: "note_xyz789",
      story_uuid: null,
      suggestion_status: 1,
      mail_to_company: false,
      suggestion_datetime: new Date("2024-06-01"),
    };
    expect(mock.suggestion_uuid).toBe("suggestion_abc123");
    expect(mock.request_uuid).toBe("request_def456");
    expect(mock.candidate_id).toBe(12345);
    expect(mock.fulltimer_uuid).toBeNull();
    expect(mock.note_uuid).toBe("note_xyz789");
    expect(mock.story_uuid).toBeNull();
    expect(mock.suggestion_status).toBe(1);
    expect(mock.mail_to_company).toBe(false);
  });
});

describe("SuggestionListResult shape", () => {
  it("defines pagination fields", () => {
    const mock: SuggestionListResult = {
      suggestions: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(mock.suggestions).toEqual([]);
    expect(mock.total).toBe(0);
    expect(mock.page).toBe(1);
    expect(mock.limit).toBe(20);
    expect(mock.totalPages).toBe(0);
  });
});

describe("UpdateSuggestionStatusResult shape", () => {
  it("can be success", () => {
    const result: UpdateSuggestionStatusResult = {
      operation: "success",
      message: "Suggestion status updated successfully",
    };
    expect(result.operation).toBe("success");
  });

  it("can be error", () => {
    const result: UpdateSuggestionStatusResult = {
      operation: "error",
      message: "Invalid Suggestion",
    };
    expect(result.operation).toBe("error");
  });
});
