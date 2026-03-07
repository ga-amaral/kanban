"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createColumn(workspaceId: string, title: string, order: number) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("columns")
        .insert({ workspace_id: workspaceId, title, order } as any)
        .select()
        .single()

    if (error) return { error: error.message }
    revalidatePath(`/workspace/${workspaceId}`)
    return { data }
}

export async function getColumns(workspaceId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("columns")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("order", { ascending: true })

    if (error) return []
    return data
}

export async function updateColumnOrder(workspaceId: string, columns: { id: string, order: number }[]) {
    const supabase = createClient()

    // Simples update em loop para MVP, ideal seria uma function no RPC
    for (const col of columns) {
        await (supabase.from("columns") as any)
            .update({ order: col.order })
            .eq("id", col.id)
    }

    revalidatePath(`/workspace/${workspaceId}`)
}
