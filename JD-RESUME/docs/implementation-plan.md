# Resume Shapeshifter — Phase-wise Implementation Plan

> **Project**: Resume Shapeshifter — JD-to-Resume Tailoring Engine  
> **Total Duration**: ~15 days (MVP)  
> **Last Updated**: 2026-05-20

---

## Table of Contents

1. [Phase 1: Static Prototype](#phase-1-static-prototype-days-1-3)
2. [Phase 2: LLM Integration](#phase-2-llm-integration-days-4-7)
3. [Phase 3: PDF Export](#phase-3-pdf-export-days-8-10)
4. [Phase 4: Validation & Guardrails](#phase-4-validation--guardrails-days-11-12)
5. [Phase 5: Polish & Demo Prep](#phase-5-polish--demo-prep-days-13-15)
6. [Dependency Graph](#dependency-graph)
7. [Effort Summary](#effort-summary)

---

## Phase 1: Static Prototype (Days 1–3)

**Goal**: Build the UI shell and demonstrate the full user flow with hardcoded mock data. By the end of this phase, the app should render a side-by-side comparison in the browser using static/resolved JSON.

### Day 1: Project Scaffolding & Foundation

| # | Task | Files to Create/Modify | Acceptance Criteria | Dependencies |
|---|------|------------------------|---------------------|--------------|
| 1.1 | Initialize Next.js project with TypeScript, Tailwind CSS | `package.json`, `next.config.js`, `tsconfig.json`, `tailwind.config.ts`, `app/globals.css` | `npm run dev` starts successfully, displays default Next.js page | None |
| 1.2 | Install and configure Shadcn UI | `components/ui/*`, `lib/utils.ts` | Button, Card, Badge components render correctly | 1.1 |
| 1.3 | Install Zod dependency | `package.json` | Zod importable in code | 1.1 |
| 1.4 | Define all TypeScript interfaces and Zod schemas | `lib/schemas.ts` | All 6 schemas (`ResumeProfile`, `JobDescriptionProfile`, `MatchScore`, `TailoredResume`, `ResumeGap`, `TailoringRun`) compile without errors | 1.3 |
| 1.5 | Create project directory structure | `app/`, `components/`, `lib/`, `prompts/`, `types/`, `public/sample/`, `tests/` | Empty files/folders exist matching architecture.md §9 | 1.1 |
| 1.6 | Set up root layout with Header component | `app/layout.tsx`, `components/Header.tsx` | Layout renders with app title, basic navigation skeleton | 1.2 |

### Day 2: Input UI & Mock Data

| # | Task | Files to Create/Modify | Acceptance Criteria | Dependencies |
|---|------|------------------------|---------------------|--------------|
| 2.1 | Build `ResumeInput` component (textarea-based) | `components/ResumeInput.tsx` | Textarea accepts and displays pasted text; state lifts to parent | 1.2 |
| 2.2 | Build `JDInput` component (textarea-based) | `components/JDInput.tsx` | Textarea accepts and displays pasted text; state lifts to parent | 1.2 |
| 2.3 | Build `AnalyzeButton` component with loading spinner | `components/AnalyzeButton.tsx` | Button shows spinner when `isLoading` prop is true; disabled state works | 1.2 |
| 2.4 | Create mock data files for a sample resume and JD | `public/sample/sample-resume.txt`, `public/sample/sample-jd.txt` | Both files contain realistic, multi-paragraph content | None |
| 2.5 | Build `ScoreCard` component with hardcoded mock data | `components/ScoreCard.tsx` | Displays overall score (0–100 gauge), sub-scores, and explanation text | 1.2 |
| 2.6 | Build `JDRequirementsSummary` component with hardcoded mock data | `components/JDRequirementsSummary.tsx` | Shows job title, company, required/preferred skills as badges, responsibilities as list | 1.2 |
| 2.7 | Build `GapCard` and `GapAnalysis` components with hardcoded mock data | `components/GapCard.tsx`, `components/GapAnalysis.tsx` | Renders list of gaps with importance badges, evidence excerpts, and suggested actions | 1.2 |
| 2.8 | Assemble main page combining ResumeInput, JDInput, AnalyzeButton, ScoreCard, JDRequirementsSummary, GapAnalysis | `app/page.tsx` | All components render in correct layout order; AnalyzeButton visually connects to mock data area | 2.1–2.7 |

### Day 3: Side-by-Side Comparison & Full Flow

| # | Task | Files to Create/Modify | Acceptance Criteria | Dependencies |
|---|------|------------------------|---------------------|--------------|
| 3.1 | Build `BulletItem` component | `components/BulletItem.tsx` | Displays bullet text, optional change reason tooltip, keywords-addressed badges, confidence label | 1.2 |
| 3.2 | Build `SideBySideColumns` component with hardcoded mock tailored data | `components/SideBySideColumns.tsx` | Two-column layout: original (left) and tailored (right). Changed bullets are highlighted. Each bullet uses `BulletItem` | 3.1 |
| 3.3 | Build `ScoreComparisonBar` component | `components/ScoreComparisonBar.tsx` | Shows original score and tailored score side by side with an improvement arrow | 1.2, 2.5 |
| 3.4 | Build `PDFExportButton` placeholder (disabled, no-op) | `components/PDFExportButton.tsx` | Button renders and is clickable but shows "Coming Soon" toast or disabled state | 1.2 |
| 3.5 | Build `LoadingState` component | `components/LoadingState.tsx` | Skeleton loading placeholders for ScoreCard, GapAnalysis, SideBySideColumns | 1.2 |
| 3.6 | Integrate all components into main app page with tabbed/multi-step UI | `app/page.tsx` (modify) | Three-step flow: Input → Analysis Results → Side-by-Side Comparison. Hardcoded mock data renders correctly at each step | 3.1–3.5 |
| 3.7 | Create `types/index.ts` re-exporting all schemas | `types/index.ts` | All types importable via `import { ResumeProfile } from '@/types'` | 1.4 |
| 3.8 | **Acceptance Test**: Manual walkthrough of full static flow | — | User can paste resume + JD text (or use sample), click Analyze, see scores + gaps + mock tailored comparison on screen | 3.6 |

**Phase 1 Deliverables**: Working UI with hardcoded mock data demonstrating the complete user flow from input to side-by-side comparison.

---

## Phase 2: LLM Integration (Days 4–7)

**Goal**: Replace mock data with real LLM-powered analysis using Groq API. By the end of this phase, the app processes real resume + JD text and returns live scores, gaps, and rewrites.

### Day 4: LLM Client & Prompt Templates

| # | Task | Files to Create/Modify | Acceptance Criteria | Dependencies |
|---|------|------------------------|---------------------|--------------|
| 4.1 | Install Groq SDK | `package.json` | `import Groq from 'groq-sdk'` works | 1.1 |
| 4.2 | Create `.env.local` and `.env.example` with `GROQ_API_KEY` | `.env.local` (gitignored), `.env.example` | App reads `process.env.GROQ_API_KEY` at runtime | None |
| 4.3 | Build LLM client wrapper with retry logic, error handling, and structured output parsing | `lib/llm.ts` | `callLLM(prompt, schema): T` function works; retries on failure (max 2); returns typed Zod-validated object | 4.1, 1.4 |
| 4.4 | Write JD extraction prompt template | `prompts/jd-extraction.ts` | Prompt asks LLM to output valid JSON matching `JobDescriptionProfile` schema; includes universal system instructions | 1.4 |
| 4.5 | Write resume parser prompt template | `prompts/resume-parser.ts` | Prompt asks LLM to structure raw resume text into `ResumeProfile` JSON | 1.4 |
| 4.6 | Write match scoring prompt template | `prompts/match-scoring.ts` | Prompt asks LLM to score resume against JD and return `MatchScore` JSON with explanation | 1.4 |
| 4.7 | Write bullet rewriter prompt template | `prompts/bullet-rewriter.ts` | Prompt asks LLM to rewrite individual bullets with metadata (`TailoredBullet`), includes per-bullet change reason and confidence | 1.4 |
| 4.8 | Write gap analysis prompt template | `prompts/gap-analysis.ts` | Prompt asks LLM to identify gaps between resume and JD, output `ResumeGap[]` | 1.4 |
| 4.9 | Build prompt loader utility | `lib/prompts.ts` | `loadPrompt(name, context): string` loads a prompt template and injects context variables | 4.4–4.8 |

### Day 5: Service Implementations

| # | Task | Files to Create/Modify | Acceptance Criteria | Dependencies |
|---|------|------------------------|---------------------|--------------|
| 5.1 | Implement `ResumeParserService.parseText()` | `lib/resume-parser.ts` | Accepts raw text string, calls LLM via prompt, returns validated `ResumeProfile` | 4.5, 4.9, 4.3 |
| 5.2 | Implement `JDParserService.parse()` | `lib/jd-parser.ts` | Accepts JD text string, calls LLM via prompt, returns validated `JobDescriptionProfile` | 4.4, 4.9, 4.3 |
| 5.3 | Implement `MatchScorerService.score()` | `lib/scoring.ts` | Accepts `ResumeProfile` + `JobDescriptionProfile`, calls LLM, returns validated `MatchScore` | 4.6, 4.9, 4.3 |
| 5.4 | Implement `BulletRewriterService.rewriteBullets()` | `lib/bullet-rewriter.ts` | Accepts experience bullets array + JD context, calls LLM, returns `TailoredBullet[]` | 4.7, 4.9, 4.3 |
| 5.5 | Implement `GapAnalyzerService.analyze()` | `lib/gap-analyzer.ts` | Accepts `ResumeProfile` + `JobDescriptionProfile`, calls LLM, returns `ResumeGap[]` | 4.8, 4.9, 4.3 |
| 5.6 | Write unit tests for each service with mock LLM responses | `tests/lib/resume-parser.test.ts`, `tests/lib/jd-parser.test.ts`, `tests/lib/scoring.test.ts` | Tests pass with mock LLM responses; validation failures are caught correctly | 5.1–5.5, 1.4 |

### Day 6: Orchestrator & API Routes

| # | Task | Files to Create/Modify | Acceptance Criteria | Dependencies |
|---|------|------------------------|---------------------|--------------|
| 6.1 | Implement `ServiceOrchestrator.run()` | `lib/orchestrator.ts` | Runs full pipeline: parse → score → gaps → rewrite → re-score. Returns `TailoringRun`. Zod validates every step output | 5.1–5.5 |
| 6.2 | Create `POST /api/parse-resume` route | `app/api/parse-resume/route.ts` | Accepts `{ text }` in body, returns `{ resume, warnings }`. Handles empty/malformed input with 400 | 5.1 |
| 6.3 | Create `POST /api/parse-jd` route | `app/api/parse-jd/route.ts` | Accepts `{ text }` in body, returns `{ jd }`. Handles empty input with 400 | 5.2 |
| 6.4 | Create `POST /api/analyze` route | `app/api/analyze/route.ts` | Accepts `{ resumeText, jdText }`, returns `{ resume, jd, originalScore, gaps }`. Calls orchestrator steps 1–4 | 6.1 |
| 6.5 | Create `POST /api/tailor` route | `app/api/tailor/route.ts` | Accepts `{ resumeText, jdText }`, returns full `{ tailoringRun }`. Calls orchestrator full pipeline | 6.1 |
| 6.6 | Add API error handling middleware | `app/api/middleware.ts` (or per-route) | Catches Zod validation errors, LLM failures, returns structured `{ error, step, details }` responses | 6.2–6.5 |
| 6.7 | Write API integration tests | `tests/lib/scoring.test.ts` (append) | Test each route with valid/invalid input; verify error response format | 6.2–6.6 |

### Day 7: Wire Frontend to Backend

| # | Task | Files to Create/Modify | Acceptance Criteria | Dependencies |
|---|------|------------------------|---------------------|--------------|
| 7.1 | Create `lib/api-client.ts` — typed fetch wrapper for all API routes | `lib/api-client.ts` | `parseResume(text)`, `parseJD(text)`, `analyze(resumeText, jdText)`, `tailor(resumeText, jdText)` functions return typed responses | 6.2–6.5 |
| 7.2 | Wire `AnalyzeButton` click → call `/api/analyze` → display real results | `app/page.tsx`, `components/AnalyzeButton.tsx` (modify) | Clicking Analyze with real text calls API, shows loading state, then displays live ScoreCard, JDRequirementsSummary, GapAnalysis | 7.1, 3.6 |
| 7.3 | Add "Generate Tailored Resume" button after analysis completes → call `/api/tailor` | `app/page.tsx` (modify) | After analysis, a new button appears. Clicking it calls tailor endpoint; loading state shown | 7.1 |
| 7.4 | Display live tailored results in `SideBySideColumns` after tailor API returns | `app/page.tsx` (modify) | SideBySideColumns renders with live tailored bullets. ScoreComparisonBar updates with before/after scores | 7.3, 3.2, 3.3 |
| 7.5 | Handle API errors in the UI (toast/error banner) | `components/ErrorBanner.tsx`, `app/page.tsx` (modify) | If any API call fails, user sees a clear error message with retry option | 7.2 |
| 7.6 | **Acceptance Test**: Test with sample resume + real JD from a live job posting | — | Live scores, gaps, and rewritten bullets render correctly. Side-by-side comparison is meaningful | 7.4 |

**Phase 2 Deliverables**: Fully functional app with live LLM-powered resume analysis, scoring, gap detection, and bullet rewriting displayed in the browser.

---

## Phase 3: PDF Export (Days 8–10)

**Goal**: Generate downloadable PDF artifacts — a tailored resume PDF and a side-by-side comparison PDF with highlights, scores, and gap analysis.

### Day 8: PDF Generation Setup

| # | Task | Files to Create/Modify | Acceptance Criteria | Dependencies |
|---|------|------------------------|---------------------|--------------|
| 8.1 | Install Playwright (or React-PDF) | `package.json` | `npx playwright install` downloads Chromium; PDF renderer works | 1.1 |
| 8.2 | Create PDF generation utility with HTML template rendering | `lib/pdf.ts` | Helper functions to render React components to HTML string, then convert to PDF buffer. Basic "Hello World" PDF generates | 8.1 |
| 8.3 | Design and implement the tailored resume PDF template | `lib/pdf-templates/tailored-resume.tsx` | Single-column resume layout with: contact header, summary, skills, experience sections with rewritten bullets, education, certifications, footer with disclaimer | 8.2 |
| 8.4 | Implement `generateTailoredPDF(tailoringRun): Buffer` | `lib/pdf.ts` (extend) | Takes `TailoringRun`, renders tailored resume template, returns PDF buffer. All sections populated correctly | 8.3 |

### Day 9: Side-by-Side Comparison PDF

| # | Task | Files to Create/Modify | Acceptance Criteria | Dependencies |
|---|------|------------------------|---------------------|--------------|
| 9.1 | Design and implement the side-by-side comparison PDF template | `lib/pdf-templates/comparison.tsx` | Two-column layout: original (left) vs tailored (right). Header with job title + company. Score before/after bar. Changed bullets highlighted with background color. Reason for change noted inline | 8.2 |
| 9.2 | Add JD requirements summary section to comparison PDF | `lib/pdf-templates/comparison.tsx` (extend) | Compact box listing: job title, company, required skills (badges), preferred skills (badges), top responsibilities | 9.1 |
| 9.3 | Add gap analysis section to comparison PDF | `lib/pdf-templates/comparison.tsx` (extend) | Table with columns: Gap Name, Importance (color-coded), Suggested Action. If too many gaps, show top 5 with "See full analysis" note | 9.1 |
| 9.4 | Add footer with truthfulness disclaimer to both PDFs | `lib/pdf-templates/shared/footer.tsx` | Both PDFs include: "⚠️ This tailored resume was generated by Resume Shapeshifter. The user is responsible for verifying all content for accuracy before submitting it to any employer." | 9.1, 8.3 |
| 9.5 | Implement `generateComparisonPDF(tailoringRun): Buffer` | `lib/pdf.ts` (extend) | Takes `TailoringRun`, renders comparison template, returns PDF buffer. All sections populated | 9.1–9.4 |

### Day 10: Export API & UI Integration

| # | Task | Files to Create/Modify | Acceptance Criteria | Dependencies |
|---|------|------------------------|---------------------|--------------|
| 10.1 | Create `POST /api/export/pdf` route | `app/api/export/pdf/route.ts` | Accepts `{ tailoringRun }` or `{ tailoringRunId }` + `{ type: 'tailored' | 'comparison' }`, returns PDF binary stream with correct Content-Type and Content-Disposition headers | 8.4, 9.5 |
| 10.2 | Implement client-side PDF download via blob | `lib/api-client.ts` (extend) | `exportPDF(tailoringRun, type): Promise<Blob>` fetches PDF, returns Blob | 10.1 |
| 10.3 | Wire `PDFExportButton` to call export API and trigger browser download | `components/PDFExportButton.tsx` (modify) | Two buttons: "Download Tailored Resume" and "Download Side-by-Side Comparison". Clicking either calls API, downloads file with descriptive filename (e.g., `resume-shapeshifter-comparison.pdf`) | 10.2 |
| 10.4 | Show download progress/status indicator | `components/PDFExportButton.tsx` (modify) | Button shows "Generating PDF..." during API call, then "Download Complete" or error state | 10.3 |
| 10.5 | **Acceptance Test**: Export both PDFs with live data | — | Both PDFs generate correctly: tailored resume has rewritten bullets, comparison PDF has two columns with highlights, scores, gaps, and disclaimer | 10.3 |

**Phase 3 Deliverables**: Two downloadable PDF artifacts — tailored resume and side-by-side comparison — generated from live analysis results.

---

## Phase 4: Validation & Guardrails (Days 11–12)

**Goal**: Strengthen truthfulness, reliability, and user confidence in the generated output.

### Day 11: Output Validation & Retry Logic

| # | Task | Files to Create/Modify | Acceptance Criteria | Dependencies |
|---|------|------------------------|---------------------|--------------|
| 11.1 | Enhance LLM client with structured JSON mode (Groq `response_format: { type: "json_object" }`) | `lib/llm.ts` (modify) | All LLM calls use JSON mode for reliable structured output | 4.3 |
| 11.2 | Add Zod validation for every LLM response with context-rich error messages | `lib/llm.ts` (modify) | On validation failure, error includes: which field failed, expected vs actual type, example of correct format. Error is fed back to LLM for retry | 11.1, 1.4 |
| 11.3 | Implement retry logic (max 2 attempts) with error feedback | `lib/llm.ts` (modify) | If first response fails Zod validation, send error message + original prompt to LLM for corrected output. If second also fails, throw structured error | 11.2 |
| 11.4 | Add per-bullet confidence labels and risk flags | `lib/bullet-rewriter.ts` (modify), `prompts/bullet-rewriter.ts` (modify) | Every `TailoredBullet` has `confidence: "high" | "medium" | "low"` and optional `riskFlag` string. Prompt enforces these fields | 5.4, 4.7 |
| 11.5 | Implement unsourced-claim detection service | `lib/unsourced-claim-detector.ts` | Post-hoc check: extracts all JD keywords from a tailored bullet, checks if any keyword (or synonym) exists in original resume. Flags mismatches as `riskFlag` | 11.4 |
| 11.6 | Integrate unsourced-claim detection into orchestrator | `lib/orchestrator.ts` (modify) | After bullet rewriting, runs claim detection on each bullet. Adds flags to `TailoredBullet.riskFlag` | 11.5, 6.1 |

### Day 12: User-Facing Guardrails & Confirmation Flow

| # | Task | Files to Create/Modify | Acceptance Criteria | Dependencies |
|---|------|------------------------|---------------------|--------------|
| 12.1 | Display confidence labels and risk flags in the BulletItem UI | `components/BulletItem.tsx` (modify) | Each bullet shows: confidence badge (green/yellow/red) and risk flag warning tooltip if present | 11.4, 3.1 |
| 12.2 | Add "Low Confidence" warning banner at top of side-by-side view | `components/SideBySideColumns.tsx` (modify) | If any bullet has `confidence: "low"`, a warning banner appears: "⚠️ Some rewrites have low confidence. Please review carefully." | 12.1 |
| 12.3 | Add user confirmation checkboxes for low-confidence rewrites | `components/BulletItem.tsx` (modify) | Low-confidence bullets show a checkbox: "I confirm this rewrite is accurate." Export buttons disabled until all low-confidence bullets are confirmed | 12.1 |
| 12.4 | Add truthfulness disclaimer to the export section | `components/ExportSection.tsx`, `app/page.tsx` (modify) | Before export buttons, display disclaimer text. Export buttons are disabled until user checks "I have reviewed and verified all content" | 12.3 |
| 12.5 | Add disclaimer to API PDF export endpoint | `lib/pdf.ts`, `lib/pdf-templates/shared/footer.tsx` | Both PDFs include prominent disclaimer; API route logs a warning if user confirmation flag is missing | 9.4, 10.1 |
| 12.6 | **Acceptance Test**: Deliberately craft a resume where rewrites would be low-confidence | — | Low-confidence bullets are flagged, user confirmation flow works, export is blocked until confirmed. PDFs include all disclaimers | 12.3–12.5 |

**Phase 4 Deliverables**: Truthfulness guardrails at every layer — LLM instructions, output validation, confidence labels, risk flags, user confirmation checkboxes, and export disclaimers.

---

## Phase 5: Polish & Demo Prep (Days 13–15)

**Goal**: Production-quality UI, comprehensive error handling, sample data for demos, and polished documentation.

### Day 13: UI Polish & Responsive Design

| # | Task | Files to Create/Modify | Acceptance Criteria | Dependencies |
|---|------|------------------------|---------------------|--------------|
| 13.1 | Add smooth page transitions between input/analysis/comparison steps | `app/page.tsx`, `components/StepTransition.tsx` | Animated transitions (fade/slide) between the three steps of the workflow | 3.6 |
| 13.2 | Improve responsive layout for mobile/tablet/desktop | `app/globals.css`, all component CSS | Side-by-side columns stack vertically on mobile. Score gauges resize. Touch-friendly buttons and inputs | 3.6 |
| 13.3 | Add dark mode support | `app/layout.tsx`, `components/ThemeToggle.tsx`, tailwind.config.ts | Toggle between light and dark themes; persists preference in localStorage | 13.2 |
| 13.4 | Add accessibility labels and keyboard navigation | All components | All interactive elements have `aria-label`, focus states visible, tab order is logical | 13.2 |
| 13.5 | Add tooltip explanations for key terms (Match Score, Confidence, etc.) | `components/ScoreCard.tsx`, `components/BulletItem.tsx`, `components/GapCard.tsx` | Hovering over score or confidence badge shows tooltip with definition. Use glossary from architecture.md §Appendix B | 12.1, 2.5, 2.7 |

### Day 14: Sample Data, Error Handling & Loading States

| # | Task | Files to Create/Modify | Acceptance Criteria | Dependencies |
|---|------|------------------------|---------------------|--------------|
| 14.1 | Create realistic sample resume and JD for one-click demo | `public/sample/sample-resume.txt`, `public/sample/sample-jd.txt` (refine) | Resume and JD are realistic, multi-paragraph, and produce meaningful analysis results. "Load Sample" button copies them into input fields | 2.4 |
| 14.2 | Add "Load Sample Data" button to the input page | `components/LoadSampleButton.tsx`, `app/page.tsx` (modify) | One click fills both textareas with sample resume and JD from public/sample/ files | 14.1 |
| 14.3 | Add per-step loading skeletons | `components/LoadingState.tsx` (modify) | During analysis: skeleton for ScoreCard, then JDRequirementsSummary, then GapAnalysis. During tailoring: skeleton for SideBySideColumns | 3.5, 7.2 |
| 14.4 | Add comprehensive error states | `components/ErrorBanner.tsx`, `components/ErrorBoundary.tsx` | Network errors, LLM errors, validation errors each have distinct, helpful error messages with retry/cancel options | 7.5 |
| 14.5 | Add empty state illustrations | `components/EmptyState.tsx` | Input page shows helpful prompt text: "Paste your resume above to get started" with illustration | 3.6 |
| 14.6 | Handle edge cases in orchestrator | `lib/orchestrator.ts` (modify) | Empty resume → graceful error. Empty JD → graceful error. Very long resume → truncation warning. Very short resume → low-confidence warning | 6.1 |

### Day 15: Documentation, README & Demo Walkthrough

| # | Task | Files to Create/Modify | Acceptance Criteria | Dependencies |
|---|------|------------------------|---------------------|--------------|
| 15.1 | Write comprehensive README.md | `README.md` | Includes: project description, architecture overview, setup instructions (`npm install`, `cp .env.example .env.local`, add API key, `npm run dev`), usage guide, sample data instructions, tech stack list | All phases |
| 15.2 | Add inline code comments for all lib/ modules | `lib/*.ts` | Every exported function has JSDoc with description, params, returns, and example | All lib/ tasks |
| 15.3 | Document environment variables | `.env.example` | All env vars listed with descriptions and example values | 4.2 |
| 15.4 | Create demo walkthrough script | `docs/demo-walkthrough.md` | Step-by-step demo guide: (1) open app, (2) load sample data, (3) click Analyze, (4) review scores and gaps, (5) generate tailored resume, (6) review side-by-side, (7) export PDFs. Screenshots optional | 14.1 |
| 15.5 | Prepare demo with a real, live job listing | — | Pick a current real job posting, paste it into the app with a matching sample resume, produce the full output (scores, gaps, tailored resume, PDFs) | All phases |
| 15.6 | Record or screenshot final demo output | `docs/demo-output/` | Screenshots of: input page, analysis results, side-by-side comparison, exported PDF pages | 15.5 |
| 15.7 | **Final Acceptance Test**: Full end-to-end workflow with a real JD | — | All 10 acceptance criteria from problem statement §12 pass: paste resume → paste JD → analyze → see score → see JD requirements → see gaps → generate tailored resume → see side-by-side → see tailored score → export PDF | 15.5 |

**Phase 5 Deliverables**: Polished, production-ready application with sample data demo, comprehensive error handling, responsive design, and complete documentation.

---

## Dependency Graph

```
Phase 1 ──────────────────────────────────────────────────────────┐
  Day 1 (Scaffolding)                                              │
    ↓                                                              │
  Day 2 (Input UI + Mock Data)                                     │
    ↓                                                              │
  Day 3 (Side-by-Side + Full Flow) ────────────────────────────────┤
                                                                    │
Phase 2 ──────────────────────────────────────────────────────────┤
  Day 4 (LLM Client + Prompts)                                     │
    ↓                                                              │
  Day 5 (Service Implementations) ──── depends on: Day 4           │
    ↓                                                              │
  Day 6 (Orchestrator + API Routes) ──── depends on: Day 5         │
    ↓                                                              │
  Day 7 (Wire Frontend) ──── depends on: Day 6, Phase 1            │
                                                                    │
Phase 3 ──────────────────────────────────────────────────────────┤
  Day 8 (PDF Setup + Tailored Resume) ──── depends on: Phase 2     │
    ↓                                                              │
  Day 9 (Side-by-Side PDF) ──── depends on: Day 8                  │
    ↓                                                              │
  Day 10 (Export API + UI) ──── depends on: Day 9, Phase 2         │
                                                                    │
Phase 4 ──────────────────────────────────────────────────────────┤
  Day 11 (Validation + Retry Logic) ──── depends on: Phase 2       │
    ↓                                                              │
  Day 12 (User Guardrails + Confirmation) ──── depends on: Day 11   │
                                                                    │
Phase 5 ──────────────────────────────────────────────────────────┤
  Day 13 (UI Polish) ──── depends on: Phase 3, Phase 4             │
    ↓                                                              │
  Day 14 (Samples + Error Handling) ──── depends on: Day 13        │
    ↓                                                              │
  Day 15 (Docs + Demo) ──── depends on: Day 14                     │
```

### Parallel Execution Possibilities

| Phase 1 path | Can run in parallel with |
|---|---|
| Day 4 (LLM Client) | Day 1–3 (if team > 1 person) |
| Day 8 (PDF Setup) | Day 4–7 (if team > 1 person) |
| Day 11 (Validation Logic) | Day 8–10 (if team > 1 person) |

---

## Effort Summary

| Phase | Days | Tasks | Files Created/Modified | Key Deliverable |
|-------|------|-------|------------------------|-----------------|
| Phase 1: Static Prototype | 3 (Days 1–3) | 22 | ~20 files | Working UI with hardcoded mock data |
| Phase 2: LLM Integration | 4 (Days 4–7) | 26 | ~30 files | Live LLM-powered analysis and rewriting |
| Phase 3: PDF Export | 3 (Days 8–10) | 15 | ~12 files | Two downloadable PDF artifacts |
| Phase 4: Validation & Guardrails | 2 (Days 11–12) | 12 | ~8 files | Truthfulness guardrails and user confirmation flow |
| Phase 5: Polish & Demo | 3 (Days 13–15) | 20 | ~15 files | Production-quality app with demo documentation |
| **Total (MVP)** | **15 days** | **95** | **~85 files** | **Complete Resume Shapeshifter MVP** |

---

## Quick-Reference: Files by Phase

### Phase 1 — New Files
```
app/layout.tsx
app/page.tsx
app/globals.css
components/ui/button.tsx
components/ui/card.tsx
components/ui/badge.tsx
components/ui/accordion.tsx
components/ui/tooltip.tsx
components/ui/progress.tsx
components/ui/skeleton.tsx
components/Header.tsx
components/ResumeInput.tsx
components/JDInput.tsx
components/AnalyzeButton.tsx
components/ScoreCard.tsx
components/JDRequirementsSummary.tsx
components/GapAnalysis.tsx
components/GapCard.tsx
components/SideBySideColumns.tsx
components/BulletItem.tsx
components/ScoreComparisonBar.tsx
components/PDFExportButton.tsx
components/LoadingState.tsx
lib/schemas.ts
lib/utils.ts
types/index.ts
public/sample/sample-resume.txt
public/sample/sample-jd.txt
next.config.js
tailwind.config.ts
tsconfig.json
package.json
```

### Phase 2 — New Files
```
lib/llm.ts
lib/prompts.ts
lib/resume-parser.ts
lib/jd-parser.ts
lib/scoring.ts
lib/bullet-rewriter.ts
lib/gap-analyzer.ts
lib/orchestrator.ts
lib/api-client.ts
prompts/jd-extraction.ts
prompts/resume-parser.ts
prompts/match-scoring.ts
prompts/bullet-rewriter.ts
prompts/gap-analysis.ts
app/api/parse-resume/route.ts
app/api/parse-jd/route.ts
app/api/analyze/route.ts
app/api/tailor/route.ts
components/ErrorBanner.tsx
.env.local
.env.example
tests/lib/resume-parser.test.ts
tests/lib/jd-parser.test.ts
tests/lib/scoring.test.ts
```

### Phase 3 — New Files
```
lib/pdf.ts
lib/pdf-templates/tailored-resume.tsx
lib/pdf-templates/comparison.tsx
lib/pdf-templates/shared/footer.tsx
app/api/export/pdf/route.ts
```

### Phase 4 — New Files
```
lib/unsourced-claim-detector.ts
```

### Phase 5 — New Files
```
components/LoadSampleButton.tsx
components/ErrorBoundary.tsx
components/EmptyState.tsx
components/StepTransition.tsx
components/ThemeToggle.tsx
README.md
docs/demo-walkthrough.md
docs/demo-output/ (directory)
```

---

> *This implementation plan is derived from the architecture.md document. Each phase builds on the previous one, with clear acceptance criteria for every task. Adjust timeline estimates based on team size and experience level.*