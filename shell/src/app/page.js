'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header, { appsList } from './components/Header';
import IframeShell from './components/IframeShell';
import JobAgentDashboard from './components/JobAgentDashboard';
import CloserDashboard from './components/CloserDashboard';

export default function Home() {
  const [activeApp, setActiveApp] = useState('shapeshifter');
  const [session, setSession] = useState({ loading: true, authenticated: false, user: null, token: '' });
  const [selectedJob, setSelectedJob] = useState(null);
  const router = useRouter();

  // Validate session status on mount
  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Unauthenticated');
      })
      .then(data => {
        setSession({
          loading: false,
          authenticated: true,
          user: data.user,
          token: data.token
        });
      })
      .catch(() => {
        setSession({ loading: false, authenticated: false, user: null, token: '' });
        router.push('/login');
      });
  }, [router]);

  const handleLogout = async () => {
    // 1. Broadcast FORCE_LOGOUT to the current active iframe to tear down its session
    const iframe = document.querySelector('.app-iframe');
    if (iframe) {
      try {
        console.log('Broadcasting FORCE_LOGOUT to sub-app iframe.');
        const currentApp = appsList.find(app => app.id === activeApp);
        const targetOrigin = currentApp && currentApp.path.startsWith('http') 
          ? new URL(currentApp.path).origin 
          : window.location.origin;
        iframe.contentWindow.postMessage({ type: 'FORCE_LOGOUT' }, targetOrigin);
      } catch (err) {
        console.error('Failed to broadcast logout event:', err);
      }
    }

    // 2. Contact shell backend to destroy session cookie
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout API failed:', err);
    }

    // 3. Clear session local state and redirect
    setSession({ loading: false, authenticated: false, user: null, token: '' });
    router.push('/login');
  };

  if (session.loading) {
    return (
      <div style={loadingContainerStyle}>
        <div className="spinner" />
        <span style={loadingTextStyle}>Validating secure session...</span>
      </div>
    );
  }

  if (!session.authenticated) {
    return null; // will redirect to login via useEffect
  }

  return (
    <div className="shell-container">
      <Header 
        activeApp={activeApp} 
        setActiveApp={setActiveApp} 
        user={session.user} 
        onLogout={handleLogout} 
      />
      <main className="shell-content">
        {activeApp === 'jobagent' ? (
          <JobAgentDashboard 
            token={session.token} 
            user={session.user} 
            onOpenInCloser={(job) => {
              setSelectedJob(job);
              setActiveApp('closer');
            }}
          />
        ) : activeApp === 'closer' ? (
          <CloserDashboard 
            token={session.token} 
            user={session.user} 
            selectedJob={selectedJob}
            onClearSelectedJob={() => setSelectedJob(null)}
          />
        ) : (
          <IframeShell 
            activeApp={activeApp} 
            token={session.token} 
            user={session.user} 
          />
        )}
      </main>
    </div>
  );
}

const loadingContainerStyle = {
  width: '100vw',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  background: '#f8f9ff'
};

const loadingTextStyle = {
  fontSize: '0.9rem',
  fontWeight: '500',
  color: '#464554'
};
