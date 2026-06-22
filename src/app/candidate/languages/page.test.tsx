import { describe, it, expect } from "vitest";
import {
  languageItemOutputSchema,
  languageActionResultOutputSchema,
} from "./schemas";

describe("candidate languages page — data contract", () => {
  it("languageItemOutputSchema validates a valid item", () => {
    const r = languageItemOutputSchema.safeParse({
      candidate_language_id: 1, language: "English", proficiency: "Fluent",
      candidate_language_created_at: new Date("2024-01-01"),
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.language).toBe("English");
  });

  it("languageItemOutputSchema rejects missing candidate_language_id", () => {
    const r = languageItemOutputSchema.safeParse({ language: "Arabic" });
    expect(r.success).toBe(false);
  });

  it("languageActionResultOutputSchema validates success", () => {
    const r = languageActionResultOutputSchema.safeParse({ success: true, languageId: 1 });
    expect(r.success).toBe(true);
  });

  it("languageActionResultOutputSchema validates failure", () => {
    const r = languageActionResultOutputSchema.safeParse({ success: false, error: "Failed" });
    expect(r.success).toBe(true);
  });
});
