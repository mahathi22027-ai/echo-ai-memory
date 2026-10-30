/**
 * Multi-process runner for Echo
 * Runs both the Vite frontend server and Express backend server concurrently.
 */

import { spawn } from 'child_process';
import path from 'path';

console.log('----------------------------------------------------');
console.log('🌟 Launching ECHO Full-Stack System (Frontend + Backend)');
console.log('----------------------------------------------------');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

// 1. Start Express Backend Server on port 5000
const backend = spawn(npmCmd, ['run', 'server'], {
  stdio: 'inherit',
  shell: true
});

// 2. Start Vite Frontend Server on port 5173
const frontend = spawn(npmCmd, ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

function cleanup() {
  console.log('\nShutting down ECHO processes...');
  backend.kill();
  frontend.kill();
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
