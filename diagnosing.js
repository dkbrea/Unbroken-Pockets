// Diagnostic script to check for Next.js startup issues
const fs = require('fs');
const path = require('path');

console.log('Starting Next.js diagnostic...');

// Check if pages directory exists
try {
  const pagesPath = path.join(process.cwd(), 'src/pages');
  const pagesDirExists = fs.existsSync(pagesPath);
  console.log(`Pages directory exists: ${pagesDirExists}`);
  
  if (pagesDirExists) {
    const pages = fs.readdirSync(pagesPath);
    console.log('Pages found:', pages);
  }
} catch (error) {
  console.error('Error checking pages directory:', error);
}

// Check Next.js version
try {
  const packageJson = require('./package.json');
  console.log('Next.js version:', packageJson.dependencies.next);
  console.log('React version:', packageJson.dependencies.react);
  console.log('React DOM version:', packageJson.dependencies['react-dom']);
} catch (error) {
  console.error('Error checking Next.js version:', error);
}

// Check if _app.js exists
try {
  const appPath = path.join(process.cwd(), 'src/pages/_app.js');
  const appExists = fs.existsSync(appPath);
  console.log(`_app.js exists: ${appExists}`);
  
  if (appExists) {
    const appContent = fs.readFileSync(appPath, 'utf8');
    console.log('_app.js content:', appContent);
  }
} catch (error) {
  console.error('Error checking _app.js:', error);
}

// Check if _document.js exists
try {
  const documentPath = path.join(process.cwd(), 'src/pages/_document.js');
  const documentExists = fs.existsSync(documentPath);
  console.log(`_document.js exists: ${documentExists}`);
  
  if (documentExists) {
    const documentContent = fs.readFileSync(documentPath, 'utf8');
    console.log('_document.js content:', documentContent);
  }
} catch (error) {
  console.error('Error checking _document.js:', error);
}

console.log('Diagnostic complete'); 