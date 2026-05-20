"use client";

import { useActionState } from "react";
import {
  updateCandidateProfile,
  uploadDocument,
  addCandidateSkill,
  removeCandidateSkill,
  addCandidateExperience,
  removeCandidateExperience,
} from "./actions";

type Option = { id: number; label: string };

type Skill = { id: number; title: string };
type Experience = { id: number; title: string; subtitle: string };

type Props = {
  candidate: {
    name: string;
    nameAr: string;
    email: string;
    phone: string;
    objective: string;
    intro: string;
    civilId: string;
    profileUrl: string;
    birthDate: string;
    address: string;
    countryId: number | null;
    universityId: number | null;
    bankId: number | null;
    bankAccountName: string;
    iban: string;
    personalPhoto: string | null;
    resume: string | null;
    video: string | null;
    civilPhotoFront: string | null;
    civilPhotoBack: string | null;
  };
  countries: Option[];
  universities: Option[];
  banks: Option[];
  skills: Skill[];
  experiences: Experience[];
};

export function CandidateEditForm({ candidate, countries, universities }: Props) {
  const [profileState, profileAction, profilePending] = useActionState(updateCandidateProfile, {
    error: "",
  });
  const [uploadState, uploadAction, uploadPending] = useActionState(uploadDocument, {
    error: "",
  });

  return (
    <div className="candidateEditLayout">
      <form action={profileAction} className="candidateEditForm">
        <h2>Personal info</h2>
        {profileState.error ? <p className="formError">{profileState.error}</p> : null}

        <label>
          <span>Name (English)</span>
          <input name="name" defaultValue={candidate.name} required />
        </label>

        <label>
          <span>Name (Arabic)</span>
          <input name="nameAr" defaultValue={candidate.nameAr} />
        </label>

        <label>
          <span>Email</span>
          <input name="email" type="email" defaultValue={candidate.email} />
        </label>

        <label>
          <span>Phone</span>
          <input name="phone" type="tel" defaultValue={candidate.phone} />
        </label>

        <label>
          <span>Birth date</span>
          <input name="birthDate" type="date" defaultValue={candidate.birthDate} />
        </label>

        <h2>Location & education</h2>

        <label>
          <span>Country / Nationality</span>
          <select name="countryId" defaultValue={candidate.countryId ?? ""}>
            <option value="">— Not set —</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>University</span>
          <select name="universityId" defaultValue={candidate.universityId ?? ""}>
            <option value="">— Not set —</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Address</span>
          <textarea name="address" rows={2} defaultValue={candidate.address} />
        </label>

        <h2>Profile details</h2>

        <label>
          <span>Civil ID</span>
          <input name="civilId" defaultValue={candidate.civilId} />
        </label>

        <label>
          <span>Objective / Headline</span>
          <input name="objective" defaultValue={candidate.objective} />
        </label>

        <label>
          <span>Profile URL</span>
          <input name="profileUrl" type="url" defaultValue={candidate.profileUrl} />
        </label>

        <label>
          <span>About / Intro</span>
          <textarea name="intro" rows={5} defaultValue={candidate.intro} />
        </label>

        <div className="formActions">
          <button type="submit" disabled={profilePending}>
            {profilePending ? "Saving..." : "Save profile"}
          </button>
        </div>
      </form>

      <form action={uploadAction} className="candidateEditForm">
        <h2>Documents</h2>
        {uploadState.error ? <p className="formError">{uploadState.error}</p> : null}

        <DocumentUpload label="Profile photo" type="photo" current={candidate.personalPhoto} />

        <DocumentUpload label="CV / Resume" type="cv" current={candidate.resume} />

        <DocumentUpload label="Video" type="video" current={candidate.video} />

        <DocumentUpload
          label="Civil ID (front)"
          type="civilFront"
          current={candidate.civilPhotoFront}
        />

        <DocumentUpload
          label="Civil ID (back)"
          type="civilBack"
          current={candidate.civilPhotoBack}
        />

        <div className="formActions">
          <button type="submit" disabled={uploadPending}>
            {uploadPending ? "Uploading..." : "Upload document"}
          </button>
        </div>
      </form>
    </div>
  );
}

function DocumentUpload({
  label,
  type,
  current,
}: {
  label: string;
  type: string;
  current: string | null;
}) {
  return (
    <fieldset className="documentUploadField">
      <legend>{label}</legend>
      <input type="hidden" name="type" value={type} />
      <input type="file" name="file" accept={acceptFor(type)} />
      {current ? (
        <small>
          Current:{" "}
          <a href={current} target="_blank" rel="noreferrer">
            {current.split("/").pop()}
          </a>
        </small>
      ) : (
        <small>No file uploaded yet.</small>
      )}
    </fieldset>
  );
}

function acceptFor(type: string): string {
  switch (type) {
    case "photo":
    case "civilFront":
    case "civilBack":
      return "image/*";
    case "cv":
      return ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "video":
      return "video/*";
    default:
      return "*/*";
  }
}
