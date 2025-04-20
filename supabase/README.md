# Supabase Database Setup

This directory contains the database schema and seed data for your Supabase database.

## Directory Structure

- `migrations/`: Contains SQL migrations that define the database schema
- `seed/`: Contains seed data to populate your database with initial data

## Getting Started

### Requirements

1. [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)
2. Docker (required by Supabase CLI)

### Setup

To set up Supabase with the included schema and seed data, follow these steps:

#### Using CLI commands directly

1. Start Supabase:
   ```bash
   supabase start
   ```

2. Reset the database (applies migrations and seed data):
   ```bash
   supabase db reset
   ```

#### Using scripts

**Linux/macOS:**
```bash
chmod +x setup_supabase.sh
./setup_supabase.sh
```

**Windows (PowerShell):**
```powershell
.\setup_supabase.ps1
```

## Database Schema

The database schema includes the following tables:

- `budget_categories`: Stores budget categories and allocation amounts
- `budget_periods`: Stores active budget periods
- `cash_flow`: Stores monthly income and expense data
- `financial_goals`: Stores financial goals and progress
- `investment_portfolio`: Stores investment portfolio summary
- `portfolio_performance`: Stores performance data for different time ranges
- `asset_allocation`: Stores asset allocation data
- `investment_accounts`: Stores investment account information
- `holdings`: Stores individual investment holdings
- `report_types`: Stores financial report types
- `spending_categories`: Stores spending by category for reports

## Development

### Adding New Migrations

To add a new migration:

1. Create a new file in the `migrations/` directory with a name following the format `YYYYMMDD_description.sql`
2. Add your SQL commands to create or modify tables

### Modifying Seed Data

To modify seed data, edit the files in the `seed/` directory.

### Accessing the Database

- Local URL: http://localhost:54321
- Database: postgres
- Username: postgres
- Password: postgres

You can access the database through the Supabase Dashboard or using any PostgreSQL client. 