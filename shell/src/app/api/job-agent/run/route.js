import { spawn } from 'child_process';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST() {
  const encoder = new TextEncoder();
  const cwd = path.resolve(process.cwd(), '../JOB-AGENT');
  
  const stream = new ReadableStream({
    start(controller) {
      let pyProcess = null;
      let active = true;

      const startProcess = (executable) => {
        if (!active) return;
        controller.enqueue(encoder.encode(`Spawning Job Scraper Agent with '${executable}'...\n`));
        
        try {
          pyProcess = spawn(executable, ['main.py'], { 
            cwd,
            env: {
              ...process.env,
              PYTHONUNBUFFERED: '1' // Force Python to output stdout immediately
            }
          });

          pyProcess.stdout.on('data', (data) => {
            if (active) controller.enqueue(encoder.encode(data.toString()));
          });

          pyProcess.stderr.on('data', (data) => {
            if (active) controller.enqueue(encoder.encode(data.toString()));
          });

          pyProcess.on('error', (err) => {
            if (!active) return;
            if (executable === 'python') {
              controller.enqueue(encoder.encode(`'python' command failed. Retrying with 'python3'...\n`));
              startProcess('python3');
            } else {
              controller.enqueue(encoder.encode(`Execution failed: ${err.message}. Please verify Python is installed.\n`));
              active = false;
              controller.close();
            }
          });

          pyProcess.on('close', (code) => {
            if (!active) return;
            controller.enqueue(encoder.encode(`\nJob Scraper Agent run completed with exit code ${code}.\n`));
            active = false;
            controller.close();
          });
        } catch (e) {
          if (!active) return;
          if (executable === 'python') {
            controller.enqueue(encoder.encode(`'python' spawn threw error: ${e.message}. Retrying with 'python3'...\n`));
            startProcess('python3');
          } else {
            controller.enqueue(encoder.encode(`Failed to launch Python: ${e.message}\n`));
            active = false;
            controller.close();
          }
        }
      };

      startProcess('python');
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
