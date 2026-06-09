# Resume Shapeshifter — Architecture Document

> **Project**: Resume Shapeshifter — JD-to-Resume Tailoring Engine  
> **Status**: MVP Planning  
> **Last Updated**: 2026-05-20

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [High-Level System Architecture](#2-high-level-system-architecture)
3. [Core Data Flow](#3-core-data-flow)
4. [Data Models & Zod Schemas](#4-data-models--zod-schemas)
5. [Module / Service Breakdown](#5-module--service-breakdown)
6. [API Route Design](#6-api-route-design)
7. [LLM Prompt Architecture](#7-llm-prompt-architecture)
8. [Frontend Component Tree](#8-frontend-component-tree)
9. [Directory Structure](#9-directory-structure)
10. [Security & Truthfulness Guardrails](#10-security--truthfulness-guardrails)
11. [Implementation Phases](#11-implementation-phases)
12. [Risks & Mitigations](#12-risks--mitigations)

---

## 1. Project Overview

**Resume Shapeshifter** is a JD-to-resume tailoring engine. A user provides a job description and an existing resume, and the system generates a tailored version of the resume that better aligns with the job listing while preserving truthfulness and the user's actual experience.

### Core Value Proposition

Given a resume and a job description, the product answers:

1. **How well does this resume match the job?**
2. **What should be changed to improve the match?**
3. **Which bullets can be rewritten truthfully?**
4. **What gaps remain after tailoring?**
5. **What does the original vs tailored resume look like side by side?**

### Target Users

- **Primary**: Job seekers, students/early-career professionals, mid-career professionals.
- **Secondary**: Career coaches, resume reviewers, bootcamp placement teams, university career centers.

### Key Principles

- **Truthfulness**: Never fabricate experience. Rewrite bullets based on existing resume content only.
- **Explainability**: Every score, gap, and rewrite includes a clear rationale.
- **Actionability**: Gap analysis provides concrete suggested actions, not just flags.
- **Exporability**: Side-by-side PDF is the main proof artifact.

---

## 2. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ Resume   │  │  JD      │  │  Side-by-Side        │  │
│  │ Input    │  │  Input   │  │  Comparison View      │  │
│  └────┬─────┘  └────┬─────┘  └──────────────────────┘  │
│       │              │         ┌──────────────────────┐  │
│       └──────┬───────┘         │  PDF Export          │  │
│              │                 │  (Playwright/PDF)    │  │
│              ▼                 └──────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                        │  HTTP / JSON
                        ▼
┌──────────────────────────────────────────────────────────┐
│                NEXT.JS API LAYER                          │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │ /api/parse-  │  │ /api/parse-  │  │ /api/analyze  │ │
│  │ resume       │  │ jd           │  │               │ │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘ │
│         │                 │                   │         │
│  ┌──────┴─────────────────┴───────────────────┴───────┐ │
│  │              Service Orchestrator                    │ │
│  │   (Coordinates parsing → scoring → tailoring)       │ │
│  └────────────────────────┬────────────────────────────┘ │
└───────────────────────────┼──────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
┌─────────────────┐ ┌──────────────┐ ┌──────────────┐
│  LLM Service    │ │  PDF Gen     │ │  Validation  │
│  (Groq API)     │ │  Service     │ │  (Zod)       │
│  - JD Extract   │ │  - Tailored  │ │               │
│  - Resume Parse │ │    Resume    │ │               │
│  - Match Score  │ │  - Side-by-  │ │               │
│  - Bullet Rewr. │ │    Side      │ │               │
│  - Gap Analysis │ │              │ │               │
└─────────────────┘ └──────────────┘ └──────────────┘
```

### Technology Stack

| Layer          | Technology Choices                                                                 |
|----------------|-----------------------------------------------------------------------------------|
| Frontend       | Next.js (App Router), React, TypeScript, Tailwind CSS, Shadcn UI                  |
| Backend        | Next.js API Routes (or Python FastAPI for document processing)                    |
| LLM            | Groq API (Llama 3.3-70B, Mixtral 8x7B, or Gemma 2-9B)                             |
| Validation     | Zod schemas for all data models                                                   |
| PDF Generation | Playwright PDF, React-PDF, or Puppeteer                                           |
| Document Parse | `pdf-parse`, `mammoth` (JS), or PyMuPDF/python-docx (Python)                      |
| Storage (MVP)  | Local/session-based (in-memory or localStorage). Optional: SQLite / Supabase      |

---

## 3. Core Data Flow

### Full Pipeline (Input → Export)

```
Resume Text/File ─┐
                  ├──▶ [1] Resume Parser ──▶ ResumeProfile (JSON)
                  │
JD Text ──────────┤
                  └──▶ [2] JD Parser ──────▶ JobDescriptionProfile (JSON)
                                            │
                                            ▼
                                    [3] Match Scorer ──▶ Original MatchScore
                                            │
                                            ▼
                         ┌───────────┬───────────┬──────────┐
                         ▼           ▼           ▼          ▼
                    [4] Bullet   [5] Gap    [6] Summary  [7] Skills
                     Rewriter    Analyzer   Rewriter    Reorderer
                         │           │           │          │
                         └───────────┴───────────┴──────────┘
                                     │
                                     ▼
                            [8] Tailored Resume Assembler
                                     │
                          ┌──────────┴──────────┐
                          ▼                     ▼
                  [9] Tailored Match       [10] PDF Generator
                      Scorer                    │
                          │           ┌─────────┴──────────┐
                          ▼           ▼                    ▼
                  TailoredScore    TailoredResume.pdf   SideBySide.pdf
```

### Step Details

| Step | Name | Input | Output | Method |
|------|------|-------|--------|--------|
| 1 | Resume Parser | Raw resume text/PDF/DOCX | `ResumeProfile` | LLM (Groq) + file parsing lib |
| 2 | JD Parser | JD text | `JobDescriptionProfile` | LLM (Groq) extraction |
| 3 | Match Scorer | ResumeProfile + JDProfile | `MatchScore` (original) | LLM (Groq) + keyword scoring |
| 4 | Bullet Rewriter | Experience bullets + JD | `TailoredBullet[]` | LLM (Groq) per-bullet rewrite |
| 5 | Gap Analyzer | ResumeProfile + JDProfile | `ResumeGap[]` | LLM (Groq) gap detection |
| 6 | Summary Rewriter | Resume summary + JD | Tailored summary string | LLM (Groq) rewrite |
| 7 | Skills Reorderer | Skills list + JD skills | Reordered skills list | Algorithm + LLM (Groq) |
| 8 | Tailored Assembler | All tailored parts | `TailoredResume` | Merge + schema validate |
| 9 | Tailored Match Scorer | TailoredResume + JDProfile | `MatchScore` (tailored) | LLM (Groq) + keyword scoring |
| 10 | PDF Generator | TailoredResume + Original + Scores | PDF buffer | Playwright/Puppeteer |

---

## 4. Data Models & Zod Schemas

All major objects should be typed with TypeScript interfaces and Zod schemas for runtime validation.

### 4.1 ResumeProfile

```typescript
interface ResumeProfile {
  contact: {
    name?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    location?: string;
  };
  summary?: string;
  skills: string[];
  experience: ResumeExperience[];
  projects: ResumeProject[];
  education: ResumeEducation[];
  certifications: ResumeCertification[];
}

interface ResumeExperience {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

interface ResumeProject {
  name: string;
  description: string;
  technologies: string[];
  bullets: string[];
}

interface ResumeEducation {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

interface ResumeCertification {
  name: string;
  issuer: string;
  date: string;
}
```

### 4.2 JobDescriptionProfile

```typescript
interface JobDescriptionProfile {
  jobTitle: string;
  company?: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  qualifications: string[];
  tools: string[];
  keywords: string[];
  seniorityLevel: "entry" | "mid" | "senior" | "lead" | "principal";
  domainSignals: string[];
  softSkills: string[];
}
```

### 4.3 MatchScore

```typescript
interface MatchScore {
  overallScore: number;         // 0–100
  skillCoverageScore: number;   // 0–100
  responsibilityAlignmentScore: number; // 0–100
  keywordScore: number;         // 0–100
  seniorityScore: number;       // 0–100
  criticalMissingRequirements: string[];
  explanation: string;          // Human-readable explanation of the score
}
```

### 4.4 TailoredResume

```typescript
interface TailoredResume {
  tailoredSummary: string;
  tailoredSkills: string[];
  tailoredExperience: TailoredExperience[];
  tailoredProjects: TailoredProject[];
  tailoredEducation: ResumeEducation[];   // Generally unchanged
  tailoredCertifications: ResumeCertification[]; // Generally unchanged
}

interface TailoredExperience {
  company: string;
  title: string;
  bullets: TailoredBullet[];
}

interface TailoredBullet {
  original: string;
  tailored: string;
  changeReason: string;
  keywordsAddressed: string[];
  confidence: "high" | "medium" | "low";
  riskFlag?: string;  // Warning if rewrite may overstate experience
}
```

### 4.5 ResumeGap

```typescript
interface ResumeGap {
  name: string;
  importance: "high" | "medium" | "low";
  jdEvidence: string;         // Excerpt from JD showing the requirement
  resumeEvidence?: string;    // How it's currently represented (or "not found")
  suggestedAction: string;    // e.g., "Add if you have this experience"
  canSafelyAdd: boolean;      // Whether user can add this without fabrication
}
```

### 4.6 TailoringRun (Aggregate Result)

```typescript
interface TailoringRun {
  id: string;
  timestamp: string;
  
  // Inputs
  originalResume: ResumeProfile;
  jobDescription: JobDescriptionProfile;
  
  // Analysis
  originalScore: MatchScore;
  gaps: ResumeGap[];
  
  // Outputs
  tailoredResume: TailoredResume;
  tailoredScore: MatchScore;
  
  // Metadata
  llmModel: string;
  promptVersions: Record<string, string>;
  disclaimers: string[];
}
```

---

## 5. Module / Service Breakdown

### 5.1 ResumeParserService

| Aspect | Detail |
|--------|--------|
| **Input** | Raw text, PDF buffer, or DOCX buffer |
| **Output** | `ResumeProfile` (validated with Zod) |
| **Methods** | `parseText(text): ResumeProfile`, `parsePDF(buffer): ResumeProfile`, `parseDOCX(buffer): ResumeProfile` |
| **Implementation** | Text parsing via LLM (Groq). PDF via `pdf-parse`. DOCX via `mammoth`. |
| **Edge Cases** | Multi-column layouts, non-standard section headers, missing optional fields |

**Behavior**:
- Accept plain text, PDF, or DOCX in MVP (at least one must be supported).
- Preserve logical sections: contact, summary, skills, experience, projects, education, certifications.
- Output structured JSON matching the `ResumeProfile` schema.

### 5.2 JDParserService

| Aspect | Detail |
|--------|--------|
| **Input** | Raw job description text |
| **Output** | `JobDescriptionProfile` (validated with Zod) |
| **Methods** | `parse(jdText): JobDescriptionProfile` |
| **Implementation** | LLM (Groq) extraction prompt with strict JSON output |

**Behavior**:
- Extract job title, company, required/preferred skills, tools, responsibilities, qualifications, seniority level, domain keywords, soft skills.
- Handle vague or overly broad JDs gracefully (mark low-confidence fields).

### 5.3 MatchScorerService

| Aspect | Detail |
|--------|--------|
| **Input** | `ResumeProfile` + `JobDescriptionProfile` |
| **Output** | `MatchScore` |
| **Methods** | `score(resume, jd): MatchScore` |
| **Implementation** | LLM (Groq) scoring prompt + optional keyword overlap algorithm |

**Scoring Dimensions**:
- **Skill Coverage**: What % of required + preferred skills appear in the resume?
- **Responsibility Alignment**: How well do resume bullets match listed responsibilities?
- **Keyword Alignment**: How many domain-specific/seniority keywords match?
- **Seniority Alignment**: Does the resume's career level match JD expectation?
- **Critical Missing**: Deduct for high-importance gaps.

### 5.4 BulletRewriterService

| Aspect | Detail |
|--------|--------|
| **Input** | Experience/project bullets + `JobDescriptionProfile` |
| **Output** | `TailoredBullet[]` |
| **Methods** | `rewriteBullets(bullets, jdContext): TailoredBullet[]` |
| **Implementation** | Per-bullet LLM (Groq) prompt or batched batch prompt |

**Rewrite Rules** (enforced via prompt instructions):
- Preserve the user's actual meaning and experience.
- Improve alignment with the JD.
- Use stronger action verbs.
- Include JD-relevant terminology where truthful.
- Preserve or improve measurable impact when present.
- Never add unsupported claims.
- Mark every rewrite with a confidence level and change reason.

### 5.5 GapAnalyzerService

| Aspect | Detail |
|--------|--------|
| **Input** | `ResumeProfile` + `JobDescriptionProfile` |
| **Output** | `ResumeGap[]` |
| **Methods** | `analyze(resume, jd): ResumeGap[]` |
| **Implementation** | LLM (Groq) gap analysis prompt |

**Gap Categories**:
- Missing required skills.
- Weakly represented required skills.
- Missing tools or technologies.
- Missing domain experience.
- Missing seniority indicators.
- Unsupported JD requirements that should not be invented.

**Suggested Actions**:
- "Add if you have this experience."
- "Leave out if not true."
- "Mention in skills section if familiar."
- "Add a project bullet if applicable."
- "Prepare to address this in interview."

### 5.6 PDFGeneratorService

| Aspect | Detail |
|--------|--------|
| **Input** | `TailoringRun` object |
| **Output** | PDF buffer(s) |
| **Methods** | `generateTailoredPDF(run): PDF`, `generateComparisonPDF(run): PDF` |
| **Implementation** | Playwright (render HTML → PDF) or React-PDF |

**Comparison PDF Layout**:
- **Header**: Job title, company, generation date.
- **Score Summary**: Original match score vs tailored match score (visual bar/tag).
- **JD Requirements Summary**: Condensed extracted requirements.
- **Side-by-Side Content**: Two columns — original resume (left) vs tailored resume (right).
- **Changed Bullets**: Highlighted with background color and a change reason annotation.
- **Gap Analysis Section**: Table of gaps with importance badges and suggested actions.
- **Footer**: Truthfulness disclaimer requiring user verification.

### 5.7 Service Orchestrator

The orchestrator coordinates the full pipeline:

```
Orchestrator.run(resumeText, jdText) → TailoringRun
  1. Parse resume → ResumeProfile
  2. Parse JD → JobDescriptionProfile
  3. Score original → MatchScore (original)
  4. Analyze gaps → ResumeGap[]
  5. Rewrite summaries/bullets → TailoredResume
  6. Score tailored → MatchScore (tailored)
  7. Validate everything with Zod
  8. Return TailoringRun
```

---

## 6. API Route Design

All routes use Next.js API route handlers (`app/api/`).

### 6.1 `POST /api/parse-resume`

**Request**:
```json
{
  "text": "string (optional, alternative to file)",
  "file": "binary (optional, PDF or DOCX)"
}
```

**Response** (200):
```json
{
  "resume": { /* ResumeProfile */ },
  "warnings": ["Possible parsing issues..."]
}
```

### 6.2 `POST /api/parse-jd`

**Request**:
```json
{
  "text": "string (job description text)"
}
```

**Response** (200):
```json
{
  "jd": { /* JobDescriptionProfile */ }
}
```

### 6.3 `POST /api/analyze`

**Request**:
```json
{
  "resumeText": "string",
  "jdText": "string"
}
```

**Response** (200):
```json
{
  "resume": { /* ResumeProfile */ },
  "jd": { /* JobDescriptionProfile */ },
  "originalScore": { /* MatchScore */ },
  "gaps": [ /* ResumeGap[] */ ]
}
```

### 6.4 `POST /api/tailor`

**Request**:
```json
{
  "resumeText": "string",
  "jdText": "string"
}
```

**Response** (200):
```json
{
  "tailoringRun": { /* TailoringRun */ }
}
```

### 6.5 `POST /api/export/pdf`

**Request**:
```json
{
  "tailoringRunId": "string",
  "options": {
    "includeComparisonPnly": false
  }
}
```

**Response** (200): PDF binary stream (`application/pdf`).

---

## 7. LLM Prompt Architecture

### 7.1 Prompt Design Principles

- Each prompt requests **strict JSON output** matching a predefined Zod schema.
- Prompts are stored in **separate files** under `/prompts/` for maintainability.
- Every prompt includes **truthfulness guardrails** as system instructions.
- Prompt versioning is tracked in the `TailoringRun.meta` field.

### 7.2 Prompt Files

| File | Purpose | Schema |
|------|---------|--------|
| `prompts/jd-extraction.ts` | Extract structured fields from raw JD text | `JobDescriptionProfile` |
| `prompts/resume-parser.ts` | Clean up and structure parsed resume text | `ResumeProfile` |
| `prompts/match-scoring.ts` | Score resume against JD with explanation | `MatchScore` |
| `prompts/bullet-rewriter.ts` | Rewrite individual experience bullets | `TailoredBullet` |
| `prompts/gap-analysis.ts` | Identify missing/weak requirements | `ResumeGap[]` |

### 7.3 Universal System Instructions

Every LLM call must include these instructions:

```
You are a resume tailoring assistant. You MUST follow these rules:
1. Never invent experience, employers, degrees, certifications, or metrics.
2. Use only evidence from the resume provided.
3. Mark uncertain suggestions clearly with a low confidence flag.
4. Keep bullet length resume-appropriate (1–2 lines typical).
5. Prefer concrete impact and measurable outcomes.
6. Avoid keyword stuffing — use JD terminology naturally.
7. Preserve the user's original career level.
8. Explain every meaningful rewrite with a clear reason.
```

### 7.4 Output Parsing

All LLM responses are:
1. Parsed from JSON string → object.
2. Validated against the corresponding Zod schema.
3. Rejected with a clear error if parsing/validation fails (with retry logic on failure).

---

## 8. Frontend Component Tree

```
App
├── Layout (app/layout.tsx)
│   ├── Header
│   │   ├── Logo / Brand
│   │   └── Navigation
│   └── Main Content Area
│
├── LandingPage
│   ├── HeroSection
│   └── HowItWorks (step summary)
│
├── InputPage (page.tsx — main app page)
│   ├── ResumeInput
│   │   ├── TextArea (paste resume text)
│   │   └── FileUpload (PDF/DOCX — future)
│   ├── JDInput
│   │   ├── TextArea (paste JD text)
│   │   └── URLInput (future)
│   └── AnalyzeButton
│       └── LoadingSpinner
│
├── AnalysisResultsPage
│   ├── ScoreCard
│   │   ├── OriginalScore (0–100 gauge)
│   │   └── ScoreExplanation
│   ├── JDRequirementsSummary
│   │   ├── JobTitle + Company
│   │   ├── RequiredSkills (badge list)
│   │   ├── PreferredSkills (badge list)
│   │   └── Responsibilities (list)
│   ├── GapAnalysis
│   │   ├── GapCard (per gap)
│   │   │   ├── GapName
│   │   │   ├── ImportanceBadge (high/med/low)
│   │   │   ├── JDEvidence
│   │   │   ├── ResumeEvidence
│   │   │   └── SuggestedAction
│   │   └── ExpandAll / CollapseAll
│   └── GenerateTailoredButton
│
├── SideBySidePage
│   ├── ScoreComparisonBar
│   │   ├── OriginalScore (0–100)
│   │   ├── ImprovementArrow
│   │   └── TailoredScore (0–100)
│   ├── SideBySideColumns
│   │   ├── Column: OriginalResume
│   │   │   ├── SummarySection
│   │   │   ├── SkillsSection
│   │   │   └── ExperienceSection (per role)
│   │   │       └── BulletItem (original text)
│   │   └── Column: TailoredResume
│   │       ├── SummarySection
│   │       ├── SkillsSection (reordered)
│   │       └── ExperienceSection (per role)
│   │           └── BulletItem
│   │               ├── Tailored text (highlighted if changed)
│   │               ├── ChangeReason (tooltip)
│   │               ├── KeywordsAddressed (badges)
│   │               └── ConfidenceLabel
│   └── ExportSection
│       ├── PDFExportButton (side-by-side)
│       ├── PDFExportButton (tailored resume only)
│       └── Disclaimer text
│
└── Shared / Utility Components
    ├── Button (variants: primary, secondary, outline, ghost)
    ├── Badge (variants: success, warning, error, info)
    ├── Card
    ├── Accordion (for gap details)
    ├── Tooltip
    ├── ProgressBar / Gauge (for scores)
    ├── LoadingSkeleton
    └── ErrorBoundary
```

---

## 9. Directory Structure

```
resume-shapeshifter/
│
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout with header/footer
│   ├── page.tsx                  # Main app page (input + results)
│   ├── globals.css               # Tailwind imports + custom styles
│   └── api/                      # API route handlers
│       ├── parse-resume/
│       │   └── route.ts
│       ├── parse-jd/
│       │   └── route.ts
│       ├── analyze/
│       │   └── route.ts
│       ├── tailor/
│       │   └── route.ts
│       └── export/
│           └── route.ts
│
├── components/                   # React components
│   ├── ui/                       # Shadcn UI primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── accordion.tsx
│   │   ├── tooltip.tsx
│   │   ├── progress.tsx
│   │   └── skeleton.tsx
│   ├── ResumeInput.tsx
│   ├── JDInput.tsx
│   ├── AnalyzeButton.tsx
│   ├── ScoreCard.tsx
│   ├── ScoreComparisonBar.tsx
│   ├── JDRequirementsSummary.tsx
│   ├── GapAnalysis.tsx
│   ├── GapCard.tsx
│   ├── SideBySideColumns.tsx
│   ├── BulletItem.tsx
│   ├── PDFExportButton.tsx
│   └── LoadingState.tsx
│
├── lib/                          # Core business logic
│   ├── schemas.ts                # All Zod schemas + TypeScript types
│   ├── orchestrator.ts           # Pipeline orchestration
│   ├── resume-parser.ts          # Resume parsing service
│   ├── jd-parser.ts              # JD parsing service
│   ├── scoring.ts                # Match scoring service
│   ├── bullet-rewriter.ts        # Bullet rewriting service
│   ├── gap-analyzer.ts           # Gap analysis service
│   ├── pdf.ts                    # PDF generation service
│   ├── llm.ts                    # Groq API client wrapper
│   └── prompts.ts                # Prompt template loader
│
├── prompts/                      # LLM prompt templates
│   ├── jd-extraction.ts
│   ├── resume-parser.ts
│   ├── match-scoring.ts
│   ├── bullet-rewriter.ts
│   └── gap-analysis.ts
│
├── types/                        # Re-exported types (convenience)
│   └── index.ts
│
├── public/                       # Static assets
│   └── sample/                   # Sample resume + JD for demo
│       ├── sample-resume.txt
│       └── sample-jd.txt
│
├── docs/                         # Documentation
│   ├── architecture.md           # This file
│   └── problem-statement.md      # Original problem statement
│
├── tests/                        # Unit + integration tests
│   ├── lib/
│   │   ├── scoring.test.ts
│   │   ├── resume-parser.test.ts
│   │   └── jd-parser.test.ts
│   └── components/
│       ├── ScoreCard.test.tsx
│       └── GapAnalysis.test.tsx
│
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── .env.local                    # GROQ_API_KEY (gitignored)
├── .env.example                  # Template for env variables
└── README.md
```

---

## 10. Security & Truthfulness Guardrails

### 10.1 Truthfulness Enforcement

The system is architected to prevent fabrication at multiple levels:

| Layer | Mechanism |
|-------|-----------|
| **LLM Instructions** | Every prompt includes strict "no fabrication" system instructions |
| **Output Validation** | Zod schemas reject any output that doesn't match expected structure |
| **Confidence Labels** | Every rewritten bullet has a `confidence: "high" | "medium" | "low"` flag |
| **Risk Flags** | Rewrites that could overstate experience are flagged with a warning |
| **Unsourced Claim Detection** | Post-hoc check: any JD keyword in a bullet that has no basis in the original resume is flagged |
| **User Review Required** | PDF export includes a disclaimer: "User must verify all content before use" |

### 10.2 Strictly Forbidden Additions

The system must never add:
- Employers the user did not work for.
- Degrees or certifications the user does not have.
- Technologies not present in the resume (unless marked as a suggested gap).
- Metrics that were not provided in the original resume.
- Leadership scope not implied by the original resume.
- Claims of expert-level proficiency without supporting evidence.

### 10.3 JSON Validation

- Every LLM response is validated against its corresponding Zod schema.
- Validation failures trigger a retry (max 2 attempts) with the error message fed back to the LLM.
- If parsing still fails, the system returns a structured error indicating which step failed.

### 10.4 Export Disclaimers

All exported PDFs include:
```
⚠️ This tailored resume was generated by Resume Shapeshifter. 
The user is responsible for verifying all content for accuracy 
before submitting it to any employer. The system does not 
guarantee ATS performance or interview outcomes.
```

---

## 11. Implementation Phases

### Phase 1: Static Prototype (Days 1–3)

**Goal**: Build the UI and demonstrate the full flow with mock data.

- [x] Initialize Next.js project with TypeScript, Tailwind CSS, Shadcn UI.
- [x] Build `ResumeInput` and `JDInput` components (textarea-based).
- [x] Build `ScoreCard`, `GapAnalysis`, `SideBySideColumns` with hardcoded mock data.
- [x] Render side-by-side comparison in the browser.
- [x] Establish Zod schemas for all data models.

### Phase 2: LLM Integration (Days 4–7)

**Goal**: Replace mocks with real LLM-powered analysis via Groq API.

- [ ] Implement LLM client wrapper (`lib/llm.ts`) with Groq API.
- [ ] Write all 5 prompt templates in `/prompts/`.
- [ ] Implement `ResumeParserService` (text-only for MVP).
- [ ] Implement `JDParserService`.
- [ ] Implement `MatchScorerService`.
- [ ] Implement `BulletRewriterService`.
- [ ] Implement `GapAnalyzerService`.
- [ ] Implement `Orchestrator` to run full pipeline.
- [ ] Wire up `/api/analyze` and `/api/tailor` routes.

### Phase 3: PDF Export (Days 8–10)

**Goal**: Generate downloadable PDF artifacts.

- [ ] Set up Playwright or React-PDF for server-side PDF generation.
- [ ] Implement `generateTailoredPDF()` — tailored resume PDF.
- [ ] Implement `generateComparisonPDF()` — side-by-side PDF with highlights, scores, gaps.
- [ ] Implement `/api/export/pdf` route.
- [ ] Add download buttons to the UI.

### Phase 4: Validation & Guardrails (Days 11–12)

**Goal**: Ensure truthfulness and reliability.

- [ ] Add Zod validation on all LLM outputs with retry logic.
- [ ] Implement confidence labels and risk flags on rewritten bullets.
- [ ] Add unsourced-claim detection (post-hoc check).
- [ ] Add user confirmation checkboxes for low-confidence rewrites.
- [ ] Add disclaimers to exported PDFs.

### Phase 5: Polish & Demo Prep (Days 13–15)

**Goal**: Production-ready UI and a compelling demo.

- [ ] Improve UI loading states, error handling, and edge cases.
- [ ] Add sample resume and JD for one-click demo.
- [ ] Polish responsive layout.
- [ ] Add tooltips, explanations, and user guidance.
- [ ] Write README with setup instructions.
- [ ] Prepare demo walkthrough with a real job listing.

---

## 12. Risks & Mitigations

### Parsing Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Multi-column resumes parsed out of order | Bad structure | Warn user, recommend single-column input in MVP |
| PDF text extraction produces broken order | Garbage data | Support plain text as primary input; PDF as best-effort |
| Non-standard section headers missed | Missing sections | Use LLM to infer section boundaries; show parse preview |

### LLM Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Model overstates experience | Un truthful resume | Strong system instructions + post-hoc check + low-confidence flag |
| Model adds unsupported keywords | Keyword stuffing | Detect keywords not in original resume; flag for user review |
| Inconsistent JSON output | Pipeline failure | Zod validation + retry logic on failure |
| Score appears more precise than real | Misleading confidence | Show score as range or with explanation, not just a number |

### Product Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Users trust content without review | Misrepresentation | Prominent disclaimers + user confirmation required before export |
| Users expect guaranteed ATS ranking | False promises | Clear messaging: "improves alignment, does not guarantee outcomes" |
| Vague/overly broad job descriptions | Poor analysis | Flag when JD is too vague; show "low confidence" on extracted fields |

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Groq API rate limits or latency | Poor UX | Implement retry with exponential backoff; show per-step progress; queue requests if needed |
| Groq free-tier token limits insufficient for large inputs | Truncation or failure | Chunk experience sections; summarize oldest roles; monitor token usage per request |
| Model differences across Groq-hosted models | Inconsistent output quality | Pin to a specific model (Llama 3.3-70B recommended); test prompts across target models before switching |

---

## Appendix A: Key Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend framework | Next.js (React) | SSR for SEO, API routes for backend, TypeScript native |
| Styling | Tailwind CSS + Shadcn UI | Rapid UI development, accessible components, consistent design |
| PDF generation | Playwright HTML → PDF | Most reliable for complex layouts with highlights and columns |
| LLM integration | Groq API (Llama 3.3-70B / Mixtral / Gemma 2) | Fast inference via Groq's LPU hardware; structured JSON mode; generous free tier |
| Data validation | Zod | Runtime type checking for LLM outputs; great DX with TypeScript |
| State management | React state + localStorage | Simple enough for MVP; no external state library needed |
| Storage (MVP) | Session-based / localStorage | No infrastructure needed; data is ephemeral by design |

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **JD** | Job Description — a posting describing a role, requirements, and responsibilities |
| **Resume** | The candidate's professional summary document |
| **Tailored Resume** | A version of the resume rewritten to better match a specific JD |
| **Match Score** | A 0–100 score indicating how well a resume aligns with a JD |
| **Gap Analysis** | A structured list of missing or weakly represented requirements |
| **Bullet Rewrite** | A single experience bullet with original → tailored transformation and metadata |
| **Confidence** | An LLM-assessed label (high/medium/low) indicating how safely a bullet was rewritten |
| **Risk Flag** | A warning on rewrites that may potentially overstate experience |
| **Side-by-Side PDF** | The main proof artifact showing original vs tailored resume in two columns |
| **Groq** | AI inference provider serving open-source LLMs (Llama, Mixtral, Gemma) via fast LPU hardware |

---

> *This architecture document corresponds to the Resume Shapeshifter problem statement (v1.0). It is intended to guide implementation of the MVP and may evolve as the product matures. Updated to use Groq API instead of OpenAI.*
