#!/usr/bin/env node
/**
 * One command to run the whole app locally.
 *
 *   npm start
 *
 * Starts the Firebase Emulator Suite (local, throwaway backend), waits for it to
 * be ready, then starts the Next.js dev server and prints the URL to open. This
 * exists so using the app needs no Firebase account: everything runs on this
 * machine. Press Ctrl+C to stop both.
 *
 * On the sign-in screen, use "Use a local test account" - no Google account or
 * email needed in local mode.
 */
import { spawn } from 'node:child_process';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import net from 'node:net';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const APP_URL = 'http://localhost:3000';

ensureEnv();
const env = withJavaOnPath();

const children = [];
function track(child) {
  children.push(child);
  child.on('exit', (code, signal) => {
    if (signal === 'SIGINT' || signal === 'SIGTERM') return;
    if (code && code !== 0) {
      console.error(`\n✖ A process exited unexpectedly (code ${code}). Stopping.\n`);
      shutdown();
    }
  });
}

let stopping = false;
function shutdown() {
  if (stopping) return;
  stopping = true;
  // Children run in their own process groups (detached), so signal the whole
  // group: otherwise the Emulator Suite's Java process outlives `firebase` and
  // holds port 8080, breaking the next run.
  for (const child of children) {
    if (!child.pid || child.killed) continue;
    try {
      process.kill(-child.pid, 'SIGINT');
    } catch {
      child.kill('SIGINT');
    }
  }
  setTimeout(() => process.exit(0), 1500);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log(
  '\n🐩  Starting Joey’s Log locally (test mode, nothing leaves this computer)…\n',
);

track(
  spawn(
    'npx',
    ['--no-install', 'firebase', 'emulators:start', '--only', 'auth,firestore'],
    {
      cwd: root,
      env,
      stdio: 'inherit',
      detached: true,
    },
  ),
);

await Promise.all([waitForPort(8080), waitForPort(9099)]);
console.log('\n✔ Local backend is ready. Starting the app…\n');

track(spawn('npm', ['run', 'dev'], { cwd: root, env, stdio: 'inherit', detached: true }));
await waitForPort(3000);

console.log(`
────────────────────────────────────────────────────────────
  Joey’s Log is running.  Open this in your browser:

      ${APP_URL}

  On the sign-in screen choose "Use a local test account".
  (Local test data is wiped whenever you stop this command.)

  Stop everything: press Ctrl+C here
────────────────────────────────────────────────────────────
`);

function ensureEnv() {
  const envPath = resolve(root, 'apps/web/.env.local');
  const examplePath = resolve(root, 'apps/web/.env.local.example');
  if (existsSync(envPath)) return;
  console.log('• Creating apps/web/.env.local from the template (local test mode).');
  copyFileSync(examplePath, envPath);
  const contents = readFileSync(envPath, 'utf8').replace(
    'NEXT_PUBLIC_USE_EMULATORS=false',
    'NEXT_PUBLIC_USE_EMULATORS=true',
  );
  writeFileSync(envPath, contents);
}

function withJavaOnPath() {
  // The Emulator Suite needs Java; a user-local JRE may not be on PATH yet.
  const jre = `${process.env.HOME}/.local/jre/bin`;
  const path = process.env.PATH ?? '';
  return {
    ...process.env,
    PATH: existsSync(jre) && !path.includes(jre) ? `${jre}:${path}` : path,
  };
}

function waitForPort(port, timeoutMs = 120_000) {
  const started = Date.now();
  return new Promise((resolvePromise, rejectPromise) => {
    const attempt = () => {
      const socket = net.connect({ host: '127.0.0.1', port });
      socket.once('connect', () => {
        socket.destroy();
        resolvePromise();
      });
      socket.once('error', () => {
        socket.destroy();
        if (Date.now() - started > timeoutMs) {
          rejectPromise(new Error(`Timed out waiting for port ${port}`));
        } else {
          setTimeout(attempt, 300);
        }
      });
    };
    attempt();
  });
}
