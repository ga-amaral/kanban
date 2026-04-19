# AutoKanban CRM

## Project Overview

**AutoKanban CRM** is a multi-workspace Customer Relationship Management system built with **Next.js 14** and **Supabase**. It features a Kanban-style board interface for managing leads/contacts, complete with drag-and-drop capabilities, AI agents, webhook-style automations, and a premium dark UI with neon-green accents.

**Author:** Gabriel Amaral  
**Version:** 0.1.4  
**License:** Private

### Core Features

- **Multi-Workspace Kanban Boards** — Organize leads across customizable columns with drag-and-drop (`@dnd-kit`)
- **AI Agents** — Configurable AI agents with system prompts, model selection, and conversation history
- **Automations** — Webhook-style automations (n8n-like) with trigger/action configurations
- **Authentication & RBAC** — Supabase Auth with role-based access control (MASTER, ADMIN, ADV, ASSISTANT, ESTAGIARIO)
- **Dark/Light Theme** — Theme toggle via `next-themes`
- **Command Palette** — Quick-access command palette for navigation
- **Legal CRM Extensions** — Cards support legal-specific fields (lawsuit number, practice area, value range, urgency level, debts)

---

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 14.2 (App Router), React 18, TypeScript |
| **Database / Auth** | Supabase (PostgreSQL), Row Level Security (RLS) |
| **UI / Styling** | Tailwind CSS, shadcn/ui patterns, Framer Motion, Lucide icons |
| **Drag & Drop** | @dnd-kit/core, @dnd-kit/sortable |
| **Forms** | React Hook Form + Zod validation |
| **AI Integration** | OpenAI SDK |
| **PDF Processing** | pdf-parse |
| **Markdown** | react-markdown, remark-gfm |
| **Notifications** | Sonner |

---

## Project Structure

```
autokanban/
├── src/
│   ├── app/
│   │   ├── actions/        # Server actions (auth, workspace, column, card, automation, webhook, agent, chat, admin)
│   │   ├── admin/          # Admin panel routes
│   │   ├── agents/         # AI agent management routes
│   │   ├── auth/           # Auth-related routes
│   │   ├── blocked/        # Blocked user page
│   │   ├── login/          # Login page
│   │   ├── workspace/      # Workspace/Kanban board routes
│   │   ├── globals.css     # Global styles + CSS variables
│   │   ├── layout.tsx      # Root layout with Sidebar, ThemeProvider, CommandPalette
│   │   └── page.tsx        # Dashboard (workspace listing)
│   ├── components/
│   │   ├── agents/         # AI agent-related components
│   │   ├── kanban/         # Kanban board components
│   │   ├── workspace/      # Workspace components
│   │   ├── automation-manager.tsx
│   │   ├── command-palette.tsx
│   │   ├── create-workspace.tsx
│   │   ├── phone-input.tsx
│   │   ├── sidebar-nav.tsx
│   │   ├── theme-provider.tsx
│   │   ├── user-nav.tsx
│   │   └── webhook-builder.tsx
│   ├── lib/
│   │   ├── supabase/       # Supabase client setup (browser + server) + middleware
│   │   ├── logger.ts       # Logging utility
│   │   └── utils.ts        # Utility functions (cn, etc.)
│   ├── types/
│   │   └── database.ts     # Auto-generated Supabase types
│   └── middleware.ts        # Next.js middleware for Supabase session management
├── schema.sql              # Database schema (tables, RLS policies, functions)
├── scripts/                # (Empty — placeholder for utility scripts)
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Database Schema

The database is managed via **Supabase** with Row Level Security (RLS) enabled on all tables. Key tables:

| Table | Description |
|-------|-------------|
| `profiles` | User profiles linked to `auth.users`, with role and status |
| `workspaces` | Top-level containers owned by users |
| `columns` | Kanban columns within a workspace (with ordering and color) |
| `cards` | Lead/contact cards within columns (supports legal-specific fields) |
| `automations` | Trigger/action automations per workspace |
| `ai_agents` | Custom AI agents with system prompts and model config |
| `conversations` / `messages` | Chat history for AI agent interactions |
| `boards` / `board_options` / `board_members` | Extended board configuration and sharing |

See `schema.sql` for the base schema and `src/types/database.ts` for the full TypeScript type definitions.

---

## Building and Running

### Prerequisites

- **Node.js** 18+
- **Supabase project** with the schema applied
- Environment variables (create a `.env.local` file):
  ```env
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
  OPENAI_API_KEY=your_openai_api_key  # if using AI agents
  ```

### Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint
```

