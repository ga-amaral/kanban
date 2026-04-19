# AutoKanban CRM

> Multi-workspace CRM with Kanban boards, AI agents, and n8n-style automations.

![Version](https://img.shields.io/badge/version-0.1.4-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

Built by [Gabriel Amaral](https://instagram.com/sougabrielamaral)

---

## Features

- **Kanban Boards** — Drag-and-drop lead management with customizable columns, colors, and ordering
- **Multi-Workspace** — Isolated workspaces per user, each with its own boards, columns, cards, and automations
- **AI Agents** — Configurable AI agents with custom system prompts, model selection (OpenAI), and persistent conversation history
- **Automations** — Trigger/action webhooks (n8n-style) that fire when cards move between columns, with field mapping
- **Legal CRM Fields** — Cards support lawsuit numbers, practice areas, value ranges, urgency levels, debts, and deadlines
- **Role-Based Access** — MASTER, ADMIN, ADV, ASSISTANT, ESTAGIARIO roles with Supabase Row Level Security
- **Dark/Light Theme** — Toggle with system preference detection
- **Command Palette** — Quick navigation via keyboard shortcut
- **Responsive Design** — Premium dark UI with neon-green accents, works on all screen sizes

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) + React 18 + TypeScript |
| Database | Supabase (PostgreSQL) with Row Level Security |
| Auth | Supabase Auth (email/password) |
| Styling | Tailwind CSS + shadcn/ui patterns + Framer Motion |
| Drag & Drop | @dnd-kit |
| Forms | React Hook Form + Zod |
| AI | OpenAI SDK |
| Notifications | Sonner |

---

## Prerequisites

- **Node.js** 18+
- **npm** or **pnpm**
- A **Supabase project** (free tier works)
- (Optional) **OpenAI API key** for AI agent features

---

## Getting Started

### 1. Clone & Install

```bash
git clone <repository-url>
cd autokanban
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and paste the contents of [`schema.sql`](schema.sql)
3. Run the SQL to create all tables, RLS policies, and the `is_admin()` function

### 3. Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI (optional — only needed for AI agents)
OPENAI_API_KEY=sk-your-key

# Site URL (optional, defaults to localhost:3000)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

You can find your Supabase URL and anon key in **Project Settings → API**.

### 4. Seed Demo Data (Optional)

Populate your database with sample workspaces, columns, and cards:

```bash
npx tsx scripts/seed.ts
```

See [scripts/README.md](scripts/README.md) for all available scripts.

### 5. Run the App

```bash
npm run dev       # Start dev server at http://localhost:3000
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

---

## Project Structure

```
autokanban/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── actions/          # Server actions (mutations)
│   │   ├── admin/            # Admin panel
│   │   ├── agents/           # AI agent management
│   │   ├── auth/             # Auth callback
│   │   ├── blocked/          # Blocked user page
│   │   ├── login/            # Login / Sign up
│   │   ├── workspace/        # Kanban board workspace
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Dashboard
│   ├── components/           # React components
│   ├── lib/                  # Utilities (Supabase, logger, cn)
│   └── types/                # TypeScript types (auto-generated)
├── scripts/                  # Utility scripts (seed, migrations)
├── schema.sql                # Database schema
├── package.json
└── QWEN.md                   # AI context file
```

---

## Server Actions

All database mutations go through **server actions** in `src/app/actions/`:

| File | Functions |
|---|---|
| `auth.ts` | `signIn`, `signUp`, `signOut`, `getCurrentUserRole` |
| `workspace.ts` | `createWorkspace`, `getWorkspaces`, `updateWorkspace`, `deleteWorkspace` |
| `column.ts` | `createColumn`, `getColumns`, `updateColumnOrder`, `updateColumn`, `deleteColumn` |
| `card.ts` | `createCard`, `getCards`, `moveCard`, `updateCard`, `deleteCard`, bulk operations |
| `automation.ts` | Automation CRUD |
| `webhook.ts` | `testWebhook`, `saveWebhookMapping` |
| `agent.ts` | AI agent CRUD |
| `chat.ts` | AI conversation handling |
| `admin.ts` | Admin-only operations |

---

## Database Schema

Key tables managed via Supabase with Row Level Security:

| Table | Description |
|---|---|
| `profiles` | User profiles linked to `auth.users` |
| `workspaces` | Top-level containers owned by users |
| `columns` | Kanban columns with ordering and color |
| `cards` | Lead/contact cards with legal-specific fields |
| `automations` | Trigger/action automations per workspace |
| `ai_agents` | Custom AI agents |
| `conversations` / `messages` | Chat history for AI interactions |
| `boards` / `board_options` | Extended board configuration |

See [`schema.sql`](schema.sql) for the full schema.

---

## Utility Scripts

Scripts in the `scripts/` directory:

```bash
npx tsx scripts/seed.ts          # Populate demo data
npx tsx scripts/migrate.ts       # Apply schema migrations
npx tsx scripts/generate-types.ts # Regenerate Supabase TS types
```

See [scripts/README.md](scripts/README.md) for details.

---

## Running Tests

```bash
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run with coverage report
```

---

## Regenerating Supabase Types

If you modify the database schema, regenerate the TypeScript types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

Then update the `__InternalSupabase.PostgrestVersion` to `"12"` if needed.

---

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run lint` and `npm test`
4. Submit a PR

---

## License

Private — All rights reserved. © 2026 Gabriel Amaral.
