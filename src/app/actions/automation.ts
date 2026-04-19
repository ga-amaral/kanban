"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Lista automações de um workspace
export async function getAutomations(workspaceId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("automations")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })

    if (error) return []
    return data
}

// Cria uma nova automação
export async function createAutomation(workspaceId: string, name: string, trigger: Record<string, unknown>, action: Record<string, unknown>) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("automations")
        .insert({
            workspace_id: workspaceId,
            name,
            trigger_config: trigger,
            action_config: action,
            is_active: true
        })
        .select()
        .single()

    if (error) return { error: error.message }
    revalidatePath(`/workspace/${workspaceId}`)
    return { data }
}

// Deleta uma automação
export async function deleteAutomation(workspaceId: string, id: string) {
    const supabase = createClient()
    const { error } = await supabase
        .from("automations")
        .delete()
        .eq("id", id)

    if (error) return { error: error.message }
    revalidatePath(`/workspace/${workspaceId}`)
    return { success: true }
}

// Ativa/desativa uma automação
export async function toggleAutomation(workspaceId: string, id: string, isActive: boolean) {
    const supabase = createClient()
    const { error } = await supabase
        .from("automations")
        .update({ is_active: isActive })
        .eq("id", id)

    if (error) return { error: error.message }
    revalidatePath(`/workspace/${workspaceId}`)
    return { success: true }
}

// Atualiza uma automação existente
export async function updateAutomation(workspaceId: string, id: string, name: string, trigger: Record<string, unknown>, action: Record<string, unknown>) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("automations")
        .update({
            name,
            trigger_config: trigger,
            action_config: action
        })
        .eq("id", id)
        .select()
        .single()

    if (error) return { error: error.message }
    revalidatePath(`/workspace/${workspaceId}`)
    return { data }
}
