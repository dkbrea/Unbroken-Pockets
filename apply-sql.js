// Script to extract the migration SQL to a file for manual application
const fs = require('fs');
const path = require('path');

// Read the migration file content
const migrationFile = path.join(__dirname, 'supabase/migrations/20250830_fix_variable_expense_delete_sync.sql');
const migrationSQL = fs.readFileSync(migrationFile, 'utf8');

// Write to output file
const outputFile = path.join(__dirname, 'migration-to-apply.sql');
fs.writeFileSync(outputFile, migrationSQL);

console.log(`Migration SQL has been extracted to ${outputFile}`);
console.log('Please apply this SQL through the Supabase Dashboard SQL Editor');
console.log('After applying, mark the migration as applied in schema_migrations table with:');
console.log(`
-- Add migration to history
INSERT INTO schema_migrations 
(version, name, status, applied_at)
VALUES
('20250830', '20250830_fix_variable_expense_delete_sync.sql', 'applied', NOW());
`); 