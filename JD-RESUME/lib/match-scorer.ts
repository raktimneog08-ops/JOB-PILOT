import { MatchScoreSchema, type MatchScore } from "@/types";
import { callLLM } from "@/lib/llm";
import { loadPrompt } from "@/lib/prompts";

/**
 * Calculate match score between parsed resume and job description.
 */
export async function calculateMatchScore(
  resumeJSON: string,
  jdJSON: string
): Promise<{
  score: MatchScore;
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

  const prompt = loadPrompt("match-scoring", {
    resumeJSON,
    jdJSON,
  });

  const score = await callLLM(prompt, MatchScoreSchema, {
    temperature: 0.1,
  });

  return { score, warnings };
}