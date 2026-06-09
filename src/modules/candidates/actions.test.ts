import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schemas (duplicated from actions.ts for isolated unit testing)
// ---------------------------------------------------------------------------

const PROFICIENCY_LEVELS = ["basic", "intermediate", "advanced", "native"] as const;

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameAr: z.string().optional().default(""),
  email: z
    .union([z.string().email("Invalid email address"), z.literal("")])
    .optional()
    .default(""),
  phone: z.string().optional().default(""),
  objective: z.string().optional().default(""),
  intro: z.string().optional().default(""),
  civilId: z.string().optional().default(""),
  profileUrl: z
    .union([z.string().url("Invalid URL"), z.literal("")])
    .optional()
    .default(""),
  countryId: z.string().optional().default(""),
  universityId: z.string().optional().default(""),
  bankId: z.string().optional().default(""),
  bankAccountName: z.string().optional().default(""),
  iban: z.string().optional().default(""),
  birthDate: z.string().optional().default(""),
  address: z.string().optional().default(""),
});

const languageSchema = z.object({
  language: z.string().min(1, "Language is required").max(128),
  proficiency: z.enum(PROFICIENCY_LEVELS, {
    required_error: "Proficiency level is required",
  }),
});

const certificateSchema = z.object({
  certificate_type: z
    .enum(["true", "false"])
    .transform((v) => v === "true"),
  start_date: z.string().max(10).optional(),
  end_date: z.string().max(10).optional(),
});

