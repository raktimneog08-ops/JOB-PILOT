import { 
  type ResumeProfile,
  type JobDescriptionProfile,
  type MatchScore,
  type TailoredBullet,
  type TailoredExperience,
  type TailoredProject,
  type TailoredResume,
  type ResumeGap,
  type TailoringRun
} from "@/types";
import { 
  parseResumeText, 
  parseJDText,
  calculateMatchScore,
  rewriteBullet,
  analyzeGaps
} from "./services";
import { detectUnsourcedClaims } from "./unsourced-claim-detector";

/**
 * Main orchestrator for the resume tailoring workflow.
 * Coordinates all steps from parsing to final output.
 */
export class ResumeTailorOrchestrator {
  private llmModel: string;

  constructor(llmModel: string = "groq/llama3-8b-8192") {
    this.llmModel = llmModel;
  }

  /**
   * Step 1: Parse resume and job description texts into structured profiles.
   */
  async parseInputs(
    resumeText: string,
    jdText: string
  ): Promise<{
    resume: ResumeProfile;
    jd: JobDescriptionProfile;
    resumeWarnings: string[];
    jdWarnings: string[];
  }> {
    const [resumeResult, jdResult] = await Promise.all([
      parseResumeText(resumeText),
      parseJDText(jdText)
    ]);

    return {
      resume: resumeResult.resume,
      jd: jdResult.jd,
      resumeWarnings: resumeResult.warnings,
      jdWarnings: jdResult.warnings
    };
  }

  /**
   * Step 2: Calculate initial match score between resume and JD.
   */
  async calculateInitialScore(
    resume: ResumeProfile,
    jd: JobDescriptionProfile
  ): Promise<{
    score: MatchScore;
    warnings: string[];
  }> {
    const resumeJSON = JSON.stringify(resume, null, 2);
    const jdJSON = JSON.stringify(jd, null, 2);
    
    return calculateMatchScore(resumeJSON, jdJSON);
  }

  /**
   * Step 3: Analyze gaps between resume and JD.
   */
  async performGapAnalysis(
    resume: ResumeProfile,
    jd: JobDescriptionProfile
  ): Promise<{
    gaps: ResumeGap[];
    warnings: string[];
  }> {
    const resumeJSON = JSON.stringify(resume, null, 2);
    const jdJSON = JSON.stringify(jd, null, 2);
    
    return analyzeGaps(resumeJSON, jdJSON);
  }

  /**
   * Step 4: Rewrite resume bullets to better align with JD.
   */
  async tailorResumeBullets(
    resume: ResumeProfile,
    jd: JobDescriptionProfile
  ): Promise<{
    tailoredResume: TailoredResume;
    bulletRewrites: {
      original: string;
      tailored: TailoredBullet;
    }[];
    warnings: string[];
  }> {
    const allWarnings: string[] = [];
    const tailoredExperience: TailoredExperience[] = [];
    const tailoredProjects: TailoredProject[] = [];
    const bulletRewrites: {
      original: string;
      tailored: TailoredBullet;
    }[] = [];

    // Tailor experience bullets
    for (const exp of resume.experience) {
      const tailoredBullets: TailoredBullet[] = [];
      
      for (const bullet of exp.bullets) {
        // Create JD context focusing on skills and responsibilities
        const jdContext = `
          Required Skills: ${jd.requiredSkills.join(", ")}
          Preferred Skills: ${jd.preferredSkills.join(", ")}
          Responsibilities: ${jd.responsibilities.slice(0, 3).join(". ")}
          Keywords: ${jd.keywords.slice(0, 10).join(", ")}
        `;

        const { rewrite, warnings } = await rewriteBullet(bullet, jdContext);
        allWarnings.push(...warnings);
        
        const validatedRewrite = detectUnsourcedClaims(rewrite, resume);
        tailoredBullets.push(validatedRewrite);
        bulletRewrites.push({
          original: bullet,
          tailored: validatedRewrite
        });
      }

      tailoredExperience.push({
        company: exp.company,
        title: exp.title,
        bullets: tailoredBullets
      });
    }

    // Tailor project bullets
    for (const project of resume.projects) {
      const tailoredBullets: TailoredBullet[] = [];
      
      for (const bullet of project.bullets) {
        // Create JD context focusing on skills and responsibilities
        const jdContext = `
          Required Skills: ${jd.requiredSkills.join(", ")}
          Preferred Skills: ${jd.preferredSkills.join(", ")}
          Responsibilities: ${jd.responsibilities.slice(0, 3).join(". ")}
          Keywords: ${jd.keywords.slice(0, 10).join(", ")}
        `;

        const { rewrite, warnings } = await rewriteBullet(bullet, jdContext);
        allWarnings.push(...warnings);
        
        const validatedRewrite = detectUnsourcedClaims(rewrite, resume);
        tailoredBullets.push(validatedRewrite);
        bulletRewrites.push({
          original: bullet,
          tailored: validatedRewrite
        });
      }

      tailoredProjects.push({
        name: project.name,
        description: project.description,
        technologies: project.technologies,
        bullets: tailoredBullets
      });
    }

    // Create tailored resume
    const tailoredResume: TailoredResume = {
      tailoredSummary: resume.summary || "Experienced professional seeking to leverage skills in new role.",
      tailoredSkills: [...new Set([...resume.skills, ...jd.requiredSkills, ...jd.preferredSkills])],
      tailoredExperience,
      tailoredProjects,
      tailoredEducation: resume.education,
      tailoredCertifications: resume.certifications
    };

    return {
      tailoredResume,
      bulletRewrites,
      warnings: allWarnings
    };
  }

