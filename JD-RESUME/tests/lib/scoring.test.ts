import test from "node:test";
import assert from "node:assert";
import { calculateMatchScore } from "../../lib/match-scorer";
import { loadEnv } from "../test-helper";

loadEnv();

test("Match Scorer Service", async (t) => {
  await t.test("should score a resume against a job description successfully", async () => {
    const mockResumeJSON = JSON.stringify({
      contact: { name: "Jane Smith" },
      summary: "Experienced React developer with a focus on UI design and frontend performance.",
      skills: ["React", "Redux", "HTML", "CSS", "JavaScript"],
      experience: [
        {
          company: "Tech Innovators",
          title: "Frontend Developer",
          startDate: "Jan 2021",
          endDate: "Present",
          bullets: ["Developed user interfaces using React and state management."]
        }
      ],
      projects: [],
      education: [],
      certifications: []
    });

    const mockJDJSON = JSON.stringify({
      jobTitle: "Senior React Developer",
      requiredSkills: ["React", "TypeScript", "Redux"],
      preferredSkills: ["Node.js", "AWS"],
      responsibilities: ["Design scalable frontend UI structures", "Mentor junior developers"],
      qualifications: ["5+ years experience"],
      tools: [],
      keywords: ["React", "Redux", "TypeScript"],
      seniorityLevel: "senior",
      domainSignals: [],
      softSkills: []
    });

    const result = await calculateMatchScore(mockResumeJSON, mockJDJSON);
    assert.ok(result.score, "Score object should be defined");
    assert.ok(typeof result.score.overallScore === "number", "overallScore should be a number");
    assert.ok(result.score.overallScore >= 0 && result.score.overallScore <= 100, "overallScore should be between 0 and 100");
    assert.ok(result.score.explanation, "explanation should be present");
  });
});
