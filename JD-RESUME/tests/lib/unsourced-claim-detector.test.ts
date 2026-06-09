import test from "node:test";
import assert from "node:assert";
import { serializeResume, detectUnsourcedClaims } from "../../lib/unsourced-claim-detector";
import { ResumeProfile, TailoredBullet } from "../../types";

const mockResume: ResumeProfile = {
  contact: {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "123-456-7890",
  },
  summary: "Experienced software developer specialized in full-stack applications.",
  skills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
  experience: [
    {
      company: "Company Alpha",
      title: "Senior Engineer",
      startDate: "2020",
      endDate: "Present",
      bullets: ["Lead developer on scalable web services", "Optimized cloud deployments on AWS"],
    },
  ],
  projects: [
    {
      name: "Portfolio Site",
      description: "Personal website showcasing projects built with Next.js.",
      technologies: ["Next.js", "Tailwind CSS"],
      bullets: ["Designed responsive layout and implemented SEO best practices."],
    },
  ],
  education: [
    {
      institution: "State University",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startDate: "2014",
      endDate: "2018",
    },
  ],
  certifications: [
    {
      name: "AWS Certified Developer",
      issuer: "Amazon Web Services",
      date: "2022",
    },
  ],
};

test("Unsourced Claim Detector Service", async (t) => {
  await t.test("serializeResume should concatenate all text fields case-insensitively", () => {
    const serialized = serializeResume(mockResume);
    
    assert.ok(serialized.includes("john doe"));
    assert.ok(serialized.includes("full-stack"));
    assert.ok(serialized.includes("react"));
    assert.ok(serialized.includes("company alpha"));
    assert.ok(serialized.includes("aws certified developer"));
    assert.ok(serialized.includes("state university"));
    assert.ok(serialized.includes("next.js"));
    assert.ok(serialized.includes("seo best practices"));
  });

  await t.test("detectUnsourcedClaims should pass through bullets with all keywords present in resume", () => {
    const bullet: TailoredBullet = {
      original: "Worked on frontend applications.",
      tailored: "Worked on frontend applications using React.",
      changeReason: "Aligned with React requirement.",
      keywordsAddressed: ["React", "TypeScript"],
      confidence: "high",
    };

    const result = detectUnsourcedClaims(bullet, mockResume);
    assert.strictEqual(result.confidence, "high");
    assert.strictEqual(result.riskFlag, undefined);
  });

  await t.test("detectUnsourcedClaims should downgrade confidence and set riskFlag warning if keywords are missing", () => {
    const bullet: TailoredBullet = {
      original: "Optimized deployments.",
      tailored: "Optimized deployments using Kubernetes and Docker.",
      changeReason: "Aligned with container requirements.",
      keywordsAddressed: ["AWS", "Docker", "Kubernetes"],
      confidence: "high",
    };

    const result = detectUnsourcedClaims(bullet, mockResume);
    assert.strictEqual(result.confidence, "low");
    assert.ok(result.riskFlag?.includes("Warning: This rewrite adds keyword(s) not found in your original resume:"));
    assert.ok(result.riskFlag?.includes("Docker"));
    assert.ok(result.riskFlag?.includes("Kubernetes"));
    // AWS should not be in the warning since it's present in the resume
    assert.ok(!result.riskFlag?.includes("AWS Certified Developer")); 
  });

  await t.test("detectUnsourcedClaims should handle empty keywordsAddressed list gracefully", () => {
    const bullet: TailoredBullet = {
      original: "Optimized deployments.",
      tailored: "Optimized deployments.",
      changeReason: "Unchanged.",
      keywordsAddressed: [],
      confidence: "high",
    };

    const result = detectUnsourcedClaims(bullet, mockResume);
    assert.strictEqual(result.confidence, "high");
    assert.strictEqual(result.riskFlag, undefined);
  });
});
