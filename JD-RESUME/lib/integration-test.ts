import { 
  parseResumeText, 
  parseJDText, 
  calculateMatchScore, 
  rewriteBullet, 
  analyzeGaps 
} from "./services";
import { resumeTailor } from "./orchestrator";

/**
 * Integration test for the resume tailoring services.
 * Uses mock data to verify the flow works end-to-end.
 */
async function runIntegrationTest() {
  console.log("Starting integration test...");
  
  // Mock resume text
  const mockResumeText = `
    John Doe
    john.doe@email.com | (555) 123-4567 | linkedin.com/in/johndoe
    
    SUMMARY
    Experienced software engineer with 5 years of experience in web development.
    
    SKILLS
    JavaScript, TypeScript, React, Node.js, Python, AWS
    
    EXPERIENCE
    Software Engineer | Tech Corp | Jan 2020 - Present
    - Developed web applications using React and Node.js
    - Improved application performance by 30%
    - Collaborated with cross-functional teams
    
    Junior Developer | StartupXYZ | Jun 2018 - Dec 2019
    - Built REST APIs with Python Flask
    - Fixed bugs and maintained legacy code
    
    EDUCATION
    Bachelor of Science in Computer Science
    University of Example | 2014 - 2018
  `;
  
  // Mock job description text
  const mockJDText = `
    Senior Software Engineer
    Innovative Solutions Inc.
    
    We are looking for a Senior Software Engineer with extensive experience in 
    full-stack development using modern JavaScript frameworks.
    
    REQUIRED SKILLS
    JavaScript, TypeScript, React, Node.js, AWS
    
    PREFERRED SKILLS
    Python, Docker, Kubernetes
    
    RESPONSIBILITIES
    - Design and develop scalable web applications
    - Lead technical projects and mentor junior developers
    - Optimize application performance and security
    
    QUALIFICATIONS
    - 5+ years of software development experience
    - Bachelor's degree in Computer Science or related field
    - Experience with cloud platforms
  `;
  
  try {
    // Test 1: Parse resume
    console.log("\n1. Testing resume parsing...");
    const resumeResult = await parseResumeText(mockResumeText);
    console.log("✓ Resume parsed successfully");
    console.log(`  - Skills found: ${resumeResult.resume.skills.length}`);
    console.log(`  - Experience entries: ${resumeResult.resume.experience.length}`);
    
    // Test 2: Parse job description
    console.log("\n2. Testing job description parsing...");
    const jdResult = await parseJDText(mockJDText);
    console.log("✓ Job description parsed successfully");
    console.log(`  - Required skills: ${jdResult.jd.requiredSkills.length}`);
    console.log(`  - Responsibilities: ${jdResult.jd.responsibilities.length}`);
    
    // Test 3: Calculate match score
    console.log("\n3. Testing match scoring...");
    const scoreResult = await calculateMatchScore(
      JSON.stringify(resumeResult.resume, null, 2),
      JSON.stringify(jdResult.jd, null, 2)
    );
    console.log("✓ Match score calculated successfully");
    console.log(`  - Overall score: ${scoreResult.score.overallScore}`);
    console.log(`  - Skill coverage: ${scoreResult.score.skillCoverageScore}`);
    
    // Test 4: Rewrite a bullet
    console.log("\n4. Testing bullet rewriting...");
    const bulletResult = await rewriteBullet(
      "Developed web applications using React and Node.js",
      `Required Skills: JavaScript, TypeScript, React, Node.js, AWS
       Responsibilities: Design and develop scalable web applications`
    );
    console.log("✓ Bullet rewritten successfully");
    console.log(`  - Original: ${bulletResult.rewrite.original}`);
    console.log(`  - Tailored: ${bulletResult.rewrite.tailored}`);
    console.log(`  - Confidence: ${bulletResult.rewrite.confidence}`);
    
    // Test 5: Analyze gaps
    console.log("\n5. Testing gap analysis...");
    const gapResult = await analyzeGaps(
      JSON.stringify(resumeResult.resume, null, 2),
      JSON.stringify(jdResult.jd, null, 2)
    );
    console.log("✓ Gap analysis completed successfully");
    console.log(`  - Gaps found: ${gapResult.gaps.length}`);
    if (gapResult.gaps.length > 0) {
      console.log(`  - High importance gaps: ${gapResult.gaps.filter(g => g.importance === "high").length}`);
    }
    
    // Test 6: Full orchestrator workflow
    console.log("\n6. Testing full orchestrator workflow...");
    const orchestratorResult = await resumeTailor.tailorResume(mockResumeText, mockJDText);
    console.log("✓ Full workflow completed successfully");
    console.log(`  - Tailoring run ID: ${orchestratorResult.tailoringRun.id}`);
    console.log(`  - Original score: ${orchestratorResult.tailoringRun.originalScore.overallScore}`);
    console.log(`  - Tailored score: ${orchestratorResult.tailoringRun.tailoredScore.overallScore}`);
    console.log(`  - Warnings: ${orchestratorResult.allWarnings.length}`);
    
    console.log("\n✅ All integration tests passed!");
    return true;
  } catch (error) {
    console.error("\n❌ Integration test failed:", error);
    return false;
  }
}

import { fileURLToPath } from "url";
import path from "path";

// Run the test if this file is executed directly
const isMain = process.argv[1] && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);
if (isMain) {
  runIntegrationTest().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(err => {
    console.error("Unhandled error in integration test:", err);
    process.exit(1);
  });
}

export { runIntegrationTest };