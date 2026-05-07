import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const isWindows = process.platform === 'win32';
const defaultUrl = 'http://localhost:3000';
const nextCli = fileURLToPath(new URL('../node_modules/next/dist/bin/next', import.meta.url));

let opened = false;
let existingServer = false;
let bufferedOutput = '';
let openTimer;
let pendingUrl = defaultUrl;

function openBrowser(url) {
  if (opened) return;
  opened = true;

  const command = isWindows
    ? ['cmd', ['/c', 'start', '""', url]]
    : process.platform === 'darwin'
      ? ['open', [url]]
      : ['xdg-open', [url]];

  const browser = spawn(command[0], command[1], {
    detached: true,
    stdio: 'ignore',
    shell: false,
  });

  browser.unref();
}

function scheduleBrowser(url, delay = 4000) {
  if (opened) return;
  pendingUrl = url;
  clearTimeout(openTimer);

  openTimer = setTimeout(() => {
    if (!existingServer) {
      openBrowser(pendingUrl);
    }
  }, delay);
}

function inspectOutput(chunk) {
  bufferedOutput += chunk;

  const localUrls = [...bufferedOutput.matchAll(/Local:\s+(https?:\/\/[^\s]+)/g)];
  const localUrl = localUrls.at(-1)?.[1];
  if (localUrl && bufferedOutput.includes('Ready')) {
    scheduleBrowser(localUrl);
  }

  const runningUrl = bufferedOutput.match(/Another next dev server is already running[\s\S]*?Local:\s+(https?:\/\/[^\s]+)/)?.[1];
  if (runningUrl) {
    existingServer = true;
    clearTimeout(openTimer);
    openBrowser(runningUrl);
  }
}

const next = spawn(process.execPath, [nextCli, 'dev'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: false,
});

next.stdout.on('data', (data) => {
  const chunk = data.toString();
  process.stdout.write(chunk);
  inspectOutput(chunk);
});

next.stderr.on('data', (data) => {
  const chunk = data.toString();
  process.stderr.write(chunk);
  inspectOutput(chunk);
});

next.on('exit', (code, signal) => {
  if (existingServer) {
    process.exit(0);
  }

  process.exit(code ?? (signal ? 1 : 0));
});

process.on('SIGINT', () => {
  next.kill('SIGINT');
});

process.on('SIGTERM', () => {
  next.kill('SIGTERM');
});

setTimeout(() => {
  scheduleBrowser(defaultUrl, 4000);
}, 8000);
