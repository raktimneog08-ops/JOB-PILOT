"use client";

import { useState, useCallback } from "react";
import { ArrowRight } from "lucide-react";
import ResumeInput from "@/components/ResumeInput";
import JDInput from "@/components/JDInput";
import AnalyzeButton from "@/components/AnalyzeButton";
import ScoreCard from "@/components/ScoreCard";
import JDRequirementsSummary from "@/components/JDRequirementsSummary";
import GapAnalysis from "@/components/GapAnalysis";
import SideBySideColumns from "@/components/SideBySideColumns";
import ScoreComparisonBar from "@/components/ScoreComparisonBar";
import PDFExportButton from "@/components/PDFExportButton";
import LoadingState from "@/components/LoadingState";
import ErrorBanner from "@/components/ErrorBanner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import {
  ResumeProfile,
  JobDescriptionProfile,
  MatchScore,
  ResumeGap,
  TailoredResume,
  TailoringRun,
} from "@/types";

type Step = "input" | "analysis" | "comparison";

export default function Home() {
  const [step, setStep] = useState<Step>("input");
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTailoring, setIsTailoring] = useState(false);

  // Live state from API responses
  const [resumeData, setResumeData] = useState<ResumeProfile | null>(null);
  const [jdData, setJdData] = useState<JobDescriptionProfile | null>(null);
  const [originalScore, setOriginalScore] = useState<MatchScore | null>(null);
  const [gaps, setGaps] = useState<ResumeGap[]>([]);
  const [tailoredResume, setTailoredResume] = useState<TailoredResume | null>(null);
  const [tailoredScore, setTailoredScore] = useState<MatchScore | null>(null);
  const [tailoringRun, setTailoringRun] = useState<TailoringRun | null>(null);

  // Phase 4 states
  const [isDisclaimerChecked, setIsDisclaimerChecked] = useState(false);
  const [confirmedLowConfidenceIds, setConfirmedLowConfidenceIds] = useState<string[]>([]);

  // Phase 5 Transitions
  const [fadeClass, setFadeClass] = useState("opacity-100 transition-opacity duration-300");

  const changeStep = useCallback((newStep: Step) => {
    setFadeClass("opacity-0 transition-opacity duration-150");
    setTimeout(() => {
      setStep(newStep);
      setFadeClass("opacity-100 transition-opacity duration-300");
    }, 150);
  }, []);

  // Fetch sample data on click instead of mount
  const loadSampleData = useCallback(async () => {
    setErrorMessage(null);
    try {
      const [resume, jd] = await Promise.all([
        fetch("/sample/sample-resume.txt").then((r) => {
          if (!r.ok) throw new Error("Failed to load sample resume");
          return r.text();
        }),
        fetch("/sample/sample-jd.txt").then((r) => {
          if (!r.ok) throw new Error("Failed to load sample JD");
          return r.text();
        }),
      ]);
      setResumeText(resume);
      setJdText(jd);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to load sample data. Please paste manually."
      );
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!resumeText.trim() || !jdText.trim()) return;

    setErrorMessage(null);
    setIsAnalyzing(true);
    changeStep("analysis");
    setResumeData(null);
    setJdData(null);
    setOriginalScore(null);
    setGaps([]);
    
    // Reset Phase 4 states
    setIsDisclaimerChecked(false);
    setConfirmedLowConfidenceIds([]);

    try {
      const data = await api.analyze(resumeText, jdText);

      setResumeData(data.resume);
      setJdData(data.jd);
      setOriginalScore(data.originalScore);
      setGaps(data.gaps);
      setIsAnalyzing(false);
    } catch (e) {
      setErrorMessage(
        e instanceof Error ? e.message : "Network error. Please check your connection."
      );
      setIsAnalyzing(false);
      changeStep("input");
    }
  }, [resumeText, jdText, changeStep]);

  const handleTailor = useCallback(async () => {
    if (!resumeText.trim() || !jdText.trim()) return;

    setErrorMessage(null);
    setIsTailoring(true);
    setTailoredResume(null);
    setTailoredScore(null);
    
    // Reset Phase 4 states
    setIsDisclaimerChecked(false);
    setConfirmedLowConfidenceIds([]);

    try {
      const data = await api.tailor(resumeText, jdText);

      setTailoringRun(data.tailoringRun);
      setTailoredResume(data.tailoringRun.tailoredResume);
      setTailoredScore(data.tailoringRun.tailoredScore);
      setIsTailoring(false);
      changeStep("comparison");
    } catch (e) {
      setErrorMessage(
        e instanceof Error ? e.message : "Tailoring failed. Please try again."
      );
      setIsTailoring(false);
    }
  }, [resumeText, jdText, changeStep]);

  const handleToggleConfirmLowConfidence = useCallback((id: string) => {
    setConfirmedLowConfidenceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  // Helper to extract low-confidence bullet IDs
  const getLowConfidenceBulletIds = useCallback((run: TailoringRun | null): string[] => {
    if (!run || !run.tailoredResume) return [];
    const ids: string[] = [];
    
    // Experience bullets
    run.tailoredResume.tailoredExperience.forEach((exp, expIdx) => {
      exp.bullets.forEach((b, bulletIdx) => {
        if (b.confidence === "low") {
          ids.push(`exp-${expIdx}-bullet-${bulletIdx}`);
        }
      });
    });

    // Project bullets
    if (run.tailoredResume.tailoredProjects) {
      run.tailoredResume.tailoredProjects.forEach((proj, projIdx) => {
        proj.bullets.forEach((b, bulletIdx) => {
          if (b.confidence === "low") {
            ids.push(`proj-${projIdx}-bullet-${bulletIdx}`);
          }
        });
      });
    }
    
    return ids;
  }, []);

  const lowConfidenceBulletIds = getLowConfidenceBulletIds(tailoringRun);
  const totalLowConfidenceCount = lowConfidenceBulletIds.length;
  const confirmedLowConfidenceCount = confirmedLowConfidenceIds.filter(id => lowConfidenceBulletIds.includes(id)).length;
  const allLowConfidenceConfirmed = confirmedLowConfidenceCount === totalLowConfidenceCount;
  const isExportDisabled = !(allLowConfidenceConfirmed && isDisclaimerChecked);

  const canAnalyze = resumeText.trim().length > 0 && jdText.trim().length > 0;

  return (
    <div className={`mx-auto max-w-6xl px-4 py-8 ${fadeClass}`}>
      {/* Step 1: Input & Analysis Step */}
      {(step === "input" || step === "analysis") && (
        <div className="space-y-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-muted-foreground bg-clip-text text-transparent">
                Resume Shapeshifter
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Paste your resume and a job description to analyze the match and
                generate a tailored version.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSampleData}
              className="hover:bg-muted text-xs font-semibold gap-1.5 shadow-sm hover:scale-[1.02] active:scale-95 transition-all"
            >
              ✨ Try Demo Sample
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <ResumeInput
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              isLoading={isAnalyzing}
            />
            <JDInput
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              isLoading={isAnalyzing}
            />
          </div>

          <div className="flex justify-center">
            <AnalyzeButton
              onClick={handleAnalyze}
              isLoading={isAnalyzing}
              disabled={!canAnalyze}
            />
          </div>

          {errorMessage && (
            <div className="mt-4">
              <ErrorBanner message={errorMessage} onRetry={() => handleAnalyze()} />
            </div>
          )}

          {/* Analysis Loading Skeletons */}
          {isAnalyzing && <LoadingState type="analysis" />}

          {/* Empty State Guide Card when not analyzed yet */}
          {!originalScore && !isAnalyzing && (
            <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center max-w-2xl mx-auto space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
                <span className="text-xl">🚀</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-base">How it works</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Resume Shapeshifter evaluates your resume alignment, highlights skill gaps, and suggests tailored modifications to help you stand out.
                </p>
              </div>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 max-w-lg mx-auto text-xs text-muted-foreground pt-2">
                <div className="p-3 bg-card border rounded-lg space-y-1 shadow-sm">
                  <div className="font-bold text-foreground">1. Paste Profile</div>
                  <div>Add your resume and the target Job Description above.</div>
                </div>
                <div className="p-3 bg-card border rounded-lg space-y-1 shadow-sm">
                  <div className="font-bold text-foreground">2. Analyze Gaps</div>
                  <div>See match scores and missing skills immediately.</div>
                </div>
                <div className="p-3 bg-card border rounded-lg space-y-1 shadow-sm">
                  <div className="font-bold text-foreground">3. Tailor & Diff</div>
                  <div>Review rewrite suggestions and download verified PDFs.</div>
                </div>
              </div>
            </div>
          )}

          {/* Hydrated Analysis Results */}
          {originalScore && resumeData && jdData && !isAnalyzing && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-sm font-medium text-muted-foreground">
                  Analysis Results
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <ScoreCard score={originalScore} title="Original Match Score" />
                <JDRequirementsSummary jd={jdData} />
              </div>

              <div>
                <h2 className="mb-4 text-xl font-semibold">Gap Analysis</h2>
                <GapAnalysis gaps={gaps} />
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleTailor}
                  disabled={isTailoring}
                  size="lg"
                  className="gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-md"
                >
                  {isTailoring ? (
                    "Tailoring..."
                  ) : (
                    <>
                      Generate Tailored Resume
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Comparison */}
      {(step === "comparison" || (step === "analysis" && tailoredResume)) && (
        <div className="space-y-8 animate-fade-in">
          {isTailoring && <LoadingState type="tailoring" />}

          {tailoredResume && tailoredScore && resumeData && originalScore && !isTailoring && (
            <>
              <div className="text-center">
                <h1 className="text-2xl font-bold tracking-tight">
                  Side-by-Side Comparison
                </h1>
                <p className="mt-1 text-muted-foreground">
                  Review changes between your original and tailored resume
                </p>
              </div>

              <ScoreComparisonBar
                original={originalScore}
                tailored={tailoredScore}
              />

              <SideBySideColumns
                original={resumeData}
                tailored={tailoredResume}
                confirmedLowConfidenceIds={confirmedLowConfidenceIds}
                onToggleConfirmLowConfidence={handleToggleConfirmLowConfidence}
              />

              {/* Verification Guardrail Card */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/20 dark:bg-amber-950/5 p-5 shadow-sm max-w-xl mx-auto w-full space-y-4">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                  <span className="text-xl">🛡️</span>
                  <h3 className="font-semibold text-base">Export Verification Guardrail</h3>
                </div>
                <div className="text-sm space-y-3">
                  {totalLowConfidenceCount > 0 && (
                    <div className="flex items-center justify-between text-xs font-semibold text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-md">
                      <span>Bullet rewrites verification:</span>
                      <span>{confirmedLowConfidenceCount} of {totalLowConfidenceCount} confirmed</span>
                    </div>
                  )}
                  <div className="flex items-start gap-3 bg-muted/40 p-3 rounded-lg hover:bg-muted/60 transition-colors">
                    <input
                      type="checkbox"
                      id="global-disclaimer"
                      checked={isDisclaimerChecked}
                      onChange={(e) => setIsDisclaimerChecked(e.target.checked)}
                      className="h-4 w-4 mt-0.5 rounded border-muted-foreground text-primary focus:ring-primary cursor-pointer accent-primary"
                    />
                    <label htmlFor="global-disclaimer" className="text-xs leading-relaxed font-semibold cursor-pointer select-none text-foreground">
                      I have reviewed and verified all content for accuracy. I confirm this tailored resume contains only truthful information matching my background.
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="flex flex-wrap justify-center gap-4 w-full">
                  <PDFExportButton
                    tailoringRun={tailoringRun}
                    isDisabled={isExportDisabled}
                    confirmedByUser={isDisclaimerChecked}
                  />
                </div>
                <p className="max-w-md text-center text-xs text-muted-foreground">
                  ⚠ This tailored resume was generated for demonstration
                  purposes. Always review and verify all content before
                  submitting it to any employer.
                </p>
              </div>

              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  onClick={() => {
                    changeStep("input");
                    setResumeData(null);
                    setJdData(null);
                    setOriginalScore(null);
                    setGaps([]);
                    setTailoredResume(null);
                    setTailoredScore(null);
                    setTailoringRun(null);
                    
                    // Reset Phase 4 states
                    setIsDisclaimerChecked(false);
                    setConfirmedLowConfidenceIds([]);
                  }}
                >
                  Start Over
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}