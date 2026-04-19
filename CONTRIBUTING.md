# Contributing to AutoKanban CRM

Thank you for contributing! This document outlines the development workflow and standards for this project.

---

## Development Workflow

### 1. Branch Strategy

```
main (production-ready)
  └── feature/your-feature-name   ← for new features
  └── fix/issue-description       ← for bug fixes
  └── refactor/description        ← for code improvements
```

### 2. Making Changes

```bash
# Create and switch to your branch
git checkout -b feature/your-feature-name

# Make your changes...

# Format code
npm run format

# Run linter
npm run lint

# Run TypeScript check
npx tsc --noEmit

# Run tests
npm test
```

### 3. Commit Messages

Follow conventional commits format:

```
type(scope): description

feat(auth): add password reset flow
fix(cards): resolve drag-and-drop race condition
test(workspace): add tests for CRUD operations
docs(readme): update setup instructions
refactor(lib): remove unused utility functions
```

### 4. Pull Requests

Before submitting a PR:
- [ ] All tests pass (`npm test`)
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] ESLint has no errors (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Commit messages follow conventional format
- [ ] PR description explains the "why" not just the "what"

---

## Coding Standards

### TypeScript
- **Strict mode** is enabled — no `any` unless absolutely necessary (add a comment explaining why)
- Use **explicit return types** for exported functions
- Prefer **interfaces** for object shapes, **types** for unions/intersections

### Server Actions
- All database mutations go through server actions in `src/app/actions/`
- Always use `as any` on `createClient()` for Supabase calls (this is a known workaround for type inference issues with the SSR client)
- Return `{ error: message }` on failures, `{ data }` or `{ success: true }` on success
- Always call `revalidatePath()` after mutations

### Components
- Default to **Server Components** (no `"use client"`)
- Mark client components explicitly with `"use client"` at the top
- Use the `cn()` utility from `@/lib/utils` for conditional class names
- Follow the existing design language: `sharp-edge` (no border-radius), `neon-green` accents, `carbon` backgrounds

### Testing
- Tests live **next to source files** as `*.test.ts`
- Use **Vitest** with `vi.mock()` for dependencies
- Mock Supabase with `vi.mock("@/lib/supabase/server")`
- Test both **success** and **error** paths for each function
- Use `mockReturnValueOnce` for chained calls and `vi.resetAllMocks()` in tests that need isolation

### Styling
- **Tailwind CSS** with CSS variables for theme tokens
- Dark mode via `class` strategy
- Custom utilities: `sharp-edge` (no border-radius), `animate-spring` (motion), `stagger-reveal` (animations)

---

## Project Structure

```
src/
├── app/
│   ├── actions/          # Server actions (mutations) — each has a .test.ts
│   ├── admin/            # Admin panel
│   ├── agents/           # AI agent management
│   ├── auth/             # Auth callback
│   ├── login/            # Login / Sign up
│   └── workspace/        # Kanban workspace
├── components/           # React components
├── lib/                  # Utilities (supabase, logger, utils)
└── types/                # TypeScript types (auto-generated from Supabase)
```

---

## Database Changes

If you need to modify the database schema:

1. Update `schema.sql` with the new/modified tables
2. Run the migration: `npx tsx scripts/migrate.ts`
3. Regenerate types: `npx tsx scripts/generate-types.ts`
4. Ensure `PostgrestVersion` is set to `"12"` in `src/types/database.ts`

---

## Adding New Server Actions

1. Create the action in the appropriate file under `src/app/actions/`
2. Write corresponding tests in `*.test.ts`
3. Cover: success path, error path, auth checks, edge cases
4. Run `npm test` to verify

---

## Useful Commands

```bash
npm run dev            # Start dev server
npm run build          # Production build
npm run lint           # ESLint
npm run format         # Prettier (write)
npm run format:check   # Prettier (check only)
npm test               # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
npx tsc --noEmit       # TypeScript check
npx tsx scripts/seed.ts        # Seed demo data
npx tsx scripts/generate-types.ts  # Regenerate types
```

---

## Questions?

Reach out to [Gabriel Amaral](https://instagram.com/sougabrielamaral) for guidance.
