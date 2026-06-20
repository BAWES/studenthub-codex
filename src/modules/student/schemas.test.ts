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
} from "./schemas";

// ---------------------------------------------------------------------------
// skillItemSchema
// ---------------------------------------------------------------------------
describe("skillItemSchema", () => {
  const valid = { id: 1, name: "JavaScript" };

  it("accepts a valid skill item", () => {
    expect(skillItemSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = valid;
    expect(skillItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing name", () => {
    const { name: _, ...rest } = valid;
    expect(skillItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-positive id", () => {
    expect(skillItemSchema.safeParse({ ...valid, id: 0 }).success).toBe(false);
  });

  it("rejects wrong type for id", () => {
    expect(skillItemSchema.safeParse({ ...valid, id: "one" }).success).toBe(
      false,
    );
  });

  it("rejects empty name", () => {
    expect(skillItemSchema.safeParse({ ...valid, name: "" }).success).toBe(
      false,
    );
  });
});

// ---------------------------------------------------------------------------
// experienceItemSchema
// ---------------------------------------------------------------------------
describe("experienceItemSchema", () => {
  const valid = {
    id: 1,
    title: "Software Engineer",
    employer: "Acme Corp",
    startYear: 2020,
    endYear: 2023,
  };

  it("accepts a valid experience item", () => {
    expect(experienceItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable employer", () => {
    expect(
      experienceItemSchema.safeParse({ ...valid, employer: null }).success,
    ).toBe(true);
  });

  it("accepts nullable startYear", () => {
    expect(
      experienceItemSchema.safeParse({ ...valid, startYear: null }).success,
    ).toBe(true);
  });

  it("accepts nullable endYear", () => {
    expect(
      experienceItemSchema.safeParse({ ...valid, endYear: null }).success,
    ).toBe(true);
  });

  it("accepts all nullable fields simultaneously", () => {
    expect(
      experienceItemSchema.safeParse({
        id: 2,
        title: "Intern",
        employer: null,
        startYear: null,
        endYear: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = valid;
    expect(experienceItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing title", () => {
    const { title: _, ...rest } = valid;
    expect(experienceItemSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-positive id", () => {
    expect(
      experienceItemSchema.safeParse({ ...valid, id: -1 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for id", () => {
    expect(
      experienceItemSchema.safeParse({ ...valid, id: "not-a-number" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// studentProfileSchema
// ---------------------------------------------------------------------------
describe("studentProfileSchema", () => {
  const valid = {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "+96512345678",
    photo: "https://example.com/photo.jpg",
    objective: "Looking for software role",
    intro: "A passionate developer",
    address: "Kuwait City",
    skills: [
      { id: 1, name: "JavaScript" },
      { id: 2, name: "TypeScript" },
    ],
    experience: [
      { id: 1, title: "SWE", employer: "Acme", startYear: 2020, endYear: 2023 },
    ],
  };

  it("accepts a valid full profile", () => {
    expect(studentProfileSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts nullable phone", () => {
    expect(
      studentProfileSchema.safeParse({ ...valid, phone: null }).success,
    ).toBe(true);
  });

  it("accepts nullable photo", () => {
    expect(
      studentProfileSchema.safeParse({ ...valid, photo: null }).success,
    ).toBe(true);
  });

  it("accepts nullable objective", () => {
    expect(
      studentProfileSchema.safeParse({ ...valid, objective: null }).success,
    ).toBe(true);
  });

  it("accepts nullable intro", () => {
    expect(
      studentProfileSchema.safeParse({ ...valid, intro: null }).success,
    ).toBe(true);
  });

  it("accepts nullable address", () => {
    expect(
      studentProfileSchema.safeParse({ ...valid, address: null }).success,
    ).toBe(true);
  });

  it("accepts all nullable fields null and empty arrays", () => {
    expect(
      studentProfileSchema.safeParse({
        id: 2,
        name: "Jane Doe",
        email: "jane@example.com",
        phone: null,
        photo: null,
        objective: null,
        intro: null,
        address: null,
        skills: [],
        experience: [],
      }).success,
    ).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = valid;
    expect(studentProfileSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing name", () => {
    const { name: _, ...rest } = valid;
    expect(studentProfileSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing email", () => {
    const { email: _, ...rest } = valid;
    expect(studentProfileSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(
      studentProfileSchema.safeParse({ ...valid, email: "not-an-email" }).success,
    ).toBe(false);
  });

  it("rejects missing skills", () => {
    const { skills: _, ...rest } = valid;
    expect(studentProfileSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-array skills", () => {
    expect(
      studentProfileSchema.safeParse({ ...valid, skills: "not-array" }).success,
    ).toBe(false);
  });

  it("rejects missing experience", () => {
    const { experience: _, ...rest } = valid;
    expect(studentProfileSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-array experience", () => {
    expect(
      studentProfileSchema.safeParse({ ...valid, experience: "not-array" })
        .success,
    ).toBe(false);
  });

  it("rejects wrong type for id", () => {
    expect(
      studentProfileSchema.safeParse({ ...valid, id: "abc" }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// studentProfileResultSchema (nullable)
// ---------------------------------------------------------------------------
describe("studentProfileResultSchema", () => {
  const valid = {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: null,
    photo: null,
    objective: null,
    intro: null,
    address: null,
    skills: [],
    experience: [],
  };

  it("accepts null", () => {
    expect(studentProfileResultSchema.safeParse(null).success).toBe(true);
  });

  it("accepts a valid profile", () => {
    expect(studentProfileResultSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing id", () => {
    const { id: _, ...rest } = valid;
    expect(studentProfileResultSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing name", () => {
    const { name: _, ...rest } = valid;
    expect(studentProfileResultSchema.safeParse(rest).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// skillListSchema
// ---------------------------------------------------------------------------
describe("skillListSchema", () => {
  const valid = [
    { id: 1, name: "JavaScript" },
    { id: 2, name: "TypeScript" },
  ];

  it("accepts a valid skill list", () => {
    expect(skillListSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty array", () => {
    expect(skillListSchema.safeParse([]).success).toBe(true);
  });

  it("rejects non-array", () => {
    expect(skillListSchema.safeParse("not-array").success).toBe(false);
  });

  it("rejects invalid element", () => {
    expect(skillListSchema.safeParse([{ id: "bad" }]).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// experienceListSchema
// ---------------------------------------------------------------------------
describe("experienceListSchema", () => {
  const valid = [
    { id: 1, title: "SWE", employer: null, startYear: null, endYear: null },
  ];

  it("accepts a valid experience list", () => {
    expect(experienceListSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty array", () => {
    expect(experienceListSchema.safeParse([]).success).toBe(true);
  });

  it("rejects non-array", () => {
    expect(experienceListSchema.safeParse("not-array").success).toBe(false);
  });

  it("rejects invalid element", () => {
    expect(
      experienceListSchema.safeParse([{ id: "bad", title: 123 }]).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// successResultSchema
// ---------------------------------------------------------------------------
describe("successResultSchema", () => {
  it("accepts success: true", () => {
    expect(successResultSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("rejects success: false", () => {
    expect(successResultSchema.safeParse({ success: false }).success).toBe(
      false,
    );
  });

  it("rejects missing success", () => {
    expect(successResultSchema.safeParse({}).success).toBe(false);
  });

  it("rejects wrong type for success", () => {
    expect(successResultSchema.safeParse({ success: "yes" }).success).toBe(
      false,
    );
  });
});

// ---------------------------------------------------------------------------
// createResultSchema
// ---------------------------------------------------------------------------
describe("createResultSchema", () => {
  it("accepts valid create result", () => {
    expect(
      createResultSchema.safeParse({ success: true, id: 42 }).success,
    ).toBe(true);
  });

  it("rejects missing id", () => {
    expect(createResultSchema.safeParse({ success: true }).success).toBe(false);
  });

  it("rejects non-positive id", () => {
    expect(
      createResultSchema.safeParse({ success: true, id: 0 }).success,
    ).toBe(false);
  });

  it("rejects wrong type for id", () => {
    expect(
      createResultSchema.safeParse({ success: true, id: "abc" }).success,
    ).toBe(false);
  });

  it("rejects success: false", () => {
    expect(
      createResultSchema.safeParse({ success: false, id: 1 }).success,
    ).toBe(false);
  });
});
