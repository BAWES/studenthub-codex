import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CandidateEditForm } from "./CandidateEditForm";

// Mock the server actions — each as a distinct async thunk
vi.mock("@/modules/candidates/actions", () => {
  // useActionState needs the action to be a function that returns a promise
  const mkAction = () => Object.assign(async () => ({}), { bind: () => {} });
  return {
    updateCandidateProfile: mkAction(),
    uploadDocument: mkAction(),
    addCandidateSkill: mkAction(),
    removeCandidateSkill: mkAction(),
    addCandidateExperience: mkAction(),
    removeCandidateExperience: mkAction(),
    addCandidateCertificate: mkAction(),
    removeCandidateCertificate: mkAction(),
    addCandidateEducation: mkAction(),
    removeCandidateEducation: mkAction(),
    addCandidateLanguage: mkAction(),
    removeCandidateLanguage: mkAction(),
  };
});

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const baseCandidate = {
  name: "Ahmed Al-Sabah",
  nameAr: "أحمد الصباح",
  email: "ahmed@example.com",
  phone: "+965 5555 1234",
  objective: "Looking for a sales role",
  intro: "Experienced sales associate with 5 years...",
  civilId: "284061234567",
  profileUrl: "https://example.com/ahmed",
  birthDate: "1994-06-01",
  address: "Salmiya, Kuwait",
  countryId: 1,
  universityId: 5,
  bankId: 3,
  bankAccountName: "Ahmed Al-Sabah",
  iban: "KW81ABCD123456789",
  personalPhoto: null,
  resume: "https://cdn.example.com/resume.pdf",
  video: null,
  civilPhotoFront: "https://cdn.example.com/civil-front.jpg",
  civilPhotoBack: null,
};

const countries = [
  { id: 1, label: "Kuwait" },
  { id: 2, label: "Saudi Arabia" },
  { id: 3, label: "UAE" },
];

const universities = [
  { id: 5, label: "Kuwait University" },
  { id: 6, label: "GUST" },
];

const banks = [
  { id: 3, label: "NBK" },
  { id: 4, label: "KFH" },
];

const skills = [
  { id: 1, title: "Sales" },
  { id: 2, title: "Customer Service" },
];

const experiences = [
  { id: 1, title: "Sales Associate", subtitle: "Alshaya Group" },
  { id: 2, title: "Cashier", subtitle: "Lulus" },
];

const certificates = [
  { id: "cert-1", title: "AWS Cloud Practitioner", subtitle: "Amazon" },
];

const languages = [
  { id: 1, title: "English", subtitle: "advanced" },
  { id: 2, title: "Arabic", subtitle: "native" },
];

const educationEntries = [
  {
    id: "edu-1",
    universityId: 5,
    degreeUuid: "deg-1",
    majorUuid: "maj-1",
    graduationYear: 2016,
    isCurrentlyStudying: false,
    universityLabel: "Kuwait University",
    degreeLabel: "Bachelor",
    majorLabel: "Computer Science",
  },
];

const degrees = [
  { id: "deg-1", label: "Bachelor" },
  { id: "deg-2", label: "Master" },
];

const majors = [
  { id: "maj-1", label: "Computer Science" },
  { id: "maj-2", label: "Business Administration" },
];

const defaultProps = {
  candidate: baseCandidate,
  countries,
  universities,
  banks,
  skills,
  experiences,
  certificates,
  languages,
  educationEntries,
  degrees,
  majors,
};

