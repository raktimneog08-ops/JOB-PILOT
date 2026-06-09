'use client';

import React, { useEffect, useState } from 'react';

const appsList = [
  { 
    id: 'shapeshifter', 
    title: 'Resume Shapeshifter', 
    path: process.env.NEXT_PUBLIC_SHAPESHIFTER_URL || 'http://localhost:3002/' 
  },
  { 
    id: 'closer', 
    title: 'The Closer', 
    path: process.env.NEXT_PUBLIC_THE_CLOSER_URL || 'https://the-closer-m59fkvodcfreb8yjtdqkaw.streamlit.app/?embed=true' 
  },
  {
    id: 'jobagent',
    title: 'Job Agent',
    path: '/api/job-agent/listings'
  }
];

export default function Header({ activeApp, setActiveApp, user, onLogout }) {
  const [status, setStatus] = useState('checking'); // 'online', 'offline', 'checking'
  const [showDropdown, setShowDropdown] = useState(false);

  // Dynamic client-side ping to verify app availability
  useEffect(() => {
    if (activeApp === 'jobagent' || activeApp === 'closer') {
      setStatus('online');
      return;
    }

    setStatus('checking');
    const activeItem = appsList.find(app => app.id === activeApp);
    if (!activeItem) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    fetch(activeItem.path, { method: 'HEAD', signal: controller.signal, mode: 'no-cors' })
      .then(() => {
        setStatus('online');
      })
      .catch(() => {
        setStatus('offline');
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [activeApp]);

  return (
    <header className="shell-header glass">
      <div className="logo-section">
        <div className="logo-icon">C</div>
        <span>Combine UI</span>
      </div>

      <nav className="app-tabs">
        {appsList.map(app => (
          <button
            key={app.id}
            className={`app-tab ${activeApp === app.id ? 'active' : ''}`}
            onClick={() => setActiveApp(app.id)}
          >
            {app.title}
          </button>
        ))}
      </nav>

      <div className="header-meta">
        <div className="status-badge">
          <span className={`status-dot ${status}`} />
          <span>
            {status === 'online' && 'Connected'}
            {status === 'offline' && 'Disconnected'}
            {status === 'checking' && 'Checking...'}
          </span>
        </div>
        
        {/* User Account Settings & Logout Dropdown */}
        <div style={profileContainerStyle}>
          <div 
            className="user-avatar" 
            onClick={() => setShowDropdown(!showDropdown)}
            title="Account Management"
          >
            {user?.name ? user.name[0] : 'U'}
          </div>

          {showDropdown && (
            <div className="glass" style={dropdownStyle}>
              <div style={userInfoStyle}>
                <span style={userNameStyle}>{user?.name || 'Administrator'}</span>
                <span style={userRoleStyle}>System Operator</span>
              </div>
              <button 
                onClick={() => {
                  setShowDropdown(false);
                  onLogout();
                }} 
                style={logoutBtnStyle}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const profileContainerStyle = {
  position: 'relative',
  display: 'inline-block'
};

const dropdownStyle = {
  position: 'absolute',
  top: '40px',
  right: '0',
  width: '180px',
  borderRadius: '8px',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  zIndex: 1000,
  animation: 'slideUp 0.2s ease-out',
  boxShadow: '0 10px 20px rgba(11, 28, 48, 0.08)'
};

const userInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  borderBottom: '1px solid rgba(199, 196, 215, 0.4)',
  paddingBottom: '8px',
  textAlign: 'left'
};

const userNameStyle = {
  fontSize: '0.82rem',
  fontWeight: '600',
  color: '#0b1c30'
};

const userRoleStyle = {
  fontSize: '0.7rem',
  color: '#464554'
};

const logoutBtnStyle = {
  padding: '6px 12px',
  background: '#ef4444',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '0.8rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  textAlign: 'center',
  ':hover': {
    background: '#dc2626'
  }
};

export { appsList };
