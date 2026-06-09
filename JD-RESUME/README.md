# Resume Shapeshifter — JD-to-Resume Tailoring Engine

Resume Shapeshifter is a state-of-the-art Next.js web application designed to analyze the alignment between your professional resume and a target job description. The engine extracts key requirements, calculates detailed match scores, performs gap analysis, and rewrites experiences and projects bullet-by-bullet using LLMs—complete with truthfulness guardrails and high-fidelity PDF proof exports.

---

## Key Features

1. **Structured Parsers**: Separately parses unstructured resumes and job descriptions using Groq LLM API.
2. **Match Scoring Card**: Computes overall compatibility scores along with sub-scores across Skill Coverage, Responsibility Alignment, Keyword Match, and Seniority Fit.
3. **Interactive Gap Analysis**: Lists prioritized discrepancies and suggests actionable items.
4. **Side-by-Side Tailored View**: Renders original vs. tailored bullets and highlights changes, showing inline change explanations and keyword lists.
5. **Truthfulness Guardrails (Phase 4)**:
   - **Post-Hoc Claim Detector**: Determines if tailored bullets add skills/keywords missing from the original resume, flagging warnings and downgrading confidence.
   - **Bullet-Level Checkpoints**: Locks downloads until low-confidence bullets are individually checked and verified by the user.
   - **Audit Logs**: The PDF export route prints log alerts if exports are triggered bypassing user confirmations.
6. **High-Fidelity PDF Export (Phase 3)**: Generates a tailored single-column resume PDF and a comprehensive comparative dashboard PDF utilizing `@react-pdf/renderer`.
7. **Premium Styling (Phase 5)**: Complete with smooth step-fade transitions, responsive visual cards, dark mode toggle, specific glossary tooltips, and client error boundaries.

---

## Technology Stack

- **Framework**: [Next.js 16.2](https://nextjs.org/) (Turbopack) & React 19
- **Styling**: Tailwind CSS v4 & PostCSS
- **PDF Compiler**: `@react-pdf/renderer` v4.5 (React 19 compatible)
- **Validation**: Zod Schemas
- **LLM Provider**: Groq SDK (using `llama-3.3-70b-versatile` / `llama3-8b-8192`)

---

## Folder Structure

```
├── app/
│   ├── api/                  # API endpoints (analyze, tailor, parse, export PDF)
│   ├── layout.tsx            # App wrapper (Geist font, ErrorBoundary, TooltipProvider)
│   └── page.tsx              # Main UI step flow manager
├── components/
│   ├── ui/                   # Basic shadcn primitives (Button, Card, Badge, Progress)
│   ├── ErrorBoundary.tsx     # Handles client rendering failures gracefully
│   ├── ThemeToggle.tsx       # Dark/Light mode switcher
│   ├── PDFExportButton.tsx   # Controls downloads with confirmation validations
│   ├── SideBySideColumns.tsx # Main comparison panels (Experience & Projects)
│   └── ...                   # Inputs, headers, loading states
├── lib/
│   ├── pdf-templates/        # Tailored resume and comparative report PDF renderers
│   ├── unsourced-claim-detector.ts # Determines keyword additions & flags claims
│   ├── orchestrator.ts       # Coordinates full parsing, gap, scoring, re-write pipeline
│   ├── llm.ts                # Groq client wrapper with retries and Zod JSON mode
│   └── ...
├── prompts/                  # Prompt files (rewriter, parsers, scoring, gaps)
├── tests/
│   └── lib/                  # Unit test suites (claim detector, parser, scoring)
```

---

## Getting Started

### 1. Prerequisites
Ensure you have **Node.js v20+** installed.

### 2. Installation
Clone this repository and install the dependencies:
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory (based on `.env.example`):
```bash
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Running the Development Server
Launch Next.js in development mode:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## Scripts & Testing

### Run Unit Tests
Executes local unit tests (parsers, match scores, claim detector, orchestrator validations) using Node's native test runner:
```bash
npm run test:unit
```

### Run Integration Tests
Runs the end-to-end service orchestrator integration loop with live Groq LLM requests:
```bash
npm run test
```

### Production Build
Builds the Next.js production bundle with complete typescript checks:
```bash
npm run build
```
