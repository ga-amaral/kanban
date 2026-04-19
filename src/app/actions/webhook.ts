"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Testa um webhook com payload customizado
export async function testWebhook(url: string, payload: Record<string, unknown>) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })

        const status = response.status
        const data = await response.text()

        return { success: response.ok, status, data }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        return { success: false, error: message }
    }
}
