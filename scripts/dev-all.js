const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const previewDir = path.join(rootDir, 'site-preview');
const envFile = path.join(rootDir, '.env');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const strapiBin = path.join(rootDir, 'node_modules', '.bin', 'strapi');
const viteBin = path.join(previewDir, 'node_modules', '.bin', 'vite');
const requiredEnvKeys = [
  'APP_KEYS',
  'API_TOKEN_SALT',
  'ADMIN_JWT_SECRET',
  'TRANSFER_TOKEN_SALT',
  'JWT_SECRET',
  'ENCRYPTION_KEY',
];

const processes = [];
let shuttingDown = false;
let exitCode = 0;

function ensureDependencies() {
  const missing = [];

  if (!fs.existsSync(strapiBin)) {
    missing.push('Root dependencies are missing. Run `npm install` from the project root.');
  }

  if (!fs.existsSync(viteBin)) {
    missing.push('Preview dependencies are missing. Run `npm run preview:install` from the project root.');
  }

  if (missing.length === 0) {
    return true;
  }

  console.error('Cannot start `npm run dev:all` yet:');
  for (const message of missing) {
    console.error(`- ${message}`);
  }

  return false;
}

function readEnvFile() {
  if (!fs.existsSync(envFile)) {
    return null;
  }

  const raw = fs.readFileSync(envFile, 'utf8');
  const values = {};

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    values[key] = value.replace(/^['"]|['"]$/g, '');
  }

  return values;
}

function ensureEnvironment() {
  const envValues = readEnvFile();

  if (!envValues) {
    console.error('Cannot start `npm run dev:all` yet:');
    console.error('- Missing `.env`. Create it with `cp .env.example .env` from the project root.');
    return false;
  }

  const missingKeys = requiredEnvKeys.filter((key) => !envValues[key]);

  if (missingKeys.length === 0) {
    return true;
  }

  console.error('Cannot start `npm run dev:all` yet:');
  console.error(`- Missing required env vars in \`.env\`: ${missingKeys.join(', ')}`);
  console.error('- Start from `cp .env.example .env` and then retry.');
  return false;
}

function startProcess(name, args, cwd) {
  const child = spawn(npmCommand, args, {
    cwd,
    stdio: 'inherit',
  });

  child.on('error', (error) => {
    console.error(`[${name}] Failed to start:`, error.message);
    exitCode = 1;
    shutdown();
  });

  child.on('exit', (code, signal) => {
    if (shuttingDown) {
      return;
    }

    if (signal) {
      console.log(`[${name}] Stopped with signal ${signal}.`);
      exitCode = 1;
    } else if (code !== 0) {
      console.log(`[${name}] Exited with code ${code}.`);
      exitCode = code || 1;
    }

    shutdown();
  });

  processes.push(child);
}

function shutdown(signal = 'SIGTERM') {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of processes) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

if (!ensureDependencies()) {
  process.exit(1);
}

if (!ensureEnvironment()) {
  process.exit(1);
}

startProcess('strapi', ['run', 'develop'], rootDir);
startProcess('preview', ['run', 'preview:dev'], rootDir);

let closed = 0;

for (const child of processes) {
  child.on('close', () => {
    closed += 1;

    if (closed === processes.length) {
      process.exit(exitCode);
    }
  });
}
