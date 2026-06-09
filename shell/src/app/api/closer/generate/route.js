import { NextResponse } from 'next/server';

function generateLocalTemplate(jobTitle, company, location, resume, type, tone) {
  const locationText = location || 'Remote';
  
  const skills = [];
  if (resume) {
    const commonSkills = ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'CSS', 'HTML', 'JavaScript', 'SQL'];
    commonSkills.forEach(skill => {
      if (resume.toLowerCase().includes(skill.toLowerCase())) {
        skills.push(skill);
      }
    });
  }
  if (skills.length === 0) {
    skills.push('Full Stack Development', 'Software Engineering', 'System Architecture');
  }

  if (type === 'coverletter') {
    return `Dear Hiring Team at ${company},

I am writing to express my enthusiastic interest in the ${jobTitle} position at ${company}, based in ${locationText}. With a strong background in software engineering, particularly in ${skills.join(', ')}, I am confident in my ability to deliver immediate value to your engineering organization.

Throughout my career, I have focused on building scalable, user-centric web applications and optimizing system performance. In my previous roles, I have:
- Designed and maintained responsive front-end applications matching modern user experience standards.
- Engineered robust backend services and RESTful APIs, facilitating seamless data flow and integration.
- Collaborated closely with cross-functional teams to align technical specifications with business objectives.

I am particularly excited about ${company}'s mission and the opportunity to work alongside your talented engineering team. I look forward to the possibility of discussing how my technical background and passion for problem-solving align with your needs.

Thank you for your time and consideration.

Sincerely,
Admin User
[Tailored using Combine UI AI]`;
  } else if (type === 'coldemail') {
    if (tone === 'Concise') {
      return `Subject: ${jobTitle} Role - Outreach from Candidate

Hi Hiring Team at ${company},

I recently saw the ${jobTitle} opening at ${company} and wanted to reach out. I am a software engineer specializing in ${skills.slice(0, 3).join(' and ')}. 

I’ve built various web projects matching these requirements. I would love to chat briefly about how my skills align with your current goals. I've attached my resume for your reference.

Thanks,
Admin User`;
    }
    
    return `Subject: Application Inquiry: ${jobTitle} - Admin User

Dear Hiring Manager,

I hope this email finds you well. 

I am reaching out regarding the ${jobTitle} position currently open at ${company}. Having followed your company's growth, I am highly inspired by your recent milestones, and I believe my background in ${skills.join(', ')} makes me a great fit for the team.

In my recent projects, I have successfully developed applications that improve user interaction and streamlined developer workflows. I bring a proactive problem-solving mindset and a passion for engineering high-quality code.

I have attached my resume to this email and would appreciate the opportunity for a brief conversation to explore how I can support the team's objectives.

Best regards,
Admin User
[Combine UI AI Writer]`;
  } else if (type === 'linkedin') {
    return `Hi Hiring Team at ${company}, I noticed the ${jobTitle} opening and wanted to connect. I'm a software developer with experience in ${skills.slice(0, 3).join(', ')}. I’d love to connect and keep in touch regarding potential opportunities on the team. Best, Admin User`;
  } else if (type === 'followup') {
    return `Subject: Follow-up: ${jobTitle} application - Admin User

Hi team,

I hope you're having a great week. 

I wanted to follow up briefly on my application for the ${jobTitle} position at ${company}. I remain very interested in the role and would love to hear if there are any updates regarding the next steps in the hiring process.

If you need any additional portfolio links or references, please let me know. Thank you for your time!

Best,
Admin User`;
  }
  
  return `Outreach for ${jobTitle} at ${company}.`;
}

export async function POST(request) {
  try {
    const { jobTitle, company, location, resume, type, tone } = await request.json();

    if (!jobTitle || !company) {
      return NextResponse.json({ error: 'Missing jobTitle or company' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (apiKey) {
      const prompt = `
You are an expert career coach and professional copywriter. Write a job application outreach message.
DETAILS:
- Job Title: ${jobTitle}
- Company: ${company}
- Location: ${location || 'Remote'}
- Candidate Resume Snippet: ${resume || 'Experienced Software Developer'}
- Outreach Type: ${type} (Options: coverletter, coldemail, linkedin, followup)
- Tone: ${tone || 'Polite'} (Options: Bold, Polite, Concise)

INSTRUCTIONS:
1. Write ONLY the text of the generated outreach (including Subject line if it is an email).
2. Make it highly professional, tailored, and persuasive.
3. Keep it brief and high-impact. For LinkedIn, strictly limit to 290 characters.
4. Do not include any placeholder brackets (like [Insert Date]) in the final text. Fill in values or use general professional phrasing.
`;
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return NextResponse.json({ text, isAiGenerated: true });
          }
        }
        console.warn('Gemini API call failed, falling back to local templates.');
      } catch (err) {
        console.error('Error invoking Gemini API:', err);
      }
    }

    const text = generateLocalTemplate(jobTitle, company, location, resume, type, tone);
    return NextResponse.json({ text, isAiGenerated: false });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
