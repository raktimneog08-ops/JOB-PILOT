"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { MatchScore } from "@/types";

interface ScoreCardProps {
  score: MatchScore;
  title: string;
}

const glossaryDescriptions: Record<string, string> = {
  "Skill Coverage": "Measures the overlap between your resume skills and the required/preferred skills in the job description.",
  "Responsibility Alignment": "Measures how closely your past responsibilities match the tasks required for the target role.",
  "Keyword Match": "Measures the presence of key terms and domain-specific vocabulary from the job description.",
  "Seniority Match": "Evaluates the alignment between your experience level and the target seniority requirements.",
};

function ScoreGauge({ value, label }: { value: number; label: string }) {
  const colorClass =
    value >= 80
      ? "bg-green-500"
      : value >= 50
        ? "bg-amber-500"
        : "bg-red-500";

  const tooltipText = glossaryDescriptions[label] || "Measures how well your resume aligns with this dimension of the job description.";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <Tooltip>
          <TooltipTrigger className="cursor-help underline decoration-dotted">
            {label}
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="max-w-[240px] text-xs">
              {tooltipText}
            </p>
          </TooltipContent>
        </Tooltip>
        <span className="font-mono font-semibold">{value}/100</span>
      </div>
      <Progress value={value} className={`h-2 ${colorClass}`} />
    </div>
  );
}

export default function ScoreCard({ score, title }: ScoreCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="flex flex-col items-center gap-1 py-2">
          <span
            className={`text-4xl font-bold tabular-nums ${
              score.overallScore >= 80
                ? "text-green-600"
                : score.overallScore >= 50
                  ? "text-amber-600"
                  : "text-red-600"
            }`}
          >
            {score.overallScore}
          </span>
          <span className="text-xs text-muted-foreground">out of 100</span>
        </div>

        {/* Sub-scores */}
        <div className="space-y-3">
          <ScoreGauge
            value={score.skillCoverageScore}
            label="Skill Coverage"
          />
          <ScoreGauge
            value={score.responsibilityAlignmentScore}
            label="Responsibility Alignment"
          />
          <ScoreGauge value={score.keywordScore} label="Keyword Match" />
          <ScoreGauge value={score.seniorityScore} label="Seniority Match" />
        </div>

        {/* Critical missing requirements */}
        {score.criticalMissingRequirements.length > 0 && (
          <div className="space-y-2 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              Missing Requirements
            </p>
            <ul className="list-inside list-disc space-y-1">
              {score.criticalMissingRequirements.map((req, i) => (
                <li
                  key={i}
                  className="text-xs text-amber-700 dark:text-amber-400"
                >
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Explanation */}
        <p className="text-sm leading-relaxed text-muted-foreground">
          {score.explanation}
        </p>
      </CardContent>
    </Card>
  );
}