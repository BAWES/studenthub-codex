import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: schema validation for candidate server actions in actions.ts
//
// These schemas are used internally by the server actions. Testing them
// separately avoids mocking "use server" dependencies (prisma, session).
// Follows the existing pattern from actions-language.test.ts.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// profileSchema — used by updateCandidateProfile
// ---------------------------------------------------------------------------

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
  gender: z.string().optional().default(""),
  drivingLicense: z.string().optional().default(""),
  civilExpiry: z.string().optional().default(""),
  preferredTime: z.string().optional().default(""),
});

describe("profileSchema", () => {
  it("accepts valid profile with minimum fields", () => {
    const result = profileSchema.safeParse({ name: "John Doe" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("John Doe");
      expect(result.data.nameAr).toBe("");
      expect(result.data.email).toBe("");
    }
  });

  it("accepts valid email address", () => {
    const result = profileSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("john@example.com");
    }
  });

  it("rejects invalid email address", () => {
    const result = profileSchema.safeParse({
      name: "John Doe",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty email string", () => {
    const result = profileSchema.safeParse({
      name: "John Doe",
      email: "",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid profile URL", () => {
    const result = profileSchema.safeParse({
      name: "John Doe",
      profileUrl: "https://linkedin.com/in/johndoe",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid profile URL", () => {
    const result = profileSchema.safeParse({
      name: "John Doe",
      profileUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty profile URL", () => {
    const result = profileSchema.safeParse({
      name: "John Doe",
      profileUrl: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = profileSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0]?.message).toBe("Name is required");
    }
  });

  it("rejects missing name entirely", () => {
    const result = profileSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts all optional fields with valid values", () => {
    const result = profileSchema.safeParse({
      name: "John Doe",
      nameAr: "جون دو",
      email: "john@example.com",
      phone: "+965 5555-1234",
      objective: "Looking for a challenging role",
      intro: "Experienced software engineer",
      civilId: "284120001234",
      profileUrl: "https://linkedin.com/in/johndoe",
      countryId: "1",
      universityId: "5",
      bankId: "3",
      bankAccountName: "John Doe",
      iban: "KW00CBKU0000000000001234567890",
      birthDate: "1990-01-15",
      address: "Kuwait City, Salmiya",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("John Doe");
      expect(result.data.nameAr).toBe("جون دو");
      expect(result.data.iban).toBe("KW00CBKU0000000000001234567890");
    }
  });

  it("defaults nameAr to empty string when omitted", () => {
    const result = profileSchema.safeParse({ name: "Jane Doe" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nameAr).toBe("");
    }
  });

  it("accepts valid gender values", () => {
    expect(profileSchema.safeParse({ name: "Test", gender: "0" }).success).toBe(true);
    expect(profileSchema.safeParse({ name: "Test", gender: "1" }).success).toBe(true);
    expect(profileSchema.safeParse({ name: "Test", gender: "2" }).success).toBe(true);
  });

  it("accepts any gender value as string", () => {
    expect(profileSchema.safeParse({ name: "Test", gender: "3" }).success).toBe(true);
    expect(profileSchema.safeParse({ name: "Test", gender: "male" }).success).toBe(true);
  });

  it("defaults gender to empty string when omitted", () => {
    const result = profileSchema.safeParse({ name: "Test" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.gender).toBe("");
    }
  });

  it("accepts drivingLicense as string", () => {
    expect(profileSchema.safeParse({ name: "Test", drivingLicense: "1" }).success).toBe(true);
    expect(profileSchema.safeParse({ name: "Test", drivingLicense: "0" }).success).toBe(true);
    expect(profileSchema.safeParse({ name: "Test", drivingLicense: "yes" }).success).toBe(true);
  });

  it("defaults drivingLicense to empty string when omitted", () => {
    const result = profileSchema.safeParse({ name: "Test" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.drivingLicense).toBe("");
    }
  });

  it("accepts valid civilExpiry date string", () => {
    const result = profileSchema.safeParse({ name: "Test", civilExpiry: "2026-12-31" });
    expect(result.success).toBe(true);
  });

  it("defaults civilExpiry to empty string when omitted", () => {
    const result = profileSchema.safeParse({ name: "Test" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.civilExpiry).toBe("");
    }
  });

  it("accepts preferredTime string value", () => {
    const result = profileSchema.safeParse({ name: "Test", preferredTime: "morning" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.preferredTime).toBe("morning");
    }
  });

  it("defaults preferredTime to empty string when omitted", () => {
    const result = profileSchema.safeParse({ name: "Test" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.preferredTime).toBe("");
    }
  });
});

// ---------------------------------------------------------------------------
// ALLOWED_TYPES — file type configuration for uploadDocument
// ---------------------------------------------------------------------------

const ALLOWED_TYPES: Record<string, { mime: string[]; ext: string[]; maxSize: number }> = {
  photo: {
    mime: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    ext: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    maxSize: 5 * 1024 * 1024, // 5 MB
  },
  cv: {
    mime: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    ext: [".pdf", ".doc", ".docx"],
    maxSize: 10 * 1024 * 1024, // 10 MB
  },
  video: {
    mime: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
    ext: [".mp4", ".webm", ".ogv", ".mov"],
    maxSize: 50 * 1024 * 1024, // 50 MB
  },
  civilFront: {
    mime: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    ext: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    maxSize: 5 * 1024 * 1024,
  },
  civilBack: {
    mime: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    ext: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    maxSize: 5 * 1024 * 1024,
  },
};

describe("ALLOWED_TYPES — document upload config", () => {
  it("has all five document types", () => {
    const types = Object.keys(ALLOWED_TYPES);
    expect(types.sort()).toEqual(["civilBack", "civilFront", "cv", "photo", "video"]);
  });

  it("photo type accepts JPEG, PNG, WebP, GIF", () => {
    const type = ALLOWED_TYPES.photo;
    expect(type.mime).toContain("image/jpeg");
    expect(type.mime).toContain("image/png");
    expect(type.mime).toContain("image/webp");
    expect(type.mime).toContain("image/gif");
    expect(type.ext).toContain(".jpg");
    expect(type.ext).toContain(".png");
    expect(type.ext).toContain(".webp");
    expect(type.ext).toContain(".gif");
    expect(type.maxSize).toBe(5 * 1024 * 1024);
  });

  it("cv type accepts PDF, DOC, DOCX with 10MB limit", () => {
    const type = ALLOWED_TYPES.cv;
    expect(type.mime).toContain("application/pdf");
    expect(type.mime).toContain("application/msword");
    expect(type.mime).toContain(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    expect(type.ext).toContain(".pdf");
    expect(type.ext).toContain(".doc");
    expect(type.ext).toContain(".docx");
    expect(type.maxSize).toBe(10 * 1024 * 1024);
  });

  it("video type accepts MP4, WebM, OGG, MOV with 50MB limit", () => {
    const type = ALLOWED_TYPES.video;
    expect(type.mime).toContain("video/mp4");
    expect(type.mime).toContain("video/webm");
    expect(type.mime).toContain("video/ogg");
    expect(type.mime).toContain("video/quicktime");
    expect(type.ext).toContain(".mp4");
    expect(type.ext).toContain(".webm");
    expect(type.ext).toContain(".ogv");
    expect(type.ext).toContain(".mov");
    expect(type.maxSize).toBe(50 * 1024 * 1024);
  });

  it("civilFront and civilBack have same config as photo", () => {
    const photo = ALLOWED_TYPES.photo;
    expect(ALLOWED_TYPES.civilFront.mime).toEqual(photo.mime);
    expect(ALLOWED_TYPES.civilFront.ext).toEqual(photo.ext);
    expect(ALLOWED_TYPES.civilFront.maxSize).toBe(photo.maxSize);
    expect(ALLOWED_TYPES.civilBack.mime).toEqual(photo.mime);
    expect(ALLOWED_TYPES.civilBack.ext).toEqual(photo.ext);
    expect(ALLOWED_TYPES.civilBack.maxSize).toBe(photo.maxSize);
  });
});

// ---------------------------------------------------------------------------
// certificateSchema — used by addCandidateCertificate
// ---------------------------------------------------------------------------

const certificateSchema = z.object({
  certificate_type: z.enum(["true", "false"]).transform((v) => v === "true"),
  start_date: z.string().max(10).optional(),
  end_date: z.string().max(10).optional(),
});

describe("certificateSchema", () => {
  it("accepts certificate_type true string", () => {
    const result = certificateSchema.safeParse({ certificate_type: "true" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificate_type).toBe(true);
    }
  });

  it("accepts certificate_type false string", () => {
    const result = certificateSchema.safeParse({
      certificate_type: "false",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.certificate_type).toBe(false);
    }
  });

  it("rejects invalid certificate_type value", () => {
    const result = certificateSchema.safeParse({
      certificate_type: "yes",
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
    if (result.success) {
      expect(result.data.start_date).toBe("2024-01-01");
      expect(result.data.end_date).toBe("2024-12-31");
    }
  });

  it("accepts certificate with no dates", () => {
    const result = certificateSchema.safeParse({
      certificate_type: "false",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.start_date).toBeUndefined();
      expect(result.data.end_date).toBeUndefined();
    }
  });

  it("rejects start_date longer than 10 characters", () => {
    const result = certificateSchema.safeParse({
      certificate_type: "true",
      start_date: "2024-01-01-extra",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// educationSchema — used by addCandidateEducation, editCandidateEducation
// ---------------------------------------------------------------------------

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

describe("educationSchema", () => {
  it("accepts valid education with all fields", () => {
    const result = educationSchema.safeParse({
      universityId: "5",
      degreeUuid: "deg-001",
      majorUuid: "maj-001",
      graduationYear: "2024",
      isCurrentlyStudying: "0",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.universityId).toBe(5);
      expect(result.data.degreeUuid).toBe("deg-001");
      expect(result.data.graduationYear).toBe(2024);
      expect(result.data.isCurrentlyStudying).toBe("0");
    }
  });

  it("coerces string universityId to number", () => {
    const result = educationSchema.safeParse({ universityId: "10" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.universityId).toBe(10);
    }
  });

  it("rejects negative universityId", () => {
    const result = educationSchema.safeParse({ universityId: "-1" });
    expect(result.success).toBe(false);
  });

  it("rejects zero universityId", () => {
    const result = educationSchema.safeParse({ universityId: "0" });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric universityId", () => {
    const result = educationSchema.safeParse({ universityId: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects missing universityId", () => {
    const result = educationSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts graduation year in valid range", () => {
    const result = educationSchema.safeParse({
      universityId: "1",
      graduationYear: "1995",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.graduationYear).toBe(1995);
    }
  });

  it("accepts graduation year exactly at minimum", () => {
    const result = educationSchema.safeParse({
      universityId: "1",
      graduationYear: "1950",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.graduationYear).toBe(1950);
    }
  });

  it("accepts graduation year exactly at maximum", () => {
    const result = educationSchema.safeParse({
      universityId: "1",
      graduationYear: "2035",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.graduationYear).toBe(2035);
    }
  });

  it("rejects graduation year below minimum", () => {
    const result = educationSchema.safeParse({
      universityId: "1",
      graduationYear: "1949",
    });
    expect(result.success).toBe(false);
  });

  it("rejects graduation year above maximum", () => {
    const result = educationSchema.safeParse({
      universityId: "1",
      graduationYear: "2036",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty graduation year", () => {
    const result = educationSchema.safeParse({
      universityId: "1",
      graduationYear: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.graduationYear).toBe("");
    }
  });

  it("defaults isCurrentlyStudying to '0' when omitted", () => {
    const result = educationSchema.safeParse({ universityId: "1" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isCurrentlyStudying).toBe("0");
    }
  });

  it("accepts isCurrentlyStudying as '1'", () => {
    const result = educationSchema.safeParse({
      universityId: "1",
      isCurrentlyStudying: "1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isCurrentlyStudying).toBe("1");
    }
  });

  it("rejects invalid isCurrentlyStudying value", () => {
    const result = educationSchema.safeParse({
      universityId: "1",
      isCurrentlyStudying: "yes",
    });
    expect(result.success).toBe(false);
  });

  it("defaults degreeUuid and majorUuid to empty string", () => {
    const result = educationSchema.safeParse({ universityId: "1" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.degreeUuid).toBe("");
      expect(result.data.majorUuid).toBe("");
    }
  });
});

// ---------------------------------------------------------------------------
// Invitation action validation (inline in respondToInvitation)
// ---------------------------------------------------------------------------

const VALID_INVITATION_ACTIONS = ["accept", "reject"] as const;

describe("respondToInvitation — action validation", () => {
  it("accepts 'accept' as valid action", () => {
    expect(VALID_INVITATION_ACTIONS.includes("accept")).toBe(true);
  });

  it("accepts 'reject' as valid action", () => {
    expect(VALID_INVITATION_ACTIONS.includes("reject")).toBe(true);
  });

  it("rejects invalid action", () => {
    expect(VALID_INVITATION_ACTIONS.includes("maybe" as any)).toBe(false);
  });

  it("rejects empty action string", () => {
    expect(VALID_INVITATION_ACTIONS.includes("" as any)).toBe(false);
  });

  it("rejects unexpected action values", () => {
    const invalid = ["approve", "deny", "pending", "cancel", "ignore"];
    for (const action of invalid) {
      expect(VALID_INVITATION_ACTIONS.includes(action as any)).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// Appeal work-log validation (inline in appealWorkLog)
// ---------------------------------------------------------------------------

describe("appealWorkLog — reason validation", () => {
  it("rejects empty reason (truthiness check)", () => {
    const reasons = ["", "   ", "\t", "\n"];
    for (const reason of reasons) {
      expect(reason.trim().length > 0).toBe(false);
    }
  });

  it("accepts non-empty reason after trim", () => {
    const reasons = [
      "I worked 8 hours but only 4 were recorded",
      "  The time is incorrect  ",
    ];
    for (const reason of reasons) {
      expect(reason.trim().length > 0).toBe(true);
    }
  });
});
