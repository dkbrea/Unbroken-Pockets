# Next.js Project with Supabase

This is a [Next.js](https://nextjs.org/) project with [Supabase](https://supabase.io/) integration.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Supabase Setup

This project uses Supabase for backend services. There are two ways to use Supabase:

### Option 1: Using Supabase CLI (Recommended for local development)

1. Install Docker Desktop from [https://docs.docker.com/desktop/install/](https://docs.docker.com/desktop/install/)

2. Configure Docker Desktop to expose the daemon on TCP:
   - Open Docker Desktop
   - Go to Settings > General
   - Check "Expose daemon on TCP localhost:2375 without TLS"
   - Apply & Restart

3. Initialize Supabase:
   ```bash
   npx supabase init
   ```

4. Start Supabase:
   ```bash
   npx supabase start
   ```

5. When Supabase starts successfully, it will provide URL and API keys. Update the values in your `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### Option 2: Using a hosted Supabase project

1. Create a new project at [https://app.supabase.io](https://app.supabase.io)

2. Get your API URL and anon key from the project settings

3. Update the values in your `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## Using Supabase in Your App

This project includes a basic setup for using Supabase. The Supabase client is configured in `src/lib/supabase.ts`. You can import it in your components:

```typescript
import { supabase } from '../lib/supabase';

// Example query
const { data, error } = await supabase
  .from('your_table')
  .select('*');
```

## Troubleshooting Docker Issues

If you encounter issues with Docker when using the Supabase CLI:

1. Ensure Docker Desktop is running
2. Check if Docker daemon is exposed on TCP
3. Try restarting Docker Desktop
4. If needed, use a hosted Supabase instance instead of local development

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [Supabase CLI Documentation](https://supabase.com/docs/reference/cli/introduction)
