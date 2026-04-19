/**
 * Generate Types Script — Regenerate Supabase TypeScript types from your live database schema.
 *
 * Usage:
 *   npx tsx scripts/generate-types.ts
 *
 * Requirements:
 *   - Supabase CLI installed: `npm install -g supabase`
 *   - SUPABASE_PROJECT_ID in .env.local or passed as argument
 *
 * After generation, the script will remind you to set PostgrestVersion to "12".
 */

import { execSync } from "child_process"
import { writeFileSync, readFileSync, existsSync } from "fs"
import { resolve } from "path"

const projectId = process.env.SUPABASE_PROJECT_ID || process.argv[2]
const outputPath = resolve(process.cwd(), "src", "types", "database.ts")

if (!projectId) {
  console.error("\n❌ Missing SUPABASE_PROJECT_ID\n")
  console.log("  Set it one of these ways:")
  console.log("  1. Add SUPABASE_PROJECT_ID=your-id to .env.local")
  console.log("  2. Pass as argument: npx tsx scripts/generate-types.ts your-project-id")
  console.log("\n  Find your project ID at: https://app.supabase.com/account\n")
  process.exit(1)
}

async function generateTypes() {
  console.log("\n🔄 Generating Supabase TypeScript types...\n")
  console.log(`  Project ID: ${projectId}`)
  console.log(`  Output:     ${outputPath}\n`)

  try {
    // Check if supabase CLI is available
    execSync("supabase --version", { stdio: "ignore" })
  } catch {
    console.log("  ⚠ Supabase CLI not found. Installing globally...")
    try {
      execSync("npm install -g supabase", { stdio: "inherit" })
    } catch (installError) {
      console.error("\n❌ Failed to install Supabase CLI. Please install it manually:")
      console.log("  npm install -g supabase")
      process.exit(1)
    }
  }

  try {
    // Generate types
    console.log("  Running: supabase gen types typescript --project-id " + projectId)
    const types = execSync(
      `supabase gen types typescript --project-id ${projectId}`,
      { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 } // 10MB buffer for large schemas
    )

    // Write to file
    writeFileSync(outputPath, types)
    console.log(`  ✅ Types written to ${outputPath}`)

    // Post-process: Fix PostgrestVersion if needed
    const content = readFileSync(outputPath, "utf-8")
    if (content.includes('PostgrestVersion: "14') || content.includes('PostgrestVersion: "13')) {
      const fixed = content.replace(
        /PostgrestVersion: "1[34](\.\d+)?"/,
        'PostgrestVersion: "12"'
      )
      writeFileSync(outputPath, fixed)
      console.log("  🔧 Fixed PostgrestVersion to \"12\" for Supabase SSR compatibility")
    } else if (!content.includes('PostgrestVersion: "12"')) {
      console.log("\n  ⚠ PostgrestVersion not found or already set — please verify it is \"12\":")
      console.log("    __InternalSupabase: { PostgrestVersion: \"12\" }")
    }

    console.log("\n✅ Type generation complete!\n")
  } catch (error: any) {
    console.error("\n❌ Failed to generate types:")
    console.error(error.message || error)
    console.log("\n  Possible causes:")
    console.log("  - Invalid SUPABASE_PROJECT_ID")
    console.log("  - Network connectivity issues")
    console.log("  - Supabase project not accessible\n")
    process.exit(1)
  }
}

generateTypes()
