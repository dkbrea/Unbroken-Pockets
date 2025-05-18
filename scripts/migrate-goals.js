require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');

console.log('Starting goal contributions migration...');

try {
  // Build the TypeScript file first
  execSync('npx tsc src/lib/migrations/populate-goal-contributions.ts --outDir dist/migrations', {
    stdio: 'inherit'
  });

  // Run the compiled JavaScript file
  execSync('node dist/migrations/populate-goal-contributions.js', {
    stdio: 'inherit'
  });

  console.log('Migration completed successfully');
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
} 