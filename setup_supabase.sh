#!/bin/bash

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI is not installed. Please install it first."
    echo "See: https://supabase.com/docs/guides/cli/getting-started"
    exit 1
fi

# Start Supabase
echo "Starting Supabase..."
supabase start

# Apply migrations
echo "Applying migrations..."
supabase db reset

echo "Supabase reset with all migrations and seed data applied successfully!"
echo "Your database is now ready to use." 