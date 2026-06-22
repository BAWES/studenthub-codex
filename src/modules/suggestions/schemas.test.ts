import { describe, it, expect } from "vitest";
import {
  suggestionListItemSchema,
  listSuggestionsResultSchema,
  suggestionActionResultSchema,
} from "./schemas";

describe("suggestionListItemSchema", () => {
  const valid = {
    suggestion_uuid: "sug-uuid-1", request_uuid: "req-uuid-1",
    candidate_id: 1, fulltimer_uuid: null, note_uuid: "note-uuid-1",
    story_uuid: null, suggestion_status: 1, mail_to_company: true,
    suggestion_datetime: new Date("2026-06-14T10:00:00"),
  };
  it("accepts a valid suggestion item", () => expect(suggestionListItemSchema.safeParse(valid).success).toBe(true));
  it("accepts all nullable fields as null", () => {
    expect(suggestionListItemSchema.safeParse({
      ...valid, candidate_id: null, fulltimer_uuid: null, story_uuid: null,
    }).success).toBe(true);
  });
  it("rejects missing suggestion_uuid", () => {
    const { suggestion_uuid: _, ...rest } = valid;
    expect(suggestionListItemSchema.safeParse(rest).success).toBe(false);
  });
  it("rejects non-date suggestion_datetime", () => {
    expect(suggestionListItemSchema.safeParse({ ...valid, suggestion_datetime: "2026-01-01" }).success).toBe(false);
  });
});

describe("listSuggestionsResultSchema", () => {
  const valid = () => ({
    suggestions: [{ suggestion_uuid: "s-1", request_uuid: "r-1", candidate_id: null,
                    fulltimer_uuid: null, note_uuid: "n-1", story_uuid: null,
                    suggestion_status: 0, mail_to_company: false,
                    suggestion_datetime: new Date() }],
    total: 1, page: 1, limit: 20, totalPages: 1,
  });
  it("accepts a valid result", () => expect(listSuggestionsResultSchema.safeParse(valid()).success).toBe(true));
  it("accepts empty suggestions", () => expect(listSuggestionsResultSchema.safeParse({ ...valid(), suggestions: [] }).success).toBe(true));
  it("rejects missing suggestions", () => {
    const { suggestions: _, ...rest } = valid();
    expect(listSuggestionsResultSchema.safeParse(rest).success).toBe(false);
  });
  it("rejects limit above 100", () => {
    expect(listSuggestionsResultSchema.safeParse({ ...valid(), limit: 200 }).success).toBe(false);
  });
});

describe("suggestionActionResultSchema", () => {
  it("accepts success", () => expect(suggestionActionResultSchema.safeParse({ operation: "success", message: "Done" }).success).toBe(true));
  it("accepts error", () => expect(suggestionActionResultSchema.safeParse({ operation: "error", message: "Failed" }).success).toBe(true));
  it("rejects unknown operation", () => expect(suggestionActionResultSchema.safeParse({ operation: "maybe", message: "?" }).success).toBe(false));
  it("rejects missing message", () => expect(suggestionActionResultSchema.safeParse({ operation: "success" }).success).toBe(false));
});
