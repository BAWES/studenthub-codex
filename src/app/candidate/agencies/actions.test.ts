import { describe, it, expect } from "vitest";
import {
  listAgenciesSchema,
  getAgencySchema,
  createAgencySchema,
  updateAgencySchema,
  deleteAgencySchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schemas validation tests
// ---------------------------------------------------------------------------

describe("listAgenciesSchema", () => {
  it("accepts default (empty input)", () => {
    const result = listAgenciesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts custom page and limit", () => {
    const result = listAgenciesSchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("accepts search parameter", () => {
    const result = listAgenciesSchema.safeParse({ search: "Test Agency" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBe("Test Agency");
    }
  });

  it("rejects page below 1", () => {
    const result = listAgenciesSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects limit above 100", () => {
    const result = listAgenciesSchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });
});

describe("getAgencySchema", () => {
  it("accepts valid company ID", () => {
    const result = getAgencySchema.safeParse({ companyId: 1 });
    expect(result.success).toBe(true);
  });

  it("rejects missing company ID", () => {
    const result = getAgencySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects zero company ID", () => {
    const result = getAgencySchema.safeParse({ companyId: 0 });
    expect(result.success).toBe(false);
  });

  it("coerces string to number", () => {
    const result = getAgencySchema.safeParse({ companyId: "5" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(5);
    }
  });
});

describe("createAgencySchema", () => {
  it("accepts valid minimal params (companyName only)", () => {
    const result = createAgencySchema.safeParse({
      companyName: "Test Agency",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyName).toBe("Test Agency");
    }
  });

  it("accepts all optional fields", () => {
    const result = createAgencySchema.safeParse({
      companyName: "Test Agency",
      companyEmail: "test@agency.com",
      companyWebsite: "https://test.agency.com",
      commercialLicence: "LIC-12345",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyName).toBe("Test Agency");
      expect(result.data.companyEmail).toBe("test@agency.com");
      expect(result.data.companyWebsite).toBe("https://test.agency.com");
      expect(result.data.commercialLicence).toBe("LIC-12345");
    }
  });

  it("rejects empty companyName", () => {
    const result = createAgencySchema.safeParse({ companyName: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing companyName", () => {
    const result = createAgencySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("trims companyName", () => {
    const result = createAgencySchema.safeParse({
      companyName: "  Test Agency  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyName).toBe("Test Agency");
    }
  });

  it("accepts empty email as optional field", () => {
    const result = createAgencySchema.safeParse({
      companyName: "Test Agency",
      companyEmail: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email format", () => {
    const result = createAgencySchema.safeParse({
      companyName: "Test Agency",
      companyEmail: "not-an-email",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateAgencySchema", () => {
  it("accepts valid update params", () => {
    const result = updateAgencySchema.safeParse({
      companyId: 1,
      companyName: "Updated Agency",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(1);
      expect(result.data.companyName).toBe("Updated Agency");
    }
  });

  it("rejects missing companyId", () => {
    const result = updateAgencySchema.safeParse({ companyName: "Test" });
    expect(result.success).toBe(false);
  });

  it("rejects empty companyName", () => {
    const result = updateAgencySchema.safeParse({
      companyId: 1,
      companyName: "",
    });
    expect(result.success).toBe(false);
  });

  it("coerces companyId from string", () => {
    const result = updateAgencySchema.safeParse({
      companyId: "3",
      companyName: "Test",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(3);
    }
  });
});

describe("deleteAgencySchema", () => {
  it("accepts valid delete params", () => {
    const result = deleteAgencySchema.safeParse({ companyId: 1 });
    expect(result.success).toBe(true);
  });

  it("rejects missing companyId", () => {
    const result = deleteAgencySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("coerces companyId from string", () => {
    const result = deleteAgencySchema.safeParse({ companyId: "10" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyId).toBe(10);
    }
  });
});
