import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function parseCSVLines(content) {
  const lines = content.split(/\r?\n/);
  const dataRows = [];
  const metadataLines = [];
  
  for (let line of lines) {
    if (line.trim().startsWith('#')) {
      metadataLines.push(line);
    } else if (line.trim()) {
      dataRows.push(line);
    }
  }
  return { dataRows, metadataLines };
}

function rebuildCSVRow(row, headers) {
  return headers.map(header => {
    let val = row[header] || '';
    if (typeof val === 'string' && val.includes('"')) {
      val = val.replace(/"/g, '""');
    }
    if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
      val = `"${val}"`;
    }
    return val;
  }).join(',');
}

export async function POST(request) {
  try {
    const { jobUrl, status } = await request.json();

    if (!jobUrl || !status) {
      return NextResponse.json({ error: 'Missing jobUrl or status' }, { status: 400 });
    }

    const validStatuses = ['New', 'Applied', 'Interviewing', 'Rejected', 'Offer'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const dataDir = path.resolve(process.cwd(), '../JOB-AGENT/data');
    if (!fs.existsSync(dataDir)) {
      return NextResponse.json({ error: 'Data directory does not exist' }, { status: 404 });
    }

    const files = fs.readdirSync(dataDir)
      .filter(f => f.endsWith('.csv'))
      .map(f => ({
        path: path.join(dataDir, f),
        mtime: fs.statSync(path.join(dataDir, f)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime);

    if (files.length === 0) {
      return NextResponse.json({ error: 'No listings CSV found' }, { status: 404 });
    }

    const latestFile = files[0].path;
    const content = fs.readFileSync(latestFile, 'utf-8');
    
    const { dataRows, metadataLines } = parseCSVLines(content);
    if (dataRows.length === 0) {
      return NextResponse.json({ error: 'CSV is empty' }, { status: 404 });
    }

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

    const headers = parseLine(dataRows[0]);
    let updated = false;
    const updatedRows = [];

    for (let i = 1; i < dataRows.length; i++) {
      const values = parseLine(dataRows[i]);
      const row = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });

      if (row['Job URL'] === jobUrl) {
        row['Status'] = status;
        updated = true;
      }
      updatedRows.push(row);
    }

    if (!updated) {
      return NextResponse.json({ error: 'Job URL not found in CSV' }, { status: 404 });
    }

    const newLines = [];
    newLines.push(headers.join(','));
    for (const row of updatedRows) {
      newLines.push(rebuildCSVRow(row, headers));
    }
    
    const fileContent = newLines.join('\n') + '\n' + metadataLines.join('\n');
    fs.writeFileSync(latestFile, fileContent, 'utf-8');

    return NextResponse.json({ success: true, updatedJobUrl: jobUrl, newStatus: status });
  } catch (error) {
    console.error('Error updating job status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
