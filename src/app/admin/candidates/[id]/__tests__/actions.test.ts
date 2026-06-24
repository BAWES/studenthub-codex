import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { prisma } from "@/lib/prisma";

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock Prisma — the actions use prisma.candidate (not prisma.users)
vi.mock("@/lib/prisma", () => ({
  prisma: {
    candidate: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock session
vi.mock("@/modules/auth/session", () => ({
  requireCapability: vi.fn().mockResolvedValue(undefined),
}));

// Mock S3
const mockS3Send = vi.fn();
vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class {
    send = mockS3Send;
  },
  PutObjectCommand: vi.fn(),
  DeleteObjectCommand: vi.fn(),
}));

// Mock fs/promises
const mockMkdir = vi.fn();
const mockWriteFile = vi.fn();
const mockUnlink = vi.fn();
vi.mock("node:fs/promises", () => ({
  default: {
    mkdir: mockMkdir,
    writeFile: mockWriteFile,
    unlink: mockUnlink,
  },
  mkdir: mockMkdir,
  writeFile: mockWriteFile,
  unlink: mockUnlink,
}));

const {
  getCandidateDetail,
  updateCandidateStatus,
  updateCandidate,
  deleteCandidate,
} = await import("../actions");

// ---------------------------------------------------------------------------
// admin/candidates/[id] actions
// ---------------------------------------------------------------------------

describe("admin/candidates/[id] actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // getCandidateDetail
  // -----------------------------------------------------------------------

  describe("getCandidateDetail", () => {
    const candidateData = {
      candidate_id: 1,
      candidate_name: "John Doe",
      candidate_name_ar: "جون دو",
      candidate_email: "john@example.com",
      candidate_phone: "50000000",
      candidate_status: 10,
      candidate_gender: 1,
      candidate_birth_date: new Date("1998-06-15"),
      candidate_hourly_rate: { toNumber: () => 5 },
      candidate_objective: "Looking for opportunities",
      currency_code: "KWD",
      candidate_created_at: new Date("2026-01-01T10:00:00Z"),
      candidate_updated_at: new Date("2026-06-01T10:00:00Z"),
      candidate_resume: "/resumes/john.pdf",
      candidate_civil_photo_front: "/civil/front.jpg",
      candidate_civil_photo_back: null,
      candidate_personal_photo: null,
      store: { store_name: "Main Branch" },
      country: { country_name_en: "Kuwait" },
      university: { university_name_en: "KU" },
      transfer_candidate: [],
    } as any;

    it("returns candidate detail with full profile", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue(candidateData);

      const result = await getCandidateDetail(1);

      expect(result.candidate).not.toBeNull();
      expect(result.candidate?.candidate_id).toBe(1);
      expect(result.candidate?.candidate_name).toBe("John Doe");
      expect(result.candidate?.candidate_email).toBe("john@example.com");
      expect(result.candidate?.store?.store_name).toBe("Main Branch");
      expect(result.candidate?.country?.country_name_en).toBe("Kuwait");
      expect(result.candidate?.university?.university_name_en).toBe("KU");
    });

    it("returns empty arrays when candidate not found", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue(null);

      const result = await getCandidateDetail(999);

      expect(result.candidate).toBeNull();
      expect(result.placements).toHaveLength(0);
      expect(result.documents).toHaveLength(0);
      expect(result.metrics).toHaveLength(0);
    });

    it("throws error for invalid candidate ID (negative)", async () => {
      await expect(getCandidateDetail(-1)).rejects.toThrow();
    });

    it("returns documents based on available profile fields", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue(candidateData);

      const result = await getCandidateDetail(1);

      // Resume + Civil ID Front (back is null, personal photo is null)
      expect(result.documents).toHaveLength(2);
      expect(result.documents[0].type).toBe("resume");
      expect(result.documents[1].type).toBe("civil_id_front");
    });

    it("returns placements from transfer_candidate records", async () => {
      const candidateWithPlacements = {
        ...candidateData,
        transfer_candidate: [
          {
            tc_id: 10,
            store_name: "Store A",
            hours: 40,
            candidate_total: 500,
            paid: 1,
            transfer: {
              transfer_id: 100,
              start_date: new Date("2026-06-01"),
              end_date: new Date("2026-06-15"),
              company: { company_name: "Acme Corp" },
            },
          },
        ],
      } as any;

      vi.mocked(prisma.candidate.findFirst).mockResolvedValue(candidateWithPlacements);

      const result = await getCandidateDetail(1);

      expect(result.placements).toHaveLength(1);
      expect(result.placements[0].transfer_id).toBe(100);
      expect(result.placements[0].company_name).toBe("Acme Corp");
      expect(result.placements[0].hours).toBe(40);
      expect(result.placements[0].paid).toBe(1);
    });

    it("calls findFirst with deleted: 0 filter", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue(null);

      await getCandidateDetail(1);

      const where = vi.mocked(prisma.candidate.findFirst).mock.calls[0][0]?.where as any;
      expect(where.deleted).toBe(0);
      expect(where.candidate_id).toBe(1);
    });
  });

  // -----------------------------------------------------------------------
  // updateCandidateStatus
  // -----------------------------------------------------------------------

  describe("updateCandidateStatus", () => {
    it("updates candidate status to active (10)", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
        candidate_status: 10,
      } as any);
      vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);

      const result = await updateCandidateStatus({
        candidateId: 1,
        status: 10,
      });

      expect(result.operation).toBe("success");
      expect(result.message).toContain("Active");
      expect(vi.mocked(prisma.candidate.update).mock.calls[0][0]?.data).toMatchObject({
        candidate_status: 10,
      });
    });

    it("updates candidate status to inactive (20)", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 2,
        candidate_status: 10,
      } as any);
      vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);

      const result = await updateCandidateStatus({
        candidateId: 2,
        status: 20,
      });

      expect(result.operation).toBe("success");
      expect(result.message).toContain("Inactive");
    });

    it("updates candidate status to banned (30)", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 3,
        candidate_status: 10,
      } as any);
      vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);

      const result = await updateCandidateStatus({
        candidateId: 3,
        status: 30,
      });

      expect(result.operation).toBe("success");
      expect(result.message).toContain("Banned");
    });

    it("returns error for non-existent candidate", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue(null);

      const result = await updateCandidateStatus({
        candidateId: 999,
        status: 20,
      });

      expect(result.operation).toBe("error");
      expect(result.message).toBe("Candidate not found");
    });

    it("returns error for invalid status value", async () => {
      const result = await updateCandidateStatus({
        candidateId: 1,
        status: 99,
      } as any);

      expect(result.operation).toBe("error");
      expect(result.message).toBeDefined();
    });

    it("returns error for invalid candidate ID", async () => {
      const result = await updateCandidateStatus({
        candidateId: -1,
        status: 10,
      });

      expect(result.operation).toBe("error");
      expect(result.message).toBeDefined();
    });

    it("returns error on Prisma failure", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
        candidate_status: 10,
      } as any);
      vi.mocked(prisma.candidate.update).mockRejectedValue(
        new Error("Deadlock"),
      );

      const result = await updateCandidateStatus({
        candidateId: 1,
        status: 20,
      });

      expect(result.operation).toBe("error");
      expect(result.message).toBe("Deadlock");
    });

    it("calls revalidatePath after status update", async () => {
      const { revalidatePath } = await import("next/cache");
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
        candidate_status: 10,
      } as any);
      vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);

      await updateCandidateStatus({ candidateId: 1, status: 20 });

      expect(revalidatePath).toHaveBeenCalledWith("/admin/candidates");
      expect(revalidatePath).toHaveBeenCalledWith("/admin/candidates/1");
    });
  });

  // -----------------------------------------------------------------------
  // updateCandidate
  // -----------------------------------------------------------------------

  describe("updateCandidate", () => {
    it("updates candidate profile fields", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
      } as any);
      vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);

      const result = await updateCandidate({
        candidateId: 1,
        candidateName: "Jane Doe",
        candidateEmail: "jane@example.com",
      });

      expect(result.operation).toBe("success");
      expect(result.message).toBe("Candidate updated successfully");

      const data = vi.mocked(prisma.candidate.update).mock.calls[0][0]?.data as any;
      expect(data.candidate_name).toBe("Jane Doe");
      expect(data.candidate_email).toBe("jane@example.com");
    });

    it("only includes provided fields", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
      } as any);
      vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);

      await updateCandidate({
        candidateId: 1,
        candidatePhone: "50000000",
      });

      const data = vi.mocked(prisma.candidate.update).mock.calls[0][0]?.data as any;
      expect(data.candidate_phone).toBe("50000000");
      expect(data.candidate_name).toBeUndefined();
      expect(data.candidate_email).toBeUndefined();
    });

    it("converts candidateBirthDate string to Date", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
      } as any);
      vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);

      await updateCandidate({
        candidateId: 1,
        candidateBirthDate: "1998-06-15",
      });

      const data = vi.mocked(prisma.candidate.update).mock.calls[0][0]?.data as any;
      expect(data.candidate_birth_date).toBeInstanceOf(Date);
    });

    it("returns error for non-existent candidate", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue(null);

      const result = await updateCandidate({
        candidateId: 999,
        candidateName: "Nope",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toBe("Candidate not found");
    });

    it("returns error for invalid candidate ID", async () => {
      const result = await updateCandidate({
        candidateId: -1,
        candidateName: "Bad",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toBeDefined();
    });

    it("returns error on Prisma failure", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
      } as any);
      vi.mocked(prisma.candidate.update).mockRejectedValue(
        new Error("Unique constraint"),
      );

      const result = await updateCandidate({
        candidateId: 1,
        candidateName: "Collision",
      });

      expect(result.operation).toBe("error");
      expect(result.message).toBe("Unique constraint");
    });

    it("sets candidate_updated_at on every update", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
      } as any);
      vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);

      await updateCandidate({ candidateId: 1, candidateName: "Test" });

      const data = vi.mocked(prisma.candidate.update).mock.calls[0][0]?.data as any;
      expect(data.candidate_updated_at).toBeInstanceOf(Date);
    });

    it("calls revalidatePath after update", async () => {
      const { revalidatePath } = await import("next/cache");
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
      } as any);
      vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);

      await updateCandidate({ candidateId: 1, candidateName: "Updated" });

      expect(revalidatePath).toHaveBeenCalledWith("/admin/candidates");
      expect(revalidatePath).toHaveBeenCalledWith("/admin/candidates/1");
    });
  });

  // -----------------------------------------------------------------------
  // deleteCandidate
  // -----------------------------------------------------------------------

  describe("deleteCandidate", () => {
    it("soft-deletes a candidate", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
      } as any);
      vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);

      const result = await deleteCandidate({ candidateId: 1 });

      expect(result.operation).toBe("success");
      expect(result.message).toBe("Candidate deleted successfully");
      expect(vi.mocked(prisma.candidate.update).mock.calls[0][0]?.data).toMatchObject({
        deleted: 1,
      });
    });

    it("returns error for non-existent candidate", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue(null);

      const result = await deleteCandidate({ candidateId: 999 });

      expect(result.operation).toBe("error");
      expect(result.message).toBe("Candidate not found");
    });

    it("returns error for invalid candidate ID", async () => {
      const result = await deleteCandidate({ candidateId: -1 });

      expect(result.operation).toBe("error");
      expect(result.message).toBeDefined();
    });

    it("returns error on Prisma failure", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
      } as any);
      vi.mocked(prisma.candidate.update).mockRejectedValue(
        new Error("Foreign key constraint"),
      );

      const result = await deleteCandidate({ candidateId: 1 });

      expect(result.operation).toBe("error");
      expect(result.message).toBe("Foreign key constraint");
    });

    it("calls revalidatePath after deletion", async () => {
      const { revalidatePath } = await import("next/cache");
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
      } as any);
      vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);

      await deleteCandidate({ candidateId: 1 });

      expect(revalidatePath).toHaveBeenCalledWith("/admin/candidates");
      expect(revalidatePath).toHaveBeenCalledWith("/admin/candidates/1");
    });

    it("sets candidate_updated_at on soft delete", async () => {
      vi.mocked(prisma.candidate.findFirst).mockResolvedValue({
        candidate_id: 1,
      } as any);
      vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);

      await deleteCandidate({ candidateId: 1 });

      const data = vi.mocked(prisma.candidate.update).mock.calls[0][0]?.data as any;
      expect(data.candidate_updated_at).toBeInstanceOf(Date);
    });
  });
});

