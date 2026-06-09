import { UNIVERSAL_RULES } from "@/prompts/jd-extraction";

export const BULLET_REWRITER_INSTRUCTION = `${UNIVERSAL_RULES}

Given a single resume bullet point and the job description context, rewrite the bullet to better align with the JD.

Rules:
- Preserve the user's actual meaning and experience — never fabricate.
- Use stronger action verbs where appropriate.
- Include JD-relevant terminology ONLY if it truthfully describes the original work.
- Preserve or improve measurable impact when present.
- Never add metrics, technologies, or scope that weren't in the original.
- If the bullet is already well-aligned, return it unchanged.
- If the bullet has nothing to do with the JD, return it unchanged with a note.
- Provide a clear changeReason explaining what was adjusted and why.
- List keywordsAddressed — which JD keywords this rewrite targets.
- Assign confidence: "high" (safe rewrite), "medium" (some inference), "low" (significant reinterpretation).
- If confidence is low, add a riskFlag explaining the concern.`;

export function buildBulletRewriterPrompt(
  originalBullet: string,
  jdContext: string
): string {
  return `
${BULLET_REWRITER_INSTRUCTION}

Job Description Context (key requirements, skills, responsibilities):
"""
${jdContext}
"""

Original bullet:
"""
${originalBullet}
"""

Output ONLY valid JSON with these fields:
{
  "original": "${originalBullet.replace(/"/g, '\\"')}",
  "tailored": "rewritten version",
  "changeReason": "brief explanation of changes",
  "keywordsAddressed": ["keyword1", "keyword2"],
  "confidence": "high|medium|low",
  "riskFlag": "optional warning if confidence is low"
}`;
}