# Check if Supabase CLI is installed
$supabaseInstalled = $null
try {
    $supabaseInstalled = Get-Command supabase -ErrorAction Stop
} catch {
    # Supabase CLI not found
}

if ($null -eq $supabaseInstalled) {
    Write-Host "Supabase CLI is not installed. Please install it first."
    Write-Host "See: https://supabase.com/docs/guides/cli/getting-started"
    exit 1
}

# Start Supabase
Write-Host "Starting Supabase..."
supabase start

# Apply migrations
Write-Host "Applying migrations..."
supabase db reset

Write-Host "Supabase reset with all migrations and seed data applied successfully!"
Write-Host "Your database is now ready to use." 