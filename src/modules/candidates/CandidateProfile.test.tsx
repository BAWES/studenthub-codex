import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CandidateProfile } from "./CandidateProfile";

afterEach(() => {
  cleanup();
});

const mockDetail = {
  candidate: {
    candidate_id: 42,
    candidate_uid: "STU-007",
    candidate_name: "Ahmed Al-Sabah",
    candidate_name_ar: "أحمد الصباح",
    candidate_email: "ahmed@example.com",
    candidate_phone: "+965 5555-1234",
    candidate_objective: "Looking for a challenging role",
    candidate_intro: "Experienced professional with 5 years in retail.",
    candidate_civil_id: "284120001234",
    candidate_civil_expiry_date: new Date("2028-06-15"),
    candidate_civil_need_verification: false,
    candidate_civil_photo_front: "https://cdn.example.com/civil-front.jpg",
    candidate_civil_photo_back: "https://cdn.example.com/civil-back.jpg",
    candidate_personal_photo: null,
    candidate_resume: null,
    candidate_status: 10,
    approved: 1,
    country_id: 1,
    country: { country_name_en: "Kuwait" },
    university_id: 5,
    university: { university_name_en: "Kuwait University", university_id: 5, university_name: "Kuwait University" },
    store: { store_name: "Salmiya Branch", company: { company_name: "KIPCO" } },
    bank_id: 3,
    candidate_iban: "KW00CBKU0000000000001234567890",
    bank: null,
    profile_url: "https://linkedin.com/in/ahmed",
    candidate_updated_at: new Date("2026-06-08"),
  },
  skills: [
    { id: 1, title: "Cashier" },
    { id: 2, title: "Sales" },
  ],
  tags: [{ id: 1, title: "Bilingual" }],
  education: [
    {
      id: "edu-1",
      title: "Kuwait University",
      subtitle: "Bachelor of Science",
      meta: "2015",
    },
  ],
  experiences: [
    { id: 1, title: "Sales Associate", subtitle: "Alshaya", meta: "2020-2023" },
  ],
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
  metrics: [
    { id: 1, label: "Something", value: "0" },
    { id: 2, label: "Rate", value: "3.500 KD/hr" },
  ],
  stats: { totalRevenue: "12,500 KWD" },
} as any;

describe("CandidateProfile", () => {
  it("renders candidate name and title", () => {
    render(
      <CandidateProfile detail={mockDetail} actions={[]} />
    );
    expect(screen.getByText("Ahmed Al-Sabah")).toBeInTheDocument();
    expect(screen.getByText("أحمد الصباح")).toBeInTheDocument();
  });

  it("renders candidate UID", () => {
    render(
      <CandidateProfile detail={mockDetail} actions={[]} />
    );
    expect(screen.getByText("STU-007")).toBeInTheDocument();
  });

  it("renders status as Active when candidate_status is 10 and approved", () => {
    render(
      <CandidateProfile detail={mockDetail} actions={[]} />
    );
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders company context", () => {
    render(
      <CandidateProfile detail={mockDetail} actions={[]} />
    );
    // KIPCO appears in both span and strong - use getAllByText
    const elements = screen.getAllByText("KIPCO");
    expect(elements.length).toBe(2);
  });

  it("renders readiness score", () => {
    render(
      <CandidateProfile detail={mockDetail} actions={[]} />
    );
    expect(screen.getByText("Readiness")).toBeInTheDocument();
  });

  it("renders fact grid with email and phone", () => {
    render(
      <CandidateProfile detail={mockDetail} actions={[]} />
    );
    expect(screen.getByText("ahmed@example.com")).toBeInTheDocument();
    expect(screen.getByText("+965 5555-1234")).toBeInTheDocument();
  });

  it("renders fact grid with country", () => {
    render(
      <CandidateProfile detail={mockDetail} actions={[]} />
    );
    // "Kuwait" appears only once (country name in fact grid, not company)
    expect(screen.getByText("Kuwait")).toBeInTheDocument();
  });

  it("renders readiness items", () => {
    render(
      <CandidateProfile detail={mockDetail} actions={[]} />
    );
    const doneItems = screen.getAllByText("Done");
    expect(doneItems.length).toBeGreaterThan(0);
  });

  it("renders skills and tags", () => {
    render(
      <CandidateProfile detail={mockDetail} actions={[]} />
    );
    expect(screen.getByText("Cashier")).toBeInTheDocument();
    expect(screen.getByText("Bilingual")).toBeInTheDocument();
  });

  it("renders education and experience panels", () => {
    render(
      <CandidateProfile detail={mockDetail} actions={[]} />
    );
    // "Education" appears both as panel header span and count badge
    const eduEls = screen.getAllByText("Education");
    expect(eduEls.length).toBe(2);
    // "Experience" appears as readiness item label AND panel header
    const expEls = screen.getAllByText("Experience");
    expect(expEls.length).toBe(2);
  });

  it("renders civil ID panel with badge", () => {
    render(
      <CandidateProfile detail={mockDetail} actions={[]} />
    );
    // "Civil ID" appears in the section heading and sidebar/badge text
    const civilIdEls = screen.getAllByText("Civil ID");
    expect(civilIdEls.length).toBe(2);
    expect(screen.getByText("On file")).toBeInTheDocument();
  });

  it("renders back link when backHref is provided", () => {
    render(
      <CandidateProfile
        detail={mockDetail}
        actions={[]}
        backHref="/candidate"
      />
    );
    expect(screen.getByText("Back to list")).toBeInTheDocument();
  });

  it("renders profile intro in full (non-compact) mode", () => {
    render(
      <CandidateProfile detail={mockDetail} actions={[]} />
    );
    expect(screen.getByText("Profile intro")).toBeInTheDocument();
    expect(
      screen.getByText("Experienced professional with 5 years in retail.")
    ).toBeInTheDocument();
  });

  it("renders action buttons when actions are provided", () => {
    const actions = [
      { label: "View resume", href: "/candidate/42/resume" },
      { label: "Edit profile", href: "/candidate/edit" },
    ];
    render(
      <CandidateProfile detail={mockDetail} actions={actions} />
    );
    expect(screen.getByText("View resume")).toBeInTheDocument();
    expect(screen.getByText("Edit profile")).toBeInTheDocument();
  });

  it("renders empty state when detail is null", () => {
    render(
      <CandidateProfile detail={null} actions={[]} />
    );
    expect(screen.getByText("No candidate selected")).toBeInTheDocument();
  });

  it("renders rate value from metrics", () => {
    render(
      <CandidateProfile detail={mockDetail} actions={[]} />
    );
    expect(screen.getByText("3.500 KD/hr")).toBeInTheDocument();
  });

  it("renders compact mode without profile intro and full panels", () => {
    render(
      <CandidateProfile detail={mockDetail} actions={[]} compact />
    );
    expect(screen.queryByText("Profile intro")).not.toBeInTheDocument();
  });
});
