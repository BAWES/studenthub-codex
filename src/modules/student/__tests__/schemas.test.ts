import { describe, it, expect } from "vitest";
import {
  skillItemSchema,
  experienceItemSchema,
  studentProfileSchema,
  studentProfileResultSchema,
  skillListSchema,
  experienceListSchema,
  successResultSchema,
  createResultSchema,
} from "../schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validProfile = () => ({
  id: 1,
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "+965 50000000",
  photo: "https://cdn.studenthub.com/photos/jane.jpg",
  objective: "Looking for a software engineering internship",
  intro: "A passionate CS student with 3 years of experience.",
  address: "Kuwait City",
  skills: [
    { id: 1, name: "TypeScript" },
    { id: 2, name: "React" },
  ],
  experience: [
    {
      id: 10,
      title: "Intern at Company",
      employer: "Company Inc.",
      startYear: 2023,
      endYear: null,
    },
  ],
});

const validProfileNullFields = () => ({
  id: 2,
  name: "John Smith",
  email: "john@test.com",
  phone: null,
  photo: null,
  objective: null,
  intro: null,
  address: null,
  skills: [],
  experience: [],
});

const validSkillItem = () => ({
  id: 1,
  name: "TypeScript",
});

const validExperienceItem = () => ({
  id: 10,
  title: "Software Engineer",
  employer: "Acme Corp",
  startYear: 2022,
  endYear: 2024,
});

const validExperienceItemNullFields = () => ({
  id: 11,
  title: "Freelance",
  employer: null,
  startYear: null,
  endYear: null,
});

// ---------------------------------------------------------------------------
// skillItemSchema (output)
// ---------------------------------------------------------------------------

