import { createClient } from "@/lib/supabase/server"
import { getUserWorkspaces } from "@/app/actions/workspace"
import { UserNav } from "@/components/user-nav"
import { LayoutDashboard, ArrowLeft, Eye, ArrowRight } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function AdminUserDashboard({ params }: { params: { id: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    // Double check admin role
    const { data: profile } = await (supabase.from("profiles") as any)
        .select("role")
        .eq("id", user.id)
        .single()

    if (profile?.role !== "admin") {
        redirect("/")
    }

    // Get the user we are spying on
    const { data: targetUser } = await (supabase.from("profiles") as any)
        .select("email, full_name")
        .eq("id", params.id)
        .single()

    const workspaces = await getUserWorkspaces(params.id)

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
            {/* Spy Warning Banner */}
            <div className="bg-indigo-600/20 border-b border-indigo-500/30 text-indigo-200 py-2 px-6 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider">
                <Eye className="h-4 w-4" />
                Modo Monitoramento: Visualizando a conta de {targetUser?.full_name || targetUser?.email}
            </div>

            {/* Header */}
            <header className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/admin"
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                            title="Voltar ao Painel Admin"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="h-6 w-px bg-slate-800" />
                        <div className="flex items-center gap-2">
                            <div className="bg-indigo-600/20 p-1.5 rounded-lg border border-indigo-500/20">
                                <LayoutDashboard className="h-5 w-5 text-indigo-500" />
                            </div>
                            <span className="text-xl font-bold text-white font-outfit tracking-tight">
                                Workspaces de {targetUser?.full_name || "Usuário"}
                            </span>
                        </div>
                    </div>

                    <UserNav user={user} />
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-white font-outfit mb-2">
                            Dashboard Monitorado
                        </h1>
                        <p className="text-slate-400">
                            Você tem acesso total aos workspaces criados por este usuário.
                        </p>
                    </div>
                </div>

                {workspaces.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <LayoutDashboard className="h-8 w-8 text-slate-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2 font-outfit">Nenhum workspace encontrado</h2>
                        <p className="text-slate-400 max-w-sm mx-auto">
                            Este usuário ainda não criou nenhum workspace.
                        </p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {workspaces.map((workspace: any) => (
                            <Link
                                key={workspace.id}
                                href={`/workspace/${workspace.id}`}
                                className="group bg-slate-900/50 border border-slate-800 p-6 rounded-3xl hover:border-indigo-500/50 hover:bg-slate-900 transition-all duration-300 relative overflow-hidden active:scale-[0.98]"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight className="h-5 w-5 text-indigo-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                                    {workspace.name}
                                </h3>
                                <p className="text-slate-500 text-sm mt-4 flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full" />
                                    Criado em {new Date(workspace.created_at!).toLocaleDateString('pt-BR')}
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
