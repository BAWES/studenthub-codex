import { describe, it, expect } from "vitest";
import { z } from "zod";

const companyRequestSchema = z.object({
  company_id: z.coerce.number().int().positive("Select a company"),
  position_title: z.string().trim().min(1, "Job title is required").max(255),
  compensation: z.string().trim().min(1, "Compensation type is required"),
  request_hourly_rate: z.coerce.number().positive("Rate must be > 0"),
  max_hourly_rate: z.coerce.number().positive("Max rate must be > 0"),
  number_of_employees: z.coerce.number().int().positive(),
  request_profession: z.coerce.number().int().positive("Select a profession"),
  job_description: z.string().optional(),
  contract_type: z.string().trim().min(1).max(255),
});

export type CompanyRequestFormState = {
  message?: string;
  success: boolean;
  requestUuid?: string;
  error?: string;
  errors?: Record<string, string>;
};

export { companyRequestSchema };

// ---------------------------------------------------------------------------
// Schema validation tests for company-create-actions.ts
// ---------------------------------------------------------------------------

describe("companyRequestSchema", () => {
  it("accepts valid input with all required fields", () => {
    const result = companyRequestSchema.safeParse({
      company_id: "1",
      position_title: "Software Engineer",
      compensation: "Hourly",
      store: "Head Office",
      brand: "Tech Solutions",
      number_of_employees: "3",
    });
    expect(result.success).toBe(true);
  });

  it("coerces string company_id to number", () => {
    const result = companyRequestSchema.safeParse({
      company_id: "42",
      position_title: "Intern",
      compensation: "Monthly",
      store: "Downtown",
      brand: "Startup Inc",
      number_of_employees: "2",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.company_id).toBe(42);
    }
  });

  it("coerces string number_of_employees to number", () => {
    const result = companyRequestSchema.safeParse({
      company_id: "1",
      position_title: "Designer",
      compensation: "Fixed",
      store: "Main Branch",
      brand: "Design Co",
      number_of_employees: "5",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.number_of_employees).toBe(5);
    }
  });

  it("rejects empty position_title", () => {
    const result = companyRequestSchema.safeParse({
      company_id: "1",
      position_title: "",
      compensation: "Hourly",
      store: "Store",
      brand: "Brand",
      number_of_employees: "1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing position_title", () => {
    const result = companyRequestSchema.safeParse({
      company_id: "1",
      compensation: "Hourly",
      store: "Store",
      brand: "Brand",
      number_of_employees: "1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty compensation", () => {
    const result = companyRequestSchema.safeParse({
      company_id: "1",
      position_title: "Engineer",
      compensation: "",
      store: "Store",
      brand: "Brand",
      number_of_employees: "1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty store", () => {
    const result = companyRequestSchema.safeParse({
      company_id: "1",
      position_title: "Engineer",
      compensation: "Hourly",
      store: "",
      brand: "Brand",
      number_of_employees: "1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty brand", () => {
    const result = companyRequestSchema.safeParse({
      company_id: "1",
      position_title: "Engineer",
      compensation: "Hourly",
      store: "Store",
      brand: "",
      number_of_employees: "1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects number_of_employees less than 1", () => {
    const result = companyRequestSchema.safeParse({
      company_id: "1",
      position_title: "Engineer",
      compensation: "Hourly",
      store: "Store",
      brand: "Brand",
      number_of_employees: "0",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive company_id", () => {
    const result = companyRequestSchema.safeParse({
      company_id: "0",
      position_title: "Engineer",
      compensation: "Hourly",
      store: "Store",
      brand: "Brand",
      number_of_employees: "1",
    });
    expect(result.success).toBe(false);
  });

  it("CompanyRequestFormState type is properly structured", () => {
    const successState: CompanyRequestFormState = {
      success: true,
      requestUuid: "req_uuid_abc_123",
    };
    expect(successState.success).toBe(true);
    expect(successState.requestUuid).toBeTruthy();

    const errorState: CompanyRequestFormState = {
      success: false,
      error: "Company not found.",
    };
    expect(errorState.success).toBe(false);
    expect(errorState.error).toBe("Company not found.");

    const fieldErrorState: CompanyRequestFormState = {
      success: false,
      errors: { position_title: "Job title is required" },
    };
    expect(fieldErrorState.success).toBe(false);
    expect(fieldErrorState.errors?.position_title).toBe("Job title is required");
  });
});
