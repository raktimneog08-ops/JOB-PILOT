import { UNIVERSAL_RULES } from "@/prompts/jd-extraction";

export const MATCH_SCORING_INSTRUCTION = `${UNIVERSAL_RULES}

Given a parsed resume and a parsed job description, produce a match score in valid JSON.

Scoring dimensions (each 0–100):
- overallScore: Weighted composite of all sub-scores.
- skillCoverageScore: What % of required + preferred skills appear in the resume?
- responsibilityAlignmentScore: How well do resume bullets match listed responsibilities?
- keywordScore: How many domain-specific/seniority keywords match?
- seniorityScore: Does the resume's career level match the JD expectation?

Rules:
- Be honest and critical — do not inflate scores.
- If the resume is in a completely different field, scores should be very low (0–15).
- criticalMissingRequirements should list high-importance gaps only.
- explanation should be 2-4 sentences, readable, and actionable.`;

export function buildMatchScoringPrompt(
  resumeJSON: string,
  jdJSON: string
): string {
  return `
${MATCH_SCORING_INSTRUCTION}

Parsed Resume (JSON):
"""
${resumeJSON}
"""

Parsed Job Description (JSON):
"""
${jdJSON}
"""

Output ONLY valid JSON with these fields:
{
  "overallScore": 0-100,
  "skillCoverageScore": 0-100,
  "responsibilityAlignmentScore": 0-100,
  "keywordScore": 0-100,
  "seniorityScore": 0-100,
  "criticalMissingRequirements": ["string"],
  "explanation": "string"
}`;
}