import { ResumeProfileSchema, type ResumeProfile } from "@/types";
import { callLLM } from "@/lib/llm";
import { loadPrompt } from "@/lib/prompts";

/**
 * Parse raw resume text into a structured ResumeProfile using LLM.
 */
export async function parseResumeText(resumeText: string): Promise<{
  resume: ResumeProfile;
  warnings: string[];
}> {
  const warnings: string[] = [];

  if (!resumeText.trim()) {
    throw new Error("Resume text is required");
  }

  if (resumeText.length > 50_000) {
    warnings.push(
      "Resume text is very long. Parsing may take longer or truncate."
    );
  }

  if (resumeText.length < 100) {
    warnings.push(
      "Your resume appears very short. Parsing may not capture all details."
    );
  }

  const prompt = loadPrompt("resume-parser", { resumeText });

  const resume = await callLLM(prompt, ResumeProfileSchema, {
    temperature: 0.1,
  });

  return { resume, warnings };
}