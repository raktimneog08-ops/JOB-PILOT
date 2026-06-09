import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { TailoringRun } from "@/types";
import PDFFooter from "./shared/footer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingLeft: 35,
    paddingRight: 35,
    fontFamily: "Helvetica",
    fontSize: 8.5,
    color: "#1f2937",
    lineHeight: 1.3,
  },
  // Report Header
  titleContainer: {
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#3b82f6",
    borderBottomStyle: "solid",
    paddingBottom: 8,
  },
  reportTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#1e3a8a",
  },
  reportSubtitle: {
    fontSize: 9,
    color: "#4b5563",
    marginTop: 3,
  },
  // Dashboard Sections
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#1e3a8a",
    marginTop: 10,
    marginBottom: 6,
    textTransform: "uppercase",
    backgroundColor: "#eff6ff",
    padding: 3,
  },
  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  scoreCard: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderStyle: "solid",
    borderRadius: 4,
    padding: 8,
    backgroundColor: "#f8fafc",
  },
  scoreHeader: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#1e3a8a",
    marginBottom: 6,
    textAlign: "center",
  },
  scoreValueContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },
  scoreBigText: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: "#2563eb",
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 1.5,
    fontSize: 7.5,
  },
  scoreLabel: {
    color: "#4b5563",
  },
  scoreNum: {
    fontFamily: "Helvetica-Bold",
    color: "#1f2937",
  },
  // JD Requirements Summary
  jdSummaryBox: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "solid",
    borderRadius: 4,
    padding: 8,
    marginBottom: 10,
    backgroundColor: "#f8fafc",
  },
  jdRow: {
    marginBottom: 6,
  },
  jdLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#4b5563",
    marginBottom: 2,
  },
  jdText: {
    fontSize: 8,
    color: "#1f2937",
  },
  // Gap Analysis Table
  gapTable: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "solid",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    fontFamily: "Helvetica-Bold",
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    borderBottomStyle: "solid",
  },
  tableRow: {
    flexDirection: "row",
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    borderBottomStyle: "solid",
  },
  colGap: { width: "30%" },
  colImportance: { width: "15%", textAlign: "center" },
  colAction: { width: "55%" },
  importanceBadge: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    textAlign: "center",
  },
  // Side by Side Styles
  comparisonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#e2e8f0",
    padding: 4,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#1e3a8a",
    marginBottom: 6,
  },
  comparisonColHeader: {
    width: "48.5%",
  },
  twoColLayout: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  column: {
    width: "48.5%",
  },
  resumeHeaderName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginBottom: 2,
  },
  resumeHeaderContact: {
    fontSize: 7.5,
    color: "#4b5563",
    marginBottom: 6,
  },
  resumeSectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    borderBottomStyle: "solid",
    paddingBottom: 2,
    marginTop: 8,
    marginBottom: 4,
  },
  bulletContainer: {
    flexDirection: "row",
    marginBottom: 3,
    paddingLeft: 4,
  },
  bulletSign: {
    width: 6,
    fontSize: 8,
    color: "#4b5563",
  },
  bulletText: {
    flex: 1,
    fontSize: 7.5,
    color: "#374151",
  },
  // Bullet Highlighted
  highlightedBulletContainer: {
    backgroundColor: "#f0fdf4",
    borderWidth: 0.5,
    borderColor: "#bbf7d0",
    borderStyle: "solid",
    borderRadius: 3,
    padding: 3,
    marginBottom: 4,
  },
  changeReasonText: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Oblique",
    color: "#059669",
    marginTop: 2,
    marginLeft: 6,
  },
  skillsText: {
    fontSize: 7.5,
    color: "#374151",
  },
  experienceTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    marginTop: 4,
    marginBottom: 1,
  },
  experienceSubTitle: {
    fontFamily: "Helvetica-Oblique",
    fontSize: 7.5,
    color: "#4b5563",
    marginBottom: 2,
  },
});

interface ComparisonPDFProps {
  run: TailoringRun;
}

