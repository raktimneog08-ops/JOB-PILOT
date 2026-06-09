import test from "node:test";
import assert from "node:assert";
import { parseResumeText } from "../../lib/resume-parser";
import { loadEnv } from "../test-helper";

loadEnv();

test("Resume Parser Service", async (t) => {
  await t.test("should parse a valid resume string successfully", async () => {
    const mockResumeText = `
      Jane Smith
      jane.smith@email.com | (555) 987-6543
      
      Summary:
      Experienced React developer with a focus on UI design and frontend performance.
      
      Skills:
      React, Redux, HTML, CSS, JavaScript
      
      Experience:
      Frontend Developer | Tech Innovators | Jan 2021 - Present
      - Developed user interfaces using React and state management.
      
      Education:
      Bachelor of Science in Computer Science | Example University | 2017 - 2021
    `;

    const result = await parseResumeText(mockResumeText);
    assert.ok(result.resume, "Resume object should be defined");
    assert.strictEqual(result.resume.contact.name, "Jane Smith");
    assert.strictEqual(result.resume.contact.email, "jane.smith@email.com");
    assert.ok(result.resume.skills.includes("React"), "Skills should contain React");
    assert.strictEqual(result.resume.experience.length, 1);
    assert.strictEqual(result.resume.experience[0].company, "Tech Innovators");
  });
});
