import { z } from "zod";

// ──────────────────────────────────────────
// 4.1 ResumeProfile
// ──────────────────────────────────────────

export const ResumeExperienceSchema = z.object({
  company: z.string(),
  title: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  bullets: z.array(z.string()),
});

export type ResumeExperience = z.infer<typeof ResumeExperienceSchema>;

export const ResumeProjectSchema = z.object({
  name: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
  bullets: z.array(z.string()),
});

export type ResumeProject = z.infer<typeof ResumeProjectSchema>;

export const ResumeEducationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string(),
  startDate: z.string(),
  endDate: z.string(),
});

export type ResumeEducation = z.infer<typeof ResumeEducationSchema>;

export const ResumeCertificationSchema = z.object({
  name: z.string(),
  issuer: z.string(),
  date: z.string(),
});

export type ResumeCertification = z.infer<typeof ResumeCertificationSchema>;

export const ResumeProfileSchema = z.object({
  contact: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    linkedin: z.string().optional(),
    location: z.string().optional(),
  }),
  summary: z.string().optional(),
  skills: z.array(z.string()),
  experience: z.array(ResumeExperienceSchema),
  projects: z.array(ResumeProjectSchema),
  education: z.array(ResumeEducationSchema),
  certifications: z.array(ResumeCertificationSchema),
});

export type ResumeProfile = z.infer<typeof ResumeProfileSchema>;

// ──────────────────────────────────────────
// 4.2 JobDescriptionProfile
// ──────────────────────────────────────────

export const seniorityLevels = [
  "entry",
  "mid",
  "senior",
  "lead",
  "principal",
] as const;

export const JobDescriptionProfileSchema = z.object({
  jobTitle: z.string(),
  company: z.string().optional(),
  requiredSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()),
  responsibilities: z.array(z.string()),
  qualifications: z.array(z.string()),
  tools: z.array(z.string()),
  keywords: z.array(z.string()),
  seniorityLevel: z.enum(seniorityLevels),
  domainSignals: z.array(z.string()),
  softSkills: z.array(z.string()),
});

export type JobDescriptionProfile = z.infer<typeof JobDescriptionProfileSchema>;

// ──────────────────────────────────────────
// 4.3 MatchScore
// ──────────────────────────────────────────

export const MatchScoreSchema = z.object({
  overallScore: z.number().min(0).max(100),
  skillCoverageScore: z.number().min(0).max(100),
  responsibilityAlignmentScore: z.number().min(0).max(100),
  keywordScore: z.number().min(0).max(100),
  seniorityScore: z.number().min(0).max(100),
  criticalMissingRequirements: z.array(z.string()),
  explanation: z.string(),
});

export type MatchScore = z.infer<typeof MatchScoreSchema>;

// ──────────────────────────────────────────
// 4.4 TailoredResume
// ──────────────────────────────────────────

export const confidenceLevels = ["high", "medium", "low"] as const;

export const TailoredBulletSchema = z.object({
  original: z.string(),
  tailored: z.string(),
  changeReason: z.string(),
  keywordsAddressed: z.array(z.string()),
  confidence: z.enum(confidenceLevels),
  riskFlag: z.string().optional(),
});

export type TailoredBullet = z.infer<typeof TailoredBulletSchema>;

export const TailoredExperienceSchema = z.object({
  company: z.string(),
  title: z.string(),
  bullets: z.array(TailoredBulletSchema),
});

export type TailoredExperience = z.infer<typeof TailoredExperienceSchema>;

export const TailoredProjectSchema = z.object({
  name: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
  bullets: z.array(TailoredBulletSchema),
});

export type TailoredProject = z.infer<typeof TailoredProjectSchema>;

export const TailoredResumeSchema = z.object({
  tailoredSummary: z.string(),
  tailoredSkills: z.array(z.string()),
  tailoredExperience: z.array(TailoredExperienceSchema),
  tailoredProjects: z.array(TailoredProjectSchema),
  tailoredEducation: z.array(ResumeEducationSchema),
  tailoredCertifications: z.array(ResumeCertificationSchema),
});

export type TailoredResume = z.infer<typeof TailoredResumeSchema>;

// ──────────────────────────────────────────
// 4.5 ResumeGap
// ──────────────────────────────────────────

export const importanceLevels = ["high", "medium", "low"] as const;

export const ResumeGapSchema = z.object({
  name: z.string(),
  importance: z.enum(importanceLevels),
  jdEvidence: z.string(),
  resumeEvidence: z.string().optional(),
  suggestedAction: z.string(),
  canSafelyAdd: z.boolean(),
});

export type ResumeGap = z.infer<typeof ResumeGapSchema>;

// ──────────────────────────────────────────
// 4.6 TailoringRun
// ──────────────────────────────────────────

export const TailoringRunSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  originalResume: ResumeProfileSchema,
  jobDescription: JobDescriptionProfileSchema,
  originalScore: MatchScoreSchema,
  gaps: z.array(ResumeGapSchema),
  tailoredResume: TailoredResumeSchema,
  tailoredScore: MatchScoreSchema,
  llmModel: z.string(),
  promptVersions: z.record(z.string()),
  disclaimers: z.array(z.string()),
});

export type TailoringRun = z.infer<typeof TailoringRunSchema>;