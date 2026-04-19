"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Verifica se o usuário logado é admin
async function checkAdminStatus() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Não autenticado")

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (profile?.role !== "admin") {
        throw new Error("Acesso negado")
    }

    return supabase
}

// Lista todos os usuários (admin only)
export async function getUsers() {
    try {
        const supabase = await checkAdminStatus()

        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .order("updated_at", { ascending: false })

        if (error) return { error: error.message }
        return { data }
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e)
        return { error: message }
    }
}

// Atualiza status de um usuário (bloquear/desbloquear)
export async function updateUserStatus(userId: string, newStatus: "active" | "blocked") {
    try {
        const supabase = await checkAdminStatus()

        const { data: { user } } = await supabase.auth.getUser()
        if (user?.id === userId) {
            return { error: "Você não pode alterar seu próprio status." }
        }

        // Atualiza usando o campo 'status' e 'active' para compatibilidade
        const isActive = newStatus === "active"
        const { error } = await supabase
            .from("profiles")
            .update({ status: newStatus, active: isActive })
            .eq("id", userId)

        if (error) return { error: error.message }

        revalidatePath("/admin")
        return { success: true }
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e)
        return { error: message }
    }
}

// Atualiza perfil de um usuário (admin only)
export async function updateUserProfile(userId: string, data: { full_name?: string, role?: string }) {
    try {
        const supabase = await checkAdminStatus()

        const { error } = await supabase
            .from("profiles")
            .update(data)
            .eq("id", userId)

        if (error) return { error: error.message }

        revalidatePath("/admin")
        return { success: true }
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e)
        return { error: message }
    }
}

// Deleta conta de um usuário (admin only, via RPC)
export async function deleteUserAccount(userId: string) {
    try {
        const supabase = await checkAdminStatus()

        const { data, error } = await supabase.rpc("delete_user_by_admin", {
            target_user_id: userId
        })

        if (error) return { error: error.message }

        revalidatePath("/admin")
        return { success: true }
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e)
        return { error: message }
    }
}
