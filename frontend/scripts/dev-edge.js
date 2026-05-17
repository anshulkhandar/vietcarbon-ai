import { spawn, exec } from 'node:child_process';
import process from 'node:process';

const url = process.env.VITE_OPEN_URL || 'http://localhost:3000';
let opened = false;

function openEdge() {
  if (opened) return;
  opened = true;

  let command;
  if (process.platform === 'win32') {
    command = `cmd /c start "" msedge "${url}"`;
  } else if (process.platform === 'darwin') {
    command = `open -a "Microsoft Edge" "${url}"`;
  } else {
    command = `microsoft-edge "${url}" || microsoft-edge-stable "${url}" || xdg-open "${url}"`;
  }

  exec(command, (error) => {
    if (error) {
      console.log(`Could not open Microsoft Edge automatically. Open manually: ${url}`);
    }
  });
}

const vite = spawn('npx', ['vite', '--host', '0.0.0.0'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: process.platform === 'win32'
});

vite.stdout.on('data', (chunk) => {
  const text = chunk.toString();
  process.stdout.write(text);
  if (text.includes('Local:') || text.includes(url)) {
    setTimeout(openEdge, 500);
  }
});

vite.stderr.on('data', (chunk) => process.stderr.write(chunk));
vite.on('close', (code) => process.exit(code ?? 0));

setTimeout(openEdge, 3000);
