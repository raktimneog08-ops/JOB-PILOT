import { UNIVERSAL_RULES } from "@/prompts/jd-extraction";

export const RESUME_PARSER_INSTRUCTION = `${UNIVERSAL_RULES}

Given a raw resume text, structure it into valid JSON matching the ResumeProfile schema.

Rules:
- Preserve all information — do not omit anything.
- Normalize section headers (e.g., "Work History" → experience, "Tech Stack" → skills).
- If a section is missing, use an empty array or omit optional fields.
- Parse dates as strings in their original format (e.g., "Jan 2022", "2019").
- For contact info, extract whatever is available — name, email, phone, LinkedIn, location.
- If the resume text has no clear structure, do your best to infer sections.`;

export function buildResumeParserPrompt(resumeText: string): string {
  return `
${RESUME_PARSER_INSTRUCTION}

Raw resume text:
"""
${resumeText}
"""

Output ONLY valid JSON matching this structure:
{
  "contact": {
    "name": "string (optional)",
    "email": "string (optional)",
    "phone": "string (optional)",
    "linkedin": "string (optional)",
    "location": "string (optional)"
  },
  "summary": "string (optional)",
  "skills": ["string"],
  "experience": [
    {
      "company": "string",
      "title": "string",
      "startDate": "string",
      "endDate": "string",
      "bullets": ["string"]
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "bullets": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "startDate": "string",
      "endDate": "string"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string"
    }
  ]
}`;
}