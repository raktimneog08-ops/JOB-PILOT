"use client";

import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { MatchScore } from "@/types";

interface ScoreComparisonBarProps {
  original: MatchScore;
  tailored: MatchScore;
}

export default function ScoreComparisonBar({
  original,
  tailored,
}: ScoreComparisonBarProps) {
  const diff = tailored.overallScore - original.overallScore;

  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Score Comparison
      </h3>
      <div className="flex items-center justify-center gap-6">
        {/* Original */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-muted-foreground">Original</span>
          <span
            className={`text-3xl font-bold tabular-nums ${
              original.overallScore >= 80
                ? "text-green-600"
                : original.overallScore >= 50
                  ? "text-amber-600"
                  : "text-red-600"
            }`}
          >
            {original.overallScore}
          </span>
        </div>

        {/* Arrow */}
        <div className="flex flex-col items-center gap-1">
          {diff > 0 ? (
            <>
              <ArrowUp className="h-6 w-6 text-green-500" />
              <span className="text-sm font-medium text-green-600">
                +{diff}
              </span>
            </>
          ) : diff < 0 ? (
            <>
              <ArrowDown className="h-6 w-6 text-red-500" />
              <span className="text-sm font-medium text-red-600">
                {diff}
              </span>
            </>
          ) : (
            <>
              <Minus className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                No change
              </span>
            </>
          )}
        </div>

        {/* Tailored */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-muted-foreground">Tailored</span>
          <span
            className={`text-3xl font-bold tabular-nums ${
              tailored.overallScore >= 80
                ? "text-green-600"
                : tailored.overallScore >= 50
                  ? "text-amber-600"
                  : "text-red-600"
            }`}
          >
            {tailored.overallScore}
          </span>
        </div>
      </div>
    </div>
  );
}