import { createClient } from "@/lib/supabase/server"
import { getColumns } from "@/app/actions/column"
import { getCards } from "@/app/actions/card"
import { KanbanBoard } from "@/components/kanban/board"
import { UserNav } from "@/components/user-nav"
import { Kanban, ChevronLeft, Settings, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AutomationManager } from "@/components/automation-manager"
import { WorkspaceSettings } from "@/components/workspace/settings"

export default async function WorkspacePage({
    params,
    searchParams
}: {
    params: { id: string },
    searchParams: { tab?: string }
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: workspace }: { data: any } = await supabase
        .from("workspaces")
        .select("*")
        .eq("id", params.id)
        .single()

    if (!workspace) notFound()

    const columns = await getColumns(params.id)
    const cards = await getCards(params.id)
    const activeTab = searchParams.tab || "kanban"

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col overflow-hidden">
            {/* Workspace Header */}
            <header className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md z-40">
                <div className="mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/"
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="h-6 w-px bg-slate-800" />
                        <div className="flex items-center gap-8">
                            <div className="flex flex-col border-r border-slate-800 pr-8">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Workspace</span>
                                <h1 className="text-sm font-bold text-white font-outfit leading-none truncate max-w-[150px]">
                                    {workspace.name}
                                </h1>
                            </div>

                            <nav className="flex items-center gap-1 bg-slate-950/50 p-1 rounded-xl border border-slate-800">
                                <Link
                                    href={`/workspace/${params.id}?tab=kanban`}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'kanban' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Quadro
                                </Link>
                                <Link
                                    href={`/workspace/${params.id}?tab=automations`}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'automations' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Automações
                                </Link>
                                <Link
                                    href={`/workspace/${params.id}?tab=settings`}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Configurações
                                </Link>
                            </nav>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <UserNav user={user} />
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-auto bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                {activeTab === "kanban" && (
                    <KanbanBoard
                        workspaceId={params.id}
                        initialColumns={columns}
                        initialCards={cards}
                    />
                )}
                {activeTab === "automations" && (
                    <div className="max-w-6xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <AutomationManager
                            workspaceId={params.id}
                            columns={columns}
                        />
                    </div>
                )}
                {activeTab === "settings" && (
                    <div className="max-w-6xl mx-auto px-6">
                        <WorkspaceSettings workspace={workspace} />
                    </div>
                )}
            </main>
        </div>
    )
}
