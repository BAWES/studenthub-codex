"use client";

import type { ExperienceItem } from "@/app/student/actions";

const CORAL = "#eb6651";

interface ExperienceSectionProps {
  experience: ExperienceItem[];
}

export function ExperienceSection({ experience }: ExperienceSectionProps) {
  return (
    <section>
      {/* Section title with coral left border */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-1 h-6 rounded-full flex-shrink-0"
          style={{ backgroundColor: CORAL }}
        />
        <h2 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
          Experience
        </h2>
      </div>

      {experience.length > 0 ? (
        <div className="space-y-4">
          {experience.map((exp, idx) => (
            <div
              key={exp.id}
              className="rounded-lg border p-4 relative"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
              }}
            >
              {/* Timeline dot */}
              <div
                className="hidden sm:block absolute -left-3 top-6 w-2.5 h-2.5 rounded-full ring-2"
                style={{
                  backgroundColor: CORAL,
                  ["--tw-ring-color" as string]: "var(--surface)",
                }}
              />

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                <div>
                  <h3
                    className="font-semibold"
                    style={{ color: "var(--ink)" }}
                  >
                    {exp.title}
                  </h3>
                  {exp.employer && (
                    <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
                      {exp.employer}
                    </p>
                  )}
                </div>
                {(exp.startYear || exp.endYear) && (
                  <p
                    className="text-sm whitespace-nowrap"
                    style={{ color: "var(--muted)" }}
                  >
                    {exp.startYear || "?"}
                    {exp.endYear ? ` — ${exp.endYear}` : ""}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          No experience listed yet.
        </p>
      )}
    </section>
  );
}
