"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

/**
 * Gabriel Amaral (https://instagram.com/sougabrielamaral)
 */

const workspaceSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
})

// Cria um novo workspace
export async function createWorkspace(formData: FormData) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Não autorizado")

    const name = formData.get("name") as string
    const validation = workspaceSchema.safeParse({ name })

    if (!validation.success) {
        return { error: validation.error.format() }
    }

    const { data, error } = await supabase
        .from("workspaces")
        .insert({ name, owner_id: user.id })
        .select()
        .single()

    if (error) return { error: error.message }

    revalidatePath("/")
    return { data }
}

// Lista workspaces do usuário logado
export async function getWorkspaces() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })

    if (error) return []
    return data
}

// Lista workspaces de um usuário (admin only)
export async function getUserWorkspaces(userId: string) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (profile?.role !== "admin") return []

    const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false })

    if (error) return []
    return data
}

// Atualiza nome de um workspace
export async function updateWorkspace(id: string, name: string) {
    const supabase = createClient()
    const { error } = await supabase
        .from("workspaces")
        .update({ name })
        .eq("id", id)

    if (error) return { error: error.message }
    revalidatePath("/")
    return { success: true }
}

// Deleta um workspace
export async function deleteWorkspace(id: string) {
    const supabase = createClient()
    const { error } = await supabase
        .from("workspaces")
        .delete()
        .eq("id", id)

    if (error) return { error: error.message }
    revalidatePath("/")
    return { success: true }
}

// Revalida cache do workspace
export async function refreshWorkspace(id: string) {
    revalidatePath(`/workspace/${id}`)
    revalidatePath("/")
    return { success: true }
}
