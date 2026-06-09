/* eslint-disable */
const fs = require('fs');
const path = require('path');

async function main() {
  const resumePath = path.join(__dirname, '..', 'public', 'sample', 'sample-resume.txt');
  const jdPath = path.join(__dirname, '..', 'public', 'sample', 'sample-jd.txt');

  const resumeText = fs.readFileSync(resumePath, 'utf8');
  const jdText = fs.readFileSync(jdPath, 'utf8');

  const url = process.env.NEXT_PORT ? `http://localhost:${process.env.NEXT_PORT}/api/analyze` : 'http://localhost:3001/api/analyze';

  const maxAttempts = 20;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Attempt ${attempt} -> POST ${url}`);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jdText }),
      });

      const text = await res.text();
      console.log('Status:', res.status);
      console.log('Response:', text);
      return;
    } catch (err) {
      console.error('Request failed:', err.message || err);
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }

  console.error('All attempts exhausted');
  process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
