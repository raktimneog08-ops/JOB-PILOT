import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { TailoringRun } from "@/types";
import PDFFooter from "./shared/footer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 65, // Extra padding to clear the footer
    paddingLeft: 45,
    paddingRight: 45,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#1f2937",
    lineHeight: 1.35,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  name: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginBottom: 4,
  },
  contactDetails: {
    fontSize: 8,
    color: "#4b5563",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  contactItem: {
    marginHorizontal: 5,
    marginBottom: 2,
  },
  sectionHeader: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    borderBottomStyle: "solid",
    paddingBottom: 2,
    marginTop: 12,
    marginBottom: 6,
  },
  summaryText: {
    textAlign: "justify",
    color: "#374151",
    marginBottom: 6,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 6,
  },
  skillText: {
    fontSize: 8.5,
    color: "#374151",
    marginRight: 6,
    marginBottom: 4,
  },
  experienceItem: {
    marginBottom: 8,
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 2,
  },
  companyName: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  dateText: {
    fontSize: 8,
    color: "#4b5563",
    fontFamily: "Helvetica",
  },
  jobTitle: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Oblique",
    color: "#4b5563",
    marginBottom: 4,
  },
  bulletContainer: {
    flexDirection: "row",
    marginBottom: 3,
    paddingLeft: 8,
  },
  bulletSign: {
    width: 8,
    fontSize: 9,
    color: "#4b5563",
  },
  bulletText: {
    flex: 1,
    color: "#374151",
  },
  projectItem: {
    marginBottom: 8,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 2,
  },
  projectName: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  projectTech: {
    fontSize: 8,
    fontFamily: "Helvetica-Oblique",
    color: "#4b5563",
    marginLeft: 4,
  },
  projectNameTechContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  educationItem: {
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  institutionName: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  degreeDetails: {
    fontSize: 8.5,
    color: "#374151",
  },
  certificationItem: {
    marginBottom: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  certName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  certIssuer: {
    fontSize: 8.5,
    color: "#374151",
  },
});

interface TailoredResumePDFProps {
  run: TailoringRun;
}

export default function TailoredResumePDF({ run }: TailoredResumePDFProps) {
  const { originalResume, tailoredResume } = run;
  const { contact } = originalResume;
  const {
    tailoredSummary,
    tailoredSkills,
    tailoredExperience,
    tailoredProjects,
    tailoredEducation,
    tailoredCertifications,
  } = tailoredResume;

  // Format contact details string items
  const contactInfo = [
    contact.email,
    contact.phone,
    contact.linkedin,
    contact.location,
  ].filter(Boolean);

  return (
    <Document title={`${contact.name || "Resume"} - Tailored Resume`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          {contact.name && <Text style={styles.name}>{contact.name}</Text>}
          <View style={styles.contactDetails}>
            {contactInfo.map((info, idx) => (
              <Text key={idx} style={styles.contactItem}>
                {info}
                {idx < contactInfo.length - 1 ? "  |  " : ""}
              </Text>
            ))}
          </View>
        </View>

        {/* Summary */}
        {tailoredSummary && (
          <View>
            <Text style={styles.sectionHeader}>Professional Summary</Text>
            <Text style={styles.summaryText}>{tailoredSummary}</Text>
          </View>
        )}

        {/* Skills */}
        {tailoredSkills && tailoredSkills.length > 0 && (
          <View>
            <Text style={styles.sectionHeader}>Key Skills</Text>
            <View style={styles.skillsContainer}>
              <Text style={styles.skillText}>
                {tailoredSkills.join("  •  ")}
              </Text>
            </View>
          </View>
        )}

        {/* Experience */}
        {tailoredExperience && tailoredExperience.length > 0 && (
          <View>
            <Text style={styles.sectionHeader}>Professional Experience</Text>
            {tailoredExperience.map((exp, idx) => {
              // Find matching original experience for dates
              const origExp = originalResume.experience[idx];
              const dates = origExp
                ? `${origExp.startDate} - ${origExp.endDate}`
                : "";

              return (
                <View key={idx} style={styles.experienceItem}>
                  <View style={styles.experienceHeader}>
                    <Text style={styles.companyName}>{exp.company}</Text>
                    <Text style={styles.dateText}>{dates}</Text>
                  </View>
                  <Text style={styles.jobTitle}>{exp.title}</Text>
                  {exp.bullets.map((bullet, bulletIdx) => (
                    <View key={bulletIdx} style={styles.bulletContainer}>
                      <Text style={styles.bulletSign}>•</Text>
                      <Text style={styles.bulletText}>{bullet.tailored}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        )}

        {/* Projects */}
        {tailoredProjects && tailoredProjects.length > 0 && (
          <View>
            <Text style={styles.sectionHeader}>Projects & Initiatives</Text>
            {tailoredProjects.map((project, idx) => {
              const origProj = originalResume.projects[idx];
              const techUsed = project.technologies && project.technologies.length > 0
                ? `(${project.technologies.join(", ")})`
                : origProj && origProj.technologies && origProj.technologies.length > 0
                ? `(${origProj.technologies.join(", ")})`
                : "";

              return (
                <View key={idx} style={styles.projectItem}>
                  <View style={styles.projectHeader}>
                    <View style={styles.projectNameTechContainer}>
                      <Text style={styles.projectName}>{project.name}</Text>
                      {techUsed && <Text style={styles.projectTech}>{techUsed}</Text>}
                    </View>
                  </View>
                  {project.bullets.map((bullet, bulletIdx) => (
                    <View key={bulletIdx} style={styles.bulletContainer}>
                      <Text style={styles.bulletSign}>•</Text>
                      <Text style={styles.bulletText}>{bullet.tailored}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        )}

        {/* Education */}
        {tailoredEducation && tailoredEducation.length > 0 && (
          <View>
            <Text style={styles.sectionHeader}>Education</Text>
            {tailoredEducation.map((edu, idx) => (
              <View key={idx} style={styles.educationItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.institutionName}>{edu.institution}</Text>
                  <Text style={styles.degreeDetails}>
                    {edu.degree} in {edu.field}
                  </Text>
                </View>
                <Text style={styles.dateText}>
                  {edu.startDate} - {edu.endDate}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {tailoredCertifications && tailoredCertifications.length > 0 && (
          <View>
            <Text style={styles.sectionHeader}>Certifications</Text>
            {tailoredCertifications.map((cert, idx) => (
              <View key={idx} style={styles.certificationItem}>
                <Text style={styles.certName}>
                  {cert.name} <Text style={styles.certIssuer}>({cert.issuer})</Text>
                </Text>
                <Text style={styles.dateText}>{cert.date}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer disclaimer and page numbering */}
        <PDFFooter />
      </Page>
    </Document>
  );
}
