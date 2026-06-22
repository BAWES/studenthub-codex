"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { ExperienceItem } from "@/app/student/actions";

interface ExperienceSectionProps {
  experience: ExperienceItem[];
}

export function ExperienceSection({ experience }: ExperienceSectionProps) {
  return (
    <section>
      {/* Section title with coral left border */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-6 rounded-full flex-shrink-0 bg-[#eb6651]" />
        <h2 className="text-xl font-semibold text-foreground">
          Experience
        </h2>
      </div>

      {experience.length > 0 ? (
        <div className="space-y-4">
          {experience.map((exp) => (
            <Card key={exp.id}>
              <CardContent className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 p-4">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {exp.title}
                  </h3>
                  {exp.employer && (
                    <p className="text-sm mt-0.5 text-muted-foreground">
                      {exp.employer}
                    </p>
                  )}
                </div>
                {(exp.startYear || exp.endYear) && (
                  <p className="text-sm whitespace-nowrap text-muted-foreground">
                    {exp.startYear || "?"}
                    {exp.endYear ? ` — ${exp.endYear}` : ""}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No experience listed yet.
        </p>
      )}
    </section>
  );
}
