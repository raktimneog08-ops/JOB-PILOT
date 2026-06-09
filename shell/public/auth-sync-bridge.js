/**
 * auth-sync-bridge.js
 * 
 * Lightweight client SDK for target applications to listen to session
 * synchronizations from the parent Unified Integration Shell.
 */

(function () {
  // Configured trusted origins
  const TRUSTED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:8080',
    'https://unified-shell.com'
  ];

  window.addEventListener('message', function (event) {
    // 1. Origin Verification (CRITICAL Security check)
    if (!TRUSTED_ORIGINS.includes(event.origin)) {
      console.warn('Authentication sync ignored from untrusted origin:', event.origin);
      return;
    }

    const payload = event.data;
    if (!payload || typeof payload !== 'object') return;

    // 2. Handle Authentication Sync
    if (payload.type === 'SYNC_AUTH') {
      console.log('Received auth sync token from parent shell.');
      if (payload.token) {
        // Store session token locally in sub-app context
        localStorage.setItem('auth_token', payload.token);
        
        // Alternatively set a local session cookie for backend queries
        document.cookie = `session_token=${payload.token}; Path=/; SameSite=Lax; Secure`;
        
        // Dispatch local event for internal app routing updates
        window.dispatchEvent(new CustomEvent('shell-auth-sync', { detail: payload.user }));
      }
    }

    // 3. Handle Forced Logout
    if (payload.type === 'FORCE_LOGOUT') {
      console.log('Received forced logout command from parent shell.');
      
      // Clear local credentials
      localStorage.removeItem('auth_token');
      document.cookie = 'session_token=; Path=/; Max-Age=0; SameSite=Lax; Secure';
      
      // Redirect or reload the application to enforce teardown
      window.location.reload();
    }
  });

  console.log('AuthSyncBridge initialized and listening for parent handshakes.');
})();
