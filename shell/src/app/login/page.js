'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // If already logged in, redirect immediately
  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          router.push('/');
        }
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/');
      } else {
        setError(data.error || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={loginContainerStyle}>
      <div className="glass" style={cardStyle}>
        <div style={logoWrapperStyle}>
          <div className="logo-icon" style={logoIconOverride}>C</div>
          <h2 style={titleStyle}>Combine UI</h2>
        </div>
        <p style={subtitleStyle}>Please log in to access the unified workspaces</p>
        
        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              required
              style={inputStyle}
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={inputStyle}
            />
          </div>

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={tipStyle}>
          <strong>Local Test Credentials:</strong> admin / admin123
        </div>
      </div>
    </div>
  );
}

// Inline styles connecting with global CSS tokens
const loginContainerStyle = {
  width: '100vw',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #f1f3fa, #e8ecf8, #f8f9ff)',
  padding: '16px'
};

const cardStyle = {
  maxWidth: '400px',
  width: '100%',
  padding: '36px',
  borderRadius: '16px',
  display: 'flex',
  flexDirection: 'column',
  animation: 'slideUp 0.4s ease-out'
};

const logoWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '8px'
};

const logoIconOverride = {
  width: '32px',
  height: '32px',
  fontSize: '1.05rem'
};

const titleStyle = {
  fontSize: '1.5rem',
  fontWeight: '700',
  letterSpacing: '-0.02em',
  color: '#0b1c30'
};

const subtitleStyle = {
  fontSize: '0.88rem',
  color: '#464554',
  marginBottom: '24px'
};

const errorStyle = {
  padding: '10px 14px',
  borderRadius: '8px',
  background: 'rgba(239, 68, 68, 0.1)',
  color: '#ef4444',
  fontSize: '0.85rem',
  fontWeight: '500',
  marginBottom: '16px',
  border: '1.5px solid rgba(239, 68, 68, 0.15)',
  textAlign: 'left'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '18px'
};

const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  textAlign: 'left'
};

const labelStyle = {
  fontSize: '0.8rem',
  fontWeight: '600',
  color: '#0b1c30'
};

const inputStyle = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid rgba(199, 196, 215, 0.6)',
  background: 'rgba(255, 255, 255, 0.6)',
  fontFamily: 'inherit',
  fontSize: '0.9rem',
  color: '#0b1c30',
  outline: 'none',
  transition: 'border-color 0.2s'
};

const btnStyle = {
  padding: '11px',
  background: '#4648d4',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.9rem',
  fontWeight: '600',
  cursor: 'pointer',
  boxShadow: '0 4px 14px rgba(70, 72, 212, 0.15)',
  marginTop: '8px',
  transition: 'background-color 0.2s'
};

const tipStyle = {
  marginTop: '24px',
  fontSize: '0.8rem',
  color: '#464554',
  borderTop: '1px solid rgba(199, 196, 215, 0.4)',
  paddingTop: '16px',
  textAlign: 'center'
};

