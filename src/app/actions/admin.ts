"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

async function checkAdminStatus() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Não autenticado")

    const { data: profile } = await (supabase.from("profiles") as any)
        .select("role")
        .eq("id", user.id)
        .single()

    if (profile?.role !== "admin") {
        throw new Error("Acesso negado")
    }

    return supabase
}

export async function getUsers() {
    try {
        const supabase = await checkAdminStatus()

        const { data, error } = await (supabase.from("profiles") as any)
            .select("*")
            .order("updated_at", { ascending: false })

        if (error) return { error: error.message }
        return { data }
    } catch (e: any) {
        return { error: e.message }
    }
}

export async function updateUserStatus(userId: string, newStatus: "active" | "blocked") {
    try {
        const supabase = await checkAdminStatus()

        // Impede que admin bloqueie a si mesmo
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.id === userId) {
            return { error: "Você não pode alterar seu próprio status." }
        }

        const { data: targetProfile } = await (supabase.from("profiles") as any)
            .select("email")
            .eq("id", userId)
            .single()

        if (targetProfile?.email === "amaralgabriel123@gmail.com" || targetProfile?.email === "amaralgabriel4321@gmail.com") {
            return { error: "Este usuário de sistema é protegido e não pode ser alterado." }
        }

        const { error } = await (supabase.from("profiles") as any)
            .update({ status: newStatus })
            .eq("id", userId)

        if (error) return { error: error.message }

        revalidatePath("/admin")
        return { success: true }
    } catch (e: any) {
        return { error: e.message }
    }
}