The dev server runs on `http://localhost:3000` by default.

---

## Known Issues

There are **no current TypeScript compilation errors**. The codebase compiles cleanly with `tsc --noEmit`.

Historical issues that were resolved:
- Supabase type mismatches on insert/update operations (fixed via `PostgrestVersion: "12"` and consistent `as any` casting on `createClient()`)
- See `errors.log` for historical error logs

---

## Testing

The project uses **Vitest** with 102 tests across 10 test files, all passing:

```bash
npm test              # Run all tests (102 tests)
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Test Coverage by Module

| Module | Tests | Coverage |
|--------|-------|----------|
| `utils.test.ts` | 7 | `cn()` utility — all edge cases |
| `workspace.test.ts` | 8 | CRUD + auth checks |
| `column.test.ts` | 8 | CRUD + ordering |
| `card.test.ts` | 17 | CRUD + bulk operations + automation triggers |
| `auth.test.ts` | 8 | signIn, signUp, signOut, getRole |
| `automation.test.ts` | 11 | CRUD + toggle |
| `agent.test.ts` | 13 | CRUD + admin checks |
| `webhook.test.ts` | 5 | testWebhook, saveWebhookMapping |
| `admin.test.ts` | 11 | User management + protected users |
| `chat.test.ts` | 14 | File upload, conversations, OpenAI messaging |

All tests use mocked Supabase clients and mock OpenAI API calls.

---

## Development Conventions

- **TypeScript** is used throughout with strict mode
- **Server Components** are the default (App Router); client components are marked with `"use client"`
- **Server Actions** in `src/app/actions/` handle database mutations
- **Supabase** client uses `as any` casting to work around type inference issues with the SSR client
- **Middleware** (`src/middleware.ts`) manages Supabase session propagation
- **UI** uses CSS variables for theming with a custom "neon green" / "carbon" palette
- **Sharp edges** (no border-radius) are a deliberate design choice — see `sharp-edge` utility usage
- **Logging** utility available in `src/lib/logger.ts`
- **Testing** — colocated `*.test.ts` files with Vitest, mocking Supabase and external APIs
- **Formatting** — Prettier configured via `.prettierrc` (single quotes, 4-space tabs, no semicolons)

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `schema.sql` | Complete database schema with RLS policies |
| `src/middleware.ts` | Supabase session refresh on every request |
| `src/app/layout.tsx` | Root layout with theme provider, sidebar, and command palette |
| `src/app/page.tsx` | Dashboard landing page |
| `src/lib/supabase/server.ts` | Server-side Supabase client instantiation |
| `src/lib/supabase/client.ts` | Browser-side Supabase client |
| `src/types/database.ts` | Auto-generated TypeScript types from Supabase |
| `tailwind.config.ts` | Tailwind config with custom color tokens and dark mode |
| `next.config.mjs` | Minimal Next.js configuration |
| `.env.example` | Template for required environment variables |
| `.prettierrc` | Code formatting configuration |
| `vitest.config.ts` | Vitest test configuration |
| `CONTRIBUTING.md` | Contribution guidelines and coding standards |
| `scripts/seed.ts` | Seed script for demo data |
| `scripts/migrate.ts` | Database migration helper |
| `scripts/generate-types.ts` | Supabase type regeneration script |

---

## Future Considerations

- Add React Testing Library for component-level tests (`.tsx` files)
- Consider adding E2E tests with Playwright
- Add integration tests for automation webhook triggers
- Consider adding a CHANGELOG.md for version tracking
