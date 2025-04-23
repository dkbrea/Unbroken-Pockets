# Recurring Transactions Sync Tools

This package contains tools to help sync locally stored recurring transactions to your Supabase database.

## Problem

The application stores recurring transactions in two places:
1. **Supabase Database**: The primary data store
2. **Browser localStorage**: Used as a fallback when offline or if there are database connectivity issues

Sometimes transactions might only exist in localStorage and not in the database, which can happen if:
- You created transactions while offline
- There were connectivity issues when adding transactions
- Database operations failed but local copies were saved

## Solution

These tools will help you push transactions from localStorage to your Supabase database.

## Tools Included

1. `export-recurring-transactions.html` - A browser utility to extract transaction data from localStorage
2. `push-recurring-transactions.js` - A Node.js script that uploads the extracted transactions to Supabase

## How to Use

### Step 1: Export Transactions from Browser

1. Open the `export-recurring-transactions.html` file in your browser
2. Click "Extract Transactions" to retrieve your recurring transactions from localStorage
3. Click "Copy to Clipboard" to copy the JSON data, or "Download as JSON" to save it as a file

### Step 2: Push Transactions to Supabase

#### Install Dependencies

```bash
npm install @supabase/supabase-js dotenv
```

#### Set Up Environment Variables

Ensure your `.env.local` file contains your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### Run the Script

```bash
node push-recurring-transactions.js
```

The script will:
1. Authenticate with Supabase using your current user session
2. Prompt you to paste the JSON data or provide a file path to the downloaded JSON
3. Compare with existing transactions in the database to find new ones
4. Ask for confirmation before uploading
5. Push the transactions to Supabase

## Notes

- You need to be authenticated with Supabase for the sync script to work
- The script will only upload transactions that don't already exist in the database
- Transactions are compared by ID, or by name+amount+date if ID matching fails
- The script will show you how many transactions will be uploaded before proceeding

## Troubleshooting

### Authentication Issues

If you get an error about not being authenticated:

1. Make sure you're logged in to the application in your browser
2. Try refreshing your auth token by logging out and back in
3. Check that your environment variables are correct

### JSON Parsing Errors

If you get JSON parsing errors:

1. Make sure you've copied the complete JSON data
2. Check for any formatting issues
3. Try using the "Download as JSON" option instead of copying directly

### Database Errors

If you encounter errors pushing to the database:

1. Check your database connection
2. Verify that the recurring_transactions table exists
3. Ensure your user has permission to insert into the table 