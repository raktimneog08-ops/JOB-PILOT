import { NextRequest, NextResponse } from "next/server";
import { TailoringRunSchema } from "@/lib/schemas";
import { generateTailoredPDF, generateComparisonPDF } from "@/lib/pdf";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tailoringRun, type, confirmedByUser } = body;

    if (confirmedByUser !== true) {
      console.warn(`[AUDIT WARNING] PDF generated without explicit user confirmation of truthfulness! (PDF export initiated without user confirmation for tailoring run ${tailoringRun?.id || 'unknown'})`);
    }

    if (!type || (type !== "tailored" && type !== "comparison")) {
      return NextResponse.json(
        { error: "Invalid export type. Must be 'tailored' or 'comparison'." },
        { status: 400 }
      );
    }

    if (!tailoringRun) {
      return NextResponse.json(
        { error: "Missing tailoringRun data." },
        { status: 400 }
      );
    }

    // Validate the tailoringRun structure using Zod
    const parsed = TailoringRunSchema.safeParse(tailoringRun);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid tailoring run data structure.",
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    let pdfBuffer: Buffer;
    if (type === "tailored") {
      pdfBuffer = await generateTailoredPDF(parsed.data);
    } else {
      pdfBuffer = await generateComparisonPDF(parsed.data);
    }

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resume-shapeshifter-${type}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("PDF generation route error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate PDF.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
