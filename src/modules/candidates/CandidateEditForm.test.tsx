// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CandidateEditForm } from "./CandidateEditForm";

afterEach(() => {
  cleanup();
});

const baseProps = {
  candidate: {
    name: "Ahmed Al-Sabah",
    nameAr: "أحمد الصباح",
    email: "ahmed@example.com",
    phone: "+965 5555-1234",
    objective: "Looking for a challenging role",
    intro: "Experienced professional",
    civilId: "284120001234",
    profileUrl: "https://linkedin.com/in/ahmed",
    birthDate: "1990-01-15",
    address: "Kuwait City",
    gender: "",
    drivingLicense: "",
    civilExpiry: "",
    preferredTime: "",
    countryId: 1,
    universityId: 5,
    bankId: 3,
    bankAccountName: "Ahmed Al-Sabah",
    iban: "KW00CBKU0000000000001234567890",
    personalPhoto: null,
    resume: null,
    video: null,
    civilPhotoFront: null,
    civilPhotoBack: null,
  },
  countries: [{ id: 1, label: "Kuwait" }],
  universities: [{ id: 5, label: "Kuwait University" }],
  banks: [{ id: 3, label: "CBK" }],
  skills: [{ id: 1, title: "Cashier" }, { id: 2, title: "Sales" }],
  experiences: [
    { id: 1, title: "Sales Associate", subtitle: "Alshaya" },
  ],
  certificates: [
    { id: "cert-1", title: "AWS Cloud Practitioner", subtitle: "Amazon" },
  ],
  languages: [
    { id: 1, title: "English", subtitle: "Advanced" },
  ],
  educationEntries: [
    {
      id: "edu-1",
      universityId: 5,
      degreeUuid: "deg-1",
      majorUuid: null,
      graduationYear: 2015,
      isCurrentlyStudying: false,
      universityLabel: "Kuwait University",
      degreeLabel: "Bachelor",
    },
  ],
  degrees: [{ id: "deg-1", label: "Bachelor" }],
  majors: [{ id: "maj-1", label: "Computer Science" }],
};

describe("CandidateEditForm", () => {
  it("renders personal info section with fields", () => {
    render(<CandidateEditForm {...baseProps} />);
    // "Ahmed Al-Sabah" appears in both `name` and `bankAccountName` inputs
    const ahmedInputs = screen.getAllByDisplayValue("Ahmed Al-Sabah");
    expect(ahmedInputs.length).toBe(2);
    expect(screen.getByDisplayValue("أحمد الصباح")).toBeInTheDocument();
    expect(screen.getByDisplayValue("ahmed@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("+965 5555-1234")).toBeInTheDocument();
  });

  it("renders all form section headings", () => {
    render(<CandidateEditForm {...baseProps} />);
    expect(screen.getByText("Personal info")).toBeInTheDocument();
    expect(screen.getByText("Location & education")).toBeInTheDocument();
    expect(screen.getByText("Bank info")).toBeInTheDocument();
    expect(screen.getByText("Profile details")).toBeInTheDocument();
    expect(screen.getByText("Documents")).toBeInTheDocument();
    expect(screen.getByText("Skills")).toBeInTheDocument();
    expect(screen.getByText("Work experience")).toBeInTheDocument();
    expect(screen.getByText("Certificates")).toBeInTheDocument();
    expect(screen.getByText("Languages")).toBeInTheDocument();
    expect(screen.getByText("Education")).toBeInTheDocument();
  });

  it("renders skill list items", () => {
    render(<CandidateEditForm {...baseProps} />);
    expect(screen.getByText("Cashier")).toBeInTheDocument();
    expect(screen.getByText("Sales")).toBeInTheDocument();
  });

  it("renders experience items with employer", () => {
    render(<CandidateEditForm {...baseProps} />);
    expect(screen.getByText(/Sales Associate/)).toBeInTheDocument();
  });

  it("renders certificate items", () => {
    render(<CandidateEditForm {...baseProps} />);
    expect(screen.getByText(/AWS Cloud Practitioner/)).toBeInTheDocument();
  });

  it("renders language items with proficiency badge", () => {
    render(<CandidateEditForm {...baseProps} />);
    // "Advanced" appears both in the badge and the proficiency select trigger
    const advancedElements = screen.getAllByText("Advanced");
    expect(advancedElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders education entries", () => {
    render(<CandidateEditForm {...baseProps} />);
    // "Kuwait University · Bachelor (2015)" is the unique education entry display
    expect(screen.getByText(/Kuwait University.*Bachelor/)).toBeInTheDocument();
    // "Bachelor" also appears in a hidden Radix Select <option>
    expect(screen.getAllByText(/Bachelor/).length).toBeGreaterThanOrEqual(1);
  });

  it("renders document upload fields", () => {
    render(<CandidateEditForm {...baseProps} />);
    expect(screen.getByText("Profile photo")).toBeInTheDocument();
    expect(screen.getByText("CV / Resume")).toBeInTheDocument();
    expect(screen.getByText("Video")).toBeInTheDocument();
    expect(screen.getByText("Civil ID (front)")).toBeInTheDocument();
    expect(screen.getByText("Civil ID (back)")).toBeInTheDocument();
  });

  it("renders country, university, bank selects with option labels", () => {
    render(<CandidateEditForm {...baseProps} />);
    // "Kuwait" appears in the SelectValue AND a hidden <option> — use getAllBy
    expect(screen.getAllByText("Kuwait").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("CBK").length).toBeGreaterThanOrEqual(1);
  });

  it("renders save profile button", () => {
    render(<CandidateEditForm {...baseProps} />);
    expect(screen.getByText("Save profile")).toBeInTheDocument();
  });

  it("renders upload document button", () => {
    render(<CandidateEditForm {...baseProps} />);
    expect(screen.getByText("Upload document")).toBeInTheDocument();
  });

  it("shows empty state for skills when none exist", () => {
    const noSkills = { ...baseProps, skills: [] };
    render(<CandidateEditForm {...noSkills} />);
    expect(screen.getByText("No skills added yet.")).toBeInTheDocument();
  });

  it("shows empty state for experience when none exist", () => {
    const noExp = { ...baseProps, experiences: [] };
    render(<CandidateEditForm {...noExp} />);
    expect(screen.getByText("No work experience added yet.")).toBeInTheDocument();
  });

  it("shows empty state for certificates when none exist", () => {
    const noCerts = { ...baseProps, certificates: [] };
    render(<CandidateEditForm {...noCerts} />);
    expect(screen.getByText("No certificates added yet.")).toBeInTheDocument();
  });

  it("shows empty state for languages when none exist", () => {
    const noLangs = { ...baseProps, languages: [] };
    render(<CandidateEditForm {...noLangs} />);
    expect(screen.getByText("No languages added yet.")).toBeInTheDocument();
  });

  it("shows empty state for education when none exist", () => {
    const noEdu = { ...baseProps, educationEntries: [] };
    render(<CandidateEditForm {...noEdu} />);
    expect(screen.getByText("No education entries added yet.")).toBeInTheDocument();
  });
});
