#! /usr/bin/env node
/* Environment smoke test for the Node.js/JS stack. */

import { execFileSync } from 'node:child_process';

const STEPS = [
  { name: 'Node.js', cmd: 'node', args: ['--version'] },
  { name: 'npm', cmd: 'npm', args: ['--version'] },
  { name: 'git', cmd: 'git', args: ['--version'] },
  { name: 'ESLint', cmd: 'npx', args: ['eslint', '--version'] },
  { name: 'Prettier', cmd: 'npx', args: ['prettier', '--version'] },
];

let failed = false;
for (const step of STEPS) {
  try {
    const out = execFileSync(step.cmd, step.args, { encoding: 'utf8' });
    console.log(`OK    ${step.name}: ${out.trim()}`);
  } catch (err) {
    failed = true;
    console.error(`FAIL  ${step.name}: ${err.message}`);
  }
}

if (failed) {
  console.error('Environment check failed.');
  process.exit(1);
}
console.log('All Node.js/JS tooling checks passed.');
