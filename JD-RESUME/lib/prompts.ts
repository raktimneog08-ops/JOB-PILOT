import { buildJDExtractionPrompt } from "@/prompts/jd-extraction";
import { buildResumeParserPrompt } from "@/prompts/resume-parser";
import { buildMatchScoringPrompt } from "@/prompts/match-scoring";
import { buildBulletRewriterPrompt } from "@/prompts/bullet-rewriter";
import { buildGapAnalysisPrompt } from "@/prompts/gap-analysis";

/**
 * Load a prompt by name, injecting the given context variables.
 * Returns the full prompt string ready to send to the LLM.
 */
export function loadPrompt(
  name: "jd-extraction" | "resume-parser" | "match-scoring" | "bullet-rewriter" | "gap-analysis",
  context: Record<string, string>
): string {
  switch (name) {
    case "jd-extraction":
      return buildJDExtractionPrompt(context.jdText);
    case "resume-parser":
      return buildResumeParserPrompt(context.resumeText);
    case "match-scoring":
      return buildMatchScoringPrompt(context.resumeJSON, context.jdJSON);
    case "bullet-rewriter":
      return buildBulletRewriterPrompt(context.originalBullet, context.jdContext);
    case "gap-analysis":
      return buildGapAnalysisPrompt(context.resumeJSON, context.jdJSON);
    default: {
      const _exhaustive: never = name;
      throw new Error(`Unknown prompt name: ${name}`);
    }
  }
}