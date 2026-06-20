"use client";

import type { SkillItem } from "@/app/student/actions";

const CORAL = "#eb6651";
const CORAL_LIGHT = "#fef1ef";

interface SkillsSectionProps {
  skills: SkillItem[];
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  return (
    <section>
      {/* Section title with coral left border */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-1 h-6 rounded-full flex-shrink-0"
          style={{ backgroundColor: CORAL }}
        />
        <h2 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
          Skills
        </h2>
      </div>

      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill.id}
              className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-[0.03em]"
              style={{
                backgroundColor: CORAL_LIGHT,
                color: CORAL,
              }}
            >
              {skill.name}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          No skills listed yet.
        </p>
      )}
    </section>
  );
}
