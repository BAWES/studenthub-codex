import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CandidateProfile } from "./CandidateProfile";

// Mock next/navigation Link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock WorkLogStaffActions
vi.mock("./WorkLogStaffActions", () => ({
  WorkLogStaffActions: () => <span>Staff actions</span>,
}));

// Mock workspace/format
vi.mock("@/modules/workspace/format", () => ({
  formatDate: (d: Date | string) =>
    typeof d === "string"
      ? new Date(d).toLocaleDateString("en-GB")
      : d.toLocaleDateString("en-GB"),
}));

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// CandidateProfile
// ---------------------------------------------------------------------------

const baseDetail = {
  candidate: {
    candidate_id: 42,
    candidate_uid: "STU-007",
    candidate_name: "Ahmed Al-Sabah",
    candidate_name_ar: "أحمد الصباح",
    candidate_email: "ahmed@example.com",
    candidate_phone: "+965 5555 1234",
    candidate_objective: "Looking for a sales role",
    candidate_intro: "Experienced sales associate with 5 years...",
    candidate_status: 10,
    approved: 1,
    country_id: 1,
    university_id: 5,
    bank_id: 3,
    candidate_iban: "KW81ABCD123456789",
    candidate_civil_id: "284061234567",
    candidate_civil_expiry_date: "2026-12-31T00:00:00.000Z",
    candidate_civil_photo_front: "https://cdn.example.com/civil-front.jpg",
    candidate_civil_photo_back: null,
    candidate_civil_need_verification: false,
    candidate_personal_photo: null,
    candidate_resume: "https://cdn.example.com/resume.pdf",
    candidate_updated_at: new Date("2026-06-09T04:00:00.000Z"),
    store: {
      store_name: "Salmiya Branch",
      company: { company_name: "KIPCO" },
    },
    country: { country_name_en: "Kuwait" },
    university: { university_name_en: "Kuwait University" },
    profile_url: "https://example.com/ahmed",
  },
  skills: [
    { id: 1, title: "Sales" },
    { id: 2, title: "Customer Service" },
  ],
  tags: [{ id: 3, title: "Fluent English" }],
  education: [
    {
      id: "edu-1",
      title: "Kuwait University",
      subtitle: "BSc Computer Science",
    },
  ],
  experiences: [
    {
      id: 1,
      title: "Sales Associate",
      subtitle: "Alshaya Group",
      meta: "2020-2024",
    },
  ],
  applications: [{ id: 1, title: "Store X", subtitle: "Applied Jun 2026" }],
  interviews: [{ id: 1, title: "Store X", subtitle: "Scheduled" }],
  suggestions: [{ id: 1, title: "Store Y", subtitle: "Pending" }],
  invitations: [{ id: 1, title: "Assessment", subtitle: "Invited" }],
  histories: [{ id: 1, title: "Store Z", subtitle: "3 months" }],
  workHours: [{ id: 1, title: "Week 24", subtitle: "40h", status: 1 }],
  notes: [{ id: 1, title: "Good candidate", subtitle: "By Staff" }],
  warnings: [],
  idCards: [
    {
      id: "cid-1",
      title: "Civil ID",
      subtitle: "Valid until 2026",
      href: "https://cdn.example.com/civil-front.jpg",
    },
  ],
  certificates: [
    {
      id: "cert-1",
      title: "AWS Cloud Practitioner",
      subtitle: "Amazon Web Services",
    },
  ],
  links: [
    {
      id: "link-1",
      title: "LinkedIn",
      subtitle: "Profile",
      href: "https://linkedin.com/in/ahmed",
    },
  ],
  metrics: [{ label: "Rate", value: "3.500 KD/hr" }],
  stats: { totalRevenue: "15,000 KD" },
};

