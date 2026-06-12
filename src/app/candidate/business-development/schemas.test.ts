import { describe, it, expect } from "vitest";
import {
  listBusinessDevelopmentSchema,
  getBusinessDevelopmentSchema,
  createBusinessDevelopmentSchema,
  updateBusinessDevelopmentSchema,
  deleteBusinessDevelopmentSchema,
  businessDevelopmentItemOutputSchema,
  businessDevelopmentActionResultOutputSchema,
  listBusinessDevelopmentResultOutputSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Input schema tests — candidate/business-development
// ---------------------------------------------------------------------------

describe("listBusinessDevelopmentSchema", () => {
  it("accepts valid pagination input", () => {
    const r = listBusinessDevelopmentSchema.safeParse({ page: 1, limit: 20 });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("defaults page and limit", () => {
    const r = listBusinessDevelopmentSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.limit).toBe(20);
    }
  });

  it("rejects page < 1", () => {
    expect(
      listBusinessDevelopmentSchema.safeParse({ page: 0 }).success,
    ).toBe(false);
  });

  it("rejects limit > 100", () => {
    expect(
      listBusinessDevelopmentSchema.safeParse({ limit: 200 }).success,
    ).toBe(false);
  });

  it("coerces string page and limit", () => {
    const r = listBusinessDevelopmentSchema.safeParse({
      page: "2",
      limit: "10",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(10);
    }
  });
});

describe("getBusinessDevelopmentSchema", () => {
  it("accepts valid UUID", () => {
    const r = getBusinessDevelopmentSchema.safeParse({
      uuid: "abc-123-def-456",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.uuid).toBe("abc-123-def-456");
    }
  });

  it("rejects missing uuid", () => {
    expect(getBusinessDevelopmentSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty uuid", () => {
    expect(
      getBusinessDevelopmentSchema.safeParse({ uuid: "" }).success,
    ).toBe(false);
  });
});

describe("createBusinessDevelopmentSchema", () => {
  const validInput = {
    company_name: "Test Corp",
    company_email: "test@example.com",
    contact_name: "John Doe",
  };

  it("accepts valid input", () => {
    const r = createBusinessDevelopmentSchema.safeParse(validInput);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.company_name).toBe("Test Corp");
      expect(r.data.company_email).toBe("test@example.com");
      expect(r.data.contact_name).toBe("John Doe");
    }
  });

  it("applies defaults for optional fields", () => {
    const r = createBusinessDevelopmentSchema.safeParse(validInput);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.currency_code).toBe("KWD");
      expect(r.data.contact_position).toBe("");
      expect(r.data.phone_number).toBe("");
      expect(r.data.requesting_for).toBe("");
      expect(r.data.notes).toBe("");
    }
  });

  it("rejects missing company_name", () => {
    expect(
      createBusinessDevelopmentSchema.safeParse({
        company_email: "test@example.com",
        contact_name: "John",
      }).success,
    ).toBe(false);
  });

  it("rejects missing company_email", () => {
    expect(
      createBusinessDevelopmentSchema.safeParse({
        company_name: "Test",
        contact_name: "John",
      }).success,
    ).toBe(false);
  });

  it("rejects missing contact_name", () => {
    expect(
      createBusinessDevelopmentSchema.safeParse({
        company_name: "Test",
        company_email: "test@example.com",
      }).success,
    ).toBe(false);
  });

  it("rejects empty company_name", () => {
    expect(
      createBusinessDevelopmentSchema.safeParse({
        ...validInput,
        company_name: "",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      createBusinessDevelopmentSchema.safeParse({
        ...validInput,
        company_email: "not-an-email",
      }).success,
    ).toBe(false);
  });

  it("rejects currency_code not length 3", () => {
    expect(
      createBusinessDevelopmentSchema.safeParse({
        ...validInput,
        currency_code: "USDD",
      }).success,
    ).toBe(false);
  });
});

describe("updateBusinessDevelopmentSchema", () => {
  const validInput = {
    uuid: "abc-123",
    company_name: "Updated Corp",
  };

  it("accepts valid update with partial fields", () => {
    const r = updateBusinessDevelopmentSchema.safeParse(validInput);
    expect(r.success).toBe(true);
  });

  it("accepts all optional fields nullable", () => {
    const r = updateBusinessDevelopmentSchema.safeParse({
      uuid: "abc-123",
      contact_position: null,
      phone_number: null,
      notes: null,
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing uuid", () => {
    expect(
      updateBusinessDevelopmentSchema.safeParse({ company_name: "Test" })
        .success,
    ).toBe(false);
  });

  it("rejects empty uuid", () => {
    expect(
      updateBusinessDevelopmentSchema.safeParse({
        uuid: "",
        company_name: "Test",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      updateBusinessDevelopmentSchema.safeParse({
        uuid: "abc",
        company_email: "bad",
      }).success,
    ).toBe(false);
  });

  it("rejects invalid currency_code", () => {
    expect(
      updateBusinessDevelopmentSchema.safeParse({
        uuid: "abc",
        currency_code: "TOOLONG",
      }).success,
    ).toBe(false);
  });
});

describe("deleteBusinessDevelopmentSchema", () => {
  it("accepts valid UUID", () => {
    expect(
      deleteBusinessDevelopmentSchema.safeParse({ uuid: "abc-123" }).success,
    ).toBe(true);
  });

  it("rejects missing uuid", () => {
    expect(deleteBusinessDevelopmentSchema.safeParse({}).success).toBe(false);
  });

  it("rejects empty uuid", () => {
    expect(
      deleteBusinessDevelopmentSchema.safeParse({ uuid: "" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

describe("businessDevelopmentItemOutputSchema", () => {
  const validItem = {
    company_request_uuid: "abc-123",
    company_name: "Test Corp",
    company_email: "test@example.com",
    contact_name: "John",
    contact_position: null,
    phone_number: null,
    requesting_for: null,
    status: null,
    country_id: null,
    currency_code: null,
    country_name_en: null,
    country_name_ar: null,
    created_at: null,
    updated_at: null,
  };

  it("accepts valid item", () => {
    expect(
      businessDevelopmentItemOutputSchema.safeParse(validItem).success,
    ).toBe(true);
  });

  it("accepts non-null values", () => {
    expect(
      businessDevelopmentItemOutputSchema.safeParse({
        ...validItem,
        status: true,
        country_id: 1,
        currency_code: "KWD",
      }).success,
    ).toBe(true);
  });

  it("rejects missing company_request_uuid", () => {
    const { company_request_uuid: _, ...rest } = validItem;
    expect(businessDevelopmentItemOutputSchema.safeParse(rest).success).toBe(
      false,
    );
  });

  it("rejects missing company_name", () => {
    const { company_name: _, ...rest } = validItem;
    expect(businessDevelopmentItemOutputSchema.safeParse(rest).success).toBe(
      false,
    );
  });
});

describe("businessDevelopmentActionResultOutputSchema", () => {
  it("accepts success result", () => {
    expect(
      businessDevelopmentActionResultOutputSchema.safeParse({
        success: true,
        uuid: "abc-123",
      }).success,
    ).toBe(true);
  });

  it("accepts error result", () => {
    expect(
      businessDevelopmentActionResultOutputSchema.safeParse({
        success: false,
        error: "Not found",
      }).success,
    ).toBe(true);
  });

  it("rejects success without uuid", () => {
    expect(
      businessDevelopmentActionResultOutputSchema.safeParse({
        success: true,
      }).success,
    ).toBe(false);
  });

  it("rejects error without error field", () => {
    expect(
      businessDevelopmentActionResultOutputSchema.safeParse({
        success: false,
      }).success,
    ).toBe(false);
  });
});

describe("listBusinessDevelopmentResultOutputSchema", () => {
  const validResult = {
    items: [
      {
        company_request_uuid: "abc",
        company_name: "Test",
        company_email: "t@t.com",
        contact_name: "John",
        contact_position: null,
        phone_number: null,
        requesting_for: null,
        status: null,
        country_id: null,
        currency_code: null,
        country_name_en: null,
        country_name_ar: null,
        created_at: null,
        updated_at: null,
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  it("accepts valid result", () => {
    expect(
      listBusinessDevelopmentResultOutputSchema.safeParse(validResult).success,
    ).toBe(true);
  });

  it("rejects missing items", () => {
    const { items: _, ...rest } = validResult;
    expect(
      listBusinessDevelopmentResultOutputSchema.safeParse(rest).success,
    ).toBe(false);
  });
});
