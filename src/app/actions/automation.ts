"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getAutomations(workspaceId: string) {
    const supabase = createClient() as any
    const { data, error } = await supabase
        .from("automations")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })

    if (error) return []
    return data
}

export async function createAutomation(workspaceId: string, name: string, trigger: any, action: any) {
    const supabase = createClient() as any
    const { data, error } = await supabase
        .from("automations")
        .insert([{
            workspace_id: workspaceId,
            name,
            trigger_config: trigger,
            action_config: action,
            is_active: true
        }])
        .select()
        .single()

    if (error) return { error: error.message }
    revalidatePath(`/workspace/${workspaceId}`)
    return { data }
}

export async function deleteAutomation(workspaceId: string, id: string) {
    const supabase = createClient() as any
    const { error } = await supabase
        .from("automations")
        .delete()
        .eq("id", id)

    if (error) return { error: error.message }
    revalidatePath(`/workspace/${workspaceId}`)
    return { success: true }
}

export async function toggleAutomation(workspaceId: string, id: string, isActive: boolean) {
    const supabase = createClient() as any
    const { error } = await supabase
        .from("automations")
        .update({ is_active: isActive })
        .eq("id", id)

    if (error) return { error: error.message }
    revalidatePath(`/workspace/${workspaceId}`)
    return { success: true }
}

export async function updateAutomation(workspaceId: string, id: string, name: string, trigger: any, action: any) {
    const supabase = createClient() as any
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
