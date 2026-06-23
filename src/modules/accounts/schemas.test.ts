import { describe, it, expect } from "vitest";
import {
  accountListItemSchema,
  accountDetailSchema,
  listAccountsResultSchema,
  candidateSkillItemSchema,
  skillListResultSchema,
  accountActionResultSchema,
  updateBankResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// accountListItemSchema
// ---------------------------------------------------------------------------
describe("accountListItemSchema", () => {
  const valid = {
    admin_id: 1,
    admin_name: "John Doe",
    admin_email: "john@example.com",
    admin_status: 1,
    admin_created_at: new Date("2026-01-01"),
  };

  it("accepts a valid account list item", () => {
    expect(accountListItemSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing admin_id", () => {
    const { admin_id: _, ...rest } = valid;
    expect(accountListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing admin_name", () => {
    const { admin_name: _, ...rest } = valid;
    expect(accountListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing admin_email", () => {
    const { admin_email: _, ...rest } = valid;
    expect(accountListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing admin_status", () => {
    const { admin_status: _, ...rest } = valid;
    expect(accountListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing admin_created_at", () => {
    const { admin_created_at: _, ...rest } = valid;
    expect(accountListItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for admin_id", () => {
    expect(
      accountListItemSchema.safeParse({ ...valid, admin_id: "not-a-number" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for admin_status", () => {
    expect(
      accountListItemSchema.safeParse({ ...valid, admin_status: "active" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for admin_created_at", () => {
    expect(
      accountListItemSchema.safeParse({ ...valid, admin_created_at: "2026-01-01" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// accountDetailSchema
// ---------------------------------------------------------------------------
describe("accountDetailSchema", () => {
  const valid = {
    admin_id: 1,
    admin_name: "John Doe",
    admin_email: "john@example.com",
    admin_status: 1,
    admin_created_at: new Date("2026-01-01"),
    admin_updated_at: new Date("2026-06-01"),
    admin_limited_access: 0,
  };

  it("accepts a valid account detail", () => {
    expect(accountDetailSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable admin_limited_access", () => {
    expect(
      accountDetailSchema.safeParse({ ...valid, admin_limited_access: null }).success,
    ).toBe(true);
  });

  it("rejects missing admin_updated_at", () => {
    const { admin_updated_at: _, ...rest } = valid;
    expect(accountDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing admin_limited_access", () => {
    const { admin_limited_access: _, ...rest } = valid;
    expect(accountDetailSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for admin_updated_at", () => {
    expect(
      accountDetailSchema.safeParse({ ...valid, admin_updated_at: "2026-06-01" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// listAccountsResultSchema
// ---------------------------------------------------------------------------
describe("listAccountsResultSchema", () => {
  const valid = {
    accounts: [
      {
        admin_id: 1,
        admin_name: "John Doe",
        admin_email: "john@example.com",
        admin_status: 1,
        admin_created_at: new Date("2026-01-01"),
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts a valid result", () => {
    expect(listAccountsResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty accounts array", () => {
    expect(
      listAccountsResultSchema.safeParse({ ...valid, accounts: [], total: 0, totalPages: 0 })
        .success,
    ).toBe(true);
  });

  it("rejects missing accounts", () => {
    const { accounts: _, ...rest } = valid;
    expect(listAccountsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing total", () => {
    const { total: _, ...rest } = valid;
    expect(listAccountsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing page", () => {
    const { page: _, ...rest } = valid;
    expect(listAccountsResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects negative total", () => {
    expect(
      listAccountsResultSchema.safeParse({ ...valid, total: -1 }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    expect(
      listAccountsResultSchema.safeParse({ ...valid, page: 0 }).success,
    ).toBe(false);
  });

  it("rejects non-integer limit", () => {
    expect(
      listAccountsResultSchema.safeParse({ ...valid, limit: 20.5 }).success,
    ).toBe(false);
  });

  it("rejects non-array contracts", () => {
    expect(
      listAccountsResultSchema.safeParse({ ...valid, accounts: "not-an-array" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// candidateSkillItemSchema
// ---------------------------------------------------------------------------
describe("candidateSkillItemSchema", () => {
  const valid = {
    candidate_skill_id: 42,
    skill: "JavaScript",
    candidate_skill_created_at: new Date("2026-01-01"),
  };

  it("accepts a valid candidate skill item", () => {
    expect(candidateSkillItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable candidate_skill_created_at", () => {
    expect(
      candidateSkillItemSchema.safeParse({ ...valid, candidate_skill_created_at: null }).success,
    ).toBe(true);
  });

  it("rejects missing candidate_skill_id", () => {
    const { candidate_skill_id: _, ...rest } = valid;
    expect(candidateSkillItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing skill", () => {
    const { skill: _, ...rest } = valid;
    expect(candidateSkillItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for candidate_skill_id", () => {
    expect(
      candidateSkillItemSchema.safeParse({ ...valid, candidate_skill_id: "not-a-number" }).success,
    ).toBe(false);
  });

  it("rejects wrong type for candidate_skill_created_at", () => {
    expect(
      candidateSkillItemSchema.safeParse({ ...valid, candidate_skill_created_at: "2026-01-01" })
        .success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// skillListResultSchema
// ---------------------------------------------------------------------------
describe("skillListResultSchema", () => {
  const valid = {
    skills: [
      {
        candidate_skill_id: 42,
        skill: "Python",
        candidate_skill_created_at: null,
      },
    ],
  };

  it("accepts a valid skill list result", () => {
    expect(skillListResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty skills array", () => {
    expect(
      skillListResultSchema.safeParse({ skills: [] }).success,
    ).toBe(true);
  });

  it("rejects missing skills", () => {
    expect(skillListResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-array skills", () => {
    expect(
      skillListResultSchema.safeParse({ skills: "not-an-array" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// accountActionResultSchema
// ---------------------------------------------------------------------------
describe("accountActionResultSchema", () => {
  const valid = {
    operation: "updateBankAccount",
    message: "Bank account updated successfully",
  };

  it("accepts a valid action result", () => {
    expect(accountActionResultSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing operation", () => {
    const { operation: _, ...rest } = valid;
    expect(accountActionResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing message", () => {
    const { message: _, ...rest } = valid;
    expect(accountActionResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for operation", () => {
    expect(
      accountActionResultSchema.safeParse({ ...valid, operation: 123 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for message", () => {
    expect(
      accountActionResultSchema.safeParse({ ...valid, message: true }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateBankResultSchema
// ---------------------------------------------------------------------------
describe("updateBankResultSchema", () => {
  const valid = {
    operation: "updateBankAccount",
    message: "Bank account updated successfully",
    bankName: "National Bank of Kuwait",
  };

  it("accepts a valid update bank result", () => {
    expect(updateBankResultSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts missing optional bankName", () => {
    const { bankName: _, ...rest } = valid;
    expect(updateBankResultSchema.safeParse(rest).success).toBe(true);
  });

  it("rejects missing operation", () => {
    const { operation: _, ...rest } = valid;
    expect(updateBankResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing message", () => {
    const { message: _, ...rest } = valid;
    expect(updateBankResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects wrong type for bankName", () => {
    expect(
      updateBankResultSchema.safeParse({ ...valid, bankName: 12345 }).success,
    ).toBe(false);
  });
});