describe("CandidateEditForm", () => {
  it("renders personal info fields with candidate data", () => {
    render(<CandidateEditForm {...defaultProps} />);

    const names = screen.getAllByDisplayValue("Ahmed Al-Sabah");
    expect(names.length).toBe(2);
    expect(screen.getByDisplayValue("أحمد الصباح")).toBeInTheDocument();
    expect(screen.getByDisplayValue("ahmed@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("+965 5555 1234")).toBeInTheDocument();
  });

  it("renders select fields with country, university, and bank options", () => {
    render(<CandidateEditForm {...defaultProps} />);

    // GUST appears in university select AND education select
    expect(screen.getAllByText("GUST").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Saudi Arabia")).toBeInTheDocument();
    expect(screen.getByText("UAE")).toBeInTheDocument();
    expect(screen.getByText("NBK")).toBeInTheDocument();
    expect(screen.getByText("KFH")).toBeInTheDocument();
  });

  it("renders skills list with remove buttons", () => {
    render(<CandidateEditForm {...defaultProps} />);

    expect(screen.getByText("Sales")).toBeInTheDocument();
    expect(screen.getByText("Customer Service")).toBeInTheDocument();
    const removeButtons = screen.getAllByText("Remove");
    expect(removeButtons.length).toBeGreaterThanOrEqual(2);
  });

  it("renders experiences list", () => {
    render(<CandidateEditForm {...defaultProps} />);

    expect(screen.getByText(/Sales Associate/)).toBeInTheDocument();
    expect(screen.getByText(/Alshaya Group/)).toBeInTheDocument();
  });

  it("renders certificates list", () => {
    render(<CandidateEditForm {...defaultProps} />);

    // Certificate text: "AWS Cloud Practitioner — Amazon"
    expect(screen.getByText(/AWS Cloud Practitioner/)).toBeInTheDocument();
  });

  it("renders languages with proficiency badges", () => {
    render(<CandidateEditForm {...defaultProps} />);

    // English appears in the language select AND language list
    expect(screen.getAllByText("English").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("advanced")).toBeInTheDocument();
    // Arabic appears in language select AND language list
    expect(screen.getAllByText("Arabic").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("native")).toBeInTheDocument();
  });

  it("renders education entries", () => {
    render(<CandidateEditForm {...defaultProps} />);

    // Kuwait University appears in university select AND education list
    expect(screen.getAllByText(/Kuwait University/).length).toBeGreaterThanOrEqual(1);
    // Bachelor appears in degree select AND education list item text
    expect(screen.getAllByText(/Bachelor/).length).toBeGreaterThanOrEqual(1);
    // Computer Science appears in majors select AND education list
    expect(screen.getAllByText(/Computer Science/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/2016/)).toBeInTheDocument();
  });

  it("renders submit buttons for each form section", () => {
    render(<CandidateEditForm {...defaultProps} />);

    // "Add skill" appears as both a <span> label and <button> text
    expect(screen.getAllByText("Add skill").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Save profile")).toBeInTheDocument();
    expect(screen.getByText("Upload document")).toBeInTheDocument();
    expect(screen.getByText("Add experience")).toBeInTheDocument();
    expect(screen.getByText("Add certificate")).toBeInTheDocument();
    expect(screen.getByText("Add language")).toBeInTheDocument();
    expect(screen.getByText("Add education")).toBeInTheDocument();
  });

  it("renders document upload fields with current file links", () => {
    render(<CandidateEditForm {...defaultProps} />);

    expect(screen.getByText("resume.pdf")).toBeInTheDocument();
    const noFileMessages = screen.getAllByText("No file uploaded yet.");
    expect(noFileMessages.length).toBeGreaterThanOrEqual(2);
  });
});

// ---------------------------------------------------------------------------
// Empty states
// ---------------------------------------------------------------------------

describe("CandidateEditForm empty states", () => {
  it("shows empty state for no skills", () => {
    render(<CandidateEditForm {...defaultProps} skills={[]} />);
    expect(screen.getByText("No skills added yet.")).toBeInTheDocument();
  });

  it("shows empty state for no experiences", () => {
    render(<CandidateEditForm {...defaultProps} experiences={[]} />);
    expect(
      screen.getByText("No work experience added yet."),
    ).toBeInTheDocument();
  });

  it("shows empty state for no certificates", () => {
    render(<CandidateEditForm {...defaultProps} certificates={[]} />);
    expect(
      screen.getByText("No certificates added yet."),
    ).toBeInTheDocument();
  });

  it("shows empty state for no languages", () => {
    render(<CandidateEditForm {...defaultProps} languages={[]} />);
    expect(screen.getByText("No languages added yet.")).toBeInTheDocument();
  });

  it("shows empty state for no education entries", () => {
    render(<CandidateEditForm {...defaultProps} educationEntries={[]} />);
    expect(
      screen.getByText("No education entries added yet."),
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// DocumentUpload fields
// ---------------------------------------------------------------------------

describe("DocumentUpload fields", () => {
  it("renders all document upload sections", () => {
    render(<CandidateEditForm {...defaultProps} />);

    expect(screen.getByText("Profile photo")).toBeInTheDocument();
    expect(screen.getByText("CV / Resume")).toBeInTheDocument();
    expect(screen.getByText("Video")).toBeInTheDocument();
    expect(screen.getByText("Civil ID (front)")).toBeInTheDocument();
    expect(screen.getByText("Civil ID (back)")).toBeInTheDocument();
  });
});
