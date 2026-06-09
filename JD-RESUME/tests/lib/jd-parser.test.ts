import test from "node:test";
import assert from "node:assert";
import { parseJDText } from "../../lib/jd-parser";
import { loadEnv } from "../test-helper";

loadEnv();

test("Job Description Parser Service", async (t) => {
  await t.test("should parse a valid job description successfully", async () => {
    const mockJDText = `
      Senior React Developer
      Company: Alpha Corp
      
      Required Skills:
      React, TypeScript, Redux
      
      Preferred Skills:
      Node.js, AWS
      
      Responsibilities:
      - Design scalable frontend UI structures
      - Mentor junior developers
      
      Qualifications:
      - 5+ years experience
    `;

    const result = await parseJDText(mockJDText);
    assert.ok(result.jd, "Job Description profile should be defined");
    assert.strictEqual(result.jd.jobTitle, "Senior React Developer");
    assert.strictEqual(result.jd.company, "Alpha Corp");
    assert.ok(result.jd.requiredSkills.includes("React"), "Required skills should include React");
    assert.ok(result.jd.responsibilities.length >= 1, "Responsibilities should be populated");
  });
});
