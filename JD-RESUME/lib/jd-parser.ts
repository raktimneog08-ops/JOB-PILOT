import { JobDescriptionProfileSchema, type JobDescriptionProfile } from "@/types";
import { callLLM } from "@/lib/llm";
import { loadPrompt } from "@/lib/prompts";

/**
 * Parse raw job description text into a structured JobDescriptionProfile using LLM.
 */
export async function parseJDText(jdText: string): Promise<{
  jd: JobDescriptionProfile;
  warnings: string[];
}> {
  if (!jdText.trim()) {
    throw new Error("Job description text is required");
  }

  const warnings: string[] = [];

  // Pre-process input: strip markdown code fences to avoid confusing JSON parsing
  // Keep inner content but remove the fence markers
  let cleaned = jdText.replace(/```[\s\S]*?```/g, (match) => {
    return match.replace(/^```[\w-]*\n?|\n?```$/g, "");
  });

  // Remove inline code backticks
  cleaned = cleaned.replace(/`([^`]+)`/g, "$1");

  // Truncate if exceedingly large to avoid token limits
  const MAX_CHARS = 50_000;
  if (cleaned.length > MAX_CHARS) {
    warnings.push("Input was truncated due to length limits.");
    cleaned = cleaned.slice(0, MAX_CHARS);
  }

  const prompt = loadPrompt("jd-extraction", { jdText: cleaned });

  const jd = await callLLM(prompt, JobDescriptionProfileSchema, {
    temperature: 0.1,
  });

  return { jd, warnings };
}