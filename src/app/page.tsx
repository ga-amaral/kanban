import { createClient } from "@/lib/supabase/server"
import { getWorkspaces } from "@/app/actions/workspace"
import { UserNav } from "@/components/user-nav"
import { CreateWorkspace } from "@/components/create-workspace"
import Link from "next/link"
import { LayoutGrid, ArrowRight, Kanban, Settings } from "lucide-react"

export default async function DashboardPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const workspaces = await getWorkspaces()

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
            {/* Header */}
            <header className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20">
                            <Kanban className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white font-outfit tracking-tight">
                            AutoKanban <span className="text-indigo-400">CRM</span>
                        </span>
                    </div>
                    <UserNav user={user} />
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Left Column: Workspaces */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white font-outfit">Seus Workspaces</h2>
                                <p className="text-slate-500 text-sm mt-1">Gerencie seus fluxos de trabalho e leads.</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                                <LayoutGrid className="h-5 w-5" />
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            {workspaces.map((workspace) => (
                                <Link
                                    key={workspace.id}
                                    href={`/workspace/${workspace.id}`}
                                    className="group bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-900 transition-all duration-300 relative overflow-hidden active:scale-[0.98]"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight className="h-5 w-5 text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
                                        {workspace.name}
                                    </h3>
                                    <p className="text-slate-500 text-xs mt-4 flex items-center gap-2">
                                        <span className="h-1 w-1 bg-indigo-500 rounded-full" />
                                        Criado em {new Date(workspace.created_at!).toLocaleDateString('pt-BR')}
                                    </p>
                                </Link>
                            ))}

                            {workspaces.length === 0 && (
                                <div className="col-span-2 py-12 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl">
                                    <p className="text-slate-500 text-sm">Nenhum workspace encontrado. Crie o primeiro ao lado!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Actions & Quick Settings */}
                    <div className="space-y-6">
                        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl space-y-6">
                            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Novo Workspace
                            </h3>
                            <CreateWorkspace />
                        </div>

                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-3xl text-white space-y-4 shadow-xl shadow-indigo-900/20 relative overflow-hidden group">
                            <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700" />
                            <div className="relative z-10">
                                <h4 className="font-bold text-lg">Precisa de Ajuda?</h4>
                                <p className="text-white/80 text-sm mt-2 leading-relaxed">
                                    Confira nossos tutoriais de automação para tirar o máximo proveito do AutoKanban.
                                </p>
                                <button className="mt-6 w-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 py-2.5 rounded-xl text-sm font-medium transition-all">
                                    Ver Documentação
                                </button>
                            </div>
                        </div>

                        <p className="text-[10px] text-slate-600 text-center px-4">
                            © 2026 AutoKanban CRM. Desenvolvido por <a href="https://instagram.com/sougabrielamaral" target="_blank" className="hover:text-indigo-400">Gabriel Amaral</a>. Todos os direitos reservados.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}

function Plus(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