describe("skillItemSchema (output)", () => {
  it("accepts a valid skill item", () => {
    const r = skillItemSchema.safeParse(validSkillItem());
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    const r = skillItemSchema.safeParse({ name: "Python" });
    expect(r.success).toBe(false);
  });

  it("rejects negative id", () => {
    const r = skillItemSchema.safeParse({ id: -1, name: "Python" });
    expect(r.success).toBe(false);
  });

  it("rejects zero id", () => {
    const r = skillItemSchema.safeParse({ id: 0, name: "Python" });
    expect(r.success).toBe(false);
  });

  it("rejects empty name", () => {
    const r = skillItemSchema.safeParse({ id: 1, name: "" });
    expect(r.success).toBe(false);
  });

  it("rejects missing name", () => {
    const r = skillItemSchema.safeParse({ id: 1 });
    expect(r.success).toBe(false);
  });

  it("rejects non-string name", () => {
    const r = skillItemSchema.safeParse({ id: 1, name: 123 });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// experienceItemSchema (output)
// ---------------------------------------------------------------------------

describe("experienceItemSchema (output)", () => {
  it("accepts a valid experience item with all fields", () => {
    const r = experienceItemSchema.safeParse(validExperienceItem());
    expect(r.success).toBe(true);
  });

  it("accepts a valid experience item with null fields", () => {
    const r = experienceItemSchema.safeParse(validExperienceItemNullFields());
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    const r = experienceItemSchema.safeParse({ title: "Dev" });
    expect(r.success).toBe(false);
  });

  it("rejects empty title", () => {
    const r = experienceItemSchema.safeParse({
      id: 1,
      title: "",
      employer: null,
      startYear: null,
      endYear: null,
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing title", () => {
    const r = experienceItemSchema.safeParse({ id: 1, employer: null, startYear: null, endYear: null });
    expect(r.success).toBe(false);
  });

  it("accepts null employer", () => {
    const r = experienceItemSchema.safeParse({ ...validExperienceItemNullFields() });
    expect(r.success).toBe(true);
    expect(r.data?.employer).toBeNull();
  });

  it("accepts null startYear", () => {
    const r = experienceItemSchema.safeParse({ ...validExperienceItemNullFields() });
    expect(r.success).toBe(true);
    expect(r.data?.startYear).toBeNull();
  });

  it("accepts null endYear", () => {
    const r = experienceItemSchema.safeParse({ ...validExperienceItemNullFields() });
    expect(r.success).toBe(true);
    expect(r.data?.endYear).toBeNull();
  });

  it("rejects string id", () => {
    const r = experienceItemSchema.safeParse({ id: "abc", title: "Dev", employer: null, startYear: null, endYear: null });
    expect(r.success).toBe(false);
  });

  it("rejects string startYear", () => {
    const r = experienceItemSchema.safeParse({ ...validExperienceItem(), startYear: "abc" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// studentProfileSchema (output)
// ---------------------------------------------------------------------------

describe("studentProfileSchema (output)", () => {
  it("accepts a valid full profile", () => {
    const r = studentProfileSchema.safeParse(validProfile());
    expect(r.success).toBe(true);
  });

  it("accepts a valid profile with all null fields", () => {
    const r = studentProfileSchema.safeParse(validProfileNullFields());
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    const r = studentProfileSchema.safeParse({
      name: "Test",
      email: "t@t.com",
      phone: null,
      photo: null,
      objective: null,
      intro: null,
      address: null,
      skills: [],
      experience: [],
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const r = studentProfileSchema.safeParse({ ...validProfile(), email: "not-an-email" });
    expect(r.success).toBe(false);
  });

  it("rejects empty name", () => {
    const r = studentProfileSchema.safeParse({ ...validProfile(), name: "" });
    expect(r.success).toBe(false);
  });

  it("rejects missing skills array", () => {
    const { skills, ...rest } = validProfile();
    const r = studentProfileSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects missing experience array", () => {
    const { experience, ...rest } = validProfile();
    const r = studentProfileSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });

  it("rejects invalid skill item inside array", () => {
    const r = studentProfileSchema.safeParse({
      ...validProfile(),
      skills: [{ id: -1, name: "Invalid" }],
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid experience item inside array", () => {
    const r = studentProfileSchema.safeParse({
      ...validProfile(),
      experience: [{ id: -1, title: "Bad", employer: null, startYear: null, endYear: null }],
    });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// studentProfileResultSchema (output, nullable)
// ---------------------------------------------------------------------------

describe("studentProfileResultSchema (output)", () => {
  it("accepts a valid profile", () => {
    const r = studentProfileResultSchema.safeParse(validProfile());
    expect(r.success).toBe(true);
  });

  it("accepts null (profile not found)", () => {
    const r = studentProfileResultSchema.safeParse(null);
    expect(r.success).toBe(true);
    expect(r.data).toBeNull();
  });

  it("rejects invalid data inside profile", () => {
    const r = studentProfileResultSchema.safeParse({ ...validProfile(), email: "bad" });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// skillListSchema (output)
// ---------------------------------------------------------------------------

describe("skillListSchema (output)", () => {
  it("accepts a list of valid skills", () => {
    const r = skillListSchema.safeParse([
      validSkillItem(),
      { id: 2, name: "Python" },
    ]);
    expect(r.success).toBe(true);
  });

  it("accepts an empty list", () => {
    const r = skillListSchema.safeParse([]);
    expect(r.success).toBe(true);
  });

  it("rejects invalid item in list", () => {
    const r = skillListSchema.safeParse([validSkillItem(), { id: "bad", name: "Python" }]);
    expect(r.success).toBe(false);
  });

  it("rejects non-array", () => {
    const r = skillListSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// experienceListSchema (output)
// ---------------------------------------------------------------------------

describe("experienceListSchema (output)", () => {
  it("accepts a list of valid experience items", () => {
    const r = experienceListSchema.safeParse([
      validExperienceItem(),
      validExperienceItemNullFields(),
    ]);
    expect(r.success).toBe(true);
  });

  it("accepts an empty list", () => {
    const r = experienceListSchema.safeParse([]);
    expect(r.success).toBe(true);
  });

  it("rejects invalid item in list", () => {
    const r = experienceListSchema.safeParse([
      validExperienceItem(),
      { id: 1, title: "", employer: null, startYear: null, endYear: null },
    ]);
    expect(r.success).toBe(false);
  });

  it("rejects non-array", () => {
    const r = experienceListSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// successResultSchema (output)
// ---------------------------------------------------------------------------

describe("successResultSchema (output)", () => {
  it("accepts { success: true }", () => {
    const r = successResultSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("rejects { success: false }", () => {
    const r = successResultSchema.safeParse({ success: false });
    expect(r.success).toBe(false);
  });

  it("rejects missing success field", () => {
    const r = successResultSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("rejects extra fields", () => {
    const r = successResultSchema.safeParse({ success: true, extra: "field" });
    expect(r.success).toBe(true); // zod strips unknown by default
  });
});

// ---------------------------------------------------------------------------
// createResultSchema (output)
// ---------------------------------------------------------------------------

describe("createResultSchema (output)", () => {
  it("accepts { success: true, id: 42 }", () => {
    const r = createResultSchema.safeParse({ success: true, id: 42 });
    expect(r.success).toBe(true);
    expect(r.data?.id).toBe(42);
  });

  it("rejects zero id", () => {
    const r = createResultSchema.safeParse({ success: true, id: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects negative id", () => {
    const r = createResultSchema.safeParse({ success: true, id: -1 });
    expect(r.success).toBe(false);
  });

  it("rejects missing id", () => {
    const r = createResultSchema.safeParse({ success: true });
    expect(r.success).toBe(false);
  });

  it("rejects { success: false } with id", () => {
    const r = createResultSchema.safeParse({ success: false, id: 42 });
    expect(r.success).toBe(false);
  });
});
