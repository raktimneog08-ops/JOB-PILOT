'use client';

import React, { useState, useEffect } from 'react';

export default function CloserDashboard({ selectedJob, onClearSelectedJob }) {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  
  // Persist resume text in localStorage so they don't have to paste it repeatedly
  const [resumeText, setResumeText] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('closer_resume_text') || '';
    }
    return '';
  });

  const [outreachType, setOutreachType] = useState('coverletter'); // 'coverletter' | 'coldemail' | 'linkedin' | 'followup'
  const [tone, setTone] = useState('Polite'); // 'Polite' | 'Bold' | 'Concise'
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [statusUpdated, setStatusUpdated] = useState(false);

  const handleLoadDemo = () => {
    setJobTitle('Senior Full Stack Engineer');
    setCompany('Combine Systems Inc.');
    setLocation('San Francisco, CA (Remote)');
    setJobDescription('We are looking for a Senior Full Stack Engineer experienced in Next.js, React, Node.js, and Python. You will lead the development of our AI-powered portal and integrate core automation pipelines.');
    handleResumeChange('7+ years of experience in JavaScript/TypeScript, React, Next.js, Node.js, Python, AWS. Engineered web shell containers and automated scraper microservices.');
    setOutreachType('coverletter');
    setTone('Polite');
    setGeneratedText('');
    setStatusUpdated(false);
  };

  // Populate inputs when a job is imported from Job Agent listings
  useEffect(() => {
    if (selectedJob) {
      setJobTitle(selectedJob['Job Title'] || '');
      setCompany(selectedJob['Company Name'] || '');
      setLocation(selectedJob.Location || '');
      setJobDescription(selectedJob['Description Snippet'] || '');
      setStatusUpdated(selectedJob.Status === 'Applied');
    }
  }, [selectedJob]);

  // Persist resume text changes
  const handleResumeChange = (val) => {
    setResumeText(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('closer_resume_text', val);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!jobTitle || !company) {
      alert('Please provide at least a Job Title and Company Name.');
      return;
    }
    
    setIsGenerating(true);
    setGeneratedText('');
    setCopySuccess(false);

    try {
      const res = await fetch('/api/closer/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle,
          company,
          location,
          resume: resumeText,
          type: outreachType,
          tone
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedText(data.text || '');
        setIsAiGenerated(data.isAiGenerated);
      } else {
        throw new Error('Generation failed');
      }
    } catch (err) {
      console.error(err);
      setGeneratedText('Failed to generate outreach text. Please check your network and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedText) return;
    navigator.clipboard.writeText(generatedText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleMarkAsApplied = async () => {
    if (!selectedJob) return;
    setIsSavingStatus(true);
    
    try {
      const res = await fetch('/api/job-agent/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobUrl: selectedJob['Job URL'],
          status: 'Applied'
        })
      });

      if (res.ok) {
        setStatusUpdated(true);
        alert('Job marked as Applied in database!');
      } else {
        alert('Failed to update job status.');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating status.');
    } finally {
      setIsSavingStatus(false);
    }
  };

  return (
    <div style={containerStyle}>
      {/* Selection Status Banner */}
      {selectedJob && (
        <div className="glass" style={importBannerStyle}>
          <span>
            📍 Imported listing details: <strong>{selectedJob['Job Title']}</strong> at <strong>{selectedJob['Company Name']}</strong>
          </span>
          <button onClick={onClearSelectedJob} style={clearBtnStyle}>
            Clear Import
          </button>
        </div>
      )}

      <div style={layoutGridStyle}>
        {/* Left column: Input Form */}
        <div className="glass" style={formCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={sectionTitleStyle}>Outreach Parameters</h3>
            <button type="button" onClick={handleLoadDemo} style={demoBtnStyle}>
              ⚡ Load Demo
            </button>
          </div>
          <form onSubmit={handleGenerate} style={formStyle}>
            <div style={formRowStyle}>
              <label style={labelStyle}>Job Title *</label>
              <input 
                type="text" 
                value={jobTitle} 
                onChange={e => setJobTitle(e.target.value)} 
                required
                style={inputStyle}
                placeholder="e.g. Senior Frontend Developer"
              />
            </div>

            <div style={formRowStyle}>
              <label style={labelStyle}>Company *</label>
              <input 
                type="text" 
                value={company} 
                onChange={e => setCompany(e.target.value)} 
                required
                style={inputStyle}
                placeholder="e.g. Stitch AI"
              />
            </div>

            <div style={formRowStyle}>
              <label style={labelStyle}>Location</label>
              <input 
                type="text" 
                value={location} 
                onChange={e => setLocation(e.target.value)} 
                style={inputStyle}
                placeholder="e.g. Bangalore (Remote)"
              />
            </div>

            <div style={formRowStyle}>
              <label style={labelStyle}>Job Description / Key Requirements</label>
              <textarea 
                value={jobDescription} 
                onChange={e => setJobDescription(e.target.value)} 
                style={textareaStyle}
                rows={4}
                placeholder="Paste key responsibilities or JD text here to customize the writing..."
              />
            </div>

            <div style={formRowStyle}>
              <label style={labelStyle}>Your Resume / Pitch Context</label>
              <textarea 
                value={resumeText} 
                onChange={e => handleResumeChange(e.target.value)} 
                style={textareaStyle}
                rows={5}
                placeholder="Paste your resume keywords or short pitch. (Auto-saved locally)"
              />
            </div>

            <div style={optionsGridStyle}>
              <div>
                <label style={labelStyle}>Message Type</label>
                <select 
                  value={outreachType} 
                  onChange={e => setOutreachType(e.target.value)} 
                  style={selectStyle}
                >
                  <option value="coverletter">Cover Letter</option>
                  <option value="coldemail">Cold Outreach Email</option>
                  <option value="linkedin">LinkedIn Connection Note</option>
                  <option value="followup">Follow-up Message</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Tone</label>
                <select 
                  value={tone} 
                  onChange={e => setTone(e.target.value)} 
                  style={selectStyle}
                >
                  <option value="Polite">Polite</option>
                  <option value="Bold">Bold / Dynamic</option>
                  <option value="Concise">Concise / Direct</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isGenerating} 
              style={isGenerating ? generateBtnDisabledStyle : generateBtnStyle}
            >
              {isGenerating ? 'Generating Outreach...' : 'Generate Outreach ✍️'}
            </button>
          </form>
        </div>

        {/* Right column: Generated Message Output */}
        <div className="glass" style={outputCardStyle}>
          <div style={outputHeaderStyle}>
            <h3 style={sectionTitleStyle}>Generated Outreach</h3>
            {isAiGenerated && <span style={aiBadgeStyle}>AI Generated</span>}
          </div>
          
          <div style={outputContainerStyle}>
            {isGenerating ? (
              <div style={spinnerContainerStyle}>
                <div className="spinner" />
                <span>Composing outreach message...</span>
              </div>
            ) : generatedText ? (
              <div style={outputBoxStyle}>
                <pre style={preTextStyle}>{generatedText}</pre>
              </div>
            ) : (
              <div style={emptyOutputStyle}>
                <span>Configure the parameters and click Generate to compose outreach text.</span>
              </div>
            )}
          </div>

          {generatedText && (
            <div style={actionRowStyle}>
              <button onClick={handleCopy} style={copyBtnStyle}>
                {copySuccess ? '✓ Copied!' : 'Copy to Clipboard'}
              </button>

              {selectedJob && (
                <button 
                  onClick={handleMarkAsApplied} 
                  disabled={isSavingStatus || statusUpdated} 
                  style={statusUpdated ? appliedBtnStyle : applyBtnStyle}
                >
                  {isSavingStatus ? 'Updating...' : statusUpdated ? '✓ Applied in Listings' : 'Mark Job as Applied'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Design Styles
const containerStyle = {
  padding: '24px',
  height: '100%',
  width: '100%',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  background: '#f8f9ff',
};

const importBannerStyle = {
  padding: '16px 20px',
  borderRadius: '12px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderLeft: '4px solid #4648d4',
  fontSize: '0.92rem',
};

const clearBtnStyle = {
  background: 'transparent',
  border: 'none',
  color: '#ef4444',
  fontWeight: '600',
  fontSize: '0.85rem',
  cursor: 'pointer',
};

const layoutGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '24px',
  alignItems: 'start',
  flex: '1',
  '@media(maxWidth: 768px)': {
    gridTemplateColumns: '1fr',
  }
};

const formCardStyle = {
  padding: '24px',
  borderRadius: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const outputCardStyle = {
  padding: '24px',
  borderRadius: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  height: '100%',
  minHeight: '500px',
};

const sectionTitleStyle = {
  fontSize: '1.15rem',
  fontWeight: '700',
  color: '#0b1c30',
  letterSpacing: '-0.01em',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const formRowStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const labelStyle = {
  fontSize: '0.85rem',
  fontWeight: '600',
  color: '#0b1c30',
};

const inputStyle = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid rgba(199, 196, 215, 0.8)',
  outline: 'none',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
  background: 'white',
};

const textareaStyle = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid rgba(199, 196, 215, 0.8)',
  outline: 'none',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
  resize: 'vertical',
};

const optionsGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
};

const selectStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid rgba(199, 196, 215, 0.8)',
  outline: 'none',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
  background: 'white',
};

const generateBtnStyle = {
  padding: '12px 20px',
  background: 'linear-gradient(135deg, #4648d4, #3b3dbb)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.9rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'transform 0.2s',
  marginTop: '8px',
};

const generateBtnDisabledStyle = {
  ...generateBtnStyle,
  background: '#6b7280',
  cursor: 'not-allowed',
};

const outputHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const aiBadgeStyle = {
  padding: '4px 8px',
  borderRadius: '6px',
  background: '#e0f2fe',
  color: '#0369a1',
  fontSize: '0.75rem',
  fontWeight: '600',
};

const outputContainerStyle = {
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
};

const outputBoxStyle = {
  flex: '1',
  background: '#ffffff',
  border: '1px solid rgba(199, 196, 215, 0.6)',
  borderRadius: '12px',
  padding: '20px',
  overflowY: 'auto',
  maxHeight: '520px',
};

const preTextStyle = {
  fontFamily: 'inherit',
  fontSize: '0.92rem',
  lineHeight: '1.6',
  color: '#0b1c30',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
};

const emptyOutputStyle = {
  flex: '1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px',
  border: '1px dashed rgba(199, 196, 215, 0.6)',
  borderRadius: '12px',
  color: '#464554',
  fontSize: '0.9rem',
  textAlign: 'center',
};

const spinnerContainerStyle = {
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  color: '#464554',
};

const actionRowStyle = {
  display: 'flex',
  gap: '16px',
  marginTop: '16px',
};

const copyBtnStyle = {
  padding: '10px 20px',
  background: '#4648d4',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.88rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  flex: '1',
};

const applyBtnStyle = {
  padding: '10px 20px',
  background: 'white',
  color: '#0b1c30',
  border: '1.5px solid #4648d4',
  borderRadius: '8px',
  fontSize: '0.88rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  flex: '1',
};

const appliedBtnStyle = {
  ...applyBtnStyle,
  background: '#dcfce7',
  color: '#166534',
  border: '1.5px solid #22c55e',
  cursor: 'not-allowed',
};

const demoBtnStyle = {
  background: 'rgba(70, 72, 212, 0.1)',
  border: 'none',
  color: '#4648d4',
  padding: '6px 12px',
  borderRadius: '6px',
  fontSize: '0.82rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
};
