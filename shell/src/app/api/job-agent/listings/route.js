import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function parseCSV(content) {
  const lines = content.split(/\r?\n/);
  const dataLines = [];
  const comments = [];
  
  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('#')) {
      comments.push(trimmed);
      continue;
    }
    dataLines.push(trimmed);
  }
  
  if (dataLines.length === 0) return { headers: [], rows: [], comments };
  
  // Custom CSV line parser to handle quoted commas correctly
  const parseLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result.map(val => {
      if (val.startsWith('"') && val.endsWith('"')) {
        return val.slice(1, -1);
      }
      return val;
    });
  };
  
  const headers = parseLine(dataLines[0]);
  const rows = [];
  for (let i = 1; i < dataLines.length; i++) {
    const values = parseLine(dataLines[i]);
    if (values.length >= headers.length) {
      const row = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });
      rows.push(row);
    }
  }
  
  return { headers, rows, comments };
}

export async function GET() {
  try {
    const dataDir = path.resolve(process.cwd(), '../JOB-AGENT/data');
    if (!fs.existsSync(dataDir)) {
      return NextResponse.json({ listings: [], lastRun: null, runId: null });
    }

    const files = fs.readdirSync(dataDir)
      .filter(f => f.endsWith('.csv'))
      .map(f => ({
        name: f,
        path: path.join(dataDir, f),
        mtime: fs.statSync(path.join(dataDir, f)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime);

    if (files.length === 0) {
      return NextResponse.json({ listings: [], lastRun: null, runId: null });
    }

    const latestFile = files[0].path;
    const content = fs.readFileSync(latestFile, 'utf-8');
    const { rows, comments } = parseCSV(content);

    // Parse comments for metadata
    let lastRun = null;
    let runId = null;
    comments.forEach(comment => {
      if (comment.startsWith('# Last run:')) {
        lastRun = comment.replace('# Last run:', '').trim();
      }
      if (comment.startsWith('# Run ID:')) {
        runId = comment.replace('# Run ID:', '').trim();
      }
    });

    return NextResponse.json({
      listings: rows,
      lastRun,
      runId,
      fileName: files[0].name
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
