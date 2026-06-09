import {
  ResumeProfile,
  JobDescriptionProfile,
  MatchScore,
  TailoredResume,
  TailoredBullet,
  ResumeGap,
} from "@/types";

export const mockResume: ResumeProfile = {
  contact: {
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "(555) 123-4567",
    linkedin: "linkedin.com/in/johndoe",
    location: "San Francisco, CA",
  },
  summary:
    "Full-stack software engineer with 5+ years of experience building web applications using React, Node.js, and PostgreSQL.",
  skills: [
    "JavaScript",
    "TypeScript",
    "Python",
    "SQL",
    "React",
    "Next.js",
    "HTML/CSS",
    "Tailwind CSS",
    "Node.js",
    "Express",
    "REST APIs",
    "GraphQL",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "Git",
    "Docker",
    "AWS",
    "CI/CD",
    "Jest",
    "Cypress",
  ],
  experience: [
    {
      company: "TechCorp Inc.",
      title: "Senior Software Engineer",
      startDate: "Jan 2022",
      endDate: "Present",
      bullets: [
        "Led development of a customer-facing dashboard serving 50K+ daily users, reducing page load time by 40% through code splitting and lazy loading",
        "Designed and implemented a GraphQL API layer that unified data from 3 microservices, reducing frontend complexity",
        "Mentored 3 junior engineers through code reviews and pair programming sessions",
        "Migrated legacy jQuery codebase to React, improving developer velocity by 30%",
        "Implemented automated CI/CD pipeline with GitHub Actions, reducing deployment time from 2 hours to 15 minutes",
      ],
    },
    {
      company: "StartupXYZ",
      title: "Software Engineer",
      startDate: "Mar 2020",
      endDate: "Dec 2021",
      bullets: [
        "Built a real-time collaborative editing feature using WebSockets and CRDTs, supporting 100+ concurrent users",
        "Developed a REST API for user management and content moderation serving 10K requests/minute",
        "Created responsive UI components using React and Tailwind CSS, achieving 95+ Lighthouse accessibility score",
        "Integrated Stripe payment processing handling $500K+ in monthly transactions",
        "Wrote unit and integration tests achieving 85% code coverage",
      ],
    },
    {
      company: "WebAgency",
      title: "Junior Developer",
      startDate: "Jun 2019",
      endDate: "Feb 2020",
      bullets: [
        "Developed landing pages and marketing sites for 10+ client projects using React and WordPress",
        "Built custom WordPress plugins for e-commerce functionality",
        "Assisted in migrating client sites from PHP to Node.js backend",
      ],
    },
  ],
  projects: [
    {
      name: "TaskFlow",
      description:
        "Open-source project management app with Kanban boards and real-time updates",
      technologies: ["React", "Node.js", "PostgreSQL", "Docker"],
      bullets: [
        "500+ GitHub stars, used by multiple small teams",
        "Implemented drag-and-drop, user authentication, and WebSocket-based collaboration",
      ],
    },
  ],
  education: [
    {
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startDate: "2015",
      endDate: "2019",
    },
  ],
  certifications: [
    { name: "AWS Certified Developer - Associate", issuer: "Amazon", date: "2023" },
    { name: "MongoDB Certified Developer", issuer: "MongoDB", date: "2021" },
  ],
};

