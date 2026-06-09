"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalyzeButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function AnalyzeButton({
  onClick,
  isLoading,
  disabled,
}: AnalyzeButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="w-full sm:w-auto"
      size="lg"
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading ? "Analyzing..." : "Analyze Match"}
    </Button>
  );
}