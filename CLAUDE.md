# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Start dev server at http://localhost:3000
npm run build         # Production build
npm run lint          # ESLint
npm run format        # Prettier (writes)
npm run format:check  # Prettier (check only)
npm test              # Run tests once (vitest)
npm run test:watch    # Tests in watch mode
npm run test:coverage # Tests with coverage report
```

Run a single test file:
```bash
npx vitest run src/app/actions/card.test.ts
```

Regenerate Supabase TypeScript types after schema changes:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
# Then ensure __InternalSupabase.PostgrestVersion is set to "12"
```

Seed demo data:
```bash
npx tsx scripts/seed.ts
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=          # Optional — only needed for AI agent features
NEXT_PUBLIC_SITE_URL=    # Optional, defaults to localhost:3000
```

## Architecture

**Next.js 14 App Router** with Supabase (PostgreSQL + RLS) as the backend. All database mutations go through Next.js **server actions** (`"use server"`). The client never calls Supabase directly for writes.

### Data Flow

1. Server components (`page.tsx`) fetch data server-side via server actions or direct Supabase calls.
2. Data is passed as props to client components.
3. Client components call server actions for mutations, which call `revalidatePath()` to invalidate the Next.js cache.
4. Optimistic UI updates are applied locally in client component state before the server response.

### Key Directories

- `src/app/actions/` — All server actions (the "backend"). One file per domain: `card.ts`, `column.ts`, `workspace.ts`, `auth.ts`, `automation.ts`, `webhook.ts`, `agent.ts`, `chat.ts`, `admin.ts`.
- `src/components/kanban/` — Core Kanban UI: `board.tsx` (DnD orchestration + state), `column.tsx`, `card.tsx`, `list-view.tsx`, `csv-importer.tsx`.
- `src/components/` — Shared components. `automation-manager.tsx` and `webhook-builder.tsx` handle the automation/webhook UI.
- `src/lib/supabase/` — `server.ts` for RSC/server actions, `client.ts` for client components, `middleware.ts` for auth middleware.
- `src/types/database.ts` — Auto-generated Supabase types. Use `Tables<"table_name">` for row types.

### Database Schema

Hierarchy: `workspaces` → `columns` → `cards`. Columns and cards have a `workspace_id` denormalization for efficient queries alongside the foreign key chain.

Key tables:
- `profiles` — Linked to `auth.users`. Has `role` field.
- `users_profiles` — Role enum: `MASTER | ADMIN | ADV | ASSISTANT | ESTAGIARIO`.
- `workspaces` — Top-level containers owned by users.
- `columns` — Kanban columns with `order_index`. Always use `board_id: "00000000-0000-0000-0000-000000000001"` (default board for production).
- `cards` — Lead cards with legal-specific fields (lawsuit_number, practice_area, urgency_level, etc.) and `custom_data_jsonb` for extensibility.
- `automations` — Trigger/action webhooks stored as JSON (`trigger_config`, `action_config`).
- `ai_agents` / `conversations` / `messages` — AI chat persistence.

### Auth & Authorization

Supabase Auth with RLS policies. The `is_admin()` DB function checks if the current user has admin privileges. Role checks happen in server actions via `getCurrentUserRole()`. Users with inactive status are redirected to `/blocked`.

### Drag & Drop

`KanbanBoard` (`src/components/kanban/board.tsx`) owns all DnD state using `@dnd-kit`. It manages both card-within-column and card-across-column moves using `DndContext` + `SortableContext`. Column reordering is also handled here.

### Automations

Trigger/action model stored in the `automations` table. When a card moves between columns (detected in `board.tsx`), the automation engine checks for matching triggers and fires webhooks. The `WebhookBuilder` component lets users map Supabase fields to outgoing webhook payloads.

### AI Agents

Custom agents stored in `ai_agents` table with configurable system prompts and OpenAI model selection. Chat history persisted in `conversations`/`messages`. The OpenAI SDK is used server-side in `chat.ts`.

## Code Conventions

- **Prettier**: no semicolons, single quotes, 4-space indent, trailing commas (`esnext`), 100-char line width, LF line endings.
- **Supabase client**: import from `@/lib/supabase/server` in server actions/RSC, `@/lib/supabase/client` in client components.
- **Type imports**: use `Tables<"table_name">` from `@/types/database` rather than hand-writing row types.
- **Tests**: Vitest with `vi.mock()` for Supabase and `next/cache`. Tests cover server actions only; React component tests are excluded from the test runner (`.tsx` files under `src/app/` are excluded in `vitest.config.ts`).
- **`as any` casts**: The codebase uses `createClient() as any` in several action files to bypass strict type-checking on the Supabase client — this is an existing pattern, not an error.
