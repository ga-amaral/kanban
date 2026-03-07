"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LogOut, User } from "lucide-react"

import { useEffect, useState } from "react"

export function UserNav({ user }: { user: any }) {
    const supabase = createClient()
    const router = useRouter()
    const [role, setRole] = useState("user")

    useEffect(() => {
        const fetchRole = async () => {
            const { data } = await (supabase.from("profiles") as any).select("role").eq("id", user.id).single()
            if (data) setRole(data.role)
        }
        if (user) fetchRole()
    }, [user, supabase])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    return (
        <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-white">{user.email}</span>
                <div className="flex items-center gap-3 mt-1">
                    {role === "admin" && (
                        <button
                            onClick={() => router.push("/admin")}
                            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            Painel Admin
                        </button>
                    )}
                    <button
                        onClick={handleSignOut}
                        className="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1"
                    >
                        <LogOut className="h-3 w-3" />
                        Sair
                    </button>
                </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center border border-white/10 shadow-lg">
                <User className="h-5 w-5 text-white" />
            </div>
        </div>
    )
}
