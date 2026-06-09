'use client';

import React, { useState, useEffect, useRef } from 'react';
import { appsList } from './Header';

export default function IframeShell({ activeApp, token, user }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const iframeRef = useRef(null);
  const timeoutRef = useRef(null);

  const currentApp = appsList.find(app => app.id === activeApp);
  const iframeUrl = currentApp ? currentApp.path : '';

  // Reset states when switching apps or retrying
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 10-second timeout check
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setHasError(true);
      console.warn(`Load timeout exceeded for app: ${activeApp}`);
    }, 10000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [activeApp, retryCount]);

  const getTargetOrigin = (path) => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      try {
        return new URL(path).origin;
      } catch (e) {
        return '*';
      }
    }
    return typeof window !== 'undefined' ? window.location.origin : '*';
  };

  const handleIframeLoad = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsLoading(false);
    setHasError(false);

    // Securely dispatch token handshake payload to sub-app on load
    if (iframeRef.current && token) {
      try {
        console.log(`Dispatching SYNC_AUTH postMessage to ${currentApp.title}`);
        const targetOrigin = getTargetOrigin(currentApp.path);
        iframeRef.current.contentWindow.postMessage({
          type: 'SYNC_AUTH',
          token: token,
          user: user
        }, targetOrigin);
      } catch (error) {
        console.error('Failed to post message to iframe:', error);
      }
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  return (
    <div className="iframe-container">
      {/* Loading Overlay */}
      <div className={`loading-overlay ${isLoading ? 'active' : ''}`}>
        <div className="shimmer-loader">
          <div className="spinner" />
          <span className="loading-text">Securing connection to {currentApp?.title}...</span>
        </div>
      </div>

      {/* Fallback View */}
      {hasError ? (
        <div className="fallback-container">
          <div className="fallback-card glass">
            <div className="fallback-icon">!</div>
            <h3 className="fallback-title">Application Temporarily Unavailable</h3>
            <p className="fallback-desc">
              We encountered a timeout while establishing a proxy connection to <strong>{currentApp?.title}</strong>. 
              This could be due to a cold-start on the server or temporary network connectivity issues.
            </p>
            <button className="fallback-btn" onClick={handleRetry}>
              Retry Connection
            </button>
          </div>
        </div>
      ) : (
        /* The Iframe Viewport */
        <iframe
          ref={iframeRef}
          src={iframeUrl}
          className="app-iframe"
          onLoad={handleIframeLoad}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
          title={currentApp?.title}
        />
      )}
    </div>
  );
}
export { appsList };
