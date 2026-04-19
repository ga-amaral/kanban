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
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (profile?.role !== "admin") {
        redirect("/")
    }

    const { data: users, error } = await getUsers()

    return (
        <div className="min-h-screen bg-transparent text-slate-200 font-sans selection:bg-neon-green/30">
            {/* Header - Radical Style */}
            <header className="border-b border-white/5 bg-carbon sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/"
                            className="p-2 hover:bg-white/5 sharp-edge transition-colors text-slate-400 hover:text-white group"
                            title="Voltar ao Dashboard"
                        >
                            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div className="h-6 w-px bg-white/5" />
                        <div className="flex items-center gap-3">
                            <div className="bg-neon-green/10 p-2 sharp-edge border border-neon-green/20">
                                <ShieldAlert className="h-5 w-5 text-neon-green neon-glow" />
                            </div>
                            <span className="text-xl font-black text-white font-outfit uppercase tracking-tighter">
                                Painel Administrativo
                            </span>
                        </div>
                    </div>

                    <UserNav user={user} />
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12 stagger-reveal">
                <div className="space-y-8">
                    <div>
                        <h2 className="text-2xl font-black text-white font-outfit uppercase tracking-tighter">Controle de Usuários</h2>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Gerencie o acesso à plataforma bloqueando ou liberando contas.</p>
                    </div>

                    <div className="bg-carbon border border-white/5 sharp-edge overflow-hidden shadow-2xl animate-spring">
                        {error ? (
                            <div className="p-8 text-center text-rose-400">
                                Erro ao carregar usuários: {error}
                            </div>
                        ) : (
                            <AdminUserList users={users || []} currentUserId={user.id} />
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
