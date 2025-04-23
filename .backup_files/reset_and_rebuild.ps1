# PowerShell script to reset and rebuild the Supabase database

# Set variables for database connection
# You may need to modify these based on your Supabase configuration
$DB_URL = $env:SUPABASE_DB_URL
if (-not $DB_URL) {
    $DB_URL = "postgresql://postgres:postgres@localhost:54322/postgres"
}

Write-Host "Resetting Supabase database..." -ForegroundColor Cyan

# Run the reset script to drop tables and reset sequences
Write-Host "Dropping existing tables..." -ForegroundColor Yellow
& psql $DB_URL -f "supabase/reset_database.sql"

Write-Host "Recreating database schema..." -ForegroundColor Cyan

# Run migrations to recreate schema
# Run all migration files in order
Get-ChildItem -Path "supabase/migrations" -Filter "*.sql" | Sort-Object Name | ForEach-Object {
    Write-Host "Applying migration: $($_.FullName)" -ForegroundColor Yellow
    & psql $DB_URL -f $_.FullName
}

Write-Host "Seeding database with sample data..." -ForegroundColor Cyan

# Run the seed script to populate with sample data
& psql $DB_URL -f "supabase/seed/seed.sql"

Write-Host "Database reset and rebuild complete!" -ForegroundColor Green 