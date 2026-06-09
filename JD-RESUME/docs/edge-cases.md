# Resume Shapeshifter — Edge Cases by Phase

> **Project**: Resume Shapeshifter — JD-to-Resume Tailoring Engine  
> **Purpose**: Reference document for developers to consult during implementation. Each section lists edge cases that must be handled for the corresponding phase.  
> **Last Updated**: 2026-05-20

---

## Table of Contents

- [Phase 1: Static Prototype — Edge Cases](#phase-1-static-prototype--edge-cases)
- [Phase 2: LLM Integration — Edge Cases](#phase-2-llm-integration--edge-cases)
- [Phase 3: PDF Export — Edge Cases](#phase-3-pdf-export--edge-cases)
- [Phase 4: Validation & Guardrails — Edge Cases](#phase-4-validation--guardrails--edge-cases)
- [Phase 5: Polish & Demo Prep — Edge Cases](#phase-5-polish--demo-prep--edge-cases)

---

## Phase 1: Static Prototype — Edge Cases

### 1.1 Project Scaffolding & Foundation

| # | Edge Case | Expected Behavior | Severity |
|---|-----------|-------------------|----------|
| EC-1.1.1 | `npm create next-app` fails due to network issues | Fall back to manual `npm install next react react-dom` with specific versions. Document in README | Medium |
| EC-1.1.2 | TypeScript strict mode causes unexpected compilation errors | Ensure `tsconfig.json` has appropriate strict settings. Test with `npx tsc --noEmit` after each schema addition | Medium |
| EC-1.1.3 | Shadcn UI `init` command fails or asks for input interactively | Use command-line flags to auto-accept defaults: `npx shadcn@latest init -d --yes` | Low |
| EC-1.1.4 | Tailwind config conflicts with Shadcn UI default theme | Verify no CSS conflicts. Shadcn UI components should take precedence for component styles | Low |
| EC-1.1.5 | Zod version mismatch with TypeScript (e.g., Zod 4.x changes API) | Pin Zod version `^3.23.0` in `package.json`. Do not use Zod 4.x until verified compatible | High |
| EC-1.1.6 | Schema definitions too large for a single file | Split into `lib/schemas/resume.ts`, `lib/schemas/jd.ts`, `lib/schemas/score.ts`, `lib/schemas/tailoring.ts` if needed | Low |

### 1.2 Input UI & Mock Data

| # | Edge Case | Expected Behavior | Severity |
|---|-----------|-------------------|----------|
| EC-1.2.1 | User pastes empty text into ResumeInput | Textarea should show placeholder text. AnalyzeButton should be disabled. Show helper message: "Please paste your resume text" | High |
| EC-1.2.2 | User pastes empty text into JDInput | Textarea should show placeholder text. AnalyzeButton should be disabled. Show helper message: "Please paste a job description" | High |
| EC-1.2.3 | User pastes extremely long text (>100KB) into either textarea | Textarea should accept the text. Show a character/word count warning if >50KB: "Your input is very long. Parsing may take longer." | Medium |
| EC-1.2.4 | User pastes text with only whitespace or special characters | Trim on paste. If result is empty, treat as empty input. Disable AnalyzeButton | Medium |
| EC-1.2.5 | User pastes text with non-UTF-8 characters (e.g., emoji, right-to-left scripts) | Textarea should accept all Unicode characters. Display should preserve them. No crashes from Unicode handling | Low |
| EC-1.2.6 | ScoreCard receives score values outside 0–100 range | Clamp to 0–100 for display. Log warning to console | Medium |
| EC-1.2.7 | ScoreCard receives NaN or undefined for score | Display "N/A" instead of a number. Do not crash. Log error to console | High |
| EC-1.2.8 | GapAnalysis receives empty gap array | Show empty state: "No significant gaps detected! Your resume already aligns well with this job description." | Medium |
| EC-1.2.9 | GapAnalysis receives gap with missing optional fields (e.g., no `jdEvidence`) | Component should render gracefully with "No evidence available" fallback text | Medium |
| EC-1.2.10 | GapCard receives gap with importance value outside "high" | "medium" | "low" |
| | Default to "medium" badge styling. Log warning if unknown value | Medium |
| EC-1.2.11 | User switches tabs or steps rapidly before mock data loads | Disable tab switching while "loading" (simulated by setTimeout). Show loading skeleton during transitions | Low |
| EC-1.2.12 | Browser back/forward navigation during multi-step flow | Use URL hash or search params to maintain step state (e.g., `?step=input`, `?step=analysis`, `?step=comparison`). Handle invalid step values by redirecting to step 1 | Medium |

### 1.3 Side-by-Side Comparison & Full Flow

| # | Edge Case | Expected Behavior | Severity |
|---|-----------|-------------------|----------|
| EC-1.3.1 | BulletItem receives empty or whitespace-only bullet text | Display placeholder: "[Empty bullet — review needed]" with low-confidence styling | Medium |
| EC-1.3.2 | BulletItem receives no `changeReason` | Omit the tooltip or change reason section. Do not show a blank tooltip | Low |
| EC-1.3.3 | BulletItem receives invalid `confidence` value | Default to "low" styling. Log warning | Low |
| EC-1.3.4 | SideBySideColumns has mismatched experience sections (e.g., original has 3 jobs, tailored reorders them) | Match by company name or fall back to index position. If mismatch is severe, show a warning: "Experience sections may be misaligned" | High |
| EC-1.3.5 | SideBySideColumns has differing number of bullets per experience (original has 5, tailored has 3) | Align by index. Extra bullets on either side show as "Added" or "Removed" with appropriate styling | Medium |
| EC-1.3.6 | ScoreComparisonBar receives equal before/after scores | Display both scores identically. Show "No change" label instead of improvement arrow | Low |
| EC-1.3.7 | ScoreComparisonBar receives lower tailored score than original | Show a red/amber downward arrow. Display warning: "Tailored match score decreased. Review changes." | Medium |
| EC-1.3.8 | PDFExportButton receives no valid mock data | Button should be disabled with tooltip: "Generate a tailored resume first" | Low |
| EC-1.3.9 | User refreshes browser mid-flow (after Step 2 but before Step 3) | Data should persist in React state. If using only in-memory state, reset to Step 1 on refresh. Consider sessionStorage for persistence | Medium |
| EC-1.3.10 | Screen width is very narrow (< 360px) | Side-by-side columns should stack vertically. Score gauges should shrink proportionally. All text should remain readable without horizontal scroll | Medium |
| EC-1.3.11 | Screen width is very wide (> 2560px) | Content area should have a max-width container (1280px) so it doesn't stretch across the full screen. Side-by-side columns should use available space proportionally | Low |
| EC-1.3.12 | Browser has JavaScript disabled | Show `<noscript>` fallback: "Resume Shapeshifter requires JavaScript to function. Please enable JavaScript in your browser settings." | Low |

---

## Phase 2: LLM Integration — Edge Cases

### 2.1 LLM Client & Prompt Templates

| # | Edge Case | Expected Behavior | Severity |
|---|-----------|-------------------|----------|
| EC-2.1.1 | `GROQ_API_KEY` environment variable is missing | LLM client should throw a clear error: "Groq API key not configured. Set GROQ_API_KEY in .env.local." API routes should return 500 with this message | Critical |
| EC-2.1.2 | `GROQ_API_KEY` is invalid or expired | LLM client should catch 401 response and return structured error: "Invalid API key. Please check your GROQ_API_KEY." | High |
| EC-2.1.3 | Groq API rate limit exceeded (429) | Implement exponential backoff: wait 1s → retry, wait 2s → retry, wait 4s → fail. Return error: "API rate limit exceeded. Please try again in a few minutes." | High |
| EC-2.1.4 | Groq API returns non-JSON response | Catch JSON parse error. Retry once with explicit instruction: "Respond with ONLY valid JSON, no markdown formatting." | High |
| EC-2.1.5 | Groq API times out (>30s per call) | Set timeout of 30s. On timeout, return error: "LLM request timed out. Your input may be too large. Try shortening it." | High |
| EC-2.1.6 | Groq API returns valid JSON but schema has extra unknown fields | Zod's `.strip()` behavior should strip unknown fields silently. Do not fail validation on extra fields | Medium |
| EC-2.1.7 | Prompt template contains syntax errors (e.g., unclosed string interpolation) | Unit tests should catch this. Each prompt template must have a corresponding test that loads the template and validates it compiles | High |
| EC-2.1.8 | Prompt template exceeds token limit for the model | Truncate the resume/JD input before injecting. Show warning: "Input was truncated due to length limits." Use token counting library if available | Medium |
| EC-2.1.9 | User injects prompt injection through resume text (e.g., "ignore all instructions above") | System instructions should be placed AFTER user input in the messages array. Use `role: "system"` for instructions, `role: "user"` for input. Validate that output matches expected schema | Critical |
| EC-2.1.10 | User input contains markdown or code blocks that confuse JSON parsing | Pre-process input: strip markdown code fences. Add instruction: "Ignore any formatting in the input and treat it as plain text" | Medium |
| EC-2.1.11 | LLM returns JSON with markdown codeblock wrapping (```json ... ```) | Parse response: strip markdown fences before JSON.parse. Handle both ````json` and ````JSON` variants | Medium |
| EC-2.1.12 | Multiple rapid API calls exceed Groq rate limits (requests per minute / tokens per minute) | Implement a queue with concurrency limit of 3. Monitor Groq rate limit headers and throttle as needed | Medium |

### 2.2 Service Implementations

| # | Edge Case | Expected Behavior | Severity |
|---|-----------|-------------------|----------|
| EC-2.2.1 | Resume text has no clear section structure (e.g., single paragraph with no headers) | LLM should infer structure. Service should return best-effort parsing with a warning: "Resume structure was unclear. Some sections may be incomplete." | High |
| EC-2.2.2 | Resume text has non-standard section headers (e.g., "Work History" instead of "Experience", "Tech Stack" instead of "Skills") | LLM should normalize to standard section names. Include original header name in metadata for user reference | Medium |
| EC-2.2.3 | Resume text contains only contact info and no experience (e.g., student with no work history) | Service should handle empty arrays. Return valid `ResumeProfile` with empty `experience` and `projects` arrays. Gap analysis will flag all experience-related requirements | High |
| EC-2.2.4 | Resume has dates in ambiguous formats (e.g., "Jan 2020" vs "01/2020" vs "2020") | Normalize to ISO-like format internally. Preserve original display format in output. LLM should handle common date formats | Medium |
| EC-2.2.5 | Resume has overlapping date ranges for multiple jobs | Service should accept as-is but add a warning: "Overlapping employment dates detected. Verify accuracy." | Medium |
| EC-2.2.6 | JD text is mostly keywords with no grammatical sentences (e.g., "Python, AWS, 5 years, team lead, agile") | LLM should still extract structured fields. Skills and tools lists may be well-populated. Responsibilities and qualifications may be empty. Add warning: "Job description appears to be keyword-heavy. Requirements may not be fully captured." | Medium |
| EC-2.2.7 | JD text is extremely short (e.g., "Hiring software engineer. Must know React.") | Service should return partial `JobDescriptionProfile` with low confidence. All scoring will be low-confidence. Flag: "Very short job description — extracted requirements may be incomplete." | Medium |
| EC-2.2.8 | JD text is copied from a job board with noise text (e.g., "Apply now!", company boilerplate, equal opportunity statements) | LLM should filter noise. Include a `rawText` field in output for reference. Add warning if noise content detected | Low |
| EC-2.2.9 | Resume contains no skills section | Service should extract skills from experience bullets. Return empty `skills` array if none found. Gap analysis will flag missing skills highlighted in JD | High |
| EC-2.2.10 | Resume contains 20+ years of experience with 10+ job entries | Summarize older roles (>10 years ago) to 1–2 bullets each. Flag: "Early career experience was summarized due to length." | Medium |
| EC-2.2.11 | Score receives mismatched professions (e.g., nurse resume vs software engineer JD) | Score should be very low (0–15). Explanation should clearly state: "The resume and job description appear to be in different fields." | Medium |
| EC-2.2.12 | Bullet rewriter receives bullet that is already perfectly aligned with JD | Return same bullet text with `changeReason: "No change needed — already aligned"` and `confidence: "high"`. Do not force a rewrite | Medium |
| EC-2.2.13 | Bullet rewriter receives bullet that is completely irrelevant to JD | Return original bullet with `changeReason: "Bullet retained as-is — no JD alignment possible without fabrication"` and `confidence: "high"`. Do not attempt forced rewrite | Medium |
| EC-2.2.14 | Gap analyzer finds zero gaps (perfect match) | Return empty gaps array. Orchestrator should handle this gracefully. Analysis page should show: "Your resume already strongly aligns with this job description." | Low |
| EC-2.2.15 | Gap analyzer finds 20+ gaps | Return all gaps but UI should show top 10 with accordion to expand rest. Importance-sorted list | Medium |
| EC-2.2.16 | LLM returns confidence values inconsistently (e.g., "HIGH", "High", "high") | Normalize to lowercase in service layer before Zod validation. Or use Zod's `.transform()` to lowercase | Medium |

### 2.3 Orchestrator & API Routes

| # | Edge Case | Expected Behavior | Severity |
|---|-----------|-------------------|----------|
| EC-2.3.1 | `/api/analyze` receives resumeText but no jdText | Return 400: "Job description text is required." | High |
| EC-2.3.2 | `/api/analyze` receives jdText but no resumeText | Return 400: "Resume text is required." | High |
| EC-2.3.3 | `/api/analyze` receives both fields but both are empty strings | Return 400: "Both resume text and job description text are required." | High |
| EC-2.3.4 | `/api/tailor` called before `/api/analyze` (no prior analysis) | Accept the request and run full pipeline anyway. Return full `TailoringRun` | Low |
| EC-2.3.5 | Orchestrator step 1 (parse) succeeds, step 2 (score) fails | Return partial results with error: "Analysis failed at scoring step. Parsing completed successfully." Include parsed resume and JD in response | Medium |
| EC-2.3.6 | Orchestrator step 4 (rewrite) succeeds, step 5 (gap) fails | Return partial results. Tailored resume is available but gap analysis is not. Include tailored score and partial gap analysis | Medium |
| EC-2.3.7 | Full pipeline runs but takes >60 seconds | Set an overall timeout of 60s. Return 504: "Analysis took too long. Try with shorter input." Implement per-step timeouts | High |
| EC-2.3.8 | API receives request body with unexpected Content-Type (e.g., XML instead of JSON) | Return 415: "Unsupported Media Type. Use application/json." | Low |
| EC-2.3.9 | API receives request body larger than 1MB | Return 413: "Request entity too large. Maximum request size is 1MB." | Medium |
| EC-2.3.10 | API route handler crashes with uncaught exception | Global error middleware should catch all unhandled exceptions and return 500 with generic error message. Log full error server-side | Critical |

### 2.4 Wire Frontend to Backend

| # | Edge Case | Expected Behavior | Severity |
|---|-----------|-------------------|----------|
| EC-2.4.1 | API returns 500 error during analyze | ErrorBanner shows: "Analysis failed. This could be due to a temporary issue. Please try again." Includes retry button | High |
| EC-2.4.2 | API returns 400 validation error | ErrorBanner shows specific validation message from API response. User can edit input and retry | High |
| EC-2.4.3 | Network request fails (user is offline) | ErrorBanner shows: "Network error. Please check your internet connection and try again." Detect offline status with `navigator.onLine` | Medium |
| EC-2.4.4 | User clicks Analyze button multiple times rapidly | Button should be disabled after first click until response returns. Prevent duplicate API calls | Medium |
| EC-2.4.5 | User navigates away from page during API call (before response) | Abort fetch request using AbortController. Show warning before unload if request is in-flight (optional `beforeunload` event) | Low |
| EC-2.4.6 | API returns partial data (e.g., score but no gaps due to step failure) | UI should render available data and show warning: "Some analysis steps failed. Results may be incomplete." | Medium |
| EC-2.4.7 | API returns after user has already started a new analyze request | Cancel previous request. Only process the most recent response. Use request IDs to track latest | Medium |
| EC-2.4.8 | User starts tailoring before analysis completes | Disable tailor button until analysis step finishes. Show loading state for analysis step | Low |

---

## Phase 3: PDF Export — Edge Cases

### 3.1 PDF Generation Setup & Tailored Resume PDF

| # | Edge Case | Expected Behavior | Severity |
|---|-----------|-------------------|----------|
| EC-3.1.1 | Playwright installation fails (Chromium download fails) | Fall back to a pure JavaScript PDF generation library (pdfkit, jspdf). Document both options in README | High |
| EC-3.1.2 | Playwright is not available in serverless environment (e.g., Vercel) | Use React-PDF (`@react-pdf/renderer`) for serverless-compatible PDF generation. Detected at build time with conditional import | Critical |
| EC-3.1.3 | Tailored resume PDF content exceeds one page | Implement pagination: auto-split content across multiple pages. Add page numbers ("Page 1 of 3") | High |
| EC-3.1.4 | Tailored resume PDF has no experience sections (student resume) | Render only available sections. Show "No experience listed" note. Do not generate empty pages | Medium |
| EC-3.1.5 | Tailored resume PDF contains Unicode characters (e.g., accented names, non-Latin scripts) | Ensure PDF font supports Unicode. Embed a Unicode-compatible font (Noto Sans) or use system fonts with fallback | Medium |
| EC-3.1.6 | Tailored resume PDF generation takes >15 seconds | Show progress indicator in UI. Implement streaming progress if possible. Set timeout of 30s for PDF generation | Medium |
| EC-3.1.7 | Tailored resume PDF has very long bullet that overflows column width | Implement text truncation with ellipsis or auto-font-size reduction. Show full text in tooltip if truncated | Medium |
| EC-3.1.8 | Contact information has no email or phone | Omit missing fields. Do not show empty fields or placeholders | Low |

### 3.2 Side-by-Side Comparison PDF

| # | Edge Case | Expected Behavior | Severity |
|---|-----------|-------------------|----------|
| EC-3.2.1 | Comparison PDF has too many bullets to fit two columns on one page | Prioritize: show first 5 bullets per experience fully, then "See full analysis" note. Add continuation pages | High |
| EC-3.2.2 | Comparison PDF columns become misaligned (different number of bullets per role) | Align by index. Show empty cells where bullets don't match. Use dotted borders to visually separate unmatched rows | Medium |
| EC-3.2.3 | Comparison PDF header (job title, company) is very long | Truncate with ellipsis. Show full text in a smaller font below the truncated title | Low |
| EC-3.2.4 | Gap analysis table in PDF has 15+ gaps | Show top 5 gaps with "See digital version for complete gap analysis" note. Sort by importance | Medium |
| EC-3.2.5 | Score bar in PDF shows improvement from 95 to 96 | Render both scores. Improvement arrow is optional if change is <5 points | Low |
| EC-3.2.6 | Score bar in PDF shows regression (tailored score lower than original) | Render both scores with red/amber coloring. Show warning text: "Score decreased — review changes" | Medium |
| EC-3.2.7 | Highlighted bullets lose color when printed in grayscale | Use patterns/icons alongside color highlights (e.g., ● changed bullets, ○ unchanged). Check PDF renders correctly in B&W | Medium |
| EC-3.2.8 | Comparison PDF is requested but tailored resume data is missing | Return 400: "Tailored resume data is required. Generate a tailored resume first." | High |
| EC-3.2.9 | PDF contains hyperlinks (e.g., LinkedIn URL in contact) | Playwright/React-PDF should render clickable links. Test that links are preserved and functional | Low |
| EC-3.2.10 | PDF is generated with wrong page size (A4 vs Letter) | Default to A4. Allow user preference via API option: `{ pageSize: "A4" | "Letter" }` | Low |

### 3.3 Export API & UI Integration

| # | Edge Case | Expected Behavior | Severity |
|---|-----------|-------------------|----------|
| EC-3.3.1 | PDF download is blocked by browser popup blocker | Use programmatic download via Blob URL, not `window.open()`. Show unobtrusive notification if download doesn't start | Medium |
| EC-3.3.2 | PDF download starts but fails mid-stream | Catch download error. Show error message: "Download failed. Please try again." Provide retry button | High |
| EC-3.3.3 | User clicks download button multiple times | Prevent duplicate download requests. Button should be disabled during download. Show progress indicator | Low |
| EC-3.3.4 | User requests download but API returns error (500) | Show error message specific to PDF generation: "PDF generation failed. Please try again." Include error details if available | Medium |
| EC-3.3.5 | Download filename contains special characters (e.g., "/" in job title) | Sanitize filename: replace special characters with underscores. Max filename length: 100 characters | Medium |
| EC-3.3.6 | Browser doesn't support Blob download (older browsers) | Fall back to server-side download via Content-Disposition header. Check `window.showSaveFilePicker` or use `<a download>` attribute | Low |
| EC-3.3.7 | Large PDF file (>10MB) takes long to download | Show download progress percentage. Consider compressing PDF images if applicable | Low |
| EC-3.3.8 | User closes browser tab during PDF download | Download should continue if using server-side response. If using Blob, download will be interrupted. No data loss on server | Low |
| EC-3.3.9 | Mobile browser triggers PDF download differently (iOS Safari opens PDF instead of downloading) | Set `Content-Disposition: attachment` header to force download. Provide fallback "Open PDF in new tab" option | Medium |

---

## Phase 4: Validation & Guardrails — Edge Cases

### 4.1 Output Validation & Retry Logic

| # | Edge Case | Expected Behavior | Severity |
|---|-----------|-------------------|----------|
| EC-4.1.1 | LLM returns valid JSON but all confidence values are "low" | Accept the result but flag in orchestrator. UI will show warning banner for all bullets. Bulk confirmation option may be appropriate | Medium |
| EC-4.1.2 | LLM returns JSON that fails Zod validation twice (both retries exhausted) | Throw structured error with validation details. Include which field failed, what was expected, and what was received. Log original LLM response for debugging | Critical |
| EC-4.1.3 | LLM returns valid JSON but with wrong data types (e.g., string instead of number for score) | Zod validation should catch this. Retry with error feedback: "The field 'overallScore' should be a number 0-100, but you provided a string." | High |
| EC-4.1.4 | LLM returns empty arrays where non-empty expected (e.g., job with no required skills) | Accept empty arrays. The resulting analysis will have fewer dimensions but should not crash | Medium |
| EC-4.1.5 | LLM returns null for required string fields | Zod should catch null. Retry with feedback: "The field 'jobTitle' is required and cannot be null." | High |
| EC-4.1.6 | LLM adds hallucinated fields not in schema | Zod's `.strip()` removes unknown fields silently. Log unknown fields for debugging | Low |
| EC-4.1.7 | Unsourced-claim detection produces a false positive (keyword was in original but missed by detector) | Implement fuzzy matching: use synonyms, stemming, and case-insensitive comparison. Allow override via user confirmation checkbox | Medium |
| EC-4.1.8 | Unsourced-claim detection produces a false negative (fabricated keyword not detected) | This is a security risk. Mitigation: also run a second check comparing bullet keywords against a union of resume+JD keywords. Flag mismatches | High |
| EC-4.1.9 | Unsourced-claim detection is too strict (flags common words like "team", "project") | Maintain a stop-word list of common terms that should not be flagged. Update list as false positives are identified | Medium |
| EC-4.1.10 | LLM returns score of exactly 0 | Accept valid score. Ensure UI displays 0 gracefully as "0/100" not as a missing value | Low |
| EC-4.1.11 | LLM returns score of exactly 100 | Accept valid score. Show "Perfect match!" celebration in UI. But also retain a note: "No score is perfect — review all changes carefully." | Low |
| EC-4.1.12 | Multiple LLM calls in parallel all fail simultaneously | Orchestrator should handle partial failure. Return what succeeded, clearly mark failed steps. Do not retry indefinitely (max 2 per step) | High |

### 4.2 User-Facing Guardrails & Confirmation Flow

| # | Edge Case | Expected Behavior | Severity |
|---|-----------|-------------------|----------|
| EC-4.2.1 | User unchecks a previously confirmed checkbox | Re-disable export buttons. Re-evaluate confirmation status | Low |
| EC-4.2.2 | User confirms all low-confidence bullets, then regenerates the tailored resume | Reset all confirmation checkboxes on regeneration. Force user to re-confirm | Medium |
| EC-4.2.3 | All bullets are high-confidence (no low-confidence bullets) | Do not show low-confidence warning banner. Hide confirmation checkboxes. Export buttons are immediately enabled | Medium |
| EC-4.2.4 | User has not checked "I have reviewed and verified all content" checkbox | Export buttons are disabled. Tooltip explains: "Please confirm you have reviewed all content before exporting" | High |
| EC-4.2.5 | User clicks export, confirmation checkboxes are mid-animation | Wait for animation to complete before checking export button state. Do not race conditions | Low |
| EC-4.2.6 | API returns risk flags that are very severe (potential legal issues, e.g., false certification claim) | Show additional prominent warning: "⚠️ This rewrite may contain a claim that cannot be supported by your original resume. Review carefully before using." | Critical |
| EC-4.2.7 | Locale/language differences affect disclaimer text (non-English users) | For MVP, English only. Flag for internationalization in future versions | Low |
| EC-4.2.8 | User copies/pastes content instead of using PDF export (bypassing disclaimer) | Not preventable. Include in-app messaging: "We recommend using PDF export which includes important disclaimers." | Low |
| EC-4.2.9 | User bypasses confirmation by using browser dev tools to re-enable buttons | Acceptable risk for MVP. Button state is enforced client-side. Server-side does not re-validate confirmation (future enhancement) | Low |
| EC-4.2.10 | Disclaimer text is too long and gets truncated in the UI | Ensure disclaimer fits within a reasonable max-width container. Use expandable section if needed | Low |

---

## Phase 5: Polish & Demo Prep — Edge Cases

### 5.1 UI Polish & Responsive Design

| # | Edge Case | Expected Behavior | Severity |
|---|-----------|-------------------|----------|
| EC-5.1.1 | Dark mode toggle is not persisted across sessions | Store preference in localStorage. Default to system preference via `prefers-color-scheme` media query | Medium |
| EC-5.1.2 | Dark mode toggle causes flash of unstyled content on page load | Use inline script in `<head>` to set `data-theme` before first paint. No FOUC (Flash of Unstyled Content) | Medium |
| EC-5.1.3 | User's system theme changes while app is open (dynamic system preference) | Listen for `matchMedia('prefers-color-scheme').change` event. If user hasn't manually toggled, follow system preference | Low |
| EC-5.1.4 | Side-by-side columns on mobile overlap or overflow | Stack vertically on screens < 768px. Each column takes full width. Min padding of 16px on each side | High |
| EC-5.1.5 | Touch targets on mobile are too small (< 44px) | Ensure all buttons, badges, and interactive elements meet minimum touch target size. Use `min-h-[44px]` utility classes | Medium |
| EC-5.1.6 | Keyboard focus ring not visible | Ensure all interactive elements have visible `:focus-visible` styles. Use Tailwind's `focus-visible:ring-2` utility | Medium |
| EC-5.1.7 | Screen reader cannot read dynamically loaded content | Use `aria-live="polite"` region for content that updates after API calls. Announce score changes, gap results | Medium |
| EC-5.1.8 | Tab order is incorrect for side-by-side comparison | Ensure tab order goes: original column top to bottom → tailored column top to bottom. Use `tabindex` if needed | Low |
| EC-5.1.9 | Page transition animations are slow on low-end devices | Use `prefers-reduced-motion: reduce` media query to disable animations. Respect user accessibility settings | Medium |
| EC-5.1.10 | Very long job title or company name breaks layout | Truncate with ellipsis (`text-overflow: ellipsis`, `overflow: hidden`, `white-space: nowrap`). Show full text in tooltip | Low |
| EC-5.1.11 | Multiple accordion sections open simultaneously (gap analysis) | Allow multiple sections to be open (no auto-close). User should be able to compare gaps side by side | Low |
| EC-5.1.12 | Score gauge animation is jerky or slow | Use CSS transitions instead of JavaScript animation. Keep animation under 500ms | Low |

### 5.2 Sample Data, Error Handling & Loading States

| # | Edge Case | Expected Behavior | Severity |
|---|-----------|-------------------|----------|
| EC-5.2.1 | Sample resume and JD files cannot be fetched (404) | "Load Sample" button should handle fetch failure gracefully. Show error toast: "Could not load sample data" | Medium |
| EC-5.2.2 | Sample resume and JD produce unexpectedly poor results (e.g., 0% match) | Sample data should be tested to produce moderate match scores (30-60%) for a meaningful demo. If poor match, revise sample data | High |
| EC-5.2.3 | User loads sample data, modifies it, then wants to reload original sample | "Load Sample" button should overwrite current textarea content with original sample data. Add confirmation: "This will replace your current input." | Low |
| EC-5.2.4 | Loading skeleton shows during API call but call returns very quickly (< 500ms) | Show skeleton for minimum 500ms to avoid flash-of-loading. Use a minimum display time for loading states | Low |
| EC-5.2.5 | Loading skeleton is shown for wrong step (e.g., score skeleton while gaps are loading) | Step-specific skeletons should correspond exactly to what is loading. Coordinate with orchestrator to know which steps are in-flight | Medium |
| EC-5.2.6 | ErrorBoundary catches an error in a non-critical component (e.g., score gauge decorative element) | ErrorBoundary should gracefully degrade: hide the failing component, show a simplified fallback. Do not crash the entire page | High |
| EC-5.2.7 | ErrorBoundary catches error in the entire page | Show full-page error state with: app logo, "Something went wrong" message, "Try Again" button, and a note to refresh | High |
| EC-5.2.8 | Network retry succeeds on second attempt | Show brief "Reconnecting..." indicator that disappears on success. Do not show full error state for transient failures | Low |
| EC-5.2.9 | Empty state shows when user has already seen results (navigating back) | Only show empty state if there is truly no data in state. Check for parsed resume/JD before showing empty state | Low |
| EC-5.2.10 | Very long resume (>50KB) truncation warning is shown but user ignores it | Proceed with truncated input. Include truncation indicator in API request metadata. Show in analysis: "Note: Resume was truncated from X characters to Y characters." | Medium |
| EC-5.2.11 | Very short resume (<100 characters) | Show warning: "Your resume appears very short. Parsing may not capture all details. Consider adding more content." | Low |
| EC-5.2.12 | Resume and JD are identical documents (user accidentally pasted same text twice) | Detect near-identical inputs (cosine similarity > 0.9). Show warning: "Your resume and job description appear to be the same text. Please verify you pasted the correct content." | Medium |

### 5.3 Documentation, README & Demo Walkthrough

| # | Edge Case | Expected Behavior | Severity |
|---|-----------|-------------------|----------|
| EC-5.3.1 | User follows README setup instructions but misses `.env.local` step | README should explicitly state: "Without a valid GROQ_API_KEY, the app will start but analysis features will not work." Show in-app warning when API key is missing | High |
| EC-5.3.2 | User uses a different Node.js version than required | Specify required Node.js version in `package.json` `engines` field: `"node": ">=18.0.0"`. Show version mismatch warning on `npm install` | Medium |
| EC-5.3.3 | Demo walkthrough video/screenshots show outdated UI | Update demo assets after any UI changes. Document as "subject to change" | Low |
| EC-5.3.4 | Real job listing used in demo goes offline or changes before demo | Use a snapshot/saved version of the JD for reproducibility. Store the exact JD text used in demo in `public/sample/` | Medium |
| EC-5.3.5 | README has broken links (e.g., to external CMS, npm packages) | All links should be verified before release. Use relative links for internal documents | Low |
| EC-5.3.6 | README commands do not work on Windows (e.g., `cp` instead of `copy`) | Use platform-agnostic commands or provide Windows-specific instructions. `cp .env.example .env.local` → note for Windows: `copy .env.example .env.local` | Medium |
| EC-5.3.7 | Demo works on developer machine but fails on fresh clone (missing dependencies) | Provide `npm ci` (clean install) as alternative to `npm install`. Lock file should be committed | Medium |
| EC-5.3.8 | Final acceptance test fails on one criterion | Document which criterion failed and why. Do not consider project complete until all 10 pass. Create a checklist to track | High |

---

## Edge Case Severity Legend

| Severity | Definition | Required Action |
|----------|------------|-----------------|
| **Critical** | Will crash the app, cause data loss, or make the app unusable | Must be handled before the phase can be considered complete |
| **High** | Will cause incorrect behavior, misleading output, or significant UX degradation | Must be handled within the phase; deferring requires documented justification |
| **Medium** | Will cause suboptimal behavior or minor UX issues | Should be handled within the phase or flagged as known issue with planned fix |
| **Low** | Edge case is unlikely or impact is cosmetic | Can be deferred to future iterations; document in "Known Issues" if deferred |

---

## Edge Case Index by Task Number

For quick reference when implementing a specific task, use this index to find which edge cases apply.

| Task | Edge Cases |
|------|------------|
| 1.1 | EC-1.1.1 through EC-1.1.6 |
| 1.2 | EC-1.2.1 through EC-1.2.12 |
| 1.3 | EC-1.3.1 through EC-1.3.12 |
| 2.1 | EC-2.1.1 through EC-2.1.12 |
| 2.2 | EC-2.2.1 through EC-2.2.16 |
| 2.3 | EC-2.3.1 through EC-2.3.10 |
| 2.4 | EC-2.4.1 through EC-2.4.8 |
| 3.1 | EC-3.1.1 through EC-3.1.8 |
| 3.2 | EC-3.2.1 through EC-3.2.10 |
| 3.3 | EC-3.3.1 through EC-3.3.9 |
| 4.1 | EC-4.1.1 through EC-4.1.12 |
| 4.2 | EC-4.2.1 through EC-4.2.10 |
| 5.1 | EC-5.1.1 through EC-5.1.12 |
| 5.2 | EC-5.2.1 through EC-5.2.12 |
| 5.3 | EC-5.3.1 through EC-5.3.8 |

---

> *This edge cases document is intended to be consulted alongside `implementation-plan.md` during development. Each edge case was derived by analyzing the task descriptions, acceptance criteria, and system interactions described in the architecture.*