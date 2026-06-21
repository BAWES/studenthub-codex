import { describe, it, expect } from "vitest";
import {
  pipelineStageSchema,
  updatePipelineStageSchema,
} from "./schemas";

describe("pipelineStageSchema", () => {
  it("accepts valid stage values", () => {
    const stages = ["pending_review", "interviewing", "offered", "hired", "rejected"];
    for (const stage of stages) {
      expect(pipelineStageSchema.safeParse(stage).success).toBe(true);
    }
  });

  it("rejects invalid stage values", () => {
    expect(pipelineStageSchema.safeParse("invalid_stage").success).toBe(false);
    expect(pipelineStageSchema.safeParse("").success).toBe(false);
  });
});

describe("updatePipelineStageSchema", () => {
  it("accepts valid payload", () => {
    const result = updatePipelineStageSchema.safeParse({
      invitationUuid: "inv-uuid-123",
      stage: "interviewing",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.invitationUuid).toBe("inv-uuid-123");
      expect(result.data.stage).toBe("interviewing");
    }
  });

  it("rejects empty invitationUuid", () => {
    const result = updatePipelineStageSchema.safeParse({
      invitationUuid: "",
      stage: "hired",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid stage", () => {
    const result = updatePipelineStageSchema.safeParse({
      invitationUuid: "inv-uuid-123",
      stage: "not_a_stage",
    });
    expect(result.success).toBe(false);
  });
});
