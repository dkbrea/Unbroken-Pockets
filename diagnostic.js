const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting diagnostic check for Next.js project...');

// 1. Check package.json
try {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  console.log('Package.json found with the following dependencies:');
  console.log('- next:', packageJson.dependencies.next);
  console.log('- react:', packageJson.dependencies.react);
  console.log('- react-dom:', packageJson.dependencies.react);
} catch (error) {
  console.error('Error reading package.json:', error.message);
}

// 2. Check next.config.js
try {
  const nextConfigContent = fs.readFileSync('./next.config.js', 'utf8');
  console.log('\nNext.config.js found with content length:', nextConfigContent.length);
} catch (error) {
  console.error('Error reading next.config.js:', error.message);
}

// 3. Check pages directory
try {
  const pagesDir = './src/pages';
  const pages = fs.readdirSync(pagesDir);
  console.log('\nPages directory found with the following files:');
  pages.forEach(page => console.log('- ' + page));
} catch (error) {
  console.error('Error reading pages directory:', error.message);
}

// 4. Check node_modules
try {
  const nextModulePath = './node_modules/next';
  const exists = fs.existsSync(nextModulePath);
  console.log('\nNext.js module exists in node_modules:', exists);
  
  if (exists) {
    const packageJsonPath = path.join(nextModulePath, 'package.json');
    const nextPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log('Next.js version installed:', nextPackageJson.version);
  }
} catch (error) {
  console.error('Error checking node_modules:', error.message);
}

console.log('\nDiagnostic check complete.'); 