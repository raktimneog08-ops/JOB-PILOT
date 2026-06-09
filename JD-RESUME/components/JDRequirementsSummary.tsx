"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { JobDescriptionProfile } from "@/types";

interface JDRequirementsSummaryProps {
  jd: JobDescriptionProfile;
}

export default function JDRequirementsSummary({
  jd,
}: JDRequirementsSummaryProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">JD Requirements Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Job Title & Company */}
        <div>
          <h3 className="text-base font-semibold">{jd.jobTitle}</h3>
          {jd.company && (
            <p className="text-sm text-muted-foreground">{jd.company}</p>
          )}
          <Badge variant="secondary" className="mt-1">
            {jd.seniorityLevel}
          </Badge>
        </div>

        {/* Required Skills */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Required Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {jd.requiredSkills.map((skill) => (
              <Badge key={skill} variant="default">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Preferred Skills */}
        {jd.preferredSkills.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Preferred Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {jd.preferredSkills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Responsibilities */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Responsibilities</p>
          <ul className="list-inside list-disc space-y-1">
            {jd.responsibilities.map((resp, i) => (
              <li key={i} className="text-sm text-muted-foreground">
                {resp}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}