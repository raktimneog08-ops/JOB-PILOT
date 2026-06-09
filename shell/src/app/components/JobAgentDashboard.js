'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function JobAgentDashboard({ onOpenInCloser }) {
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'settings'
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [lastRun, setLastRun] = useState(null);
  const [runId, setRunId] = useState(null);
  
  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  
  const [isRunning, setIsRunning] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState('');
  
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const logTerminalRef = useRef(null);

  const fetchListings = async () => {
    try {
      setLoadingListings(true);
      const res = await fetch('/api/job-agent/listings');
      if (res.ok) {
        const data = await res.json();
        setListings(data.listings || []);
        setLastRun(data.lastRun);
        setRunId(data.runId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingListings(false);
    }
  };

  const fetchConfig = async () => {
    try {
      setLoadingConfig(true);
      const res = await fetch('/api/job-agent/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    fetchListings();
    fetchConfig();
  }, []);

  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [logs]);

  const handleRunAgent = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setShowLogs(true);
    setLogs('Connecting to Job Agent Scraper...\n');
    
    try {
      const res = await fetch('/api/job-agent/run', { method: 'POST' });
      if (!res.ok) {
        throw new Error(`Execution request failed: ${res.statusText}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setLogs(prev => prev + chunk);
      }
    } catch (error) {
      setLogs(prev => prev + `\n[Error] ${error.message}\n`);
    } finally {
      setIsRunning(false);
      fetchListings();
    }
  };

  const handleStatusChange = async (jobUrl, newStatus) => {
    setListings(prev => prev.map(job => {
      if (job['Job URL'] === jobUrl) {
        return { ...job, Status: newStatus };
      }
      return job;
    }));

    try {
      const res = await fetch('/api/job-agent/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobUrl, status: newStatus })
      });
      if (!res.ok) {
        throw new Error('Failed to update status');
      }
    } catch (e) {
      console.error(e);
      fetchListings();
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/job-agent/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings.');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving settings.');
    }
  };

  const filteredListings = listings.filter(job => {
    const matchesSearch = 
      (job['Job Title'] || '').toLowerCase().includes(search.toLowerCase()) ||
      (job['Company Name'] || '').toLowerCase().includes(search.toLowerCase()) ||
      (job['Location'] || '').toLowerCase().includes(search.toLowerCase());
    
    const matchesPlatform = platformFilter === 'All' || job['Source Platform'] === platformFilter;
    const matchesStatus = statusFilter === 'All' || job['Status'] === statusFilter;

    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return { bg: '#e5e7eb', text: '#374151' };
      case 'Applied': return { bg: '#dcfce7', text: '#166534' };
      case 'Interviewing': return { bg: '#dbeafe', text: '#1e40af' };
      case 'Rejected': return { bg: '#fee2e2', text: '#991b1b' };
      case 'Offer': return { bg: '#f3e8ff', text: '#6b21a8' };
      default: return { bg: '#f3f4f6', text: '#4b5563' };
    }
  };

  return (
    <div style={containerStyle}>
      <div className="glass" style={bannerStyle}>
        <div style={bannerLeftStyle}>
          <h2 style={titleStyle}>Scraper Agent Dashboard</h2>
          <p style={subtitleStyle}>
            {lastRun ? `Last Run: ${lastRun}` : 'No recent agent execution recorded.'}
            {runId && ` (${runId})`}
          </p>
        </div>
        <div style={bannerRightStyle}>
          <button 
            onClick={handleRunAgent} 
            disabled={isRunning} 
            style={isRunning ? runBtnDisabledStyle : runBtnStyle}
          >
            {isRunning ? (
              <>
                <span className="spinner-small" /> Running Agent...
              </>
            ) : (
              'Run Scraper Agent'
            )}
          </button>
        </div>
      </div>

      {showLogs && (
        <div className="glass" style={logsContainerStyle}>
          <div style={logsHeaderStyle}>
            <span style={logsTitleStyle}>Agent Execution Logs</span>
            <button onClick={() => setShowLogs(false)} style={closeLogsBtnStyle}>✕ Hide Logs</button>
          </div>
          <pre ref={logTerminalRef} style={terminalStyle}>
            {logs}
          </pre>
        </div>
      )}

      <div style={tabsContainerStyle}>
        <button 
          onClick={() => setActiveTab('listings')} 
          style={activeTab === 'listings' ? activeTabStyle : tabStyle}
        >
          Job Listings ({filteredListings.length})
        </button>
        <button 
          onClick={() => setActiveTab('settings')} 
          style={activeTab === 'settings' ? activeTabStyle : tabStyle}
        >
          Agent Settings
        </button>
      </div>

      {activeTab === 'listings' && (
        <div className="glass" style={contentCardStyle}>
          <div style={filtersStyle}>
            <input 
              type="text" 
              placeholder="Search title, company, location..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              style={inputStyle}
            />
            
            <select 
              value={platformFilter} 
              onChange={e => setPlatformFilter(e.target.value)} 
              style={selectStyle}
            >
              <option value="All">All Platforms</option>
              <option value="Naukri">Naukri</option>
              <option value="RemoteOK">RemoteOK</option>
              <option value="Adzuna">Adzuna</option>
            </select>

            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)} 
              style={selectStyle}
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Applied">Applied</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Rejected">Rejected</option>
              <option value="Offer">Offer</option>
            </select>
          </div>

          {loadingListings ? (
            <div style={spinnerContainerStyle}>
              <div className="spinner" />
              <span>Loading scraped listings...</span>
            </div>
          ) : filteredListings.length === 0 ? (
            <div style={emptyStateStyle}>
              <span>No job listings found matching filters.</span>
            </div>
          ) : (
            <div style={tableWrapperStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr style={tableHeaderRowStyle}>
                    <th style={thStyle}>Job Title</th>
                    <th style={thStyle}>Company</th>
                    <th style={thStyle}>Location</th>
                    <th style={thStyle}>Salary</th>
                    <th style={thStyle}>Platform</th>
                    <th style={thStyle}>Date Scraped</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredListings.map((job, idx) => {
                    const statusColors = getStatusColor(job.Status);
                    return (
                      <tr key={idx} style={tableRowStyle}>
                        <td style={{ ...tdStyle, fontWeight: '600' }}>{job['Job Title']}</td>
                        <td style={tdStyle}>{job['Company Name']}</td>
                        <td style={tdStyle}>{job.Location || 'Remote'}</td>
                        <td style={tdStyle}>{job['Salary Range'] || 'Not Specified'}</td>
                        <td style={tdStyle}>
                          <span style={platformPillStyle}>{job['Source Platform']}</span>
                        </td>
                        <td style={tdStyle}>{job['Date Scraped']}</td>
                        <td style={tdStyle}>
                          <select 
                            value={job.Status || 'New'} 
                            onChange={e => handleStatusChange(job['Job URL'], e.target.value)}
                            style={{
                              ...statusSelectStyle,
                              backgroundColor: statusColors.bg,
                              color: statusColors.text,
                            }}
                          >
                            <option value="New">New</option>
                            <option value="Applied">Applied</option>
                            <option value="Interviewing">Interviewing</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Offer">Offer</option>
                          </select>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <a 
                              href={job['Job URL']} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              style={linkBtnStyle}
                            >
                              Link ↗
                            </a>
                            <button
                              onClick={() => onOpenInCloser && onOpenInCloser(job)}
                              style={closerActionBtnStyle}
                            >
                              Tailor ✍️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="glass" style={contentCardStyle}>
          {loadingConfig ? (
            <div style={spinnerContainerStyle}>
              <div className="spinner" />
              <span>Loading configuration...</span>
            </div>
          ) : (
            <form onSubmit={handleSaveConfig} style={formStyle}>
              <div style={formRowStyle}>
                <label style={labelStyle}>Target Job Titles (Comma separated)</label>
                <textarea 
                  value={config.job_titles?.join(', ') || ''} 
                  onChange={e => setConfig({
                    ...config,
                    job_titles: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  style={textareaStyle}
                  rows={3}
                />
              </div>

              <div style={formRowStyle}>
                <label style={labelStyle}>Filter Keywords (Comma separated)</label>
                <textarea 
                  value={config.keywords_filter?.join(', ') || ''} 
                  onChange={e => setConfig({
                    ...config,
                    keywords_filter: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  style={textareaStyle}
                  rows={3}
                />
              </div>

              <div style={formGridStyle}>
                <div>
                  <label style={labelStyle}>Max Results Per Platform</label>
                  <input 
                    type="number" 
                    value={config.max_results_per_platform || 50} 
                    onChange={e => setConfig({
                      ...config,
                      max_results_per_platform: parseInt(e.target.value, 10) || 50
                    })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Deduplication Similarity Threshold (%)</label>
                  <input 
                    type="number" 
                    value={config.dedup_similarity_threshold || 85} 
                    onChange={e => setConfig({
                      ...config,
                      dedup_similarity_threshold: parseInt(e.target.value, 10) || 85
                    })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <button type="submit" style={saveBtnStyle}>Save Config Settings</button>
            </form>
          )}
        </div>
      )}
      
      <style jsx global>{`
        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          display: inline-block;
          animation: spin-small-kf 0.8s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }
        @keyframes spin-small-kf {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

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

const bannerStyle = {
  padding: '24px',
  borderRadius: '16px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '16px',
};

const bannerLeftStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const titleStyle = {
  fontSize: '1.4rem',
  fontWeight: '700',
  letterSpacing: '-0.02em',
  color: '#0b1c30',
};

const subtitleStyle = {
  fontSize: '0.88rem',
  color: '#464554',
};

const bannerRightStyle = {
  display: 'flex',
  alignItems: 'center',
};

const runBtnStyle = {
  padding: '12px 24px',
  background: 'linear-gradient(135deg, #4648d4, #3b3dbb)',
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  fontSize: '0.9rem',
  fontWeight: '600',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(70, 72, 212, 0.2)',
  transition: 'transform 0.2s, background-color 0.2s',
  display: 'flex',
  alignItems: 'center',
};

const runBtnDisabledStyle = {
  ...runBtnStyle,
  background: '#6b7280',
  boxShadow: 'none',
  cursor: 'not-allowed',
};

const logsContainerStyle = {
  padding: '16px',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  border: '1px solid rgba(199, 196, 215, 0.6)',
};

const logsHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const logsTitleStyle = {
  fontSize: '0.9rem',
  fontWeight: '600',
  color: '#0b1c30',
};

const closeLogsBtnStyle = {
  background: 'transparent',
  border: 'none',
  fontSize: '0.82rem',
  fontWeight: '600',
  color: '#ef4444',
  cursor: 'pointer',
};

const terminalStyle = {
  background: '#111827',
  color: '#10b981',
  padding: '16px',
  borderRadius: '8px',
  fontFamily: 'Courier New, Courier, monospace',
  fontSize: '0.82rem',
  maxHeight: '220px',
  overflowY: 'auto',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
};

const tabsContainerStyle = {
  display: 'flex',
  gap: '12px',
  borderBottom: '1px solid rgba(199, 196, 215, 0.4)',
  paddingBottom: '8px',
};

const tabStyle = {
  padding: '8px 16px',
  background: 'transparent',
  border: 'none',
  fontSize: '0.92rem',
  fontWeight: '500',
  color: '#464554',
  cursor: 'pointer',
  transition: 'all 0.2s',
  borderBottom: '2px solid transparent',
};

const activeTabStyle = {
  ...tabStyle,
  color: '#4648d4',
  fontWeight: '600',
  borderBottom: '2px solid #4648d4',
};

const contentCardStyle = {
  padding: '24px',
  borderRadius: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
};

const filtersStyle = {
  display: 'flex',
  gap: '16px',
  flexWrap: 'wrap',
};

const inputStyle = {
  flex: '1',
  minWidth: '200px',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid rgba(199, 196, 215, 0.8)',
  outline: 'none',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
  background: 'white',
};

const selectStyle = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid rgba(199, 196, 215, 0.8)',
  outline: 'none',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
  background: 'white',
  minWidth: '150px',
};

const spinnerContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px',
  gap: '12px',
  color: '#464554',
};

const emptyStateStyle = {
  display: 'flex',
  justifyContent: 'center',
  padding: '40px',
  color: '#464554',
  fontSize: '0.92rem',
};

const tableWrapperStyle = {
  overflowX: 'auto',
  width: '100%',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
};

const tableHeaderRowStyle = {
  borderBottom: '2px solid rgba(199, 196, 215, 0.6)',
};

const thStyle = {
  padding: '12px 16px',
  fontSize: '0.85rem',
  fontWeight: '600',
  color: '#464554',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const tableRowStyle = {
  borderBottom: '1px solid rgba(199, 196, 215, 0.4)',
  transition: 'background-color 0.2s',
};

const tdStyle = {
  padding: '14px 16px',
  fontSize: '0.9rem',
  color: '#0b1c30',
  verticalAlign: 'middle',
};

const platformPillStyle = {
  padding: '4px 8px',
  borderRadius: '6px',
  background: '#e0e7ff',
  color: '#4338ca',
  fontSize: '0.78rem',
  fontWeight: '600',
};

const statusSelectStyle = {
  padding: '6px 12px',
  borderRadius: '8px',
  border: 'none',
  fontSize: '0.85rem',
  fontWeight: '600',
  cursor: 'pointer',
  outline: 'none',
};

const linkBtnStyle = {
  color: '#4648d4',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '0.88rem',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
};

const formRowStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const labelStyle = {
  fontSize: '0.88rem',
  fontWeight: '600',
  color: '#0b1c30',
};

const textareaStyle = {
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid rgba(199, 196, 215, 0.8)',
  outline: 'none',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
  resize: 'vertical',
};

const formGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px',
};

const saveBtnStyle = {
  alignSelf: 'flex-start',
  padding: '12px 24px',
  background: '#4648d4',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.9rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
};

const closerActionBtnStyle = {
  background: 'transparent',
  border: 'none',
  color: '#4648d4',
  fontWeight: '600',
  fontSize: '0.88rem',
  cursor: 'pointer',
  padding: 0,
  transition: 'color 0.2s',
};