export default function ComparisonPDF({ run }: ComparisonPDFProps) {
  const { originalResume, tailoredResume, originalScore, tailoredScore, gaps, jobDescription } = run;

  // Filter for top 5 gaps to make sure page 1 does not overflow
  const topGaps = gaps.slice(0, 5);
  const remainingGapsCount = gaps.length - topGaps.length;

  return (
    <Document title="Resume Tailoring Comparison Report">
      {/* PAGE 1: Dashboard Analysis */}
      <Page size="A4" style={styles.page}>
        <View style={styles.titleContainer}>
          <Text style={styles.reportTitle}>Resume Shapeshifter — Tailoring Report</Text>
          <Text style={styles.reportSubtitle}>
            Target Role: {jobDescription.jobTitle} {jobDescription.company ? `at ${jobDescription.company}` : ""} | Run Date: {run.timestamp.split("T")[0]}
          </Text>
        </View>

        {/* Match Scores */}
        <Text style={styles.sectionTitle}>1. Match Score Comparison</Text>
        <View style={styles.gridContainer}>
          {/* Original Score */}
          <View style={styles.scoreCard}>
            <Text style={styles.scoreHeader}>Original Resume Score</Text>
            <View style={styles.scoreValueContainer}>
              <Text style={styles.scoreBigText}>{originalScore.overallScore}/100</Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Skill Coverage:</Text>
              <Text style={styles.scoreNum}>{originalScore.skillCoverageScore}%</Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Responsibility Alignment:</Text>
              <Text style={styles.scoreNum}>{originalScore.responsibilityAlignmentScore}%</Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Keyword Match:</Text>
              <Text style={styles.scoreNum}>{originalScore.keywordScore}%</Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Seniority Fit:</Text>
              <Text style={styles.scoreNum}>{originalScore.seniorityScore}%</Text>
            </View>
          </View>

          {/* Tailored Score */}
          <View style={styles.scoreCard}>
            <Text style={styles.scoreHeader}>Tailored Resume Score</Text>
            <View style={styles.scoreValueContainer}>
              <Text style={styles.scoreBigText}>{tailoredScore.overallScore}/100</Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Skill Coverage:</Text>
              <Text style={styles.scoreNum}>{tailoredScore.skillCoverageScore}%</Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Responsibility Alignment:</Text>
              <Text style={styles.scoreNum}>{tailoredScore.responsibilityAlignmentScore}%</Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Keyword Match:</Text>
              <Text style={styles.scoreNum}>{tailoredScore.keywordScore}%</Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Seniority Fit:</Text>
              <Text style={styles.scoreNum}>{tailoredScore.seniorityScore}%</Text>
            </View>
          </View>
        </View>

        {/* JD Requirements */}
        <Text style={styles.sectionTitle}>2. Job Description Requirements Summary</Text>
        <View style={styles.jdSummaryBox}>
          <View style={styles.jdRow}>
            <Text style={styles.jdLabel}>Required Skills</Text>
            <Text style={styles.jdText}>{jobDescription.requiredSkills.join(", ") || "None specified"}</Text>
          </View>
          <View style={styles.jdRow}>
            <Text style={styles.jdLabel}>Preferred Skills</Text>
            <Text style={styles.jdText}>{jobDescription.preferredSkills.join(", ") || "None specified"}</Text>
          </View>
          <View style={{ ...styles.jdRow, marginBottom: 0 }}>
            <Text style={styles.jdLabel}>Top Responsibilities</Text>
            <Text style={styles.jdText}>
              {jobDescription.responsibilities.slice(0, 3).map((r, i) => `${i + 1}. ${r}`).join("   ")}
            </Text>
          </View>
        </View>

        {/* Gaps List */}
        <Text style={styles.sectionTitle}>3. Gap Analysis & Recommendations (Top 5)</Text>
        <View style={styles.gapTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colGap, { fontFamily: "Helvetica-Bold" }]}>Identified Gap</Text>
            <Text style={[styles.colImportance, { fontFamily: "Helvetica-Bold" }]}>Importance</Text>
            <Text style={[styles.colAction, { fontFamily: "Helvetica-Bold" }]}>Suggested Action</Text>
          </View>
          {topGaps.map((gap, idx) => {
            let badgeBg = "#eff6ff";
            let badgeColor = "#2563eb";
            if (gap.importance === "high") {
              badgeBg = "#fee2e2";
              badgeColor = "#ef4444";
            } else if (gap.importance === "medium") {
              badgeBg = "#fef3c7";
              badgeColor = "#d97706";
            }
            return (
              <View key={idx} style={styles.tableRow}>
                <Text style={styles.colGap}>{gap.name}</Text>
                <View style={styles.colImportance}>
                  <Text style={[styles.importanceBadge, { backgroundColor: badgeBg, color: badgeColor }]}>
                    {gap.importance}
                  </Text>
                </View>
                <Text style={styles.colAction}>{gap.suggestedAction}</Text>
              </View>
            );
          })}
          {remainingGapsCount > 0 && (
            <View style={[styles.tableRow, { backgroundColor: "#f8fafc" }]}>
              <Text style={{ flex: 1, fontSize: 8, color: "#6b7280", fontStyle: "italic", textAlign: "center" }}>
                + {remainingGapsCount} additional gaps identified. Review in-app for full list.
              </Text>
            </View>
          )}
        </View>

        <PDFFooter />
      </Page>

      {/* PAGE 2+: Side by Side Resume Diffs */}
      <Page size="A4" style={styles.page}>
        <View style={styles.comparisonHeader}>
          <Text style={styles.comparisonColHeader}>Original Resume (Left)</Text>
          <Text style={styles.comparisonColHeader}>Tailored Resume (Right)</Text>
        </View>

        {/* Candidate Info */}
        <View style={styles.twoColLayout}>
          {/* Original Header */}
          <View style={styles.column}>
            <Text style={styles.resumeHeaderName}>{originalResume.contact.name || "Candidate"}</Text>
            <Text style={styles.resumeHeaderContact}>
              {[originalResume.contact.email, originalResume.contact.phone].filter(Boolean).join(" | ")}
            </Text>
          </View>
          {/* Tailored Header */}
          <View style={styles.column}>
            <Text style={styles.resumeHeaderName}>{originalResume.contact.name || "Candidate"}</Text>
            <Text style={styles.resumeHeaderContact}>
              {[originalResume.contact.email, originalResume.contact.phone].filter(Boolean).join(" | ")}
            </Text>
          </View>
        </View>

        {/* Professional Summary */}
        <View style={styles.twoColLayout}>
          <View style={styles.column}>
            <Text style={styles.resumeSectionTitle}>Professional Summary</Text>
            <Text style={{ fontSize: 7.5, color: "#4b5563" }}>
              {originalResume.summary || "No original summary provided."}
            </Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.resumeSectionTitle}>Professional Summary</Text>
            {originalResume.summary !== tailoredResume.tailoredSummary ? (
              <View style={styles.highlightedBulletContainer}>
                <Text style={{ fontSize: 7.5, color: "#111827" }}>
                  {tailoredResume.tailoredSummary}
                </Text>
                <Text style={styles.changeReasonText}>
                  * Refocused summary to target the {jobDescription.jobTitle} responsibilities.
                </Text>
              </View>
            ) : (
              <Text style={{ fontSize: 7.5, color: "#374151" }}>
                {tailoredResume.tailoredSummary}
              </Text>
            )}
          </View>
        </View>

        {/* Skills */}
        <View style={styles.twoColLayout}>
          <View style={styles.column}>
            <Text style={styles.resumeSectionTitle}>Key Skills</Text>
            <Text style={styles.skillsText}>
              {originalResume.skills.join("  •  ")}
            </Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.resumeSectionTitle}>Key Skills</Text>
            {originalResume.skills.join(",") !== tailoredResume.tailoredSkills.join(",") ? (
              <View style={styles.highlightedBulletContainer}>
                <Text style={{ ...styles.skillsText, fontFamily: "Helvetica-Bold" }}>
                  {tailoredResume.tailoredSkills.join("  •  ")}
                </Text>
                <Text style={styles.changeReasonText}>
                  * Supplemented with matching skills required for the job.
                </Text>
              </View>
            ) : (
              <Text style={styles.skillsText}>
                {tailoredResume.tailoredSkills.join("  •  ")}
              </Text>
            )}
          </View>
        </View>

        {/* Experience */}
        <Text style={styles.resumeSectionTitle}>Professional Experience (Bullet Diffs)</Text>
        {tailoredResume.tailoredExperience.map((exp, expIdx) => {
          const origExp = originalResume.experience[expIdx];
          const dates = origExp ? `(${origExp.startDate} - ${origExp.endDate})` : "";

          return (
            <View key={expIdx} style={{ marginBottom: 6 }} wrap={false}>
              <View style={styles.twoColLayout}>
                {/* Original Experience header */}
                <View style={styles.column}>
                  <Text style={styles.experienceTitle}>
                    {exp.company}
                  </Text>
                  <Text style={styles.experienceSubTitle}>
                    {exp.title} {dates}
                  </Text>
                </View>
                {/* Tailored Experience header */}
                <View style={styles.column}>
                  <Text style={styles.experienceTitle}>
                    {exp.company}
                  </Text>
                  <Text style={styles.experienceSubTitle}>
                    {exp.title} {dates}
                  </Text>
                </View>
              </View>

              {/* Bullet Comparison */}
              {exp.bullets.map((bullet, bulletIdx) => (
                <View key={bulletIdx} style={styles.twoColLayout}>
                  {/* Left Column: Original Bullet */}
                  <View style={styles.column}>
                    <View style={styles.bulletContainer}>
                      <Text style={styles.bulletSign}>•</Text>
                      <Text style={styles.bulletText}>{bullet.original}</Text>
                    </View>
                  </View>

                  {/* Right Column: Tailored Bullet (Highlighted if different) */}
                  <View style={styles.column}>
                    {bullet.original !== bullet.tailored ? (
                      <View style={styles.highlightedBulletContainer}>
                        <View style={{ flexDirection: "row" }}>
                          <Text style={[styles.bulletSign, { color: "#065f46" }]}>•</Text>
                          <Text style={[styles.bulletText, { color: "#065f46", fontFamily: "Helvetica-Bold" }]}>
                            {bullet.tailored}
                          </Text>
                        </View>
                        <Text style={styles.changeReasonText}>
                          Reason: {bullet.changeReason}
                        </Text>
                        {bullet.keywordsAddressed.length > 0 && (
                          <Text style={{ ...styles.changeReasonText, color: "#1e40af" }}>
                            Keywords: {bullet.keywordsAddressed.join(", ")}
                          </Text>
                        )}
                      </View>
                    ) : (
                      <View style={styles.bulletContainer}>
                        <Text style={styles.bulletSign}>•</Text>
                        <Text style={styles.bulletText}>{bullet.tailored}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          );
        })}

        {/* Projects */}
        {tailoredResume.tailoredProjects && tailoredResume.tailoredProjects.length > 0 && (
          <View wrap={false}>
            <Text style={styles.resumeSectionTitle}>Projects & Initiatives (Bullet Diffs)</Text>
            {tailoredResume.tailoredProjects.map((proj, projIdx) => (
              <View key={projIdx} style={{ marginBottom: 6 }}>
                <View style={styles.twoColLayout}>
                  <View style={styles.column}>
                    <Text style={styles.experienceTitle}>{proj.name}</Text>
                  </View>
                  <View style={styles.column}>
                    <Text style={styles.experienceTitle}>{proj.name}</Text>
                  </View>
                </View>

                {proj.bullets.map((bullet, bulletIdx) => (
                  <View key={bulletIdx} style={styles.twoColLayout}>
                    <View style={styles.column}>
                      <View style={styles.bulletContainer}>
                        <Text style={styles.bulletSign}>•</Text>
                        <Text style={styles.bulletText}>{bullet.original}</Text>
                      </View>
                    </View>
                    <View style={styles.column}>
                      {bullet.original !== bullet.tailored ? (
                        <View style={styles.highlightedBulletContainer}>
                          <View style={{ flexDirection: "row" }}>
                            <Text style={[styles.bulletSign, { color: "#065f46" }]}>•</Text>
                            <Text style={[styles.bulletText, { color: "#065f46", fontFamily: "Helvetica-Bold" }]}>
                              {bullet.tailored}
                            </Text>
                          </View>
                          <Text style={styles.changeReasonText}>
                            Reason: {bullet.changeReason}
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.bulletContainer}>
                          <Text style={styles.bulletSign}>•</Text>
                          <Text style={styles.bulletText}>{bullet.tailored}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        <PDFFooter />
      </Page>
    </Document>
  );
}
