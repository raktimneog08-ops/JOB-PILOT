"use client";

import { useState } from "react";
import { FileDown, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { TailoringRun } from "@/types";

interface PDFExportButtonProps {
  tailoringRun: TailoringRun | null;
  isDisabled?: boolean;
  confirmedByUser?: boolean;
}

export default function PDFExportButton({
  tailoringRun,
  isDisabled = false,
  confirmedByUser = false,
}: PDFExportButtonProps) {
  const [isExportingTailored, setIsExportingTailored] = useState(false);
  const [isExportingComparison, setIsExportingComparison] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async (type: "tailored" | "comparison") => {
    if (!tailoringRun) return;

    setExportError(null);
    if (type === "tailored") {
      setIsExportingTailored(true);
    } else {
      setIsExportingComparison(true);
    }

    try {
      const blob = await api.exportPDF(tailoringRun, type, confirmedByUser);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const candidateName = tailoringRun.originalResume.contact.name || "candidate";
      const sanitizedName = candidateName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      a.download = `resume-shapeshifter-${sanitizedName}-${type}.pdf`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed:", err);
      setExportError(
        err instanceof Error ? err.message : `Failed to generate ${type} PDF. Please try again.`
      );
    } finally {
      if (type === "tailored") {
        setIsExportingTailored(false);
      } else {
        setIsExportingComparison(false);
      }
    }
  };

  const isDisabledButton = !tailoringRun || isDisabled;

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="flex flex-wrap justify-center gap-4 w-full sm:w-auto">
        <Button
          disabled={isDisabledButton || isExportingTailored}
          onClick={() => handleExport("tailored")}
          className="w-full sm:w-auto font-medium"
          variant="default"
          size="lg"
        >
          {isExportingTailored ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Resume...
            </>
          ) : (
            <>
              <FileDown className="mr-2 h-4 w-4" />
              Download Tailored Resume
            </>
          )}
        </Button>

        <Button
          disabled={isDisabledButton || isExportingComparison}
          onClick={() => handleExport("comparison")}
          className="w-full sm:w-auto font-medium"
          variant="outline"
          size="lg"
        >
          {isExportingComparison ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Comparison...
            </>
          ) : (
            <>
              <FileDown className="mr-2 h-4 w-4" />
              Download Comparison Report
            </>
          )}
        </Button>
      </div>

      {exportError && (
        <div className="flex items-center gap-2 text-sm font-medium text-destructive mt-2 bg-destructive/10 px-4 py-2 rounded-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{exportError}</span>
        </div>
      )}
    </div>
  );
}