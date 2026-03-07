"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const workspaceSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
})

export async function createWorkspace(formData: FormData) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Não autorizado")

    const name = formData.get("name") as string
    const validation = workspaceSchema.safeParse({ name })

    if (!validation.success) {
        return { error: validation.error.format() }
    }

    const { data, error } = await (supabase.from("workspaces") as any)
        .insert([{ name, owner_id: user.id }])
        .select()
        .single()

    if (error) return { error: error.message }

    revalidatePath("/")
    return { data }
}

export async function getWorkspaces(): Promise<any[]> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await (supabase.from("workspaces") as any)
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })

    if (error) return []
    return data
}

export async function getUserWorkspaces(userId: string): Promise<any[]> {
    const supabase = createClient()

    // Check if caller is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await (supabase.from("profiles") as any)
        .select("role")
        .eq("id", user.id)
        .single()

    if (profile?.role !== "admin") return []

    const { data, error } = await (supabase.from("workspaces") as any)
        .select("*")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false })

    if (error) return []
    return data
}

export async function updateWorkspace(id: string, name: string) {
    const supabase = createClient()
    const { error } = await (supabase.from("workspaces") as any)
        .update({ name })
        .eq("id", id)

    if (error) return { error: error.message }
    revalidatePath("/")
    return { success: true }
}

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

export async function refreshWorkspace(id: string) {
    revalidatePath(`/workspace/${id}`)
    revalidatePath("/")
    return { success: true }
}
