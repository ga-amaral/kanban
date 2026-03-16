"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * Gabriel Amaral (https://instagram.com/sougabrielamaral)
 * Atualizado para refletir o schema real (order_index)
 */

export async function createColumn(workspaceId: string, title: string, orderIndex: number) {
    const supabase = createClient() as any
    const { data, error } = await supabase
        .from("columns")
        .insert({ 
            workspace_id: workspaceId,
            board_id: "00000000-0000-0000-0000-000000000001", // Default board for production
            title, 
            order_index: orderIndex 
        })
        .select()
        .single()

    if (error) return { error: error.message }
    
    revalidatePath(`/workspace/${workspaceId}`) 
    return { data }
}

export async function getColumns(workspaceId: string) {
    const supabase = createClient() as any
    const { data, error } = await supabase
        .from("columns")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("order_index", { ascending: true })

    if (error) return []
    return data
}

export async function updateColumnOrder(workspaceId: string, columns: { id: string, order: number }[]) {
    const supabase = createClient() as any

    // Simples update em loop para MVP, ideal seria uma function no RPC
    for (const col of columns) {
        await supabase
            .from("columns")
            .update({ order_index: col.order })
            .eq("id", col.id)
    }

    revalidatePath(`/workspace/${workspaceId}`)
}

export async function updateColumn(workspaceId: string, columnId: string, data: { title?: string, color?: string }) {
    const supabase = createClient() as any
    const { error } = await supabase
        .from("columns")
        .update({
            title: data.title,
            // color não existe no schema real da tabela columns
        } as any)
        .eq("id", columnId)

    if (error) return { error: error.message }
    revalidatePath(`/workspace/${workspaceId}`)
    return { success: true }
}

export async function deleteColumn(workspaceId: string, columnId: string) {
    const supabase = createClient() as any
    const { error } = await supabase
        .from("columns")
        .delete()
        .eq("id", columnId)

    if (error) return { error: error.message }
    revalidatePath(`/workspace/${workspaceId}`)
    return { success: true }
}
