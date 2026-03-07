"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function testWebhook(url: string, payload: any) {
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
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function saveWebhookMapping(workspaceId: string, mapping: any) {
    const supabase = createClient()
    const { error } = await (supabase.from("workspaces") as any)
        .update({ webhook_config: mapping })
        .eq("id", workspaceId)

    if (error) return { error: error.message }
    revalidatePath(`/workspace/${workspaceId}`)
    return { success: true }
}
