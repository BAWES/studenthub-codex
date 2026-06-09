import { describe, it, expect } from "vitest";
import {
  listBusinessDevelopmentSchema,
  getBusinessDevelopmentSchema,
  createBusinessDevelopmentSchema,
  updateBusinessDevelopmentSchema,
  deleteBusinessDevelopmentSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema tests for candidate/business-development actions (pure unit — no DB)
// ---------------------------------------------------------------------------

describe("listBusinessDevelopmentSchema", () => {
  it("accepts empty params (defaults)", () => {
    const r = listBusinessDevelopmentSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("accepts pagination params", () => {
    const r = listBusinessDevelopmentSchema.safeParse({
      page: 2,
      limit: 10,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });

  it("rejects limit over 100", () => {
    expect(
      listBusinessDevelopmentSchema.safeParse({ limit: 999 }).success,
    ).toBe(false);
  });

  it("rejects negative page", () => {
    expect(
      listBusinessDevelopmentSchema.safeParse({ page: -1 }).success,
    ).toBe(false);
  });

  it("rejects zero page", () => {
    // positive() means 0 is rejected
    expect(
      listBusinessDevelopmentSchema.safeParse({ page: 0 }).success,
    ).toBe(false);
  });
});

describe("getBusinessDevelopmentSchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      getBusinessDevelopmentSchema.safeParse({ uuid: "abc-123-def" }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(getBusinessDevelopmentSchema.safeParse({ uuid: "" }).success).toBe(
      false,
    );
  });

  it("rejects missing UUID", () => {
    expect(getBusinessDevelopmentSchema.safeParse({}).success).toBe(false);
  });
});

describe("createBusinessDevelopmentSchema", () => {
  it("accepts valid create params", () => {
    const r = createBusinessDevelopmentSchema.safeParse({
      company_name: "ACME Corp",
      company_email: "contact@acme.com",
      contact_name: "John Doe",
      contact_position: "CEO",
      phone_number: "+965 5000 0000",
      requesting_for: "Software engineers",
      country_id: 1,
      currency_code: "KWD",
      notes: "Met at conference",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.company_name).toBe("ACME Corp");
      expect(r.data.company_email).toBe("contact@acme.com");
      expect(r.data.currency_code).toBe("KWD");
    }
  });

  it("accepts minimum required params", () => {
    const r = createBusinessDevelopmentSchema.safeParse({
      company_name: "Test Co",
      company_email: "test@test.com",
      contact_name: "Tester",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.currency_code).toBe("KWD"); // default
      expect(r.data.contact_position).toBe(""); // default
    }
  });

  it("rejects missing company_name", () => {
    expect(
      createBusinessDevelopmentSchema.safeParse({
        company_email: "test@test.com",
        contact_name: "Tester",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      createBusinessDevelopmentSchema.safeParse({
        company_name: "Test Co",
        company_email: "not-an-email",
        contact_name: "Tester",
      }).success,
    ).toBe(false);
  });

  it("rejects missing contact_name", () => {
    expect(
      createBusinessDevelopmentSchema.safeParse({
        company_name: "Test Co",
        company_email: "test@test.com",
      }).success,
    ).toBe(false);
  });

  it("rejects short currency code", () => {
    expect(
      createBusinessDevelopmentSchema.safeParse({
        company_name: "Test Co",
        company_email: "test@test.com",
        contact_name: "Tester",
        currency_code: "KW",
      }).success,
    ).toBe(false);
  });

  it("coerces string numbers for country_id", () => {
    const r = createBusinessDevelopmentSchema.safeParse({
      company_name: "Test Co",
      company_email: "test@test.com",
      contact_name: "Tester",
      country_id: "5",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.country_id).toBe(5);
    }
  });
});

describe("updateBusinessDevelopmentSchema", () => {
  it("accepts valid update params", () => {
    const r = updateBusinessDevelopmentSchema.safeParse({
      uuid: "abc-123",
      company_name: "Updated Co",
      contact_position: null,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.uuid).toBe("abc-123");
      expect(r.data.contact_position).toBeNull();
    }
  });

  it("accepts partial update (only uuid required)", () => {
    const r = updateBusinessDevelopmentSchema.safeParse({
      uuid: "abc-123",
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing uuid", () => {
    expect(
      updateBusinessDevelopmentSchema.safeParse({
        company_name: "Test",
      }).success,
    ).toBe(false);
  });

  it("rejects empty uuid", () => {
    expect(
      updateBusinessDevelopmentSchema.safeParse({ uuid: "" }).success,
    ).toBe(false);
  });

  it("rejects invalid email in update", () => {
    expect(
      updateBusinessDevelopmentSchema.safeParse({
        uuid: "abc-123",
        company_email: "bad-email",
      }).success,
    ).toBe(false);
  });

  it("accepts nullable fields", () => {
    const r = updateBusinessDevelopmentSchema.safeParse({
      uuid: "abc-123",
      contact_position: null,
      phone_number: null,
      requesting_for: null,
      country_id: null,
      currency_code: "KWD",
    });
    expect(r.success).toBe(true);
  });
});

describe("deleteBusinessDevelopmentSchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      deleteBusinessDevelopmentSchema.safeParse({ uuid: "abc-123" }).success,
    ).toBe(true);
  });

  it("rejects empty UUID", () => {
    expect(deleteBusinessDevelopmentSchema.safeParse({ uuid: "" }).success).toBe(
      false,
    );
  });

  it("rejects missing UUID", () => {
    expect(deleteBusinessDevelopmentSchema.safeParse({}).success).toBe(false);
  });
});
