import { TailoredBulletSchema, type TailoredBullet } from "@/types";
import { callLLM } from "@/lib/llm";
import { loadPrompt } from "@/lib/prompts";

/**
 * Rewrite a resume bullet point to better align with job description context.
 */
export async function rewriteBullet(
  originalBullet: string,
  jdContext: string
): Promise<{
  rewrite: TailoredBullet;
  warnings: string[];
}> {
  const warnings: string[] = [];

  if (!originalBullet.trim()) {
    throw new Error("Original bullet is required");
  }

  if (!jdContext.trim()) {
    throw new Error("Job description context is required");
  }

  if (originalBullet.length > 500) {
    warnings.push("Bullet is very long. Consider shortening for better results.");
  }

  const prompt = loadPrompt("bullet-rewriter", {
    originalBullet,
    jdContext,
  });

  const rewrite = await callLLM(prompt, TailoredBulletSchema, {
    temperature: 0.2,
  });

  return { rewrite, warnings };
}