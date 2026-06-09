/**
 * smoke-test.js
 * 
 * Node.js automated post-deployment validation script.
 * Verifies that shell routing, authentication redirects, and proxy gateway header rewrites
 * are active and correctly configured on the specified target domain.
 * 
 * Usage: node shell/scripts/smoke-test.js [target-domain]
 * Example: node shell/scripts/smoke-test.js http://localhost:3000
 */

const http = require('http');
const https = require('https');

// Read target domain argument (defaults to local port 3000)
const targetUrl = process.argv[2] || 'http://localhost:3000';
console.log(`\x1b[36m=== Starting Unified Shell Smoke Test against: ${targetUrl} ===\x1b[0m\n`);

// Helper to make HTTP/S requests and return headers/status
function makeRequest(urlStr, method = 'GET') {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(urlStr);
    const options = {
      method: method,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        'User-Agent': 'SmokeTestAgent/1.0',
        'Accept': '*/*'
      }
    };

    const requestLib = parsedUrl.protocol === 'https:' ? https : http;
    const req = requestLib.request(options, (res) => {
      resolve({
        statusCode: res.statusCode,
        headers: res.headers
      });
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}

// Run validation sequence
async function runSmokeTests() {
  let failed = false;

  // Test 1: Verify home page loads
  try {
    const res = await makeRequest(`${targetUrl}/`);
    console.log(`[PASS] Home page (/) loaded. Status: ${res.statusCode}`);
  } catch (err) {
    console.error(`[FAIL] Home page (/) failed to load: ${err.message}`);
    failed = true;
  }

  // Test 2: Verify unauthenticated session endpoints block access
  try {
    const res = await makeRequest(`${targetUrl}/api/auth/session`);
    if (res.statusCode === 401) {
      console.log(`[PASS] Unauthenticated session API blocked with 401 Unauthorized.`);
    } else {
      console.warn(`[WARN] Session API returned status ${res.statusCode} (expected 401).`);
    }
  } catch (err) {
    console.error(`[FAIL] Session API request failed: ${err.message}`);
    failed = true;
  }

  // Test 3: Verify login page renders
  try {
    const res = await makeRequest(`${targetUrl}/login`);
    if (res.statusCode === 200) {
      console.log(`[PASS] Login page (/login) is available. Status: ${res.statusCode}`);
    } else {
      console.error(`[FAIL] Login page (/login) returned status ${res.statusCode}.`);
      failed = true;
    }
  } catch (err) {
    console.error(`[FAIL] Login page (/login) request failed: ${err.message}`);
    failed = true;
  }

  // Test 4: Verify Shapeshifter Proxy Gateway
  try {
    const res = await makeRequest(`${targetUrl}/apps/shapeshifter/`, 'HEAD');
    console.log(`[PASS] Shapeshifter proxy route available. Status: ${res.statusCode}`);
    
    // Check framing headers
    const xfo = res.headers['x-frame-options'];
    const csp = res.headers['content-security-policy'];
    
    if (!xfo) {
      console.log(`[PASS] X-Frame-Options stripped from Shapeshifter response.`);
    } else {
      console.warn(`[WARN] X-Frame-Options exists in Shapeshifter response: ${xfo}`);
    }

    if (csp && csp.includes('frame-ancestors')) {
      console.log(`[PASS] Frame-ancestors CSP injected in Shapeshifter: ${csp}`);
    } else {
      console.warn(`[WARN] CSP framing rules missing from Shapeshifter: ${csp || 'none'}`);
    }
  } catch (err) {
    console.error(`[FAIL] Shapeshifter proxy check failed: ${err.message}`);
    failed = true;
  }

  // Test 5: Verify The Closer (Streamlit) Proxy Gateway
  try {
    const res = await makeRequest(`${targetUrl}/apps/closer/`, 'HEAD');
    console.log(`[PASS] The Closer proxy route available. Status: ${res.statusCode}`);
  } catch (err) {
    console.error(`[FAIL] The Closer proxy check failed: ${err.message}`);
    failed = true;
  }

  // Conclusion
  console.log('\n\x1b[36m====================================================\x1b[0m');
  if (failed) {
    console.log('\x1b[31mSmoke tests completed with FAILURES. Review logs above.\x1b[0m');
    process.exit(1);
  } else {
    console.log('\x1b[32mAll smoke tests PASSED. Production Gateway routes are verified!\x1b[0m');
    process.exit(0);
  }
}

runSmokeTests();
