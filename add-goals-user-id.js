const { execSync } = require('child_process');
require('dotenv').config({ path: '.env.local' });

// Send the command to the MCP server
try {
  // Prepare the environment for the MCP server
  process.env.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  process.env.SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Create the command to add the user_id column to financial_goals
  const command = JSON.stringify({
    command: 'add_user_id_to_goals'
  });

  // Run mcp-server with the command
  const result = execSync(
    `echo '${command}' | node mcp-server.js`
  ).toString();

  console.log('Result:', result);
  console.log('Successfully added user_id column to financial_goals table!');
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
} 