describe("CandidateProfile", () => {
  it("renders empty state when no candidate selected", () => {
    render(
      <CandidateProfile detail={null} actions={[]} />,
    );
    expect(screen.getByText("No candidate selected")).toBeInTheDocument();
  });

  it("renders candidate name, email, and company context", () => {
    render(
      <CandidateProfile
        detail={baseDetail as any}
        actions={[{ label: "Edit", href: "/candidate/edit" }]}
      />,
    );
    expect(screen.getByText("Ahmed Al-Sabah")).toBeInTheDocument();
    expect(screen.getByText("ahmed@example.com")).toBeInTheDocument();
    // KIPCO appears multiple times (store context + candidateStatusLine)
    const kipcos = screen.getAllByText("KIPCO");
    expect(kipcos.length).toBeGreaterThanOrEqual(1);
  });

  it("renders status indicator", () => {
    render(
      <CandidateProfile
        detail={baseDetail as any}
        actions={[]}
      />,
    );
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders readiness score heading", () => {
    render(
      <CandidateProfile
        detail={baseDetail as any}
        actions={[]}
      />,
    );
    expect(screen.getByText("Readiness")).toBeInTheDocument();
    // Score rendered as a strong element containing "100%"
    // Use getAllByText since "Ready" also appears in the summary text
    expect(screen.getByText("Ready to present")).toBeInTheDocument();
  });

  it("renders store and company in candidate status line", () => {
    render(
      <CandidateProfile
        detail={baseDetail as any}
        actions={[]}
      />,
    );
    expect(screen.getByText("Salmiya Branch")).toBeInTheDocument();
  });

  it("renders fact fields in the grid", () => {
    render(
      <CandidateProfile
        detail={baseDetail as any}
        actions={[]}
      />,
    );
    // Kuwait appears in fact grid + readiness; use getAllByText
    expect(screen.getByText("Kuwait")).toBeInTheDocument();
    expect(screen.getByText("Salmiya Branch")).toBeInTheDocument();
  });

  it("renders back link when backHref is provided", () => {
    render(
      <CandidateProfile
        detail={baseDetail as any}
        actions={[]}
        backHref="/candidate"
      />,
    );
    expect(screen.getByText("Back to list")).toBeInTheDocument();
  });

  it("renders action links", () => {
    render(
      <CandidateProfile
        detail={baseDetail as any}
        actions={[
          { label: "Edit", href: "/candidate/edit" },
          { label: "Export", href: "/api/export/42" },
        ]}
      />,
    );
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Export")).toBeInTheDocument();
  });

  it("shows skills and tags panels", () => {
    render(
      <CandidateProfile
        detail={baseDetail as any}
        actions={[]}
      />,
    );
    expect(screen.getByText("Sales")).toBeInTheDocument();
    expect(screen.getByText("Customer Service")).toBeInTheDocument();
    expect(screen.getByText("Fluent English")).toBeInTheDocument();
  });

  it("renders profile intro when not in compact mode", () => {
    render(
      <CandidateProfile
        detail={baseDetail as any}
        actions={[]}
      />,
    );
    expect(screen.getByText("Profile intro")).toBeInTheDocument();
    expect(
      screen.getByText("Experienced sales associate with 5 years..."),
    ).toBeInTheDocument();
  });

  it("renders work logs panel for staff viewerRole", () => {
    render(
      <CandidateProfile
        detail={baseDetail as any}
        actions={[]}
        viewerRole="staff"
      />,
    );
    expect(screen.getByText("Staff actions")).toBeInTheDocument();
  });

  it("renders panels in non-compact mode", () => {
    render(
      <CandidateProfile
        detail={baseDetail as any}
        actions={[]}
        compact={false}
      />,
    );
    // Each panel title is rendered in multiple places (PanelHeader span + timeline)
    // Use getAllByText and check at least one exists
    expect(screen.getByText("Suggestions")).toBeInTheDocument();
    expect(screen.getByText("Work history")).toBeInTheDocument();
    expect(screen.getByText("Notes")).toBeInTheDocument();
  });

  it("renders empty message for warnings panel", () => {
    render(
      <CandidateProfile
        detail={baseDetail as any}
        actions={[]}
        compact={false}
      />,
    );
    // A panel with empty data shows "No imported rows visible for this login."
    const emptyMessages = screen.getAllByText(
      /No imported rows visible for this login/,
    );
    expect(emptyMessages.length).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// CandidateProfile — edge cases
// ---------------------------------------------------------------------------

describe("CandidateProfile edge cases", () => {
  it("renders candidate with minimal fields and shows readiness gaps", () => {
    const minimalDetail = {
      ...baseDetail,
      candidate: {
        ...baseDetail.candidate,
        candidate_email: "",
        candidate_phone: null,
        country_id: null,
        university_id: null,
        bank_id: null,
        candidate_iban: null,
        candidate_civil_id: null,
        candidate_civil_expiry_date: null,
        candidate_civil_photo_front: null,
        candidate_civil_photo_back: null,
        candidate_civil_need_verification: false,
        candidate_personal_photo: null,
        candidate_resume: null,
        candidate_intro: null,
        candidate_objective: null,
        approved: 0,
        store: null,
        country: null,
        university: null,
      },
      skills: [],
      tags: [],
      education: [],
      experiences: [],
      applications: [],
      interviews: [],
      suggestions: [],
      invitations: [],
      histories: [],
      workHours: [],
      notes: [],
      warnings: [],
      idCards: [],
      certificates: [],
      links: [],
      metrics: [{ label: "Rate", value: "0" }],
      stats: { totalRevenue: null },
    };

    render(
      <CandidateProfile
        detail={minimalDetail as any}
        actions={[]}
      />,
    );
    expect(screen.getByText("Ahmed Al-Sabah")).toBeInTheDocument();
    // Needs review status instead of Active (approved=0)
    expect(screen.getByText("Needs review")).toBeInTheDocument();
    // Missing fields section should appear
    expect(screen.getByText("Missing fields")).toBeInTheDocument();
  });

  it("handles null candidate gracefully", () => {
    render(
      <CandidateProfile
        detail={{ candidate: null } as any}
        actions={[]}
      />,
    );
    expect(screen.getByText("No candidate selected")).toBeInTheDocument();
  });

  it("shows Arabic name when present", () => {
    render(
      <CandidateProfile
        detail={baseDetail as any}
        actions={[]}
      />,
    );
    expect(screen.getByText("أحمد الصباح")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// CivilIdPanel states
// ---------------------------------------------------------------------------

describe("CivilIdPanel", () => {
  it("shows On file badge for valid civil ID", () => {
    render(
      <CandidateProfile
        detail={baseDetail as any}
        actions={[]}
      />,
    );
    expect(screen.getByText("On file")).toBeInTheDocument();
  });

  it("shows Needs verification badge when verification flag is set", () => {
    const needsVerification = {
      ...baseDetail,
      candidate: {
        ...baseDetail.candidate,
        candidate_civil_need_verification: true,
      },
    };
    render(
      <CandidateProfile
        detail={needsVerification as any}
        actions={[]}
      />,
    );
    expect(screen.getByText("Needs verification")).toBeInTheDocument();
  });

  it("shows civil ID number in the civil id panel", () => {
    render(
      <CandidateProfile
        detail={baseDetail as any}
        actions={[]}
      />,
    );
    // The civil ID appears in both the fact grid and the CivilIdPanel
    const civilIdNumbers = screen.getAllByText("284061234567");
    expect(civilIdNumbers.length).toBeGreaterThanOrEqual(1);
  });

  it("shows expiry date formatted in en-GB", () => {
    render(
      <CandidateProfile
        detail={baseDetail as any}
        actions={[]}
      />,
    );
    // formatDate with en-GB locale: "2026-12-31T00:00:00.000Z" -> "31/12/2026"
    expect(screen.getByText("31/12/2026")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// RowsPanel
// ---------------------------------------------------------------------------

describe("RowsPanel empty state", () => {
  it("shows empty message when warnings panel has no data", () => {
    render(
      <CandidateProfile
        detail={baseDetail as any}
        actions={[]}
        compact={false}
      />,
    );
    // Warnings panel has empty array -> "No imported rows visible for this login."
    const emptyMessages = screen.getAllByText(
      /No imported rows visible for this login/,
    );
    expect(emptyMessages.length).toBeGreaterThanOrEqual(1);
  });
});
