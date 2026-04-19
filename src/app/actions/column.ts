"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * Gabriel Amaral (https://instagram.com/sougabrielamaral)
 * Atualizado para refletir o schema real (order_index, sem board_id)
 */

// Cria uma nova coluna no workspace
export async function createColumn(workspaceId: string, title: string, orderIndex: number) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("columns")
        .insert({
            title,
            order_index: orderIndex,
            workspace_id: workspaceId,
        })
        .select()
        .single()

    if (error) return { error: error.message }

    revalidatePath(`/workspace/${workspaceId}`)
    return { data }
}

// Lista colunas de um workspace ordenadas
export async function getColumns(workspaceId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("columns")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("order_index", { ascending: true })

    if (error) return []
    return data
}

// Atualiza a ordem das colunas
export async function updateColumnOrder(workspaceId: string, columns: { id: string, order: number }[]) {
    const supabase = createClient()

    for (const col of columns) {
        await supabase
            .from("columns")
            .update({ order_index: col.order })
            .eq("id", col.id)
    }

    revalidatePath(`/workspace/${workspaceId}`)
}

// Atualiza título/cor de uma coluna
export async function updateColumn(workspaceId: string, columnId: string, data: { title?: string, color?: string }) {
    const supabase = createClient()
    const { error } = await supabase
        .from("columns")
        .update({
            title: data.title,
            color: data.color,
        })
        .eq("id", columnId)

    if (error) return { error: error.message }
    revalidatePath(`/workspace/${workspaceId}`)
    return { success: true }
}

// Deleta uma coluna
export async function deleteColumn(workspaceId: string, columnId: string) {
    const supabase = createClient()
    const { error } = await supabase
        .from("columns")
        .delete()
        .eq("id", columnId)

    if (error) return { error: error.message }
    revalidatePath(`/workspace/${workspaceId}`)
    return { success: true }
}
