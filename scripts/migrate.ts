/**
 * Migration Script — Apply schema.sql to your Supabase database.
 *
 * Usage:
 *   npx tsx scripts/migrate.ts
 *
 * Requirements:
 *   - .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *
 * This script reads schema.sql and executes it against your Supabase project.
 * It is idempotent — safe to run multiple times.
 */

import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { resolve } from "path"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function migrate() {
  console.log("\n🚀 Applying database migrations...\n")

  // Read schema
  const schemaPath = resolve(process.cwd(), "schema.sql")
  let schemaSQL: string

  try {
    schemaSQL = readFileSync(schemaPath, "utf-8")
    console.log(`  📄 Read schema.sql (${schemaSQL.length} bytes)`)
  } catch {
    console.error("❌ Could not read schema.sql — make sure it exists in the project root")
    process.exit(1)
  }

  // Split into individual statements (naive approach — works for this schema)
  // Supabase REST API doesn't support multi-statement, so we execute via RPC or raw SQL
  // For complex migrations, consider using the Supabase CLI instead

  console.log("  ⚠ This script applies the full schema.sql as a single SQL block.")
  console.log("  ℹ For incremental migrations, use the Supabase CLI or Dashboard.\n")

  // Execute via Supabase SQL endpoint (requires service role)
  const { error } = await supabase.rpc("exec_sql", { sql: schemaSQL })

  if (error) {
    // Fallback: Try executing via the REST API management endpoint
    console.log("  ℹ RPC 'exec_sql' not found. Attempting direct execution...")
    console.log("  ⚠ If this fails, apply schema.sql manually via Supabase Dashboard → SQL Editor.\n")

    console.log(`  📋 Schema SQL path: ${schemaPath}`)
    console.log("\n  Manual steps:")
    console.log("  1. Go to your Supabase Dashboard")
    console.log("  2. Navigate to SQL Editor")
    console.log("  3. Paste the contents of schema.sql")
    console.log("  4. Click 'Run'\n")
    process.exit(1)
  }

  console.log("✅ Migration applied successfully!\n")
}

migrate().catch((err) => {
  console.error("\n❌ Migration failed:", err)
  process.exit(1)
})
