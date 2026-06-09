"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingState({ type }: { type: "analysis" | "tailoring" }) {
  if (type === "analysis") {
    return (
      <div className="space-y-6">
        {/* Score skeleton */}
        <div className="rounded-lg border p-4">
          <Skeleton className="mb-4 h-5 w-32" />
          <div className="flex flex-col items-center gap-2 py-4">
            <Skeleton className="h-12 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* JD Summary skeleton */}
        <div className="rounded-lg border p-4">
          <Skeleton className="mb-4 h-5 w-40" />
          <Skeleton className="mb-2 h-6 w-48" />
          <Skeleton className="mb-4 h-4 w-32" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-5 w-20 rounded-full" />
            ))}
          </div>
        </div>

        {/* Gaps skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Tailoring skeleton
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {[1, 2].map((col) => (
        <div key={col} className="space-y-4">
          <Skeleton className="h-10 w-full rounded-lg" />
          <div className="rounded-lg border p-4">
            <Skeleton className="mb-4 h-5 w-32" />
            <Skeleton className="mb-3 h-4 w-full" />
            <Skeleton className="mb-6 h-4 w-3/4" />
            <div className="space-y-4">
              {[1, 2, 3].map((row) => (
                <div key={row} className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}