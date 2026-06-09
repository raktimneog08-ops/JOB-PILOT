import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { TailoringRun } from "@/types";
import TailoredResumePDF from "./pdf-templates/tailored-resume";
import ComparisonPDF from "./pdf-templates/comparison";

/**
 * Generates a binary PDF buffer for the tailored resume.
 */
export async function generateTailoredPDF(run: TailoringRun): Promise<Buffer> {
  const element = React.createElement(TailoredResumePDF, { run });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return renderToBuffer(element as any);
}

/**
 * Generates a binary PDF buffer for the side-by-side comparison report.
 */
export async function generateComparisonPDF(run: TailoringRun): Promise<Buffer> {
  const element = React.createElement(ComparisonPDF, { run });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return renderToBuffer(element as any);
}
