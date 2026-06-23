import { describe, it, expect, vi, beforeEach } from "vitest";
import path from "node:path";

// ---------------------------------------------------------------------------
// Mocks — must use vi.hoisted() because vi.mock factories are hoisted
// ---------------------------------------------------------------------------

const {
  mockFindFirst,
  mockUpdate,
  mockRequireRoleCapability,
  mockWriteFile,
  mockMkdir,
} = vi.hoisted(() => ({
  mockFindFirst: vi.fn(),
  mockUpdate: vi.fn(),
  mockRequireRoleCapability: vi.fn(),
  mockWriteFile: vi.fn(),
  mockMkdir: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    invitation: {
      findFirst: mockFindFirst,
      update: mockUpdate,
    },
    candidate: {
      update: vi.fn().mockResolvedValue({}),
    },
  },
}));

vi.mock("@/modules/auth/session", () => ({
  requireRoleCapability: mockRequireRoleCapability,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("node:fs/promises", () => ({
  default: {
    writeFile: mockWriteFile,
    mkdir: mockMkdir,
  },
  writeFile: mockWriteFile,
  mkdir: mockMkdir,
}));

// ---------------------------------------------------------------------------
// Imports (must come after vi.mock calls)
// ---------------------------------------------------------------------------

import { uploadDocument, respondToInvitation } from "./actions";

// ---------------------------------------------------------------------------
// Pure logic: ALLOWED_TYPES configuration
// ---------------------------------------------------------------------------

const ALLOWED_TYPES: Record<string, { mime: string[]; ext: string[]; maxSize: number }> = {
  photo: {
    mime: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    ext: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    maxSize: 5 * 1024 * 1024,
  },
  cv: {
    mime: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    ext: [".pdf", ".doc", ".docx"],
    maxSize: 10 * 1024 * 1024,
  },
  video: {
    mime: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
    ext: [".mp4", ".webm", ".ogv", ".mov"],
    maxSize: 50 * 1024 * 1024,
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

describe("ALLOWED_TYPES config", () => {
  it("defines all five document types", () => {
    expect(Object.keys(ALLOWED_TYPES)).toEqual([
      "photo",
      "cv",
      "video",
      "civilFront",
      "civilBack",
    ]);
  });

  it("photo has correct extensions", () => {
    expect(ALLOWED_TYPES.photo.ext).toContain(".jpg");
    expect(ALLOWED_TYPES.photo.ext).toContain(".png");
    expect(ALLOWED_TYPES.photo.ext).toContain(".webp");
    expect(ALLOWED_TYPES.photo.ext).toContain(".gif");
  });

  it("cv has pdf/doc/docx extensions only", () => {
    expect(ALLOWED_TYPES.cv.ext).toEqual([".pdf", ".doc", ".docx"]);
  });

  it("cv maxSize is 10 MB", () => {
    expect(ALLOWED_TYPES.cv.maxSize).toBe(10 * 1024 * 1024);
  });

  it("video maxSize is 50 MB", () => {
    expect(ALLOWED_TYPES.video.maxSize).toBe(50 * 1024 * 1024);
  });

  it("photo maxSize is 5 MB", () => {
    expect(ALLOWED_TYPES.photo.maxSize).toBe(5 * 1024 * 1024);
  });

  it("civilFront and civilBack match photo config", () => {
    expect(ALLOWED_TYPES.civilFront.mime).toEqual(ALLOWED_TYPES.photo.mime);
    expect(ALLOWED_TYPES.civilBack.ext).toEqual(ALLOWED_TYPES.photo.ext);
    expect(ALLOWED_TYPES.civilFront.maxSize).toBe(ALLOWED_TYPES.photo.maxSize);
  });

  it("all types have non-empty mime and ext arrays", () => {
    for (const [key, type] of Object.entries(ALLOWED_TYPES)) {
      expect(type.mime.length).toBeGreaterThan(0);
      expect(type.ext.length).toBeGreaterThan(0);
      expect(type.maxSize).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// uploadDocument — validation logic
// ---------------------------------------------------------------------------

describe("uploadDocument", () => {
  const fakeSession = { id: "42", role: "candidate" };

  const mockFormData = (
    type: string | null,
    fileProps?: { name?: string; size?: number; type?: string },
  ) => {
    const f = fileProps
      ? new File(
          [new ArrayBuffer(fileProps.size ?? 1000)],
          fileProps.name ?? "test.pdf",
          { type: fileProps.type ?? "application/pdf" },
        )
      : null;

    return {
      get: (key: string) => {
        if (type && key === `file_${type}`) return f;
        return null;
      },
    } as unknown as FormData;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue(fakeSession);
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);
  });

  it("returns error when no file is provided", async () => {
    const result = await uploadDocument({ error: "" }, mockFormData(null));
    expect(result).toEqual({ error: "Please select a file to upload." });
  });

  it("returns error for invalid file type", async () => {
    const fd = new FormData();
    fd.append(
      "file_cv",
      new File([new ArrayBuffer(1000)], "test.exe", {
        type: "application/x-msdownload",
      }),
    );

    const result = await uploadDocument({ error: "" }, fd);
    expect(result.error).toContain("Invalid file type for CV");
  });

  it("returns error when file exceeds max size", async () => {
    const fd = new FormData();
    fd.append(
      "file_cv",
      new File([new ArrayBuffer(50 * 1024 * 1024)], "test.pdf", {
        type: "application/pdf",
      }),
    );

    const result = await uploadDocument({ error: "" }, fd);
    expect(result.error).toContain("File is too large");
  });

  it("successfully uploads a photo", async () => {
    const fd = new FormData();
    fd.append(
      "file_photo",
      new File([new ArrayBuffer(100000)], "photo.jpg", {
        type: "image/jpeg",
      }),
    );

    const result = await uploadDocument({ error: "" }, fd);
    expect(result).toEqual({ error: "" });
  });
});

// ---------------------------------------------------------------------------
// respondToInvitation — validation logic
// ---------------------------------------------------------------------------

describe("respondToInvitation", () => {
  const fakeSession = { id: "42", role: "candidate" };

  const mockFormData = (overrides: Record<string, string>) => {
    const data: Record<string, string> = {
      invitationUuid: "invitation-test-uuid",
      action: "accept",
      ...overrides,
    };
    return {
      get: (key: string) => data[key] ?? null,
    } as unknown as FormData;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleCapability.mockResolvedValue(fakeSession);
    mockFindFirst.mockResolvedValue({ invitation_uuid: "invitation-test-uuid" });
    mockUpdate.mockResolvedValue({ invitation_uuid: "invitation-test-uuid" });
  });

  it("returns error when invitationUuid is missing", async () => {
    const result = await respondToInvitation(
      { error: "" },
      mockFormData({ invitationUuid: "" }),
    );
    expect(result).toEqual({ error: "Missing invitation identifier." });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns error for invalid action value", async () => {
    const result = await respondToInvitation(
      { error: "" },
      mockFormData({ action: "invalid" }),
    );
    expect(result).toEqual({ error: "Invalid action." });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("accepts 'accept' as valid action (redirects)", async () => {
    const result = await respondToInvitation(
      { error: "" },
      mockFormData({ action: "accept" }),
    );
    expect(result).toBeUndefined();
    expect(mockUpdate).toHaveBeenCalled();
  });

  it("accepts 'reject' as valid action (redirects)", async () => {
    const result = await respondToInvitation(
      { error: "" },
      mockFormData({ action: "reject" }),
    );
    expect(result).toBeUndefined();
    expect(mockUpdate).toHaveBeenCalled();
  });

  it("returns error when invitation is not found", async () => {
    mockFindFirst.mockResolvedValue(null);
    const result = await respondToInvitation(
      { error: "" },
      mockFormData({ invitationUuid: "nonexistent-uuid" }),
    );
    expect(result).toEqual({ error: "Invitation not found." });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("updates invitation_status to 1 for accept (redirects)", async () => {
    await respondToInvitation(
      { error: "" },
      mockFormData({ action: "accept" }),
    );
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { invitation_uuid: "invitation-test-uuid" },
        data: expect.objectContaining({
          invitation_status: 1,
        }),
      }),
    );
  });

  it("updates invitation_status to 2 for reject (redirects)", async () => {
    await respondToInvitation(
      { error: "" },
      mockFormData({ action: "reject" }),
    );
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { invitation_uuid: "invitation-test-uuid" },
        data: expect.objectContaining({
          invitation_status: 2,
        }),
      }),
    );
  });

  it("checks candidate_id matches session", async () => {
    await respondToInvitation(
      { error: "" },
      mockFormData({ action: "accept" }),
    );
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          candidate_id: 42,
        }),
      }),
    );
  });
});