export const mockJD: JobDescriptionProfile = {
  jobTitle: "Senior Frontend Engineer",
  company: "TechGrowth Inc.",
  requiredSkills: [
    "React",
    "TypeScript",
    "Web Performance Optimization",
    "CSS",
    "Tailwind CSS",
    "REST APIs",
    "GraphQL",
    "Git",
    "CI/CD",
    "Testing",
    "Next.js",
  ],
  preferredSkills: [
    "State Management",
    "Redux",
    "Zustand",
    "Node.js",
    "AWS",
    "GCP",
    "Azure",
    "Design Systems",
    "Open Source",
  ],
  responsibilities: [
    "Architect and implement new frontend features using React and TypeScript",
    "Collaborate with designers to implement pixel-perfect, accessible UIs",
    "Optimize application performance and improve Core Web Vitals scores",
    "Participate in code reviews and mentor junior engineers",
    "Contribute to internal component library and design system",
    "Work with backend engineers to design and evolve API contracts",
    "Write and maintain comprehensive tests",
  ],
  qualifications: [
    "5+ years of professional software engineering experience",
    "3+ years of experience with React and TypeScript",
    "Strong understanding of web performance optimization",
    "Experience with modern CSS (Tailwind CSS, CSS Modules)",
    "Experience building and consuming REST and GraphQL APIs",
    "Proficiency with Git and CI/CD pipelines",
    "Strong testing practices",
    "Experience with Next.js or similar React framework",
  ],
  tools: [
    "React",
    "TypeScript",
    "Next.js",
    "Tailwind CSS",
    "GraphQL",
    "Jest",
    "Cypress",
    "Git",
    "GitHub Actions",
    "AWS",
    "Figma",
  ],
  keywords: [
    "senior frontend",
    "React",
    "TypeScript",
    "performance optimization",
    "Core Web Vitals",
    "code splitting",
    "lazy loading",
    "accessible",
    "component library",
    "design system",
    "API contracts",
    "unit tests",
    "integration tests",
    "end-to-end tests",
  ],
  seniorityLevel: "senior",
  domainSignals: ["web application", "platform team", "customer-facing"],
  softSkills: ["collaboration", "mentoring", "code review", "communication"],
};

export const mockOriginalScore: MatchScore = {
  overallScore: 64,
  skillCoverageScore: 72,
  responsibilityAlignmentScore: 58,
  keywordScore: 61,
  seniorityScore: 70,
  criticalMissingRequirements: [
    "No explicit mention of Core Web Vitals optimization experience",
    "No mention of design system or component library contribution",
    "State management expertise not highlighted",
  ],
  explanation:
    "Your resume shows solid frontend engineering experience, but several key areas from the JD are under-represented. Your React, TypeScript, and testing experience are strong matches. However, the JD emphasizes performance optimization (Core Web Vitals), design systems contribution, and explicit Next.js experience — areas where your resume could be stronger. The seniority level match is good based on your current title and 5+ years of experience.",
};

export const mockTailoredBullets: TailoredBullet[] = [
  {
    original:
      "Led development of a customer-facing dashboard serving 50K+ daily users, reducing page load time by 40% through code splitting and lazy loading",
    tailored:
      "Architected a customer-facing React dashboard serving 50K+ daily users, improving Core Web Vitals scores by 40% through code splitting, lazy loading, and performance optimization techniques",
    changeReason:
      "Added JD-specific terminology (Core Web Vitals, performance optimization) and stronger action verb (Architected)",
    keywordsAddressed: [
      "performance optimization",
      "Core Web Vitals",
      "code splitting",
      "lazy loading",
    ],
    confidence: "high",
    riskFlag: undefined,
  },
  {
    original:
      "Designed and implemented a GraphQL API layer that unified data from 3 microservices, reducing frontend complexity",
    tailored:
      "Designed and implemented a GraphQL API layer that unified data from 3 microservices, collaborating with backend engineers to evolve API contracts and reducing frontend complexity",
    changeReason:
      "Added collaboration language and 'API contracts' terminology from JD responsibilities",
    keywordsAddressed: ["GraphQL", "API contracts", "collaboration"],
    confidence: "high",
    riskFlag: undefined,
  },
  {
    original:
      "Mentored 3 junior engineers through code reviews and pair programming sessions",
    tailored:
      "Mentored 3 junior engineers through rigorous code reviews and pair programming sessions, upholding code quality standards across the team",
    changeReason:
      "Strengthened the mentoring description to align with JD's emphasis on code review participation",
    keywordsAddressed: ["code review", "mentoring"],
    confidence: "high",
    riskFlag: undefined,
  },
  {
    original:
      "Migrated legacy jQuery codebase to React, improving developer velocity by 30%",
    tailored:
      "Led migration of legacy jQuery codebase to a modern React architecture with reusable components, improving developer velocity by 30%",
    changeReason:
      "Emphasized component-based architecture to align with design system requirements",
    keywordsAddressed: ["React", "component library"],
    confidence: "medium",
    riskFlag: undefined,
  },
  {
    original:
      "Implemented automated CI/CD pipeline with GitHub Actions, reducing deployment time from 2 hours to 15 minutes",
    tailored:
      "Implemented automated CI/CD pipeline with GitHub Actions, reducing deployment time from 2 hours to 15 minutes",
    changeReason: "No change needed — already aligned with JD requirements",
    keywordsAddressed: ["CI/CD", "GitHub Actions", "Git"],
    confidence: "high",
    riskFlag: undefined,
  },
  {
    original:
      "Created responsive UI components using React and Tailwind CSS, achieving 95+ Lighthouse accessibility score",
    tailored:
      "Created responsive, accessible UI components using React and Tailwind CSS, achieving 95+ accessibility score and contributing patterns to the internal design system",
    changeReason:
      "Added design system contribution language to match JD responsibility",
    keywordsAddressed: [
      "Tailwind CSS",
      "accessible",
      "design system",
      "component library",
    ],
    confidence: "medium",
    riskFlag:
      "Verify you contributed to a shared component library or design system",
  },
  {
    original:
      "Wrote unit and integration tests achieving 85% code coverage",
    tailored:
      "Wrote comprehensive unit, integration, and end-to-end tests achieving 85% code coverage using Jest and Cypress",
    changeReason:
      "Added testing framework names (Jest, Cypress) and expanded test types to match JD",
    keywordsAddressed: [
      "unit tests",
      "integration tests",
      "end-to-end tests",
      "Jest",
      "Cypress",
    ],
    confidence: "high",
    riskFlag: undefined,
  },
  {
    original:
      "Built a real-time collaborative editing feature using WebSockets and CRDTs, supporting 100+ concurrent users",
    tailored:
      "Built a real-time collaborative editing feature using WebSockets and CRDTs, supporting 100+ concurrent users with optimized performance",
    changeReason:
      "Minor adjustment to emphasize performance, aligning with JD's performance focus",
    keywordsAddressed: ["performance optimization"],
    confidence: "high",
    riskFlag: undefined,
  },
];

