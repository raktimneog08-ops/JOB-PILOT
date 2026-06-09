import test from "node:test";
import assert from "node:assert";
import { ResumeTailorOrchestrator } from "../../lib/orchestrator";

test("Orchestrator Validation & Warnings", async (t) => {
  const orchestrator = new ResumeTailorOrchestrator();

  await t.test("should throw an error on empty resume", async () => {
    await assert.rejects(
      () => orchestrator.tailorResume("", "Some JD text"),
      /Resume text cannot be empty/
    );
  });

  await t.test("should throw an error on empty JD", async () => {
    await assert.rejects(
      () => orchestrator.tailorResume("Some resume text", ""),
      /Job description text cannot be empty/
    );
  });

  await t.test("should generate warning on short and long resumes", async () => {
    const mockOrchestrator = new ResumeTailorOrchestrator();
    
    // Stub methods that make network requests
    mockOrchestrator.parseInputs = async () => ({
      resume: { contact: {}, skills: [], experience: [], projects: [], education: [], certifications: [] },
      jd: { jobTitle: "Engineer", requiredSkills: [], preferredSkills: [], responsibilities: [], qualifications: [], tools: [], keywords: [], seniorityLevel: "mid", domainSignals: [], softSkills: [] },
      resumeWarnings: [],
      jdWarnings: [],
    });
    
    mockOrchestrator.calculateInitialScore = async () => ({
      score: { overallScore: 50, skillCoverageScore: 50, responsibilityAlignmentScore: 50, keywordScore: 50, seniorityScore: 50, criticalMissingRequirements: [], explanation: "" },
      warnings: [],
    });
    
    mockOrchestrator.performGapAnalysis = async () => ({ gaps: [], warnings: [] });
    mockOrchestrator.tailorResumeBullets = async () => ({
      tailoredResume: { tailoredSummary: "", tailoredSkills: [], tailoredExperience: [], tailoredProjects: [], tailoredEducation: [], tailoredCertifications: [] },
      bulletRewrites: [],
      warnings: [],
    });
    mockOrchestrator.calculateTailoredScore = async () => ({
      score: { overallScore: 50, skillCoverageScore: 50, responsibilityAlignmentScore: 50, keywordScore: 50, seniorityScore: 50, criticalMissingRequirements: [], explanation: "" },
      warnings: [],
    });

    const shortResume = "Very short resume text.";
    const result = await mockOrchestrator.tailorResume(shortResume, "Valid JD text that is longer");
    assert.ok(result.allWarnings.includes("Resume is very short. AI rewriter may produce low-confidence suggestions."));
    
    const longResume = "a".repeat(15001);
    const resultLong = await mockOrchestrator.tailorResume(longResume, "Valid JD text that is longer");
    assert.ok(resultLong.allWarnings.includes("Resume is very long. Content may be truncated during processing."));
  });
});
