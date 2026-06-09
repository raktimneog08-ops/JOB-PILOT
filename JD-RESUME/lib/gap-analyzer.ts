import { z } from "zod";
import { ResumeGapSchema, type ResumeGap } from "@/types";
import { callLLM } from "@/lib/llm";
import { loadPrompt } from "@/lib/prompts";

/**
 * Analyze gaps between parsed resume and job description.
 */
export async function analyzeGaps(
  resumeJSON: string,
  jdJSON: string
): Promise<{
  gaps: ResumeGap[];
  warnings: string[];
}> {
  const warnings: string[] = [];

  if (!resumeJSON.trim() || !jdJSON.trim()) {
    throw new Error("Both resume and job description JSON are required");
  }

  // Basic validation that the JSON is parseable
  try {
    JSON.parse(resumeJSON);
    JSON.parse(jdJSON);
  } catch (e) {
    throw new Error("Invalid JSON provided for resume or job description");
  }

  const prompt = loadPrompt("gap-analysis", {
    resumeJSON,
    jdJSON,
  });

  const GapResponseSchema = z.object({
    gaps: z.array(ResumeGapSchema),
  });

  const response = await callLLM(prompt, GapResponseSchema, {
    temperature: 0.1,
  });

  return { gaps: response.gaps, warnings };
}