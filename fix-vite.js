const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== VITE ERROR FIX ===');
console.log('Starting automatic repair...\n');

const projectRoot = process.cwd();

function runCommand(command, description) {
  console.log(`→ ${description}...`);
  try {
    execSync(command, { cwd: projectRoot, stdio: 'inherit' });
    console.log(`✓ ${description} complete\n`);
    return true;
  } catch (error) {
    console.log(`✗ ${description} failed\n`);
    return false;
  }
}

function removeIfExists(filePath, description) {
  const fullPath = path.join(projectRoot, filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`→ Removing ${description}...`);
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log(`✓ ${description} removed\n`);
  }
}

console.log('Step 1: Cleaning build artifacts and caches');
removeIfExists('node_modules', 'node_modules');
removeIfExists('.vite', '.vite cache');
removeIfExists('dist', 'dist folder');
removeIfExists('package-lock.json', 'package-lock.json');

console.log('Step 2: Clearing npm cache');
runCommand('npm cache clean --force', 'Cache clean');

console.log('Step 3: Reinstalling dependencies');
const installed = runCommand('npm install', 'npm install');

if (!installed) {
  console.log('\n⚠ Installation failed. Trying alternative approach...\n');
  runCommand('npm install --legacy-peer-deps', 'npm install (legacy mode)');
}

console.log('Step 4: Verifying Vite installation');
const viteDistPath = path.join(projectRoot, 'node_modules/vite/dist/node/chunks/dist.js');
if (fs.existsSync(viteDistPath)) {
  console.log('✓ Vite is correctly installed\n');
} else {
  console.log('✗ Vite dist.js missing, reinstalling Vite...\n');
  runCommand('npm install vite@latest --save-dev', 'Vite reinstall');
}

console.log('Step 5: Final cleanup');
removeIfExists('.vite', '.vite cache (final)');

console.log('=== FIX COMPLETE ===');
console.log('You can now start the development server.');
console.log('If the error persists, please restart your terminal.\n');
