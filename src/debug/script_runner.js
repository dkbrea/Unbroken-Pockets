#!/usr/bin/env node

// Load environment variables from .env file
require('dotenv').config();

// Execute the fetch_budget_data.js script
console.log('Loading budget data fetcher script...');
require('./fetch_budget_data.js'); 