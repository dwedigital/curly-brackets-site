#!/usr/bin/env node

/**
 * Pre-build script to prepare for static export
 * Removes API routes that are incompatible with static export
 */

const fs = require('fs');
const path = require('path');

const apiRoutePath = path.join(process.cwd(), 'src/app/api');

console.log('Preparing for static export build...');

// Remove API routes directory if it exists (they're not compatible with static export)
if (fs.existsSync(apiRoutePath)) {
  console.log('Removing API routes (not compatible with static export)...');
  fs.rmSync(apiRoutePath, { recursive: true, force: true });
  console.log('✓ API routes removed');
}

console.log('✓ Pre-build complete');