// ---------------------------------------------------------------------------
// adminUploadCandidateDocument
// ---------------------------------------------------------------------------

function validUploadFormData(candidateId: number = 1, documentType: string = "cv"): FormData {
  const fd = new FormData();
  fd.set("candidateId", String(candidateId));
  fd.set("documentType", documentType);
  // Use appropriate filename and MIME type per document type
  let fileName = "resume.pdf";
  let mimeType = "application/pdf";
  if (documentType === "photo" || documentType === "civilFront" || documentType === "civilBack") {
    fileName = "photo.jpeg";
    mimeType = "image/jpeg";
  } else if (documentType === "video") {
    fileName = "video.mp4";
    mimeType = "video/mp4";
  }
  const blob = new Blob(["fake content"], { type: mimeType });
  fd.set("file", blob, fileName);
  return fd;
}

describe("adminUploadCandidateDocument", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock: S3 env vars set
    process.env.AWS_TEMP_BUCKET_REGION = "us-east-1";
    process.env.AWS_TEMP_ACCESS_KEY_ID = "AKIA...";
    process.env.AWS_TEMP_SECRET_ACCESS_KEY = "secret";
    process.env.AWS_TEMP_BUCKET_NAME = "test-bucket";
    mockS3Send.mockResolvedValue({ ETag: '"abc123"' });
    vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);
  });

  afterEach(() => {
    delete process.env.AWS_TEMP_BUCKET_REGION;
    delete process.env.AWS_TEMP_ACCESS_KEY_ID;
    delete process.env.AWS_TEMP_SECRET_ACCESS_KEY;
    delete process.env.AWS_TEMP_BUCKET_NAME;
  });

  it("uploads a file to S3 when S3 is configured", async () => {
    const { adminUploadCandidateDocument } = await import(
      "@/modules/admin/candidates/[id]/actions"
    );

    const result = await adminUploadCandidateDocument(
      { success: false } as any,
      validUploadFormData(1, "cv"),
    );

    expect(result.success).toBe(true);
    expect(result.filePath).toMatch(/^candidates\/1\/cv_.+\.pdf$/);
    expect(result.s3Key).toBeDefined();
    expect(mockS3Send).toHaveBeenCalledTimes(1);
  });

  it("falls back to local disk when S3 is not configured", async () => {
    delete process.env.AWS_TEMP_BUCKET_REGION;
    delete process.env.AWS_TEMP_ACCESS_KEY_ID;
    delete process.env.AWS_TEMP_SECRET_ACCESS_KEY;
    delete process.env.AWS_TEMP_BUCKET_NAME;

    const { adminUploadCandidateDocument } = await import(
      "@/modules/admin/candidates/[id]/actions"
    );

    const result = await adminUploadCandidateDocument(
      { success: false } as any,
      validUploadFormData(1, "photo"),
    );

    expect(result.success).toBe(true);
    expect(result.filePath).toMatch(/^\/uploads\/candidates\/1\/photo_.+\.jpe?g$/);
    expect(mockMkdir).toHaveBeenCalled();
    expect(mockWriteFile).toHaveBeenCalled();
  });

  it("updates the candidate document field in DB", async () => {
    const { adminUploadCandidateDocument } = await import(
      "@/modules/admin/candidates/[id]/actions"
    );

    await adminUploadCandidateDocument(
      { success: false } as any,
      validUploadFormData(1, "photo"),
    );

    const updateCall = vi.mocked(prisma.candidate.update).mock.calls[0][0] as any;
    expect(updateCall.where.candidate_id).toBe(1);
    expect(updateCall.data.candidate_personal_photo).toMatch(
      /^candidates\/1\/photo_/,
    );
  });

  it("rejects unsupported file extension", async () => {
    const { adminUploadCandidateDocument } = await import(
      "@/modules/admin/candidates/[id]/actions"
    );

    const fd = new FormData();
    fd.set("candidateId", "1");
    fd.set("documentType", "photo");
    const blob = new Blob(["not a video"], { type: "video/mp4" });
    fd.set("file", blob, "photo.exe");

    const result = await adminUploadCandidateDocument(
      { success: false } as any,
      fd,
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain(".exe");
  });

  it("rejects oversized file", async () => {
    const { adminUploadCandidateDocument } = await import(
      "@/modules/admin/candidates/[id]/actions"
    );

    const fd = new FormData();
    fd.set("candidateId", "1");
    fd.set("documentType", "cv");
    // 11 MB blob
    const largeBlob = new Blob(["x".repeat(11 * 1024 * 1024)], {
      type: "application/pdf",
    });
    fd.set("file", largeBlob, "large.pdf");

    const result = await adminUploadCandidateDocument(
      { success: false } as any,
      fd,
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("too large");
  });

  it("rejects missing candidateId", async () => {
    const { adminUploadCandidateDocument } = await import(
      "@/modules/admin/candidates/[id]/actions"
    );

    const fd = new FormData();
    fd.set("documentType", "cv");
    fd.set("file", new Blob(["x"], { type: "application/pdf" }), "doc.pdf");

    const result = await adminUploadCandidateDocument(
      { success: false } as any,
      fd,
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("candidateId");
  });

  it("rejects missing file", async () => {
    const { adminUploadCandidateDocument } = await import(
      "@/modules/admin/candidates/[id]/actions"
    );

    const fd = new FormData();
    fd.set("candidateId", "1");
    fd.set("documentType", "cv");

    const result = await adminUploadCandidateDocument(
      { success: false } as any,
      fd,
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("No file");
  });

  it("requires candidate.write capability", async () => {
    const { requireCapability } = await import("@/modules/auth/session");
    vi.mocked(requireCapability).mockRejectedValueOnce(
      new Error("Unauthorized"),
    );

    const { adminUploadCandidateDocument } = await import(
      "@/modules/admin/candidates/[id]/actions"
    );

    await expect(
      adminUploadCandidateDocument(
        { success: false } as any,
        validUploadFormData(),
      ),
    ).rejects.toThrow("Unauthorized");
  });

  it("calls revalidatePath after upload", async () => {
    const { revalidatePath } = await import("next/cache");
    const { adminUploadCandidateDocument } = await import(
      "@/modules/admin/candidates/[id]/actions"
    );

    await adminUploadCandidateDocument(
      { success: false } as any,
      validUploadFormData(42, "cv"),
    );

    expect(revalidatePath).toHaveBeenCalledWith("/admin/candidates/42");
  });
});

// ---------------------------------------------------------------------------
// adminDeleteCandidateDocument
// ---------------------------------------------------------------------------

describe("adminDeleteCandidateDocument", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AWS_TEMP_BUCKET_REGION = "us-east-1";
    process.env.AWS_TEMP_ACCESS_KEY_ID = "AKIA...";
    process.env.AWS_TEMP_SECRET_ACCESS_KEY = "secret";
    process.env.AWS_TEMP_BUCKET_NAME = "test-bucket";
    vi.mocked(prisma.candidate.findUnique).mockResolvedValue({
      candidate_id: 1,
      candidate_resume: "candidates/1/cv_abc123.pdf",
    } as any);
    vi.mocked(prisma.candidate.update).mockResolvedValue({} as any);
    mockS3Send.mockResolvedValue({});
  });

  afterEach(() => {
    delete process.env.AWS_TEMP_BUCKET_REGION;
    delete process.env.AWS_TEMP_ACCESS_KEY_ID;
    delete process.env.AWS_TEMP_SECRET_ACCESS_KEY;
    delete process.env.AWS_TEMP_BUCKET_NAME;
  });

  it("deletes a document and clears DB field", async () => {
    const { adminDeleteCandidateDocument } = await import(
      "@/modules/admin/candidates/[id]/actions"
    );

    const fd = new FormData();
    fd.set("candidateId", "1");
    fd.set("documentType", "cv");

    const result = await adminDeleteCandidateDocument(
      { success: false } as any,
      fd,
    );

    expect(result.success).toBe(true);
    expect(vi.mocked(prisma.candidate.update).mock.calls[0][0]?.data).toMatchObject({
      candidate_resume: null,
    });
  });

  it("deletes file from S3 when it has an S3 key", async () => {
    vi.mocked(prisma.candidate.findUnique).mockResolvedValue({
      candidate_id: 1,
      candidate_resume: "candidates/1/cv_abc.pdf",
    } as any);

    const { adminDeleteCandidateDocument } = await import(
      "@/modules/admin/candidates/[id]/actions"
    );

    const fd = new FormData();
    fd.set("candidateId", "1");
    fd.set("documentType", "cv");

    await adminDeleteCandidateDocument({ success: false } as any, fd);

    // S3 DeleteObjectCommand should have been sent
    expect(mockS3Send).toHaveBeenCalled();
  });

  it("deletes file from local disk when it has a local path", async () => {
    delete process.env.AWS_TEMP_BUCKET_REGION;
    delete process.env.AWS_TEMP_ACCESS_KEY_ID;
    delete process.env.AWS_TEMP_SECRET_ACCESS_KEY;
    delete process.env.AWS_TEMP_BUCKET_NAME;

    vi.mocked(prisma.candidate.findUnique).mockResolvedValue({
      candidate_id: 1,
      candidate_resume: "/uploads/candidates/1/cv_abc.pdf",
    } as any);

    const { adminDeleteCandidateDocument } = await import(
      "@/modules/admin/candidates/[id]/actions"
    );

    const fd = new FormData();
    fd.set("candidateId", "1");
    fd.set("documentType", "cv");

    await adminDeleteCandidateDocument({ success: false } as any, fd);

    expect(mockUnlink).toHaveBeenCalled();
  });

  it("returns error when candidate not found", async () => {
    vi.mocked(prisma.candidate.findUnique).mockResolvedValue(null);

    const { adminDeleteCandidateDocument } = await import(
      "@/modules/admin/candidates/[id]/actions"
    );

    const fd = new FormData();
    fd.set("candidateId", "999");
    fd.set("documentType", "cv");

    const result = await adminDeleteCandidateDocument(
      { success: false } as any,
      fd,
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("Candidate not found");
  });

  it("rejects missing candidateId", async () => {
    const { adminDeleteCandidateDocument } = await import(
      "@/modules/admin/candidates/[id]/actions"
    );

    const fd = new FormData();
    fd.set("documentType", "cv");

    const result = await adminDeleteCandidateDocument(
      { success: false } as any,
      fd,
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("candidateId");
  });

  it("requires candidate.write capability", async () => {
    const { requireCapability } = await import("@/modules/auth/session");
    vi.mocked(requireCapability).mockRejectedValueOnce(
      new Error("Unauthorized"),
    );

    const { adminDeleteCandidateDocument } = await import(
      "@/modules/admin/candidates/[id]/actions"
    );

    await expect(
      adminDeleteCandidateDocument(
        { success: false } as any,
        new FormData(),
      ),
    ).rejects.toThrow("Unauthorized");
  });

  it("calls revalidatePath after delete", async () => {
    const { revalidatePath } = await import("next/cache");
    const { adminDeleteCandidateDocument } = await import(
      "@/modules/admin/candidates/[id]/actions"
    );

    const fd = new FormData();
    fd.set("candidateId", "7");
    fd.set("documentType", "cv");

    await adminDeleteCandidateDocument({ success: false } as any, fd);

    expect(revalidatePath).toHaveBeenCalledWith("/admin/candidates/7");
  });
});