export const mockTailoredResume: TailoredResume = {
  tailoredSummary:
    "Senior frontend-focused software engineer with 5+ years of experience architecting performant React applications, building scalable APIs, and mentoring engineering teams. Proven track record of improving Core Web Vitals, implementing design systems, and delivering accessible, user-centric interfaces.",
  tailoredSkills: [
    "React",
    "TypeScript",
    "Next.js",
    "JavaScript",
    "Tailwind CSS",
    "HTML/CSS",
    "Node.js",
    "Express",
    "GraphQL",
    "REST APIs",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "Git",
    "Docker",
    "AWS (EC2, S3)",
    "CI/CD (GitHub Actions)",
    "Jest",
    "Cypress",
    "Web Performance Optimization",
    "Design Systems",
    "State Management",
  ],
  tailoredExperience: [
    {
      company: "TechCorp Inc.",
      title: "Senior Software Engineer",
      bullets: mockTailoredBullets.slice(0, 5),
    },
    {
      company: "StartupXYZ",
      title: "Software Engineer",
      bullets: mockTailoredBullets.slice(5, 8),
    },
    {
      company: "WebAgency",
      title: "Junior Developer",
      bullets: [
        {
          original:
            "Developed landing pages and marketing sites for 10+ client projects using React and WordPress",
          tailored:
            "Developed responsive landing pages and marketing sites for 10+ client projects using React and WordPress",
          changeReason:
            "Added 'responsive' descriptor to align with frontend focus",
          keywordsAddressed: ["React", "CSS"],
          confidence: "high",
          riskFlag: undefined,
        },
        {
          original:
            "Built custom WordPress plugins for e-commerce functionality",
          tailored:
            "Built custom WordPress plugins for e-commerce functionality",
          changeReason: "No change needed",
          keywordsAddressed: [],
          confidence: "high",
          riskFlag: undefined,
        },
        {
          original:
            "Assisted in migrating client sites from PHP to Node.js backend",
          tailored:
            "Assisted in migrating client sites from PHP to Node.js backend",
          changeReason: "No change needed",
          keywordsAddressed: ["Node.js"],
          confidence: "high",
          riskFlag: undefined,
        },
      ],
    },
  ],
  tailoredProjects: [
    {
      name: "TaskFlow",
      description:
        "Open-source project management app with Kanban boards and real-time updates — 500+ GitHub stars",
      technologies: ["React", "Node.js", "PostgreSQL", "Docker"],
      bullets: [
        {
          original:
            "500+ GitHub stars, used by multiple small teams",
          tailored:
            "Open-source project with 500+ GitHub stars, demonstrating commitment to the developer community",
          changeReason:
            "Rephrased to highlight open-source contribution, a JD preferred qualification",
          keywordsAddressed: ["Open Source"],
          confidence: "medium",
          riskFlag:
            "Ensure you accurately represent your role in this open-source project",
        },
        {
          original:
            "Implemented drag-and-drop, user authentication, and WebSocket-based collaboration",
          tailored:
            "Implemented drag-and-drop, user authentication, and WebSocket-based real-time collaboration",
          changeReason:
            "Minor wording improvement for clarity",
          keywordsAddressed: [],
          confidence: "high",
          riskFlag: undefined,
        },
      ],
    },
  ],
  tailoredEducation: mockResume.education,
  tailoredCertifications: mockResume.certifications,
};

