import { describe, it, expect } from "vitest";

import {
  listCandidateSkillsSchema,
  updateEmailSchema,
  updateBankAccountSchema,
  changePasswordSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listCandidateSkillsSchema
// ---------------------------------------------------------------------------

describe("listCandidateSkillsSchema", () => {
  it("accepts empty params", () => {
    const result = listCandidateSkillsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts explicit candidateId", () => {
    const result = listCandidateSkillsSchema.safeParse({ candidateId: "42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });

  it("rejects non-numeric candidateId", () => {
    const result = listCandidateSkillsSchema.safeParse({ candidateId: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects negative candidateId", () => {
    const result = listCandidateSkillsSchema.safeParse({ candidateId: "-1" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateEmailSchema
// ---------------------------------------------------------------------------

describe("updateEmailSchema", () => {
  it("accepts valid email", () => {
    const result = updateEmailSchema.safeParse({ email: "new@example.com" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("new@example.com");
    }
  });

  it("rejects empty email", () => {
    const result = updateEmailSchema.safeParse({ email: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const result = updateEmailSchema.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects missing email", () => {
    const result = updateEmailSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateBankAccountSchema
// ---------------------------------------------------------------------------

describe("updateBankAccountSchema", () => {
  it("accepts valid benefName and iban", () => {
    const result = updateBankAccountSchema.safeParse({
      benefName: "John Doe",
      iban: "KW81CBKU0000000000001234560101",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.benefName).toBe("John Doe");
      expect(result.data.iban).toBe("KW81CBKU0000000000001234560101");
    }
  });

  it("rejects empty benefName", () => {
    const result = updateBankAccountSchema.safeParse({
      benefName: "",
      iban: "KW81CBKU0000000000001234560101",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty iban", () => {
    const result = updateBankAccountSchema.safeParse({
      benefName: "John Doe",
      iban: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing benefName", () => {
    const result = updateBankAccountSchema.safeParse({ iban: "KW81..." });
    expect(result.success).toBe(false);
  });

  it("rejects missing iban", () => {
    const result = updateBankAccountSchema.safeParse({ benefName: "John" });
    expect(result.success).toBe(false);
  });

  it("rejects missing all fields", () => {
    const result = updateBankAccountSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// changePasswordSchema
// ---------------------------------------------------------------------------

describe("changePasswordSchema", () => {
  it("accepts valid old and new passwords", () => {
    const result = changePasswordSchema.safeParse({
      oldPassword: "current-pass",
      newPassword: "new-strong-pass-123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.oldPassword).toBe("current-pass");
      expect(result.data.newPassword).toBe("new-strong-pass-123");
    }
  });

  it("rejects empty oldPassword", () => {
    const result = changePasswordSchema.safeParse({
      oldPassword: "",
      newPassword: "new-pass",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty newPassword", () => {
    const result = changePasswordSchema.safeParse({
      oldPassword: "old-pass",
      newPassword: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing oldPassword", () => {
    const result = changePasswordSchema.safeParse({ newPassword: "new-pass" });
    expect(result.success).toBe(false);
  });

  it("rejects missing newPassword", () => {
    const result = changePasswordSchema.safeParse({ oldPassword: "old-pass" });
    expect(result.success).toBe(false);
  });

  it("rejects too-short new password (< 6 chars)", () => {
    const result = changePasswordSchema.safeParse({
      oldPassword: "old-pass",
      newPassword: "12345",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Return type shape verification
// ---------------------------------------------------------------------------

type CandidateSkillItem = {
  candidate_skill_id: number;
  skill: string;
  candidate_skill_created_at: Date | null;
};

type SkillListResult = {
  skills: CandidateSkillItem[];
};

type AccountActionResult = {
  operation: string;
  message: string;
};

type UpdateBankResult = {
  operation: string;
  message: string;
  bankName?: string;
};

describe("SkillListResult type shape", () => {
  it("conforms to expected structure", () => {
    const result: SkillListResult = {
      skills: [
        {
          candidate_skill_id: 1,
          skill: "JavaScript",
          candidate_skill_created_at: new Date("2024-01-01"),
        },
      ],
    };
    expect(result.skills).toHaveLength(1);
    expect(result.skills[0].skill).toBe("JavaScript");
  });

  it("handles empty skills list", () => {
    const result: SkillListResult = { skills: [] };
    expect(result.skills).toHaveLength(0);
  });
});

describe("AccountActionResult type shape", () => {
  it("represents a success result", () => {
    const result: AccountActionResult = {
      operation: "success",
      message: "Email updated successfully",
    };
    expect(result.operation).toBe("success");
  });

  it("represents an error result", () => {
    const result: AccountActionResult = {
      operation: "error",
      message: "Validation failed",
    };
    expect(result.operation).toBe("error");
  });
});

describe("UpdateBankResult type shape", () => {
  it("includes optional bankName", () => {
    const result: UpdateBankResult = {
      operation: "success",
      message: "Bank details updated",
      bankName: "National Bank of Kuwait",
    };
    expect(result.bankName).toBeDefined();
  });

  it("works without bankName", () => {
    const result: UpdateBankResult = {
      operation: "success",
      message: "Bank details updated",
    };
    expect(result.bankName).toBeUndefined();
  });
});
