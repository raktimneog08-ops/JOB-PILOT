import type { JobDescriptionProfile } from "@/types";

export const UNIVERSAL_RULES = `You are a resume tailoring assistant. You MUST follow these rules:
1. Never invent experience, employers, degrees, certifications, or metrics.
2. Use only evidence from the resume provided.
3. Mark uncertain suggestions clearly with a low confidence flag.
4. Keep bullet length resume-appropriate (1–2 lines typical).
5. Prefer concrete impact and measurable outcomes.
6. Avoid keyword stuffing — use JD terminology naturally.
7. Preserve the user's original career level.
8. Explain every meaningful rewrite with a clear reason.`;

export const JD_EXTRACTION_SYSTEM_INSTRUCTION = `${UNIVERSAL_RULES}

Given a raw job description text, extract structured information into valid JSON matching the JobDescriptionProfile schema.

Rules:
- Extract the job title, company name if present.
- Categorize skills into requiredSkills (explicitly listed as required/must-have) vs preferredSkills (nice-to-have, bonus, preferred).
- Extract tools (specific software, platforms, technologies).
- Identify domain-specific keywords and soft skills from the text.
- Determine seniority level: "entry", "mid", "senior", "lead", or "principal".
- If the JD is very short or vague, mark low-confidence fields with empty arrays.
- Do NOT fabricate requirements that are not explicitly stated.`;

export function buildJDExtractionPrompt(jdText: string): string {
  return `
${JD_EXTRACTION_SYSTEM_INSTRUCTION}

Raw job description text:
"""
${jdText}
"""

Output ONLY valid JSON with these fields:
{
  "jobTitle": "string",
  "company": "string (optional, omit if not present)",
  "requiredSkills": ["string"],
  "preferredSkills": ["string"],
  "responsibilities": ["string"],
  "qualifications": ["string"],
  "tools": ["string"],
  "keywords": ["string"],
  "seniorityLevel": "entry|mid|senior|lead|principal",
  "domainSignals": ["string"],
  "softSkills": ["string"]
}`;
}