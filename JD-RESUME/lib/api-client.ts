import {
  ResumeProfile,
  JobDescriptionProfile,
  MatchScore,
  ResumeGap,
  TailoringRun,
} from "@/types";

export interface AnalyzeResponse {
  resume: ResumeProfile;
  jd: JobDescriptionProfile;
  originalScore: MatchScore;
  gaps: ResumeGap[];
  warnings: string[];
}

export interface TailorResponse {
  tailoringRun: TailoringRun;
  allWarnings: string[];
}

export interface ParseResumeResponse {
  resume: ResumeProfile;
  warnings: string[];
}

export interface ParseJDResponse {
  jd: JobDescriptionProfile;
  warnings?: string[];
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.error || `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  async analyze(resumeText: string, jdText: string): Promise<AnalyzeResponse> {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText, jdText }),
    });
    return handleResponse<AnalyzeResponse>(res);
  },

  async tailor(resumeText: string, jdText: string): Promise<TailorResponse> {
    const res = await fetch("/api/tailor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText, jdText }),
    });
    return handleResponse<TailorResponse>(res);
  },

  async parseResume(text: string): Promise<ParseResumeResponse> {
    const res = await fetch("/api/parse-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    return handleResponse<ParseResumeResponse>(res);
  },

  async parseJD(text: string): Promise<ParseJDResponse> {
    const res = await fetch("/api/parse-jd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    return handleResponse<ParseJDResponse>(res);
  },

  async exportPDF(tailoringRun: TailoringRun, type: "tailored" | "comparison", confirmedByUser: boolean): Promise<Blob> {
    const res = await fetch("/api/export/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tailoringRun, type, confirmedByUser }),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload.error || `PDF generation failed with status ${res.status}`);
    }
    return res.blob();
  },
};

