import { UNIVERSAL_RULES } from "@/prompts/jd-extraction";

export const GAP_ANALYSIS_INSTRUCTION = `${UNIVERSAL_RULES}

Given a parsed resume and a parsed job description, identify gaps where the resume does not fully meet JD requirements.

Gap categories to check:
1. Missing required skills — skills listed as required in JD that don't appear in resume.
2. Weakly represented required skills — skills mentioned but not demonstrated in experience bullets.
3. Missing tools or technologies — specific tools in JD not present in resume.
4. Missing domain experience — industry or domain signals in JD not reflected.
5. Missing seniority indicators — resume level doesn't match JD seniority level.
6. Unsupported JD requirements — requirements that should NOT be fabricated (mark canSafelyAdd: false).

For each gap, provide:
- name: Short gap name.
- importance: "high" | "medium" | "low".
- jdEvidence: Exact excerpt from JD showing the requirement.
- resumeEvidence: How it appears in the resume, or "Not found" if completely absent.
- suggestedAction: Concrete action the user can take.
- canSafelyAdd: true if user can truthfully add this, false if it would require fabrication.`;

export function buildGapAnalysisPrompt(
  resumeJSON: string,
  jdJSON: string
): string {
  return `
${GAP_ANALYSIS_INSTRUCTION}

Parsed Resume (JSON):
"""
${resumeJSON}
"""

Parsed Job Description (JSON):
"""
${jdJSON}
"""

Output ONLY valid JSON matching this schema:
{
  "gaps": [
    {
      "name": "string",
      "importance": "high|medium|low",
      "jdEvidence": "string",
      "resumeEvidence": "string",
      "suggestedAction": "string",
      "canSafelyAdd": true|false
    }
  ]
}

If there are zero gaps, output an empty array for "gaps": { "gaps": [] }.`;
}