"use client";

import { Badge } from "@/components/ui/badge";
import type { SkillItem } from "@/app/student/actions";

interface SkillsSectionProps {
  skills: SkillItem[];
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  return (
    <section>
      {/* Section title with coral left border */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-6 rounded-full flex-shrink-0 bg-[#eb6651]" />
        <h2 className="text-xl font-semibold text-foreground">
          Skills
        </h2>
      </div>

      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge
              key={skill.id}
              variant="outline"
              className="text-[11px] font-black uppercase tracking-[0.03em] bg-[#fef1ef] text-[#eb6651] border-[#eb6651]"
            >
              {skill.name}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No skills listed yet.
        </p>
      )}
    </section>
  );
}
