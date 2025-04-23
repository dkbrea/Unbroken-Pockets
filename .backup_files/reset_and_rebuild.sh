#!/bin/bash

# Set variables for database connection
# You may need to modify these based on your Supabase configuration
DB_URL=${SUPABASE_DB_URL:-"postgresql://postgres:postgres@localhost:54322/postgres"}

echo "Resetting Supabase database..."

# Run the reset script to drop tables and reset sequences
psql $DB_URL -f supabase/reset_database.sql

echo "Recreating database schema..."

# Run migrations to recreate schema
# Run all migration files in order
for migration in supabase/migrations/*.sql; do
  echo "Applying migration: $migration"
  psql $DB_URL -f $migration
done

echo "Seeding database with sample data..."

# Run the seed script to populate with sample data
psql $DB_URL -f supabase/seed.sql

echo "Database reset and rebuild complete!" 