const educationSchema = z.object({
  universityId: z.coerce.number().int().positive("University is required."),
  degreeUuid: z.string().optional().default(""),
  majorUuid: z.string().optional().default(""),
  graduationYear: z
    .union([z.coerce.number().int().min(1950).max(2035), z.literal("")])
    .optional()
    .default(""),
  isCurrentlyStudying: z
    .union([z.literal("1"), z.literal("0")])
    .optional()
    .default("0"),
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("profileSchema", () => {
  it("accepts minimal valid profile (name only)", () => {
    const result = profileSchema.safeParse({ name: "John Doe" });
    expect(result.success).toBe(true);
  });

  it("fills defaults for optional fields", () => {
    const result = profileSchema.safeParse({ name: "John Doe" });
    if (result.success) {
      expect(result.data.nameAr).toBe("");
      expect(result.data.email).toBe("");
      expect(result.data.phone).toBe("");
      expect(result.data.profileUrl).toBe("");
    }
  });

  it("accepts all fields with valid values", () => {
    const result = profileSchema.safeParse({
      name: "John Doe",
      nameAr: "جون دو",
      email: "john@example.com",
      phone: "+96512345678",
      objective: "Looking for a job",
      intro: "Experienced developer",
      civilId: "123456789012",
      profileUrl: "https://example.com/profile/john",
      countryId: "1",
      universityId: "5",
      bankId: "3",
      bankAccountName: "John Doe",
      iban: "KW1234567890",
      birthDate: "1990-01-15",
      address: "Kuwait City",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = profileSchema.safeParse({});
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("name");
      expect(result.error.issues[0].message).toMatch(/required/i);
    } else {
      // name has no default, so missing name should fail
      expect(result.success).toBe(false);
    }
  });

  it("rejects empty name", () => {
    const result = profileSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const result = profileSchema.safeParse({
      name: "John",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty string for email", () => {
    const result = profileSchema.safeParse({ name: "John", email: "" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid URL for profileUrl", () => {
    const result = profileSchema.safeParse({
      name: "John",
      profileUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty string for profileUrl", () => {
    const result = profileSchema.safeParse({ name: "John", profileUrl: "" });
    expect(result.success).toBe(true);
  });

  it("accepts name with special characters", () => {
    const result = profileSchema.safeParse({ name: "José María García-López" });
    expect(result.success).toBe(true);
  });

  it("accepts long name", () => {
    const result = profileSchema.safeParse({
      name: "A".repeat(200),
    });
    expect(result.success).toBe(true);
  });
});

describe("languageSchema", () => {
  it("accepts valid language with all proficiency levels", () => {
    for (const level of PROFICIENCY_LEVELS) {
      const result = languageSchema.safeParse({
        language: "English",
        proficiency: level,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects missing language", () => {
    const result = languageSchema.safeParse({ proficiency: "native" });
    expect(result.success).toBe(false);
  });

  it("rejects empty language", () => {
    const result = languageSchema.safeParse({
      language: "",
      proficiency: "basic",
    });
    expect(result.success).toBe(false);
  });

  it("rejects language exceeding 128 characters", () => {
    const result = languageSchema.safeParse({
      language: "x".repeat(129),
      proficiency: "advanced",
    });
    expect(result.success).toBe(false);
  });

  it("accepts language at 128 character boundary", () => {
    const result = languageSchema.safeParse({
      language: "x".repeat(128),
      proficiency: "advanced",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing proficiency", () => {
    const result = languageSchema.safeParse({ language: "English" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid proficiency level", () => {
    const result = languageSchema.safeParse({
      language: "English",
      proficiency: "expert",
    });
    expect(result.success).toBe(false);
  });

  it("accepts proficiency enum values exactly", () => {
    const result = languageSchema.safeParse({
      language: "Arabic",
      proficiency: "native",
    });
    expect(result.success).toBe(true);
  });

  it("rejects numeric proficiency", () => {
    const result = languageSchema.safeParse({
      language: "French",
      proficiency: 1,
    });
    expect(result.success).toBe(false);
  });
});

describe("certificateSchema", () => {
  it("accepts certificate_type true", () => {
    const result = certificateSchema.safeParse({
      certificate_type: "true",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificate_type).toBe(true);
    }
  });

  it("accepts certificate_type false", () => {
    const result = certificateSchema.safeParse({
      certificate_type: "false",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificate_type).toBe(false);
    }
  });

  it("rejects invalid certificate_type", () => {
    const result = certificateSchema.safeParse({
      certificate_type: "yes",
    });
    expect(result.success).toBe(false);
  });

  it("rejects numeric certificate_type", () => {
    const result = certificateSchema.safeParse({
      certificate_type: 1,
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional start_date and end_date", () => {
    const result = certificateSchema.safeParse({
      certificate_type: "true",
      start_date: "2024-01-01",
      end_date: "2024-12-31",
    });
    expect(result.success).toBe(true);
  });

  it("accepts missing optional date fields", () => {
    const result = certificateSchema.safeParse({
      certificate_type: "false",
    });
    expect(result.success).toBe(true);
  });

  it("rejects start_date > 10 chars", () => {
    const result = certificateSchema.safeParse({
      certificate_type: "true",
      start_date: "2024-01-01-extra",
    });
    expect(result.success).toBe(false);
  });

  it("rejects end_date > 10 chars", () => {
    const result = certificateSchema.safeParse({
      certificate_type: "true",
      end_date: "2024-01-01-extra",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty certificate_type value type", () => {
    const result = certificateSchema.safeParse({
      certificate_type: "true",
    });
    expect(result.success).toBe(true);
  });
});

describe("educationSchema", () => {
  it("accepts valid input with all fields", () => {
    const result = educationSchema.safeParse({
      universityId: 1,
      degreeUuid: "deg-123",
      majorUuid: "maj-456",
      graduationYear: "2023",
      isCurrentlyStudying: "0",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.universityId).toBe(1);
      expect(result.data.graduationYear).toBe(2023);
      expect(result.data.isCurrentlyStudying).toBe("0");
    }
  });

  it("fills defaults for optional fields", () => {
    const result = educationSchema.safeParse({ universityId: 1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.degreeUuid).toBe("");
      expect(result.data.majorUuid).toBe("");
      expect(result.data.graduationYear).toBe("");
      expect(result.data.isCurrentlyStudying).toBe("0");
    }
  });

  it("coerces string universityId to number", () => {
    const result = educationSchema.safeParse({ universityId: "5" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.universityId).toBe(5);
    }
  });

  it("rejects non-positive universityId", () => {
    const result = educationSchema.safeParse({ universityId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative universityId", () => {
    const result = educationSchema.safeParse({ universityId: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects missing universityId", () => {
    const result = educationSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts isCurrentlyStudying 1", () => {
    const result = educationSchema.safeParse({
      universityId: 1,
      isCurrentlyStudying: "1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isCurrentlyStudying).toBe("1");
    }
  });

  it("rejects isCurrentlyStudying with invalid value", () => {
    const result = educationSchema.safeParse({
      universityId: 1,
      isCurrentlyStudying: "yes",
    });
    expect(result.success).toBe(false);
  });

  it("rejects graduationYear below 1950", () => {
    const result = educationSchema.safeParse({
      universityId: 1,
      graduationYear: "1949",
    });
    expect(result.success).toBe(false);
  });

  it("rejects graduationYear above 2035", () => {
    const result = educationSchema.safeParse({
      universityId: 1,
      graduationYear: "2036",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty string for graduationYear", () => {
    const result = educationSchema.safeParse({
      universityId: 1,
      graduationYear: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.graduationYear).toBe("");
    }
  });

  it("coerces string graduationYear to number", () => {
    const result = educationSchema.safeParse({
      universityId: 1,
      graduationYear: "2024",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.graduationYear).toBe(2024);
    }
  });

  it("rejects non-numeric graduationYear", () => {
    const result = educationSchema.safeParse({
      universityId: 1,
      graduationYear: "abc",
    });
    expect(result.success).toBe(false);
  });
});