export const mockGaps: ResumeGap[] = [
  {
    name: "Core Web Vitals Optimization",
    importance: "high",
    jdEvidence:
      "Required Qualifications: 'Strong understanding of web performance optimization (Core Web Vitals, lazy loading, code splitting)'",
    resumeEvidence:
      "Mentions code splitting and lazy loading in one bullet (page load time reduction), but does not use 'Core Web Vitals' terminology explicitly",
    suggestedAction:
      "Add 'Core Web Vitals' terminology to the dashboard bullet if you have experience with performance metrics",
    canSafelyAdd: true,
  },
  {
    name: "Design System Contribution",
    importance: "high",
    jdEvidence:
      "Responsibilities: 'Contribute to our internal component library and design system'",
    resumeEvidence:
      "Not mentioned in current resume",
    suggestedAction:
      "Add if you have experience with design systems or component libraries (even informal team-level patterns)",
    canSafelyAdd: true,
  },
  {
    name: "State Management (Redux/Zustand)",
    importance: "medium",
    jdEvidence:
      "Preferred Qualifications: 'Experience with state management (Redux, Zustand, or similar)'",
    resumeEvidence:
      "Not explicitly mentioned in skills or experience bullets",
    suggestedAction:
      "Add to skills section if you have used any state management library. Mention in experience context if applicable",
    canSafelyAdd: true,
  },
  {
    name: "Explicit Next.js Experience",
    importance: "medium",
    jdEvidence:
      "Required Qualifications: 'Experience with Next.js or similar React framework' — also listed in Tools & Technologies",
    resumeEvidence:
      "Next.js listed in skills but not highlighted in any experience bullet",
    suggestedAction:
      "If you've used Next.js in any project or role, add a mention to the relevant experience bullet",
    canSafelyAdd: true,
  },
  {
    name: "Accessibility Deep Expertise",
    importance: "medium",
    jdEvidence:
      "Responsibilities: 'Collaborate with designers to implement pixel-perfect, accessible UIs'",
    resumeEvidence:
      "Mentions 95+ Lighthouse accessibility score in one bullet, but no deeper accessibility expertise",
    suggestedAction:
      "If you have deeper accessibility knowledge (WCAG, ARIA, screen reader testing), highlight it",
    canSafelyAdd: true,
  },
  {
    name: "Cloud Platform Experience",
    importance: "low",
    jdEvidence:
      "Preferred Qualifications: 'Experience with cloud platforms (AWS, GCP, or Azure)'",
    resumeEvidence:
      "AWS listed in skills and CI/CD bullet, but minimal detail on depth of cloud experience",
    suggestedAction:
      "If you have used AWS for production deployment, add a brief mention to an experience bullet",
    canSafelyAdd: true,
  },
];

export const mockTailoredScore: MatchScore = {
  overallScore: 82,
  skillCoverageScore: 88,
  responsibilityAlignmentScore: 78,
  keywordScore: 80,
  seniorityScore: 70,
  criticalMissingRequirements: [
    "State management expertise still not explicitly highlighted",
    "Accessibility deep expertise not fully covered",
  ],
  explanation:
    "After tailoring, your resume shows significantly improved alignment with the Senior Frontend Engineer role. Key improvements include: explicit mention of Core Web Vitals optimization, design system contribution language, stronger action verbs aligned with senior-level expectations, and better keyword coverage. The tailored score improved from 64 to 82. Two gaps remain: state management experience and deep accessibility expertise are still under-represented.",
};