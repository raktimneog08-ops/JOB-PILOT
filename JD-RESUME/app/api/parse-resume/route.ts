import { NextResponse } from "next/server";
import { parseResumeText } from "@/lib/resume-parser";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = body.text as string | undefined;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Resume text is required." },
        { status: 400 }
      );
    }

    const { resume, warnings } = await parseResumeText(text);

    return NextResponse.json({ resume, warnings });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("Groq API key not configured")) {
      return NextResponse.json({ error: message }, { status: 500 });
    }
    if (message.includes("timed out") || message.includes("timeout")) {
      return NextResponse.json(
        { error: "Parsing request timed out. Please try again." },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: `Resume parsing failed: ${message}` },
      { status: 500 }
    );
  }
}
