import { describe, it, expect } from "vitest";
import {
  profileEditDataOutputSchema,
  profileActionResultOutputSchema,
  optionsItemOutputSchema,
} from "./schemas";

describe("candidate edit page — data contract", () => {
  it("profileEditDataOutputSchema validates valid profile data", () => {
    const r = profileEditDataOutputSchema.safeParse({
      candidateName: "Ahmed",
      candidateNameAr: "أحمد",
      candidateEmail: "ahmed@example.com",
      candidatePhone: "+965****5678",
      candidateObjective: "Looking for opportunities",
      candidateIntro: "Experienced developer",
      candidateCivilId: "1234567890",
      profileUrl: "https://example.com/profile",
      candidateBirthDate: new Date("1990-01-01"),
      candidateAddressLine1: "Kuwait City",
      candidateGender: 1,
      candidateDrivingLicense: true,
      candidateCivilExpiryDate: new Date("2030-01-01"),
      candidatePreferredTime: "morning",
      countryId: 1,
      universityId: 2,
      bankId: 3,
      bankAccountName: "Ahmed",
      candidateIban: "KW123456",
      candidatePersonalPhoto: null,
      candidateResume: null,
      candidateVideo: null,
      civilPhotoFront: null,
      civilPhotoBack: null,
    });
    expect(r.success).toBe(true);
  });

  it("profileEditDataOutputSchema rejects missing candidateName", () => {
    const r = profileEditDataOutputSchema.safeParse({ candidateEmail: "test@test.com" });
    expect(r.success).toBe(false);
  });

  it("profileActionResultOutputSchema validates success", () => {
    const r = profileActionResultOutputSchema.safeParse({ success: true });
    expect(r.success).toBe(true);
  });

  it("profileActionResultOutputSchema validates failure", () => {
    const r = profileActionResultOutputSchema.safeParse({ success: false, error: "Validation failed" });
    expect(r.success).toBe(true);
  });

  it("optionsItemOutputSchema validates a valid option item with number id", () => {
    const r = optionsItemOutputSchema.safeParse({ id: 1, label: "Option 1" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.label).toBe("Option 1");
    }
  });

  it("optionsItemOutputSchema validates a valid option item with string id", () => {
    const r = optionsItemOutputSchema.safeParse({ id: "uuid-1", label: "Option 1" });
    expect(r.success).toBe(true);
  });

  it("optionsItemOutputSchema rejects missing id", () => {
    const r = optionsItemOutputSchema.safeParse({ label: "Option" });
    expect(r.success).toBe(false);
  });
});
