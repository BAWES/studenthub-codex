"use client";

import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StudentProfile } from "@/app/student/actions";

interface HeroSectionProps {
  profile: StudentProfile;
}

export function HeroSection({ profile }: HeroSectionProps) {
  const initial = profile.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <section className="flex flex-col sm:flex-row items-start gap-6">
      {/* Avatar */}
      <div className="w-24 h-24 rounded-full flex-shrink-0 flex items-center justify-center text-3xl font-bold overflow-hidden ring-2 ring-[#eb6651] transition-shadow duration-200 bg-card text-coral border border-border">
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
        <h1 className="text-3xl font-bold text-foreground">
          {profile.name || "Student Profile"}
        </h1>

        {profile.intro && (
          <p className="text-lg text-muted-foreground">
            {profile.intro}
          </p>
        )}

        {profile.objective && (
          <p className="text-sm line-clamp-2 text-muted-foreground">
            {profile.objective}
          </p>
        )}

        {/* Contact info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
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
        <Button
          asChild
          className="transition-all duration-150 hover:scale-[1.02] bg-coral hover:bg-coral-hover">
          <a href={`mailto:${profile.email}`}>
            Contact
          </a>
        </Button>
      </div>
    </section>
  );
}
