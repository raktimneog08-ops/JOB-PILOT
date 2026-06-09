"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import GapCard from "@/components/GapCard";
import type { ResumeGap } from "@/types";

interface GapAnalysisProps {
  gaps: ResumeGap[];
}

export default function GapAnalysis({ gaps }: GapAnalysisProps) {
  if (gaps.length === 0) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-950/30">
        <p className="text-sm font-medium text-green-800 dark:text-green-300">
          No significant gaps detected! Your resume already aligns well with
          this job description.
        </p>
      </div>
    );
  }

  const sortedGaps = [...gaps].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.importance] - order[b.importance];
  });

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {gaps.length} gap{gaps.length !== 1 && "s"} found — sorted by priority
      </p>
      <div className="space-y-2">
        {sortedGaps.map((gap, i) => (
          <Accordion key={`${gap.name}-${i}`}>
            <AccordionItem value={`gap-${i}`} className="rounded-lg border px-4">
              <AccordionTrigger>
                <span className="text-sm font-medium">{gap.name}</span>
              </AccordionTrigger>
              <AccordionContent>
                <GapCard gap={gap} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>
    </div>
  );
}