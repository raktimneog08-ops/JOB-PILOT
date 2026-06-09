import { NextResponse } from "next/server";
import { resumeTailor } from "@/lib/orchestrator";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const resumeText = body.resumeText as string | undefined;
    const jdText = body.jdText as string | undefined;

    if (!resumeText && !jdText) {
      return NextResponse.json(
        { error: "Both resume text and job description text are required." },
        { status: 400 }
      );
    }
    if (!resumeText) {
      return NextResponse.json(
        { error: "Resume text is required." },
        { status: 400 }
      );
    }
    if (!jdText) {
      return NextResponse.json(
        { error: "Job description text is required." },
        { status: 400 }
      );
    }

    const { tailoringRun, allWarnings } = await resumeTailor.tailorResume(
      resumeText,
      jdText
    );

    return NextResponse.json({ tailoringRun, allWarnings });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("Groq API key not configured")) {
      return NextResponse.json({ error: message }, { status: 500 });
    }
    if (message.includes("timed out") || message.includes("timeout")) {
      return NextResponse.json(
        { error: "Tailoring request timed out. Please try shortening your input or try again later." },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: `Resume tailoring failed: ${message}` },
      { status: 500 }
    );
  }
}
