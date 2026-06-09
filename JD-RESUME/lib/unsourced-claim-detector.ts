import { TailoredBullet, ResumeProfile } from "@/types";

/**
 * Helper to serialize all text fields of a resume into a single lowercase string.
 * This includes summary, skills, experience details, project details, education, and certifications.
 */
export function serializeResume(resume: ResumeProfile): string {
  const parts: string[] = [];

  if (resume.contact) {
    if (resume.contact.name) parts.push(resume.contact.name);
    if (resume.contact.email) parts.push(resume.contact.email);
    if (resume.contact.phone) parts.push(resume.contact.phone);
    if (resume.contact.linkedin) parts.push(resume.contact.linkedin);
    if (resume.contact.location) parts.push(resume.contact.location);
  }

  if (resume.summary) {
    parts.push(resume.summary);
  }

  if (resume.skills && Array.isArray(resume.skills)) {
    parts.push(...resume.skills);
  }

  if (resume.experience && Array.isArray(resume.experience)) {
    for (const exp of resume.experience) {
      if (exp.company) parts.push(exp.company);
      if (exp.title) parts.push(exp.title);
      if (exp.bullets && Array.isArray(exp.bullets)) {
        parts.push(...exp.bullets);
      }
    }
  }

  if (resume.projects && Array.isArray(resume.projects)) {
    for (const proj of resume.projects) {
      if (proj.name) parts.push(proj.name);
      if (proj.description) parts.push(proj.description);
      if (proj.technologies && Array.isArray(proj.technologies)) {
        parts.push(...proj.technologies);
      }
      if (proj.bullets && Array.isArray(proj.bullets)) {
        parts.push(...proj.bullets);
      }
    }
  }

  if (resume.education && Array.isArray(resume.education)) {
    for (const edu of resume.education) {
      if (edu.institution) parts.push(edu.institution);
      if (edu.degree) parts.push(edu.degree);
      if (edu.field) parts.push(edu.field);
    }
  }

  if (resume.certifications && Array.isArray(resume.certifications)) {
    for (const cert of resume.certifications) {
      if (cert.name) parts.push(cert.name);
      if (cert.issuer) parts.push(cert.issuer);
    }
  }

  return parts.join(" ").toLowerCase();
}

/**
 * Post-hoc check: extracts keywords addressed in a rewrite, checks if they exist
 * in the original resume. If any keyword is missing, flags as a risk and downgrades confidence.
 */
export function detectUnsourcedClaims(
  bullet: TailoredBullet,
  resume: ResumeProfile
): TailoredBullet {
  if (!bullet.keywordsAddressed || !Array.isArray(bullet.keywordsAddressed) || bullet.keywordsAddressed.length === 0) {
    return bullet;
  }

  const serialized = serializeResume(resume);
  const missingKeywords: string[] = [];

  for (const keyword of bullet.keywordsAddressed) {
    const cleanedKeyword = keyword.trim().toLowerCase();
    if (!cleanedKeyword) continue;
    
    // Check if the exact keyword is present in the original resume text
    if (!serialized.includes(cleanedKeyword)) {
      missingKeywords.push(keyword.trim());
    }
  }

  if (missingKeywords.length > 0) {
    const warningMsg = `Warning: This rewrite adds keyword(s) not found in your original resume: ${missingKeywords.join(", ")}. Please verify you possess this skill/experience.`;
    
    const updatedRiskFlag = bullet.riskFlag
      ? `${bullet.riskFlag}; ${warningMsg}`
      : warningMsg;

    return {
      ...bullet,
      confidence: "low",
      riskFlag: updatedRiskFlag,
    };
  }

  return bullet;
}