  /**
   * Step 5: Calculate match score after tailoring.
   */
  async calculateTailoredScore(
    tailoredResume: TailoredResume,
    jd: JobDescriptionProfile
  ): Promise<{
    score: MatchScore;
    warnings: string[];
  }> {
    // Convert tailored resume back to regular resume format for scoring
    const resumeForScoring = {
      contact: {
        name: "",
        email: "",
        phone: "",
        linkedin: "",
        location: ""
      },
      summary: tailoredResume.tailoredSummary,
      skills: tailoredResume.tailoredSkills,
      experience: tailoredResume.tailoredExperience.map(exp => ({
        company: exp.company,
        title: exp.title,
        startDate: "Present",
        endDate: "Present",
        bullets: exp.bullets.map(b => b.tailored)
      })),
      projects: tailoredResume.tailoredProjects.map(proj => ({
        name: proj.name,
        description: proj.description,
        technologies: proj.technologies,
        bullets: proj.bullets.map(b => b.tailored)
      })),
      education: tailoredResume.tailoredEducation,
      certifications: tailoredResume.tailoredCertifications
    };

    const resumeJSON = JSON.stringify(resumeForScoring, null, 2);
    const jdJSON = JSON.stringify(jd, null, 2);
    
    return calculateMatchScore(resumeJSON, jdJSON);
  }

  /**
   * Step 6: Generate a complete tailoring run record.
   */
  async generateTailoringRun(
    originalResume: ResumeProfile,
    jobDescription: JobDescriptionProfile,
    originalScore: MatchScore,
    gaps: ResumeGap[],
    tailoredResume: TailoredResume,
    tailoredScore: MatchScore
  ): Promise<TailoringRun> {
    return {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      originalResume,
      jobDescription,
      originalScore,
      gaps,
      tailoredResume,
      tailoredScore,
      llmModel: this.llmModel,
      promptVersions: {
        "jd-extraction": "v1.0",
        "resume-parser": "v1.0",
        "match-scoring": "v1.0",
        "bullet-rewriter": "v1.0",
        "gap-analysis": "v1.0"
      },
      disclaimers: [
        "This tool provides suggestions for resume improvement. Users should verify all claims remain truthful.",
        "AI-generated content should be reviewed for accuracy and tone.",
        "Final resume should reflect genuine experience and skills."
      ]
    };
  }

  /**
   * Main workflow: Execute complete resume tailoring pipeline.
   */
  async tailorResume(
    resumeText: string,
    jdText: string
  ): Promise<{
    tailoringRun: TailoringRun;
    allWarnings: string[];
  }> {
    if (!resumeText.trim()) {
      throw new Error("Resume text cannot be empty.");
    }
    if (!jdText.trim()) {
      throw new Error("Job description text cannot be empty.");
    }

    const allWarnings: string[] = [];

    if (resumeText.length > 15000) {
      allWarnings.push("Resume is very long. Content may be truncated during processing.");
    } else if (resumeText.length < 300) {
      allWarnings.push("Resume is very short. AI rewriter may produce low-confidence suggestions.");
    }

    try {
      // Step 1: Parse inputs
      const { resume, jd, resumeWarnings, jdWarnings } = await this.parseInputs(resumeText, jdText);
      allWarnings.push(...resumeWarnings, ...jdWarnings);

      // Step 2: Calculate initial score
      const { score: originalScore, warnings: scoreWarnings } = await this.calculateInitialScore(resume, jd);
      allWarnings.push(...scoreWarnings);

      // Step 3: Analyze gaps
      const { gaps, warnings: gapWarnings } = await this.performGapAnalysis(resume, jd);
      allWarnings.push(...gapWarnings);

      // Step 4: Tailor resume
      const { tailoredResume, warnings: tailorWarnings } = await this.tailorResumeBullets(resume, jd);
      allWarnings.push(...tailorWarnings);

      // Step 5: Calculate tailored score
      const { score: tailoredScore, warnings: tailoredScoreWarnings } = await this.calculateTailoredScore(tailoredResume, jd);
      allWarnings.push(...tailoredScoreWarnings);

      // Step 6: Generate tailoring run record
      const tailoringRun = await this.generateTailoringRun(
        resume,
        jd,
        originalScore,
        gaps,
        tailoredResume,
        tailoredScore
      );

      return {
        tailoringRun,
        allWarnings
      };
    } catch (error) {
      throw new Error(`Resume tailoring failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export a default instance for convenience
export const resumeTailor = new ResumeTailorOrchestrator();