import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { DocumentManager } from "./DocumentManager";

afterEach(() => {
  cleanup();
});

const mockItems = [
  {
    type: "photo" as const,
    label: "Personal Photo",
    filePath: "/uploads/candidates/1/photo_abc.jpg",
    fileUrl: "/uploads/candidates/1/photo_abc.jpg",
    field: "candidate_personal_photo",
  },
  {
    type: "cv" as const,
    label: "CV / Resume",
    filePath: null,
    fileUrl: null,
    field: "candidate_resume",
  },
  {
    type: "video" as const,
    label: "Video Profile",
    filePath: null,
    fileUrl: null,
    field: "candidate_video",
  },
  {
    type: "civilFront" as const,
    label: "Civil ID (Front)",
    filePath: "/uploads/candidates/1/civilFront_def.jpg",
    fileUrl: "/uploads/candidates/1/civilFront_def.jpg",
    field: "candidate_civil_photo_front",
  },
  {
    type: "civilBack" as const,
    label: "Civil ID (Back)",
    filePath: null,
    fileUrl: null,
    field: "candidate_civil_photo_back",
  },
];

describe("DocumentManager", () => {
  it("renders all document types", () => {
    render(<DocumentManager items={mockItems} />);
    expect(screen.getByText("Personal Photo")).toBeInTheDocument();
    expect(screen.getByText("CV / Resume")).toBeInTheDocument();
    expect(screen.getByText("Video Profile")).toBeInTheDocument();
    expect(screen.getByText("Civil ID (Front)")).toBeInTheDocument();
    expect(screen.getByText("Civil ID (Back)")).toBeInTheDocument();
  });

  it("shows Uploaded badge for documents with filePath", () => {
    render(<DocumentManager items={mockItems} />);
    const badges = screen.getAllByText("Uploaded");
    expect(badges.length).toBeGreaterThanOrEqual(2);
  });

  it("shows description text for document types", () => {
    render(<DocumentManager items={mockItems} />);
    expect(screen.getAllByText(/JPEG, PNG, WebP or GIF/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/PDF, DOC or DOCX/)).toBeInTheDocument();
  });

  it("renders View file links for uploaded documents", () => {
    render(<DocumentManager items={mockItems} />);
    const links = screen.getAllByText("View file");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "/uploads/candidates/1/photo_abc.jpg");
    expect(links[1]).toHaveAttribute("href", "/uploads/candidates/1/civilFront_def.jpg");
  });

  it("renders Delete buttons for uploaded documents", () => {
    render(<DocumentManager items={mockItems} />);
    const deleteButtons = screen.getAllByText("Delete");
    expect(deleteButtons).toHaveLength(2);
  });

  it("renders file input for each missing document", () => {
    render(<DocumentManager items={mockItems} />);
    const fileInputs = document.querySelectorAll('input[type="file"]');
    expect(fileInputs).toHaveLength(3);
  });

  it("renders hidden documentType inputs for delete forms", () => {
    render(<DocumentManager items={mockItems} />);
    const hiddenInputs = document.querySelectorAll(
      'input[type="hidden"][name="documentType"]'
    );
    expect(hiddenInputs).toHaveLength(2);
    expect((hiddenInputs[0] as HTMLInputElement).value).toBe("photo");
    expect((hiddenInputs[1] as HTMLInputElement).value).toBe("civilFront");
  });

  it("accepts empty items list and shows empty state", () => {
    render(<DocumentManager items={[]} />);
    expect(screen.getByText("No document types available")).toBeInTheDocument();
  });

  it("renders upload file inputs with correct name attribute", () => {
    render(<DocumentManager items={mockItems} />);
    const cvInput = document.querySelector('input[name="file_cv"]');
    expect(cvInput).toBeInTheDocument();
    const videoInput = document.querySelector('input[name="file_video"]');
    expect(videoInput).toBeInTheDocument();
  });
});
