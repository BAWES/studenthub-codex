import { describe, it, expect } from "vitest";
// Documents
import {
  listDocumentsSchema as listCandidateDocsSchema,
  getDocumentSchema as getCandidateDocSchema,
  candidateDocumentItemResultSchema,
  listCandidateDocumentsResultSchema,
  getCandidateDocumentResultSchema,
  uploadDocumentStateResultSchema,
  deleteDocumentStateResultSchema,
} from "@/modules/candidates/documents/schemas";
// Invitations
import {
  invitationRowOutputSchema,
  listInvitationsResultOutputSchema,
  getInvitationDetailResultOutputSchema,
  listInvitationsSchema as candidateListInvitationsSchema,
  getInvitationDetailSchema as candidateGetInvitationDetailSchema,
} from "@/app/candidate/invitations/schemas";
// App-level document schemas
import {
  listDocumentsSchema as appListDocumentsSchema,
  getDocumentSchema as appGetDocumentSchema,
} from "@/app/candidate/documents/schemas";

// ===========================================================================
// CANDIDATE DOCUMENTS — Input Schema Validation
// ===========================================================================

describe("candidate/documents: listDocumentsSchema (module)", () => {
  it("accepts a valid candidate ID", () => {
    const result = listCandidateDocsSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });

  it("coerces string candidate ID", () => {
    const result = listCandidateDocsSchema.safeParse({ candidateId: "99" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(99);
    }
  });

  it("rejects zero candidate ID", () => {
    const result = listCandidateDocsSchema.safeParse({ candidateId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative candidate ID", () => {
    const result = listCandidateDocsSchema.safeParse({ candidateId: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects missing candidateId", () => {
    const result = listCandidateDocsSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("candidate/documents: getDocumentSchema (module)", () => {
  it("accepts valid candidate ID and document type", () => {
    const result = getCandidateDocSchema.safeParse({
      candidateId: 1,
      documentType: "cv",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.documentType).toBe("cv");
    }
  });

  it("accepts all valid document types", () => {
    for (const dt of ["photo", "cv", "video", "civilFront", "civilBack"]) {
      const result = getCandidateDocSchema.safeParse({
        candidateId: 1,
        documentType: dt,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid document type", () => {
    const result = getCandidateDocSchema.safeParse({
      candidateId: 1,
      documentType: "passport",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing documentType", () => {
    const result = getCandidateDocSchema.safeParse({ candidateId: 1 });
    expect(result.success).toBe(false);
  });
});

describe("candidate/documents: app-level listDocumentsSchema", () => {
  it("applies defaults for empty input", () => {
    const result = appListDocumentsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("rejects limit > 100", () => {
    const result = appListDocumentsSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });
});

describe("candidate/documents: app-level getDocumentSchema", () => {
  it("accepts valid document type", () => {
    const result = appGetDocumentSchema.safeParse({ documentType: "photo" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid document type", () => {
    const result = appGetDocumentSchema.safeParse({ documentType: "badge" });
    expect(result.success).toBe(false);
  });
});

// ===========================================================================
// CANDIDATE DOCUMENTS — Output Schema Validation
// ===========================================================================

describe("candidate/documents: candidateDocumentItemResultSchema", () => {
  it("accepts a valid document item", () => {
    const result = candidateDocumentItemResultSchema.safeParse({
      type: "cv",
      label: "CV / Resume",
      filePath: "/uploads/cv_123.pdf",
      fileUrl: "https://example.com/cv_123.pdf",
    });
    expect(result.success).toBe(true);
  });

  it("accepts item with null filePath and fileUrl", () => {
    const result = candidateDocumentItemResultSchema.safeParse({
      type: "photo",
      label: "Profile Photo",
      filePath: null,
      fileUrl: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing label", () => {
    const result = candidateDocumentItemResultSchema.safeParse({
      type: "cv",
      filePath: null,
      fileUrl: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const result = candidateDocumentItemResultSchema.safeParse({
      type: "diploma",
      label: "Diploma",
      filePath: null,
      fileUrl: null,
    });
    expect(result.success).toBe(false);
  });
});

describe("candidate/documents: listCandidateDocumentsResultSchema", () => {
  it("accepts valid result with items", () => {
    const result = listCandidateDocumentsResultSchema.safeParse({
      items: [
        { type: "cv", label: "CV", filePath: null, fileUrl: null },
        { type: "photo", label: "Photo", filePath: "/img.jpg", fileUrl: "https://example.com/img.jpg" },
      ],
      candidateId: 42,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing candidateId", () => {
    const result = listCandidateDocumentsResultSchema.safeParse({
      items: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("candidate/documents: getCandidateDocumentResultSchema", () => {
  it("accepts a valid item", () => {
    const result = getCandidateDocumentResultSchema.safeParse({
      type: "cv",
      label: "CV",
      filePath: null,
      fileUrl: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts null (not found)", () => {
    const result = getCandidateDocumentResultSchema.safeParse(null);
    expect(result.success).toBe(true);
  });
});

describe("candidate/documents: uploadDocumentStateResultSchema", () => {
  it("accepts success state", () => {
    const result = uploadDocumentStateResultSchema.safeParse({
      success: true,
      filePath: "/uploads/new.pdf",
    });
    expect(result.success).toBe(true);
  });

  it("accepts failure state with error", () => {
    const result = uploadDocumentStateResultSchema.safeParse({
      success: false,
      error: "File too large",
    });
    expect(result.success).toBe(true);
  });

  it("accepts minimal failure state", () => {
    const result = uploadDocumentStateResultSchema.safeParse({
      success: false,
    });
    expect(result.success).toBe(true);
  });
});

describe("candidate/documents: deleteDocumentStateResultSchema", () => {
  it("accepts success state", () => {
    const result = deleteDocumentStateResultSchema.safeParse({
      success: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts failure state with error", () => {
    const result = deleteDocumentStateResultSchema.safeParse({
      success: false,
      error: "Document not found",
    });
    expect(result.success).toBe(true);
  });
});

// ===========================================================================
// CANDIDATE INVITATIONS — Input Schema Validation
// ===========================================================================

describe("candidate/invitations: listInvitationsSchema", () => {
  it("applies defaults for empty input", () => {
    const result = candidateListInvitationsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts valid page and limit", () => {
    const result = candidateListInvitationsSchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
  });

  it("rejects non-positive page", () => {
    const result = candidateListInvitationsSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects limit > 100", () => {
    const result = candidateListInvitationsSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });
});

describe("candidate/invitations: getInvitationDetailSchema", () => {
  it("accepts a valid UUID string", () => {
    const result = candidateGetInvitationDetailSchema.safeParse({
      invitationUuid: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.invitationUuid).toBe("550e8400-e29b-41d4-a716-446655440000");
    }
  });

  it("rejects empty UUID", () => {
    const result = candidateGetInvitationDetailSchema.safeParse({ invitationUuid: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing invitationUuid", () => {
    const result = candidateGetInvitationDetailSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ===========================================================================
// CANDIDATE INVITATIONS — Output Schema Validation
// ===========================================================================

describe("candidate/invitations: invitationRowOutputSchema", () => {
  it("accepts a valid invitation row", () => {
    const result = invitationRowOutputSchema.safeParse({
      invitation_uuid: "uuid-123",
      invitation_status: 1,
      invitation_app_seen_at: new Date("2026-06-01"),
      invitation_email_seen_at: new Date("2026-06-01"),
      invitation_created_at: new Date(),
      position_title: "Software Engineer",
      compensation: "KD 800-1500",
      company_name: "ACME Corp",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all nullable fields as null", () => {
    const result = invitationRowOutputSchema.safeParse({
      invitation_uuid: "uuid-123",
      invitation_status: null,
      invitation_app_seen_at: null,
      invitation_email_seen_at: null,
      invitation_created_at: null,
      position_title: null,
      compensation: null,
      company_name: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required UUID", () => {
    const result = invitationRowOutputSchema.safeParse({
      invitation_status: null,
      invitation_app_seen_at: null,
      invitation_email_seen_at: null,
      invitation_created_at: null,
      position_title: null,
      compensation: null,
      company_name: null,
    });
    expect(result.success).toBe(false);
  });
});

describe("candidate/invitations: listInvitationsResultOutputSchema", () => {
  it("accepts valid result with items", () => {
    const result = listInvitationsResultOutputSchema.safeParse({
      items: [
        {
          invitation_uuid: "uuid-1",
          invitation_status: 1,
          invitation_app_seen_at: null,
          invitation_email_seen_at: null,
          invitation_created_at: null,
          position_title: "Engineer",
          compensation: null,
          company_name: "ACME",
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty items", () => {
    const result = listInvitationsResultOutputSchema.safeParse({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.success).toBe(true);
  });
});

describe("candidate/invitations: getInvitationDetailResultOutputSchema", () => {
  const validDetail = {
    invitation: {
      invitation_uuid: "inv-uuid",
      invitation_status: 1,
      invitation_app_seen_at: new Date(),
      invitation_email_seen_at: new Date(),
      invitation_seen_via: "email",
      invitation_created_at: new Date(),
      invitation_updated_at: new Date(),
      request: {
        request_uuid: "req-uuid",
        request_position_title: "Engineer",
        request_job_description: "Build things",
        request_compensation: "KD 1000",
        request_location: "Kuwait City",
        request_number_of_employees: 3,
        request_status: "active",
        company_name: "ACME Corp",
        company_email: "hr@acme.com",
        staff_name: "John Staff",
        staff_email: "john@staff.com",
      },
      story_uuid: "story-uuid",
      story_status: 1,
      story_last_updated_at: new Date(),
    },
    metrics: [
      { label: "Match Score", value: 85, note: "Good match" },
    ],
    notes: [
      { id: "note-1", title: "Follow up", subtitle: "Call candidate", meta: "2026-06-01" },
    ],
  };

  it("accepts a valid detailed result", () => {
    const result = getInvitationDetailResultOutputSchema.safeParse(validDetail);
    expect(result.success).toBe(true);
  });

  it("accepts null invitation (not found)", () => {
    const result = getInvitationDetailResultOutputSchema.safeParse({
      invitation: null,
      metrics: [],
      notes: [],
    });
    expect(result.success).toBe(true);
  });

  it("accepts nullable fields in request as null", () => {
    const result = getInvitationDetailResultOutputSchema.safeParse({
      invitation: {
        ...validDetail.invitation,
        request: {
          ...validDetail.invitation.request,
          request_position_title: null,
          request_compensation: null,
        },
      },
      metrics: [],
      notes: [],
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty metrics and notes arrays", () => {
    const result = getInvitationDetailResultOutputSchema.safeParse({
      invitation: validDetail.invitation,
      metrics: [],
      notes: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing metrics array", () => {
    const { metrics, ...withoutMetrics } = validDetail;
    const result = getInvitationDetailResultOutputSchema.safeParse(withoutMetrics);
    expect(result.success).toBe(false);
  });

  it("rejects missing notes array", () => {
    const { notes, ...withoutNotes } = validDetail;
    const result = getInvitationDetailResultOutputSchema.safeParse(withoutNotes);
    expect(result.success).toBe(false);
  });

  it("rejects missing request object inside invitation", () => {
    const { request, ...invWithoutRequest } = validDetail.invitation;
    const result = getInvitationDetailResultOutputSchema.safeParse({
      invitation: invWithoutRequest,
      metrics: [],
      notes: [],
    });
    expect(result.success).toBe(false);
  });

  it("accepts string and number metric values", () => {
    const result = getInvitationDetailResultOutputSchema.safeParse({
      invitation: validDetail.invitation,
      metrics: [
        { label: "Score", value: 95, note: "High" },
        { label: "Status", value: "Active", note: "Open" },
      ],
      notes: [],
    });
    expect(result.success).toBe(true);
  });

  it("accepts nullable story fields", () => {
    const result = getInvitationDetailResultOutputSchema.safeParse({
      invitation: {
        ...validDetail.invitation,
        story_uuid: null,
        story_status: null,
        story_last_updated_at: null,
      },
      metrics: [],
      notes: [],
    });
    expect(result.success).toBe(true);
  });
});
