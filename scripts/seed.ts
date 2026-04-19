/**
 * Seed Script — Populate the database with demo data for development/testing.
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * Requirements:
 *   - .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   - An existing user in Supabase Auth (or the script will create one)
 */

import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local")
  process.exit(1)
}

// Use service role key if available (for bypassing RLS during seeding)
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY
)

// ─── Helpers ────────────────────────────────────────────────────────────────

function log(message: string, emoji = "✓") {
  console.log(`  ${emoji} ${message}`)
}

// ─── Seed Data ──────────────────────────────────────────────────────────────

async function seed() {
  console.log("\n🌱 Seeding AutoKanban CRM database...\n")

  // 1. Create a demo user via Auth (if service role key is available)
  let userId: string

  if (SUPABASE_SERVICE_ROLE_KEY) {
    log("Creating demo user...")
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: "demo@autokanban.com",
      password: "demo123456",
      email_confirm: true,
      user_metadata: { full_name: "Demo User" },
    })

    if (authError) {
      // User might already exist — try to fetch it
      log("Demo user may already exist, fetching...", "ℹ")
      const { data: users } = await supabase.auth.admin.listUsers()
      const existing = users?.users.find((u) => u.email === "demo@autokanban.com")
      if (!existing) {
        console.error("❌ Failed to create/fetch demo user:", authError.message)
        process.exit(1)
      }
      userId = existing.id
    } else {
      userId = authData.user.id
    }
    log(`Demo user created: demo@autokanban.com (${userId})`)
  } else {
    console.log("  ⚠ No SUPABASE_SERVICE_ROLE_KEY — skipping auth user creation.")
    console.log("  ℹ You'll need to provide a user UUID manually or sign up via the app.")
    console.log("\n  Sign up at: http://localhost:3000/login")
    console.log("  Then re-run with SUPABASE_SERVICE_ROLE_KEY set.\n")
    process.exit(0)
  }

  // 2. Create profile
  log("Creating profile...")
  await supabase.from("profiles").upsert({
    id: userId,
    email: "demo@autokanban.com",
    full_name: "Demo User",
    role: "admin",
    status: "active",
  })

  // 3. Create workspace
  log("Creating workspace: 'Escritório Jurídico'...")
  const { data: workspace, error: wsError } = await supabase
    .from("workspaces")
    .insert({ name: "Escritório Jurídico", owner_id: userId })
    .select()
    .single()

  if (wsError) {
    console.error("❌ Failed to create workspace:", wsError.message)
    process.exit(1)
  }
  log(`Workspace created: ${workspace.name} (${workspace.id})`)

  // 4. Create columns
  const columns = [
    { title: "Novos Leads", order_index: 0, color: "#6366f1" },
    { title: "Em Análise", order_index: 1, color: "#f59e0b" },
    { title: "Aguardando Documentos", order_index: 2, color: "#10b981" },
    { title: "Em Andamento", order_index: 3, color: "#3b82f6" },
    { title: "Concluído", order_index: 4, color: "#22c55e" },
  ]

  log("Creating Kanban columns...")
  const columnIds: string[] = []

  for (const col of columns) {
    const { data, error } = await supabase
      .from("columns")
      .insert({
        board_id: "00000000-0000-0000-0000-000000000001",
        workspace_id: workspace.id,
        title: col.title,
        order_index: col.order_index,
      })
      .select()
      .single()

    if (error) {
      console.error(`❌ Failed to create column "${col.title}":`, error.message)
    } else {
      columnIds.push(data.id)
      log(`Column: ${col.title}`)
    }
  }

  // 5. Create demo cards
  const demoCards = [
    {
      title: "João Silva — Consulta Trabalhista",
      client_name: "João Silva",
      phone: "+55 11 99999-0001",
      description: "Cliente busca orientação sobre horas extras não pagas.",
      deadline_date: "2026-05-15T00:00:00Z",
      urgency_level: "HIGH",
      practice_area: "Trabalhista",
      value_range: "R$ 10.000 - R$ 50.000",
    },
    {
      title: "Maria Santos — Aposentadoria",
      client_name: "Maria Santos",
      phone: "+55 11 99999-0002",
      description: "Processo de aposentadoria por tempo de contribuição.",
      deadline_date: "2026-06-01T00:00:00Z",
      urgency_level: "MED",
      practice_area: "Previdenciário",
      value_range: "R$ 5.000 - R$ 15.000",
    },
    {
      title: "Carlos Oliveira — Divórcio",
      client_name: "Carlos Oliveira",
      phone: "+55 11 99999-0003",
      description: "Divórcio consensual com partilha de bens.",
      deadline_date: "2026-04-20T00:00:00Z",
      urgency_level: "LOW",
      practice_area: "Família",
      value_range: "R$ 3.000 - R$ 8.000",
    },
    {
      title: "Ana Costa — Indenização",
      client_name: "Ana Costa",
      phone: "+55 11 99999-0004",
      description: "Ação indenizatória por dano moral em acidente de trânsito.",
      deadline_date: "2026-07-10T00:00:00Z",
      urgency_level: "HIGH",
      practice_area: "Cível",
      value_range: "R$ 20.000 - R$ 100.000",
    },
    {
      title: "Pedro Lima — Contrato Social",
      client_name: "Pedro Lima",
      phone: "+55 11 99999-0005",
      description: "Elaboração de contrato social para nova LTDA.",
      deadline_date: "2026-04-25T00:00:00Z",
      urgency_level: "MED",
      practice_area: "Empresarial",
      value_range: "R$ 2.000 - R$ 5.000",
    },
  ]

  log("Creating demo cards...")
  for (let i = 0; i < demoCards.length; i++) {
    const card = demoCards[i]
    const columnIndex = Math.min(i, columnIds.length - 1)

    const { data, error } = await supabase.from("cards").insert({
      column_id: columnIds[columnIndex],
      workspace_id: workspace.id,
      title: card.title,
      client_name: card.client_name,
      phone: card.phone,
      description: card.description,
      deadline_date: card.deadline_date,
      urgency_level: card.urgency_level,
      practice_area: card.practice_area,
      value_range: card.value_range,
      order_index: i,
    }).select().single()

    if (error) {
      console.error(`❌ Failed to create card "${card.title}":`, error.message)
    } else {
      log(`Card: ${card.client_name} → ${columns[columnIndex].title}`)
    }
  }

  // 6. Create a demo AI agent
  log("Creating demo AI agent...")
  await supabase.from("ai_agents").insert({
    name: "Assistente Jurídico",
    owner_id: userId,
    description: "Assistente de IA para consultas jurídicas rápidas.",
    provider: "openai",
    model_name: "gpt-4o-mini",
    system_prompt: "Você é um assistente jurídico prestatável e conhecedor. Responda perguntas de forma clara e objetiva, citando a legislação brasileira quando aplicável.",
    is_public: true,
  })

  // 7. Create a demo automation
  log("Creating demo automation...")
  await supabase.from("automations").insert({
    workspace_id: workspace.id,
    name: "Notificar ao mover para Concluído",
    trigger_config: {
      type: "column_move",
      to_column_id: columnIds[4], // Concluído
    },
    action_config: {
      url: "https://httpbin.org/post",
      mappings: [
        { external: "client_name", internal: "client_name" },
        { external: "column_title", internal: "column_title" },
      ],
    },
    is_active: true,
  })

  // ─── Summary ──────────────────────────────────────────────────────────────

  console.log("\n✅ Seed completed!\n")
  console.log("  Login credentials:")
  console.log(`    Email:    demo@autokanban.com`)
  console.log(`    Password: demo123456`)
  console.log(`\n  Dashboard:  http://localhost:3000`)
  console.log(`  Workspace:  http://localhost:3000/workspace/${workspace.id}`)
  console.log("\n")
}

seed().catch((err) => {
  console.error("\n❌ Seed failed:", err)
  process.exit(1)
})
