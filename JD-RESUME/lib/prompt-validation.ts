import { loadPrompt } from "@/lib/prompts";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

async function run() {
  console.log("Validating prompt templates...");

  const prompts: {
    name: "jd-extraction" | "resume-parser" | "match-scoring" | "bullet-rewriter" | "gap-analysis";
    ctx: Record<string, string>;
  }[] = [
    { name: "jd-extraction", ctx: { jdText: "Sample JD text" } },
    { name: "resume-parser", ctx: { resumeText: "Sample resume text" } },
    { name: "match-scoring", ctx: { resumeJSON: "{}", jdJSON: "{}" } },
    { name: "bullet-rewriter", ctx: { originalBullet: "Did X", jdContext: "skills: X" } },
    { name: "gap-analysis", ctx: { resumeJSON: "{}", jdJSON: "{}" } },
  ];

  for (const p of prompts) {
    try {
      const out = loadPrompt(p.name, p.ctx);
      console.log(`- ${p.name}: ${out.length} chars`);

      // Basic sanity checks
      assert(typeof out === "string", `${p.name} did not return a string`);
      assert(out.length > 20, `${p.name} seems unexpectedly short`);
      // Ensure there are no leftover un-interpolated template markers
      assert(!out.includes("${"), p.name + " contains unexpanded ${ markers");
      assert(!out.includes("{{"), p.name + " contains double-curly markers");
    } catch (err) {
      console.error(`Prompt validation failed for ${p.name}:`, err);
      process.exit(2);
    }
  }

  console.log("All prompts validated successfully.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
