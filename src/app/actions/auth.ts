"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function signIn(formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    redirect("/")
}

export async function signUp(formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("fullName") as string
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
            data: {
                full_name: fullName,
                role: 'user'
            }
        }
    })

    if (error) {
        return { error: error.message }
    }

    return { success: "Verifique seu e-mail para confirmar o cadastro!" }
}

export async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    revalidatePath("/", "layout")
    redirect("/login")
}

export async function getCurrentUserRole() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    const { data: profile } = await (supabase.from("profiles") as any)
        .select("role")
        .eq("id", user.id)
        .single()

    return profile?.role || "user"
}
