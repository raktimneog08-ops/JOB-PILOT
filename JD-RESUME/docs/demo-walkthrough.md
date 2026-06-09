# Resume Shapeshifter — Demo Walkthrough Script

This script guides you through demonstrating the full capabilities of Resume Shapeshifter. It highlights match scoring, gap analysis, side-by-side AI tailoring, truthfulness validation checks, and high-fidelity PDF exports.

---

## Preparation

1. **Verify Environment**:
   Ensure `.env.local` is present in the project root containing your `GROQ_API_KEY`.
2. **Start Server**:
   ```bash
   npm run dev
   ```
3. **Open App**:
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## Step-by-Step Walkthrough

### 1. The Landing Page & Demo Loading
*   **Action**: On load, point out the modern layout and the **Empty State Guide Card** indicating the four-step tailoring process.
*   **Action**: Click the **✨ Try Demo Sample** button in the top right corner.
*   **Result**: The **Resume Input** and **Job Description Input** text fields are automatically populated with realistic mock profiles.
*   **Talking Point**: *"Instead of forcing users to search for sample files, they can load a complete, pre-configured software engineering profile with a single click."*

### 2. Running Alignment Analysis
*   **Action**: Click the **Analyze Match** button and observe the skeleton loaders.
*   **Result**: The **Analysis Results** section appears, rendering:
    *   **Match Score Card**: Displays the overall match score (e.g. 70) and sub-scores. Hover over the dotted headers (e.g., *Skill Coverage*) to demonstrate the specific glossary definitions.
    *   **JD Requirements Summary**: Highlights required and preferred skills as badges.
    *   **Gap Analysis Table**: Lists critical gaps (e.g., AWS, Docker) with importance levels and suggested actions.
*   **Talking Point**: *"The engine performs a detailed semantic review, highlighting missing requirements so candidates know where their profile falls short before tailoring."*

### 3. Generating the Tailored Resume
*   **Action**: Click the **Generate Tailored Resume** button and observe the tailoring progress loaders.
*   **Result**: The application shifts to the **Side-by-Side Comparison** screen.
*   **Key Items to Show**:
    *   **Project Rendering**: Scroll down and point out that both **Experiences** and **Projects** are fully rendered in two columns.
    *   **Diff Highlights**: Optimized resume bullets are highlighted in amber.
    *   **Low Confidence Warning Banner**: Point out the persistent warning banner at the top indicating that some rewrites have low confidence.
    *   **Individual Bullet Checkpoints**: Find a low-confidence bullet (flagged because it introduced unsourced claims like Docker or Kubernetes). Note the inline warning explaining *why* it has low confidence, and point out the individual confirmation checkbox.

### 4. Resolving Guardrails & Exporting
*   **Action**: Try clicking the download buttons at the bottom.
*   **Result**: The buttons are disabled because the validation requirements haven't been met.
*   **Action**: Scroll to the flagged bullet points and check the **"I confirm this rewrite is accurate."** checkbox for each flagged item. Point out the counter updating inside the **Export Verification Guardrail Card**.
*   **Action**: Check the global checkbox: **"I have reviewed and verified all content for accuracy."**
*   **Result**: The download buttons immediately become active!
*   **Action**: Click **Download Tailored Resume** and **Download Comparison Report**. Open the PDFs and point out the high-fidelity render layouts and the footer disclaimers.
*   **Action**: (Optional) In the terminal running your Next.js server, observe that no audit warnings were printed because the export payload successfully included the confirmation flags.

---

## Conclusion
*   **Talking Point**: *"Resume Shapeshifter is not just an optimizer—it is a self-auditing tool that balances LLM tailoring power with strict user accountability and backend auditing, ensuring resume truthfulness."*
