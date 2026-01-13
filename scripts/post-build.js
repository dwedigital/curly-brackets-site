#!/usr/bin/env node

/**
 * Post-build script to restore API routes for development
 * Restores the API route file that was removed before static export build
 */

const fs = require('fs');
const path = require('path');

const apiRoutes = [
  'src/app/api/articles/route.ts',
  'src/app/api/tags/route.ts',
];

console.log('Restoring API routes for development...');

const { execSync } = require('child_process');

for (const routeFile of apiRoutes) {
  const fullPath = path.join(process.cwd(), routeFile);
  const dirPath = path.dirname(fullPath);

  if (!fs.existsSync(fullPath)) {
    console.log(`Restoring ${routeFile}...`);
    // Create directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Restore the file using git
    try {
      execSync(`git checkout HEAD -- ${routeFile}`, { stdio: 'inherit' });
      console.log(`✓ ${routeFile} restored`);
    } catch (error) {
      console.log(`⚠ Could not restore ${routeFile} from git (this is OK if file is new)`);
    }
  } else {
    console.log(`✓ ${routeFile} already exists`);
  }
}

console.log('✓ Post-build complete');

