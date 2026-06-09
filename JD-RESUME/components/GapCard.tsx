"use client";

import { Badge } from "@/components/ui/badge";
import type { ResumeGap } from "@/types";

interface GapCardProps {
  gap: ResumeGap;
}

const importanceConfig = {
  high: { label: "High", variant: "destructive" as const },
  medium: { label: "Medium", variant: "secondary" as const },
  low: { label: "Low", variant: "outline" as const },
};

export default function GapCard({ gap }: GapCardProps) {
  const config = importanceConfig[gap.importance] ?? importanceConfig.medium;

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <h4 className="font-medium leading-none">{gap.name}</h4>
          <Badge variant={config.variant}>{config.label} Priority</Badge>
        </div>
      </div>

      <div className="mt-3 space-y-2 text-sm">
        <div>
          <span className="font-medium text-muted-foreground">From JD: </span>
          <span className="text-muted-foreground">{gap.jdEvidence}</span>
        </div>

        {gap.resumeEvidence && (
          <div>
            <span className="font-medium text-muted-foreground">
              In your resume:{ " " }
            </span>
            <span className="text-muted-foreground">
              {gap.resumeEvidence}
            </span>
          </div>
        )}

        <div className="rounded-md bg-muted p-3">
          <span className="font-medium">Suggested action: </span>
          <span>{gap.suggestedAction}</span>
        </div>
      </div>
    </div>
  );
}