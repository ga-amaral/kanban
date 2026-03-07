import { createClient } from "@/lib/supabase/server"
import { getUsers } from "@/app/actions/admin"
import { UserNav } from "@/components/user-nav"
import Link from "next/link"
import { ArrowLeft, ShieldAlert, UserX, UserCheck } from "lucide-react"
import { AdminUserList } from "./user-list"
import { redirect } from "next/navigation"

export default async function AdminPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    // Double check on page side just in case middleware fails
    const { data: profile } = await (supabase.from("profiles") as any)
        .select("role")
        .eq("id", user.id)
        .single()

    if (profile?.role !== "admin") {
        redirect("/")
    }

    const { data: users, error } = await getUsers()

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
            {/* Header */}
            <header className="border-b border-rose-900/30 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/"
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                            title="Voltar ao Dashboard"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="h-6 w-px bg-slate-800" />
                        <div className="flex items-center gap-2">
                            <div className="bg-rose-600/20 p-1.5 rounded-lg border border-rose-500/20">
                                <ShieldAlert className="h-5 w-5 text-rose-500" />
                            </div>
                            <span className="text-xl font-bold text-white font-outfit tracking-tight">
                                Painel Administrativo
                            </span>
                        </div>
                    </div>

                    <UserNav user={user} />
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white font-outfit">Controle de Usuários</h2>
                        <p className="text-slate-400 text-sm mt-1">Gerencie o acesso à plataforma bloqueando ou liberando contas.</p>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                        {error ? (
                            <div className="p-8 text-center text-rose-400">
                                Erro ao carregar usuários: {error}
                            </div>
                        ) : (
                            <AdminUserList users={users} currentUserId={user.id} />
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
