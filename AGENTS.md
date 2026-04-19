# AGENTS.md

Developer commands:

```bash
npm run dev           # Dev server at localhost:3000
npm run build         # Production build
npm run lint          # ESLint
npm run format        # Prettier (writes)
npm run format:check  # Prettier (check only)
npm test              # Run tests (vitest)
npx vitest run src/app/actions/card.test.ts  # Run single test file
npx tsx scripts/seed.ts                    # Seed demo data
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

Environment variables required:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# Optional:
OPENAI_API_KEY=         # For AI agents
NEXT_PUBLIC_SITE_URL=  # Defaults to localhost:3000
# For seed/migrate scripts:
SUPABASE_SERVICE_ROLE_KEY=
```

Seed script (`scripts/seed.ts`) requires `SUPABASE_SERVICE_ROLE_KEY` to create auth users programmatically.

Database schema: Run `schema.sql` via Supabase Dashboard SQL Editor after creating project.

After regenerating Supabase types, ensure `__InternalSupabase.PostgrestVersion` is set to `"12"` in `src/types/database.ts`.

Test runner excludes `.tsx` React component files (`src/app/**/*.tsx` in `vitest.config.ts`). Only `.test.ts` files are run.

Supabase client imports:
- `@/lib/supabase/server` — for server actions and RSC
- `@/lib/supabase/client` — for client components

Code style: Prettier with 4-space indent, no semicolons, single quotes, LF line endings. Use `Tables<"table_name">` from `@/types/database` for row types.