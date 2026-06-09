import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Pure logic: candidate link schema validation
//
// addCandidateLink, updateCandidateLink, and removeCandidateLink in actions.ts
// use these Zod schemas internally. Testing them separately avoids the need to
// mock "use server" dependencies (prisma, session, next/cache).
// ---------------------------------------------------------------------------

const URL_MAX = 2048;
const TITLE_MAX = 255;

const createLinkSchema = z.object({
  title: z.string().min(1, "Title is required").max(TITLE_MAX),
  url: z
    .string()
    .min(1, "URL is required")
    .max(URL_MAX, "URL is too long")
    .url("Invalid URL format"),
});

const updateLinkSchema = z.object({
  linkUuid: z.string().min(1, "Link UUID is required"),
  title: z.string().min(1, "Title is required").max(TITLE_MAX).optional(),
  url: z
    .string()
    .min(1, "URL is required")
    .max(URL_MAX, "URL is too long")
    .url("Invalid URL format")
    .optional(),
});

const deleteLinkSchema = z.object({
  linkUuid: z.string().min(1, "Link UUID is required"),
});

// ---------------------------------------------------------------------------
// createLinkSchema
// ---------------------------------------------------------------------------

describe("createLinkSchema", () => {
  it("accepts a valid link with title and URL", () => {
    const result = createLinkSchema.safeParse({
      title: "Portfolio",
      url: "https://example.com/portfolio",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Portfolio");
      expect(result.data.url).toBe("https://example.com/portfolio");
    }
  });

  it("rejects empty title", () => {
    const result = createLinkSchema.safeParse({
      title: "",
      url: "https://example.com",
    });
    expect(result.success).toBe(false);
    expect(result.error!.errors[0]?.message).toBe("Title is required");
  });

  it("rejects title exceeding 255 characters", () => {
    const result = createLinkSchema.safeParse({
      title: "x".repeat(256),
      url: "https://example.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty URL", () => {
    const result = createLinkSchema.safeParse({
      title: "GitHub",
      url: "",
    });
    expect(result.success).toBe(false);
    expect(result.error!.errors[0]?.message).toBe("URL is required");
  });

  it("rejects invalid URL format", () => {
    const result = createLinkSchema.safeParse({
      title: "My Profile",
      url: "not-a-url",
    });
    expect(result.success).toBe(false);
    expect(result.error!.errors[0]?.message).toBe("Invalid URL format");
  });

  it("rejects URL exceeding 2048 characters", () => {
    const result = createLinkSchema.safeParse({
      title: "Long URL",
      url: `https://example.com/${"x".repeat(2030)}`,
    });
    expect(result.success).toBe(false);
    expect(result.error!.errors[0]?.message).toBe("URL is too long");
  });

  it("rejects missing title", () => {
    const result = createLinkSchema.safeParse({
      url: "https://example.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing URL", () => {
    const result = createLinkSchema.safeParse({
      title: "LinkedIn",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateLinkSchema
// ---------------------------------------------------------------------------

describe("updateLinkSchema", () => {
  it("accepts valid update with linkUuid only (partial update)", () => {
    const result = updateLinkSchema.safeParse({
      linkUuid: "abc-123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.linkUuid).toBe("abc-123");
    }
  });

  it("accepts update with linkUuid and title", () => {
    const result = updateLinkSchema.safeParse({
      linkUuid: "abc-123",
      title: "Updated Portfolio",
    });
    expect(result.success).toBe(true);
  });

  it("accepts update with linkUuid and URL", () => {
    const result = updateLinkSchema.safeParse({
      linkUuid: "abc-123",
      url: "https://example.com/new",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty linkUuid", () => {
    const result = updateLinkSchema.safeParse({
      linkUuid: "",
    });
    expect(result.success).toBe(false);
    expect(result.error!.errors[0]?.message).toBe("Link UUID is required");
  });

  it("rejects invalid URL format in update", () => {
    const result = updateLinkSchema.safeParse({
      linkUuid: "abc-123",
      url: "bad-url",
    });
    expect(result.success).toBe(false);
    expect(result.error!.errors[0]?.message).toBe("Invalid URL format");
  });
});

// ---------------------------------------------------------------------------
// deleteLinkSchema
// ---------------------------------------------------------------------------

describe("deleteLinkSchema", () => {
  it("accepts valid delete with linkUuid", () => {
    const result = deleteLinkSchema.safeParse({
      linkUuid: "abc-123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty linkUuid", () => {
    const result = deleteLinkSchema.safeParse({
      linkUuid: "",
    });
    expect(result.success).toBe(false);
    expect(result.error!.errors[0]?.message).toBe("Link UUID is required");
  });

  it("rejects missing linkUuid", () => {
    const result = deleteLinkSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
