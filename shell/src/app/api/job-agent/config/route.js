import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const configPath = path.resolve(process.cwd(), '../JOB-AGENT/config/settings.json');
    if (!fs.existsSync(configPath)) {
      return NextResponse.json({ error: 'Config file not found' }, { status: 404 });
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const configPath = path.resolve(process.cwd(), '../JOB-AGENT/config/settings.json');
    if (!fs.existsSync(configPath)) {
      return NextResponse.json({ error: 'Config file not found' }, { status: 404 });
    }
    
    const newConfig = await request.json();
    const currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    
    const mergedConfig = {
      ...currentConfig,
      ...newConfig
    };
    
    fs.writeFileSync(configPath, JSON.stringify(mergedConfig, null, 4), 'utf-8');
    return NextResponse.json(mergedConfig);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
