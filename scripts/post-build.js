#!/usr/bin/env node

/**
 * Post-build script to restore API routes for development
 * Restores the API route file that was removed before static export build
 */

const fs = require('fs');
const path = require('path');

const apiRoutePath = path.join(process.cwd(), 'src/app/api/articles');
const apiRouteFile = path.join(apiRoutePath, 'route.ts');

console.log('Restoring API routes for development...');

// Restore API route from git if it was removed
if (!fs.existsSync(apiRouteFile)) {
  console.log('Restoring API route from git...');
  // Create directory if it doesn't exist
  if (!fs.existsSync(apiRoutePath)) {
    fs.mkdirSync(apiRoutePath, { recursive: true });
  }
  
  // Restore the file using git
  const { execSync } = require('child_process');
  try {
    execSync(`git checkout HEAD -- ${apiRouteFile}`, { stdio: 'inherit' });
    console.log('✓ API route restored');
  } catch (error) {
    console.log('⚠ Could not restore API route from git (this is OK if file is new)');
  }
} else {
  console.log('✓ API route already exists');
}

console.log('✓ Post-build complete');

