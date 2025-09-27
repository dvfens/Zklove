#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Clearing Metro cache and fixing issues...');

try {
  // Clear Metro cache
  console.log('Clearing Metro cache...');
  execSync('npx expo r -c', { stdio: 'inherit' });
} catch (error) {
  console.log('Metro cache cleared (or already empty)');
}

// Clear node_modules/.cache if it exists
const cacheDir = path.join(__dirname, 'node_modules', '.cache');
if (fs.existsSync(cacheDir)) {
  console.log('Clearing node_modules cache...');
  fs.rmSync(cacheDir, { recursive: true, force: true });
}

// Clear Expo cache
const expoCacheDir = path.join(__dirname, '.expo');
if (fs.existsSync(expoCacheDir)) {
  console.log('Clearing Expo cache...');
  fs.rmSync(expoCacheDir, { recursive: true, force: true });
}

// Clear any InternalBytecode.js files
const findAndRemoveInternalBytecode = (dir) => {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        findAndRemoveInternalBytecode(filePath);
      } else if (file === 'InternalBytecode.js') {
        console.log(`Removing ${filePath}`);
        fs.unlinkSync(filePath);
      }
    });
  } catch (error) {
    // Ignore errors (permissions, etc.)
  }
};

console.log('Searching for and removing InternalBytecode.js files...');
findAndRemoveInternalBytecode(__dirname);

// Clear Metro bundler cache
const metroCacheDir = path.join(__dirname, 'node_modules', 'metro', 'cache');
if (fs.existsSync(metroCacheDir)) {
  console.log('Clearing Metro bundler cache...');
  fs.rmSync(metroCacheDir, { recursive: true, force: true });
}

console.log('✅ Cache cleared successfully!');
console.log('You can now run: npm start or expo start');
console.log('If issues persist, try: npm run clear-cache && npm start');
