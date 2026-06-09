"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BulletItem from "@/components/BulletItem";
import type { TailoredResume, ResumeProfile, TailoredBullet } from "@/types";

interface SideBySideColumnsProps {
  original: ResumeProfile;
  tailored: TailoredResume;
  confirmedLowConfidenceIds?: string[];
  onToggleConfirmLowConfidence?: (id: string) => void;
}

function ExperienceSection({
  company,
  title,
  bullets,
  isTailored,
  expIdx,
  confirmedLowConfidenceIds,
  onToggleConfirmLowConfidence,
}: {
  company: string;
  title: string;
  bullets: TailoredBullet[];
  isTailored: boolean;
  expIdx?: number;
  confirmedLowConfidenceIds?: string[];
  onToggleConfirmLowConfidence?: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-muted-foreground">{company}</p>
      </div>
      <div className="space-y-1">
        {bullets.map((bullet, bulletIdx) => {
          const bulletId = isTailored && expIdx !== undefined ? `exp-${expIdx}-bullet-${bulletIdx}` : undefined;
          const isConfirmed = bulletId && confirmedLowConfidenceIds ? confirmedLowConfidenceIds.includes(bulletId) : false;
          return (
            <BulletItem
              key={bulletIdx}
              bullet={bullet}
              showOriginal={!isTailored}
              bulletId={bulletId}
              isConfirmed={isConfirmed}
              onToggleConfirm={onToggleConfirmLowConfidence}
            />
          );
        })}
      </div>
    </div>
  );
}

function ProjectSection({
  name,
  description,
  bullets,
  isTailored,
  projIdx,
  confirmedLowConfidenceIds,
  onToggleConfirmLowConfidence,
}: {
  name: string;
  description: string;
  bullets: TailoredBullet[];
  isTailored: boolean;
  projIdx?: number;
  confirmedLowConfidenceIds?: string[];
  onToggleConfirmLowConfidence?: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="font-semibold text-sm">{name}</h4>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="space-y-1">
        {bullets.map((bullet, bulletIdx) => {
          const bulletId = isTailored && projIdx !== undefined ? `proj-${projIdx}-bullet-${bulletIdx}` : undefined;
          const isConfirmed = bulletId && confirmedLowConfidenceIds ? confirmedLowConfidenceIds.includes(bulletId) : false;
          return (
            <BulletItem
              key={bulletIdx}
              bullet={bullet}
              showOriginal={!isTailored}
              bulletId={bulletId}
              isConfirmed={isConfirmed}
              onToggleConfirm={onToggleConfirmLowConfidence}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function SideBySideColumns({
  original,
  tailored,
  confirmedLowConfidenceIds = [],
  onToggleConfirmLowConfidence,
}: SideBySideColumnsProps) {
  const hasLowConfidence = 
    tailored.tailoredExperience.some(exp => exp.bullets.some(b => b.confidence === "low")) ||
    (tailored.tailoredProjects && tailored.tailoredProjects.some(proj => proj.bullets.some(b => b.confidence === "low")));

  return (
    <div className="space-y-6">
      {/* Low Confidence warning banner */}
      {hasLowConfidence && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 text-sm text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-300">
          <div className="flex items-start gap-2">
            <span className="shrink-0 text-base">⚠️</span>
            <div>
              <p className="font-semibold">Some rewrites have low confidence.</p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Please review and confirm accuracy on individual bullets below before exporting.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Original Column */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Original Resume</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              {original.summary && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Summary
                  </h3>
                  <p className="text-sm leading-relaxed">{original.summary}</p>
                </div>
              )}

              {/* Skills */}
              {original.skills.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {original.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-block rounded-md bg-muted px-2 py-0.5 text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Experience
                </h3>
                <div className="space-y-6">
                  {original.experience.map((exp, i) => {
                    const tail = tailored.tailoredExperience[i];
                    return (
                      <ExperienceSection
                        key={i}
                        company={exp.company}
                        title={exp.title}
                        bullets={exp.bullets.map((b, bulletIdx) => ({
                          original: b,
                          tailored: tail?.bullets[bulletIdx]?.tailored ?? b,
                          changeReason: "",
                          keywordsAddressed: [],
                          confidence: "high" as const,
                        }))}
                        isTailored={false}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Projects */}
              {original.projects && original.projects.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Projects
                  </h3>
                  <div className="space-y-6">
                    {original.projects.map((proj, i) => {
                      const tail = tailored.tailoredProjects?.[i];
                      return (
                        <ProjectSection
                          key={i}
                          name={proj.name}
                          description={proj.description}
                          bullets={proj.bullets.map((b, bulletIdx) => ({
                            original: b,
                            tailored: tail?.bullets[bulletIdx]?.tailored ?? b,
                            changeReason: "",
                            keywordsAddressed: [],
                            confidence: "high" as const,
                          }))}
                          isTailored={false}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tailored Column */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Tailored Resume</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              {tailored.tailoredSummary && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Summary
                  </h3>
                  <p className="text-sm leading-relaxed">
                    {tailored.tailoredSummary}
                  </p>
                </div>
              )}

              {/* Skills */}
              {tailored.tailoredSkills.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {tailored.tailoredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-block rounded-md bg-muted px-2 py-0.5 text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Experience
                </h3>
                <div className="space-y-6">
                  {tailored.tailoredExperience.map((exp, i) => (
                    <ExperienceSection
                      key={i}
                      company={exp.company}
                      title={exp.title}
                      bullets={exp.bullets}
                      isTailored={true}
                      expIdx={i}
                      confirmedLowConfidenceIds={confirmedLowConfidenceIds}
                      onToggleConfirmLowConfidence={onToggleConfirmLowConfidence}
                    />
                  ))}
                </div>
              </div>

              {/* Projects */}
              {tailored.tailoredProjects && tailored.tailoredProjects.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Projects
                  </h3>
                  <div className="space-y-6">
                    {tailored.tailoredProjects.map((proj, i) => (
                      <ProjectSection
                        key={i}
                        name={proj.name}
                        description={proj.description}
                        bullets={proj.bullets}
                        isTailored={true}
                        projIdx={i}
                        confirmedLowConfidenceIds={confirmedLowConfidenceIds}
                        onToggleConfirmLowConfidence={onToggleConfirmLowConfidence}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}