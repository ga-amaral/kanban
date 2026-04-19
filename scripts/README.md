# Scripts

Utility scripts for the AutoKanban CRM project.

## Usage

All scripts are run via `npx tsx`:

```bash
npx tsx scripts/<script-name>
```

## Available Scripts

### `seed.ts` — Populate Demo Data

Creates a demo user, workspace, Kanban columns, cards, an AI agent, and an automation.

```bash
npx tsx scripts/seed.ts
```

**Required env vars:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (to create auth users programmatically)

**Output:**
- User: `demo@autokanban.com` / `demo123456`
- Workspace: "Escritório Jurídico" with 5 columns and 5 demo cards
- AI Agent: "Assistente Jurídico"
- Automation: Webhook trigger on card move to "Concluído"

### `migrate.ts` — Apply Database Schema

Applies `schema.sql` to your Supabase database.

```bash
npx tsx scripts/migrate.ts
```

**Required env vars:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

> **Note:** If the `exec_sql` RPC function is not available on your Supabase instance, the script will print manual instructions to apply `schema.sql` via the Supabase Dashboard SQL Editor.

### `generate-types.ts` — Regenerate Supabase Types

Generates TypeScript types from your Supabase schema and writes them to `src/types/database.ts`.

```bash
npx tsx scripts/generate-types.ts
```

**Required:**
- Supabase CLI installed (`npm install -g supabase`)
- `SUPABASE_PROJECT_ID` in env or passed as argument

Alternatively, run directly:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

After regenerating, ensure `__InternalSupabase.PostgrestVersion` is set to `"12"` in the generated file.

## Adding New Scripts

Place new `.ts` scripts in this directory. Follow the pattern:
1. Validate required env vars at the top
2. Use the Supabase JS client for database operations
3. Log progress with emoji-prefixed messages
4. Exit with code 1 on failure, 0 on success
