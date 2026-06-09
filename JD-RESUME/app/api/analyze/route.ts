import { NextResponse } from "next/server";
import { resumeTailor } from "@/lib/orchestrator";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const resumeText = body.resumeText as string | undefined;
    const jdText = body.jdText as string | undefined;

    if (!resumeText && !jdText) {
      return NextResponse.json({ error: "Both resume text and job description text are required." }, { status: 400 });
    }

    if (!resumeText) {
      return NextResponse.json({ error: "Resume text is required." }, { status: 400 });
    }

    if (!jdText) {
      return NextResponse.json({ error: "Job description text is required." }, { status: 400 });
    }

    // For /api/analyze we run parse -> score -> gaps (no rewriting)
    const { resume, jd, resumeWarnings, jdWarnings } = await resumeTailor.parseInputs(resumeText, jdText);

    const { score: originalScore, warnings: scoreWarnings } = await resumeTailor.calculateInitialScore(resume, jd);

    const { gaps, warnings: gapWarnings } = await resumeTailor.performGapAnalysis(resume, jd);

    return NextResponse.json({ resume, jd, originalScore, gaps, warnings: [...resumeWarnings, ...jdWarnings, ...scoreWarnings, ...gapWarnings] });
  } catch (err) {
    console.error("API error in /api/analyze:", err);
    const message = err instanceof Error ? err.message : String(err);
    // Distinguish known errors
    if (message.includes("Groq API key not configured")) {
      return NextResponse.json({ error: message }, { status: 500 });
    }

    if (message.includes("timed out") || message.includes("timeout")) {
      return NextResponse.json({ error: "Analysis timed out. Try shortening input or try again later." }, { status: 504 });
    }

    return NextResponse.json({ error: `Analysis failed: ${message}` }, { status: 500 });
  }
}
