"use client";

import { Mail, Phone, MapPin } from "lucide-react";
import type { StudentProfile } from "@/app/student/actions";

const CORAL = "#eb6651";
const CORAL_HOVER = "#d45441";

interface HeroSectionProps {
  profile: StudentProfile;
}

export function HeroSection({ profile }: HeroSectionProps) {
  const initial = profile.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <section className="flex flex-col sm:flex-row items-start gap-6">
      {/* Avatar */}
      <div
        className="w-24 h-24 rounded-full flex-shrink-0 flex items-center justify-center text-3xl font-bold overflow-hidden ring-2 transition-shadow duration-200"
        style={{
          backgroundColor: "var(--surface)",
          color: CORAL,
          borderColor: "var(--border)",
          ["--tw-ring-color" as string]: CORAL,
        }}
      >
        {profile.photo ? (
          <img
            src={profile.photo}
            alt={profile.name || "Student"}
            className="w-full h-full object-cover"
          />
        ) : (
          initial
        )}
      </div>

      {/* Info */}
      <div className="flex-1 space-y-3 min-w-0">
        <h1 className="text-3xl font-bold" style={{ color: "var(--ink)" }}>
          {profile.name || "Student Profile"}
        </h1>

        {profile.intro && (
          <p className="text-lg" style={{ color: "var(--muted)" }}>
            {profile.intro}
          </p>
        )}

        {profile.objective && (
          <p
            className="text-sm line-clamp-2"
            style={{ color: "var(--muted)" }}
          >
            {profile.objective}
          </p>
        )}

        {/* Contact info */}
        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm"
          style={{ color: "var(--muted)" }}
        >
          <span className="inline-flex items-center gap-1.5">
            <Mail size={14} />
            {profile.email}
          </span>
          {profile.phone && (
            <span className="inline-flex items-center gap-1.5">
              <Phone size={14} />
              {profile.phone}
            </span>
          )}
          {profile.address && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} />
              {profile.address}
            </span>
          )}
        </div>

        {/* CTA */}
        <a
          href={`mailto:${profile.email}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-150 hover:scale-[1.02]"
          style={{
            backgroundColor: CORAL,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = CORAL_HOVER;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = CORAL;
          }}
        >
          Contact
        </a>
      </div>
    </section>
  );
}
