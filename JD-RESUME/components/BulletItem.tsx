"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { TailoredBullet } from "@/types";

interface BulletItemProps {
  bullet: TailoredBullet;
  showOriginal?: boolean;
  bulletId?: string;
  isConfirmed?: boolean;
  onToggleConfirm?: (id: string) => void;
}

const confidenceConfig = {
  high: { label: "High", variant: "default" as const },
  medium: { label: "Medium", variant: "secondary" as const },
  low: { label: "Low", variant: "outline" as const },
};

export default function BulletItem({
  bullet,
  showOriginal,
  bulletId,
  isConfirmed,
  onToggleConfirm,
}: BulletItemProps) {
  const config = confidenceConfig[bullet.confidence] ?? confidenceConfig.low;
  const hasChanges = bullet.original !== bullet.tailored;
  const text = showOriginal ? bullet.original : bullet.tailored;

  return (
    <div
      className={`group rounded-md p-3 transition-colors ${
        hasChanges && !showOriginal
          ? "bg-amber-50 dark:bg-amber-950/20"
          : "hover:bg-muted/50"
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 shrink-0 select-none text-muted-foreground">
          •
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm leading-relaxed">{text}</p>

          {!showOriginal && bullet.confidence === "low" && bulletId && onToggleConfirm && (
            <div className="mt-2 flex flex-col gap-2 rounded border border-amber-200 bg-amber-50/50 p-2 text-xs text-amber-850 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-300">
              {bullet.riskFlag && (
                <div className="font-medium flex items-start gap-1">
                  <span className="shrink-0">⚠️</span>
                  <span>{bullet.riskFlag}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`confirm-${bulletId}`}
                  checked={isConfirmed || false}
                  onChange={() => onToggleConfirm(bulletId)}
                  className="h-3.5 w-3.5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-650"
                />
                <label htmlFor={`confirm-${bulletId}`} className="cursor-pointer font-semibold select-none text-amber-900 dark:text-amber-200">
                  I confirm this rewrite is accurate.
                </label>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {!showOriginal && hasChanges && (
              <Tooltip>
                <TooltipTrigger className="text-xs text-muted-foreground underline decoration-dotted">
                  Why changed
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[300px]">
                  <p>{bullet.changeReason}</p>
                </TooltipContent>
              </Tooltip>
            )}

            {!showOriginal && bullet.keywordsAddressed.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {bullet.keywordsAddressed.map((kw) => (
                  <Badge key={kw} variant="outline" className="text-[10px]">
                    {kw}
                  </Badge>
                ))}
              </div>
            )}

            {!showOriginal && (
              <Badge
                variant={config.variant}
                className="text-[10px] capitalize"
              >
                {config.label} confidence
              </Badge>
            )}

            {!showOriginal && bullet.riskFlag && (
              <Tooltip>
                <TooltipTrigger className="text-xs text-amber-600 underline decoration-dotted dark:text-amber-400">
                  ⚠ Review
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[300px]">
                  <p>{bullet.riskFlag}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}